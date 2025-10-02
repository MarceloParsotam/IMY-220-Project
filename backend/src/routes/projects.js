const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');
const { authenticateUser } = require('../middleware/auth');

// GET /api/projects/all - Get all public projects and user's projects
// GET /api/projects/all - Get all public projects and user's projects
router.get('/all', authenticateUser, async (req, res) => {
    try {
        const userId = req.user._id;
        const projectsCollection = viewDocDB.getCollection('projects');
        const checkoutsCollection = viewDocDB.getCollection('checkouts');
        const favoritesCollection = viewDocDB.getCollection('favorites');

        // Get all public projects AND user's own projects (even if private)
        const projects = await projectsCollection.find({ 
            $or: [
                { isPublic: true }, // All public projects
                { userId: new ObjectId(userId) }, // User's own projects (even private)
                { 'collaborators.userId': new ObjectId(userId) } // Projects user collaborates on
            ]
        })
        .sort({ createdAt: -1 })
        .toArray();

        // Get user's favorites
        const userFavorites = await favoritesCollection.find({
            userId: new ObjectId(userId)
        }).toArray();

        const favoriteProjectIds = userFavorites.map(fav => fav.projectId.toString());

        // Get current checkout status for each project
        const projectsWithCheckoutStatus = await Promise.all(
            projects.map(async (project) => {
                const activeCheckout = await checkoutsCollection.findOne({
                    projectId: project._id,
                    returnedAt: null
                });

                return {
                    id: project._id.toString(),
                    _id: project._id,
                    name: project.name,
                    title: project.name,
                    description: project.description,
                    type: project.type || 'Web Application',
                    tags: project.tags || [],
                    isPublic: project.isPublic !== undefined ? project.isPublic : true,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                    status: project.status || 'active',
                    userId: project.userId,
                    // Checkout information
                    isCheckedOut: !!activeCheckout,
                    currentCheckout: activeCheckout ? {
                        userId: activeCheckout.userId,
                        userName: activeCheckout.userName,
                        checkedOutAt: activeCheckout.checkedOutAt,
                        expectedReturn: activeCheckout.expectedReturn
                    } : null,
                    // Favorite information
                    isFavorite: favoriteProjectIds.includes(project._id.toString()),
                    lastUpdated: formatTimeAgo(project.updatedAt || project.createdAt),
                    version: project.version || 'v1.0.0',
                    created: formatDate(project.createdAt),
                    // Ownership info for frontend
                    isOwnedByUser: project.userId.toString() === userId.toString(),
                    isCollaborator: project.collaborators && project.collaborators.some(collab => 
                        collab.userId.toString() === userId.toString()
                    )
                };
            })
        );

        res.json(projectsWithCheckoutStatus);
    } catch (error) {
        console.error('Error fetching all projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
});
// POST /api/projects - Create new project
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { name, description, type, tags, isPublic } = req.body;
        const userId = req.user._id;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Project name and description are required'
            });
        }

        const projectsCollection = viewDocDB.getCollection('projects');

        const newProject = {
            name,
            description,
            type: type || 'Web Application',
            tags: tags || [],
            isPublic: isPublic !== undefined ? isPublic : true,
            userId: new ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active'
        };

        const result = await projectsCollection.insertOne(newProject);

        // Create activity for the new project
        try {
            const activitiesCollection = viewDocDB.getCollection('activities');
            await activitiesCollection.insertOne({
                userId: new ObjectId(userId),
                type: 'project_created',
                title: 'Created New Project',
                description: `Created project: ${name}`,
                date: new Date(),
                projectId: result.insertedId
            });
        } catch (activityError) {
            console.log('Could not create activity record:', activityError);
        }

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project: {
                _id: result.insertedId,
                ...newProject
            }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project'
        });
    }
});

