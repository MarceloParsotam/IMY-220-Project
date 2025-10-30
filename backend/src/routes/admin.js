const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// Admin middleware - check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// GET /api/admin/stats - Get admin dashboard statistics
router.get('/stats', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');
    const checkoutsCollection = viewDocDB.getCollection('checkouts');
    const activitiesCollection = viewDocDB.getCollection('activities');

    const [
      totalProjects,
      totalUsers,
      activeCheckouts,
      recentActivities
    ] = await Promise.all([
      projectsCollection.countDocuments(),
      usersCollection.countDocuments(),
      checkoutsCollection.countDocuments({ returnedAt: null }),
      activitiesCollection.find().sort({ date: -1 }).limit(10).toArray()
    ]);

    res.json({
      success: true,
      stats: {
        totalProjects,
        totalUsers,
        activeCheckouts,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
});

// GET /api/admin/projects - Get all projects with full details
router.get('/projects', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [projects, total] = await Promise.all([
      projectsCollection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      projectsCollection.countDocuments(query)
    ]);

    // Get user details for project owners
    const projectsWithUsers = await Promise.all(
      projects.map(async (project) => {
        const owner = await usersCollection.findOne(
          { _id: project.userId },
          { projection: { username: 1, email: 1, name: 1 } }
        );

        return {
          ...project,
          owner: owner ? {
            username: owner.username,
            email: owner.email,
            name: owner.name
          } : null
        };
      })
    );

    res.json({
      success: true,
      projects: projectsWithUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
});

// PUT /api/admin/projects/:projectId - Admin edit any project
router.put('/projects/:projectId', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const projectsCollection = viewDocDB.getCollection('projects');

    // Check if project exists
    const project = await projectsCollection.findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Remove immutable fields
    const { _id, userId, createdAt, ...allowedUpdates } = updates;
    
    // Add updated timestamp
    allowedUpdates.updatedAt = new Date();

    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $set: allowedUpdates }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes made to project'
      });
    }

    // Log admin activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(req.user._id),
      type: 'admin_project_updated',
      title: 'Project Updated by Admin',
      description: `Admin updated project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        adminId: req.user._id,
        adminName: req.user.username
      }
    });

    const updatedProject = await projectsCollection.findOne({ _id: new ObjectId(projectId) });

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error updating project as admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

// DELETE /api/admin/projects/:projectId - Admin delete any project
router.delete('/projects/:projectId', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectsCollection = viewDocDB.getCollection('projects');
    const checkoutsCollection = viewDocDB.getCollection('checkouts');
    const favoritesCollection = viewDocDB.getCollection('favorites');

    // Check if project exists
    const project = await projectsCollection.findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete project and related data
    await Promise.all([
      projectsCollection.deleteOne({ _id: new ObjectId(projectId) }),
      checkoutsCollection.deleteMany({ projectId: new ObjectId(projectId) }),
      favoritesCollection.deleteMany({ projectId: new ObjectId(projectId) })
    ]);

    // Log admin activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(req.user._id),
      type: 'admin_project_deleted',
      title: 'Project Deleted by Admin',
      description: `Admin deleted project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        adminId: req.user._id,
        adminName: req.user.username
      }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project as admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const usersCollection = viewDocDB.getCollection('users');
    const projectsCollection = viewDocDB.getCollection('projects');

    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [users, total] = await Promise.all([
      usersCollection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      usersCollection.countDocuments(query)
    ]);

    // Get project counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const projectCount = await projectsCollection.countDocuments({ 
          userId: user._id 
        });

        return {
          ...user,
          password: undefined, // Remove password from response
          projectCount
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// PUT /api/admin/users/:userId - Admin edit any user
router.put('/users/:userId', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const usersCollection = viewDocDB.getCollection('users');

    // Check if user exists
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove immutable fields and sensitive data
    const { _id, password, createdAt, ...allowedUpdates } = updates;
    
    // Add updated timestamp
    allowedUpdates.updatedAt = new Date();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: allowedUpdates }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes made to user'
      });
    }

    // Log admin activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(req.user._id),
      type: 'admin_user_updated',
      title: 'User Updated by Admin',
      description: `Admin updated user: ${user.username}`,
      date: new Date(),
      metadata: {
        targetUserId: userId,
        targetUserName: user.username,
        adminId: req.user._id,
        adminName: req.user.username
      }
    });

    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user as admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// DELETE /api/admin/users/:userId - Admin delete any user
router.delete('/users/:userId', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const usersCollection = viewDocDB.getCollection('users');
    const projectsCollection = viewDocDB.getCollection('projects');
    const checkoutsCollection = viewDocDB.getCollection('checkouts');
    const favoritesCollection = viewDocDB.getCollection('favorites');

    // Check if user exists
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow admin to delete themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user and all their data
    await Promise.all([
      usersCollection.deleteOne({ _id: new ObjectId(userId) }),
      projectsCollection.deleteMany({ userId: new ObjectId(userId) }),
      checkoutsCollection.deleteMany({ userId: new ObjectId(userId) }),
      favoritesCollection.deleteMany({ userId: new ObjectId(userId) })
    ]);

    // Log admin activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(req.user._id),
      type: 'admin_user_deleted',
      title: 'User Deleted by Admin',
      description: `Admin deleted user: ${user.username}`,
      date: new Date(),
      metadata: {
        targetUserId: userId,
        targetUserName: user.username,
        adminId: req.user._id,
        adminName: req.user.username
      }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user as admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// GET /api/admin/discussions - Get all discussions across projects
router.get('/discussions', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, projectId } = req.query;
    const skip = (page - 1) * limit;

    const projectsCollection = viewDocDB.getCollection('projects');

    let query = { discussions: { $exists: true, $ne: [] } };
    if (projectId) {
      query._id = new ObjectId(projectId);
    }

    const projects = await projectsCollection.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Flatten discussions with project context
    const allDiscussions = [];
    projects.forEach(project => {
      if (project.discussions && project.discussions.length > 0) {
        project.discussions.forEach(discussion => {
          allDiscussions.push({
            ...discussion,
            projectId: project._id,
            projectName: project.name,
            discussionId: discussion._id || discussion.id
          });
        });
      }
    });

    // Sort discussions by date
    allDiscussions.sort((a, b) => new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time));

    res.json({
      success: true,
      discussions: allDiscussions.slice(0, limit),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allDiscussions.length
      }
    });
  } catch (error) {
    console.error('Error fetching admin discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions'
    });
  }
});

// DELETE /api/admin/discussions/:discussionId - Admin delete any discussion
router.delete('/discussions/:discussionId', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const projectsCollection = viewDocDB.getCollection('projects');

    // Remove the discussion from the project
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $pull: { discussions: { _id: new ObjectId(discussionId) } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Log admin activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(req.user._id),
      type: 'admin_discussion_deleted',
      title: 'Discussion Deleted by Admin',
      description: `Admin deleted a discussion from project`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        adminId: req.user._id,
        adminName: req.user.username,
        discussionId: discussionId
      }
    });

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting discussion as admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discussion'
    });
  }
});

module.exports = router;