// GET /api/projects/user/:userId - Get user's projects with checkout status
router.get('/user/:userId', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const projectsCollection = viewDocDB.getCollection('projects');
        const checkoutsCollection = viewDocDB.getCollection('checkouts');

        const projects = await projectsCollection.find({ 
            $or: [
                { userId: new ObjectId(userId) },
                { 'collaborators.userId': new ObjectId(userId) }
            ]
        })
        .sort({ createdAt: -1 })
        .toArray();

        // Get current checkout status for each project
        const projectsWithCheckoutStatus = await Promise.all(
            projects.map(async (project) => {
                const activeCheckout = await checkoutsCollection.findOne({
                    projectId: project._id,
                    returnedAt: null
                });

                // Helper functions for date formatting
                const formatTimeAgo = (date) => {
                    const now = new Date();
                    const diffMs = now - new Date(date);
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);

                    if (diffMins < 1) return 'Just now';
                    if (diffMins < 60) return `${diffMins} minutes ago`;
                    if (diffHours < 24) return `${diffHours} hours ago`;
                    if (diffDays < 7) return `${diffDays} days ago`;
                    return new Date(date).toLocaleDateString();
                };

                const formatDate = (date) => {
                    return new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                };

                return {
                    id: project._id.toString(),
                    _id: project._id,
                    name: project.name,
                    title: project.name,
                    description: project.description,
                    type: project.type || 'Web Application',
                    tags: project.tags || [],
                    isPublic: project.isPublic !== undefined ? project.isPublic : true,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                    status: project.status || 'active',
                    userId: project.userId,
                    // Checkout information
                    isCheckedOut: !!activeCheckout,
                    currentCheckout: activeCheckout ? {
                        userId: activeCheckout.userId,
                        userName: activeCheckout.userName,
                        checkedOutAt: activeCheckout.checkedOutAt,
                        expectedReturn: activeCheckout.expectedReturn
                    } : null,
                    // Frontend fields
                    isFavorite: project.isFavorite || false,
                    lastUpdated: formatTimeAgo(project.updatedAt || project.createdAt),
                    version: project.version || 'v1.0.0',
                    created: formatDate(project.createdAt)
                };
            })
        );

        res.json(projectsWithCheckoutStatus);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
});

// Helper functions
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
// POST /api/projects/checkout - Check out a project
router.post('/checkout', authenticateUser, async (req, res) => {
    try {
        const { projectId, expectedReturn, notes } = req.body;
        const userId = req.user._id;
        const userName = req.user.name || req.user.username;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Project ID is required'
            });
        }

        const projectsCollection = viewDocDB.getCollection('projects');
        const checkoutsCollection = viewDocDB.getCollection('checkouts');

        // Check if project exists
        const project = await projectsCollection.findOne({ 
            _id: new ObjectId(projectId) 
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if project is already checked out
        const activeCheckout = await checkoutsCollection.findOne({
            projectId: new ObjectId(projectId),
            returnedAt: null
        });

        if (activeCheckout) {
            return res.status(400).json({
                success: false,
                message: 'Project is already checked out'
            });
        }

        // Create checkout record
        const checkoutData = {
            projectId: new ObjectId(projectId),
            userId: new ObjectId(userId),
            userName: userName,
            checkedOutAt: new Date(),
            expectedReturn: expectedReturn ? new Date(expectedReturn) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
            notes: notes || '',
            status: 'active',
            isSample: false
        };

        const result = await checkoutsCollection.insertOne(checkoutData);

        // Update project status
        await projectsCollection.updateOne(
            { _id: new ObjectId(projectId) },
            { 
                $set: { 
                    isCheckedOut: true,
                    lastCheckedOut: new Date(),
                    currentUser: userName
                } 
            }
        );

        // Create activity for the checkout
        const activitiesCollection = viewDocDB.getCollection('activities');
        await activitiesCollection.insertOne({
            userId: new ObjectId(userId),
            type: 'project_checked_out',
            title: 'Project Checked Out',
            description: `Checked out project: ${project.name}`,
            date: new Date(),
            projectId: new ObjectId(projectId),
            metadata: {
                projectName: project.name,
                expectedReturn: checkoutData.expectedReturn
            }
        });

        res.status(200).json({
            success: true,
            message: 'Project checked out successfully',
            checkout: checkoutData
        });

    } catch (error) {
        console.error('Error checking out project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check out project'
        });
    }
});

// POST /api/projects/checkin - Check in a project
router.post('/checkin', authenticateUser, async (req, res) => {
    try {
        const { projectId, notes } = req.body;
        const userId = req.user._id;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Project ID is required'
            });
        }

        const projectsCollection = viewDocDB.getCollection('projects');
        const checkoutsCollection = viewDocDB.getCollection('checkouts');

        // Find active checkout
        const activeCheckout = await checkoutsCollection.findOne({
            projectId: new ObjectId(projectId),
            returnedAt: null
        });

        if (!activeCheckout) {
            return res.status(400).json({
                success: false,
                message: 'Project is not currently checked out'
            });
        }

        // Get project details for activity logging
        const project = await projectsCollection.findOne({
            _id: new ObjectId(projectId)
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Verify user has permission to check in
        if (activeCheckout.userId.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You can only check in projects you checked out'
            });
        }

        // Update checkout record
        const returnedAt = new Date();
        await checkoutsCollection.updateOne(
            { _id: activeCheckout._id },
            { 
                $set: { 
                    returnedAt: returnedAt,
                    status: 'returned',
                    returnNotes: notes || ''
                } 
            }
        );

        // Update project status
        await projectsCollection.updateOne(
            { _id: new ObjectId(projectId) },
            { 
                $set: { 
                    isCheckedOut: false,
                    lastCheckedIn: returnedAt
                },
                $unset: {
                    currentUser: ""
                }
            }
        );

        // Create activity for the checkin
        const activitiesCollection = viewDocDB.getCollection('activities');
        await activitiesCollection.insertOne({
            userId: new ObjectId(userId),
            type: 'project_checked_in',
            title: 'Project Checked In',
            description: `Checked in project: ${project.name}`,
            date: new Date(),
            projectId: new ObjectId(projectId),
            metadata: {
                projectName: project.name,
                checkoutDuration: returnedAt - activeCheckout.checkedOutAt
            }
        });

        res.status(200).json({
            success: true,
            message: 'Project checked in successfully',
            checkin: {
                returnedAt: returnedAt,
                notes: notes || ''
            }
        });

    } catch (error) {
        console.error('Error checking in project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check in project'
        });
    }
});

// GET /api/projects/checkout-status/:projectId - Get current checkout status
router.get('/checkout-status/:projectId', authenticateUser, async (req, res) => {
    try {
        const { projectId } = req.params;
        const checkoutsCollection = viewDocDB.getCollection('checkouts');

        const activeCheckout = await checkoutsCollection.findOne({
            projectId: new ObjectId(projectId),
            returnedAt: null
        });

        res.json({
            success: true,
            isCheckedOut: !!activeCheckout,
            currentCheckout: activeCheckout
        });

    } catch (error) {
        console.error('Error fetching checkout status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch checkout status'
        });
    }
});

// GET /api/projects/user-checkouts/:userId - Get user's checkout history
router.get('/user-checkouts/:userId', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const checkoutsCollection = viewDocDB.getCollection('checkouts');

        const userCheckouts = await checkoutsCollection.find({
            userId: new ObjectId(userId)
        })
        .sort({ checkedOutAt: -1 })
        .toArray();

        res.json({
            success: true,
            checkouts: userCheckouts
        });

    } catch (error) {
        console.error('Error fetching user checkouts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user checkouts'
        });
    }
});

// In projects.js - UPDATE the PUT /api/projects/:projectId route
router.put('/:projectId', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, type, tags, version, technologies, members } = req.body;
    const userId = req.user._id;

    const projectsCollection = viewDocDB.getCollection('projects');

    // Check if project exists and user owns it
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
      userId: new ObjectId(userId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to edit it'
      });
    }

    // Update project with all fields
    const updateData = {
      name,
      description,
      type: type || 'Web Application',
      tags: tags || [],
      version: version || 'v1.0.0',
      technologies: technologies || [],
      members: members || [],
      updatedAt: new Date()
    };

    await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $set: updateData }
    );

    // Create activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: 'project_updated',
      title: 'Project Updated',
      description: `Updated project: ${name}`,
      date: new Date(),
      projectId: new ObjectId(projectId)
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: { ...project, ...updateData }
    });

  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

// DELETE /api/projects/:projectId - Delete a project
router.delete('/:projectId', authenticateUser, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const projectsCollection = viewDocDB.getCollection('projects');

        // Check if project exists and user owns it
        const project = await projectsCollection.findOne({
            _id: new ObjectId(projectId),
            userId: new ObjectId(userId)
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or you do not have permission to delete it'
            });
        }

        // Delete project
        await projectsCollection.deleteOne({ _id: new ObjectId(projectId) });

        // Create activity
        const activitiesCollection = viewDocDB.getCollection('activities');
        await activitiesCollection.insertOne({
            userId: new ObjectId(userId),
            type: 'project_deleted',
            title: 'Project Deleted',
            description: `Deleted project: ${project.name}`,
            date: new Date(),
            projectId: new ObjectId(projectId)
        });

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project'
        });
    }
});

// POST /api/projects/:projectId/favorite - Add project to favorites
router.post('/:projectId/favorite', authenticateUser, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const projectsCollection = viewDocDB.getCollection('projects');
        const favoritesCollection = viewDocDB.getCollection('favorites');

        // Check if project exists
        const project = await projectsCollection.findOne({
            _id: new ObjectId(projectId)
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if already favorited
        const existingFavorite = await favoritesCollection.findOne({
            userId: new ObjectId(userId),
            projectId: new ObjectId(projectId)
        });

        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                message: 'Project is already in your favorites'
            });
        }

        // Add to favorites
        const favoriteData = {
            userId: new ObjectId(userId),
            projectId: new ObjectId(projectId),
            favoritedAt: new Date()
        };

        await favoritesCollection.insertOne(favoriteData);

        // Create activity
        const activitiesCollection = viewDocDB.getCollection('activities');
        await activitiesCollection.insertOne({
            userId: new ObjectId(userId),
            type: 'project_favorited',
            title: 'Project Favorited',
            description: `Added project to favorites: ${project.name}`,
            date: new Date(),
            projectId: new ObjectId(projectId)
        });

        res.status(200).json({
            success: true,
            message: 'Project added to favorites',
            favorite: favoriteData
        });

    } catch (error) {
        console.error('Error favoriting project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add project to favorites'
        });
    }
});

// DELETE /api/projects/:projectId/favorite - Remove project from favorites
router.delete('/:projectId/favorite', authenticateUser, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const favoritesCollection = viewDocDB.getCollection('favorites');

        // Remove from favorites
        const result = await favoritesCollection.deleteOne({
            userId: new ObjectId(userId),
            projectId: new ObjectId(projectId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project was not in your favorites'
            });
        }

        // Create activity
        const activitiesCollection = viewDocDB.getCollection('activities');
        await activitiesCollection.insertOne({
            userId: new ObjectId(userId),
            type: 'project_unfavorited',
            title: 'Project Removed from Favorites',
            description: `Removed project from favorites`,
            date: new Date(),
            projectId: new ObjectId(projectId)
        });

        res.status(200).json({
            success: true,
            message: 'Project removed from favorites'
        });

    } catch (error) {
        console.error('Error unfavoriting project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove project from favorites'
        });
    }
});

// GET /api/projects/favorites/:userId - Get user's favorite projects
router.get('/favorites/:userId', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const favoritesCollection = viewDocDB.getCollection('favorites');
        const projectsCollection = viewDocDB.getCollection('projects');
        const checkoutsCollection = viewDocDB.getCollection('checkouts');

        // Get user's favorite project IDs
        const favorites = await favoritesCollection.find({
            userId: new ObjectId(userId)
        }).toArray();

        const favoriteProjectIds = favorites.map(fav => fav.projectId);

        // Get the actual projects
        const projects = await projectsCollection.find({
            _id: { $in: favoriteProjectIds }
        }).toArray();

        // Get current checkout status for each project
        const projectsWithCheckoutStatus = await Promise.all(
            projects.map(async (project) => {
                const activeCheckout = await checkoutsCollection.findOne({
                    projectId: project._id,
                    returnedAt: null
                });

                return {
                    id: project._id.toString(),
                    _id: project._id,
                    name: project.name,
                    title: project.name,
                    description: project.description,
                    type: project.type || 'Web Application',
                    tags: project.tags || [],
                    isPublic: project.isPublic !== undefined ? project.isPublic : true,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                    status: project.status || 'active',
                    userId: project.userId,
                    // Checkout information
                    isCheckedOut: !!activeCheckout,
                    currentCheckout: activeCheckout ? {
                        userId: activeCheckout.userId,
                        userName: activeCheckout.userName,
                        checkedOutAt: activeCheckout.checkedOutAt,
                        expectedReturn: activeCheckout.expectedReturn
                    } : null,
                    // Frontend fields
                    isFavorite: true, // These are all favorites
                    lastUpdated: formatTimeAgo(project.updatedAt || project.createdAt),
                    version: project.version || 'v1.0.0',
                    created: formatDate(project.createdAt),
                    // Ownership info for frontend
                    isOwnedByUser: project.userId.toString() === userId.toString(),
                    isCollaborator: project.collaborators && project.collaborators.some(collab => 
                        collab.userId.toString() === userId.toString()
                    )
                };
            })
        );

        res.json(projectsWithCheckoutStatus);

    } catch (error) {
        console.error('Error fetching favorite projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch favorite projects'
        });
    }
});

// In projects.js - UPDATE the GET /api/projects/:id route to include all fields
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');
    const checkoutsCollection = viewDocDB.getCollection('checkouts');
    const favoritesCollection = viewDocDB.getCollection('favorites');
    
    // Get the project
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId)
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get user info for the project owner
    const user = await usersCollection.findOne({
      _id: project.userId
    });

    // Check if project is checked out
    const activeCheckout = await checkoutsCollection.findOne({
      projectId: new ObjectId(projectId),
      returnedAt: null
    });

    // Check if current user has favorited this project
    const userFavorite = await favoritesCollection.findOne({
      userId: new ObjectId(req.user._id),
      projectId: new ObjectId(projectId)
    });

    // Format the project with all the fields the frontend expects
    const formattedProject = {
      // Basic project info from database
      id: project._id.toString(),
      _id: project._id,
      name: project.name,
      description: project.description,
      type: project.type || 'Web Application',
      tags: project.tags || [],
      version: project.version || 'v1.0.0',
      technologies: project.technologies || project.tags || ['React', 'Node.js', 'MongoDB'],
      members: project.members || (user ? [user.username] : ['Project Owner']),
      isPublic: project.isPublic !== undefined ? project.isPublic : true,
      userId: project.userId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      
      // Fields the frontend expects
      username: user ? user.username : 'Unknown User',
      startDate: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Unknown date',
      views: project.views || Math.floor(Math.random() * 1000) + 100,
      languages: project.languages || project.tags || ['JavaScript', 'React'],
      
      // Stats
      downloads: project.downloads || Math.floor(Math.random() * 500) + 50,
      stars: project.stars || Math.floor(Math.random() * 200) + 10,
      
      // Messages and discussions
      messages: project.messages || [],
      checkoutMessages: project.checkoutMessages || [],
      
      // Files data
      files: project.files || [
        { name: 'src/components', type: 'folder', changes: 'Member 1', time: '2 hours ago' },
        { name: 'src/utils', type: 'folder', changes: 'Member 2', time: '5 hours ago' },
        { name: 'package.json', type: 'file', changes: 'Member 1', time: '2 hours ago' },
        { name: 'README.md', type: 'file', changes: 'Member 2', time: '5 hours ago' }
      ],
      
      // Discussions
      discussions: project.discussions || [
        {
          user: 'Developer123',
          time: '3 days ago',
          content: 'This project looks great! Looking forward to collaborating.'
        }
      ],
      
      // Checkout status
      isCheckedOut: !!activeCheckout,
      isFavorite: !!userFavorite,
      
      // Current checkout info if checked out
      currentCheckout: activeCheckout ? {
        userId: activeCheckout.userId,
        userName: activeCheckout.userName,
        checkedOutAt: activeCheckout.checkedOutAt
      } : null
    };

    res.json(formattedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===DEBUG ROUTE - REMOVE IN PRODUCTION=== //
// Add this temporary debug route to test the individual project endpoint
router.get('/debug/:id', authenticateUser, async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log('Debug: Fetching project with ID:', projectId);
    
    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');
    
    // Get the project
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId)
    });
    
    console.log('Debug: Found project:', project);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get user info for the project owner
    const user = await usersCollection.findOne({
      _id: project.userId
    });

    console.log('Debug: Found user:', user);

    // Format the project with all the fields the frontend expects
    const formattedProject = {
      // Basic project info from database
      id: project._id.toString(),
      _id: project._id,
      name: project.name,
      description: project.description,
      type: project.type,
      tags: project.tags || [],
      isPublic: project.isPublic !== undefined ? project.isPublic : true,
      userId: project.userId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      
      // Fields the frontend expects but aren't in database - add defaults
      username: user ? user.username : 'Unknown User',
      startDate: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Unknown date',
      views: project.views || Math.floor(Math.random() * 1000) + 100,
      languages: project.languages || project.tags || ['JavaScript', 'React'],
      
      // Members data
      members: project.members || (user ? [user.username] : ['Project Owner']),
      
      // Technologies - use tags or default
      technologies: project.technologies || project.tags || ['React', 'Node.js', 'MongoDB'],
      
      // Stats
      downloads: project.downloads || Math.floor(Math.random() * 500) + 50,
      stars: project.stars || Math.floor(Math.random() * 200) + 10,
      version: project.version || 'v1.0.0',
      
      // Messages and discussions
      messages: project.messages || [],
      checkoutMessages: project.checkoutMessages || [],
      
      // Files data
      files: project.files || [
        { name: 'src/components', type: 'folder', changes: 'Member 1', time: '2 hours ago' },
        { name: 'src/utils', type: 'folder', changes: 'Member 2', time: '5 hours ago' },
        { name: 'package.json', type: 'file', changes: 'Member 1', time: '2 hours ago' },
        { name: 'README.md', type: 'file', changes: 'Member 2', time: '5 hours ago' }
      ],
      
      // Discussions
      discussions: project.discussions || [
        {
          user: 'Developer123',
          time: '3 days ago',
          content: 'This project looks great! Looking forward to collaborating.'
        }
      ],
      
      // Checkout status
      isCheckedOut: project.isCheckedOut || false,
      isFavorite: project.isFavorite || false
    };

    console.log('Debug: Formatted project:', formattedProject);
    res.json(formattedProject);
  } catch (error) {
    console.error('Debug: Error fetching project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;