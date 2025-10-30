const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');
const { authenticateUser } = require('../middleware/auth');
// Add at the top of your projects.js file
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/projects/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only for projectImage
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Use .any() to accept any field names, or be more specific
const handleUpload = upload.any(); 
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
                    image: project.image ? {
                        data: project.image.data,
                        contentType: project.image.contentType,
                        filename: project.image.filename
                    } : null,
                    imageUrl: project.imageUrl,
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
// In projects.js - UPDATE THE POST ROUTE
router.post('/', authenticateUser, upload.single('projectImage'), async (req, res) => {
    try {
        console.log('Project creation request received');
        console.log('Request body:', req.body);

        let { name, description, type, tags, isPublic } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!name || !description) {
            // Clean up uploaded file if validation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Project name and description are required'
            });
        }

        const projectsCollection = viewDocDB.getCollection('projects');

        // Handle tags
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = JSON.parse(tags);
            } catch (e) {
                console.warn('Failed to parse tags, using empty array');
            }
        }

        // Handle project image - STORE IN DATABASE AS BASE64
        let imageData = null;
        if (req.file) {
            try {
                // Read the image file and convert to Base64
                const imageBuffer = fs.readFileSync(req.file.path);
                const base64Image = imageBuffer.toString('base64');
                
                // Store image data in database
                imageData = {
                    data: base64Image,
                    contentType: req.file.mimetype,
                    filename: req.file.originalname,
                    size: req.file.size
                };
                
                console.log('Image stored in database, size:', req.file.size, 'bytes');
                
                // Delete the temporary file since we stored it in DB
                fs.unlinkSync(req.file.path);
                
            } catch (imageError) {
                console.error('Error processing image:', imageError);
                // Clean up file if error
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            }
        }

        const newProject = {
            name: name.trim(),
            description: description.trim(),
            type: type || 'Web Application',
            tags: parsedTags,
            isPublic: isPublic !== undefined ? (isPublic === 'true' || isPublic === true) : true,
            userId: new ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active',
            image: imageData, // Store image data in database
            version: '1.0.0'
        };

        console.log('Creating project with image data:', !!imageData);

        const result = await projectsCollection.insertOne(newProject);

        // Create activity
        try {
            const activitiesCollection = viewDocDB.getCollection('activities');
            await activitiesCollection.insertOne({
                userId: new ObjectId(userId),
                type: 'project_created',
                title: 'Created New Project',
                description: `Created project: ${name}`,
                date: new Date(),
                projectId: result.insertedId,
                metadata: {
                    hasImage: !!imageData
                }
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
        // Clean up uploaded file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
        });
    }
});
// In projects.js - ADD IMAGE SERVING ROUTE
// GET /api/projects/:id/image - Get project image from database
router.get('/:id/image', authenticateUser, async (req, res) => {
    try {
        const projectId = req.params.id;
        const projectsCollection = viewDocDB.getCollection('projects');
        
        // Get the project with image data
        const project = await projectsCollection.findOne({
            _id: new ObjectId(projectId)
        }, {
            projection: { image: 1 }
        });
        
        if (!project || !project.image || !project.image.data) {
            return res.status(404).json({
                success: false,
                message: 'Project image not found'
            });
        }

        // Convert Base64 back to buffer
        const imageBuffer = Buffer.from(project.image.data, 'base64');
        
        // Set appropriate headers
        res.set({
            'Content-Type': project.image.contentType,
            'Content-Length': imageBuffer.length,
            'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        });
        
        // Send the image data
        res.send(imageBuffer);
        
    } catch (error) {
        console.error('Error serving project image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load project image'
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

// In projects.js - UPDATE the PUT route to handle image uploads
router.put('/:projectId', authenticateUser, upload.single('projectImage'), async (req, res) => {
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
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to edit it'
      });
    }

    // Handle image upload if new image provided
    let imageData = null;
    if (req.file) {
      try {
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        
        imageData = {
          data: base64Image,
          contentType: req.file.mimetype,
          filename: req.file.originalname,
          size: req.file.size
        };
        
        // Delete temporary file
        fs.unlinkSync(req.file.path);
        console.log('New project image uploaded and stored in database');
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
    }

    // Parse arrays from strings if needed
    let parsedTags = [];
    let parsedTechnologies = [];
    let parsedMembers = [];

    try {
      if (tags) {
        if (typeof tags === 'string') {
          parsedTags = JSON.parse(tags);
        } else {
          parsedTags = tags;
        }
      }
      if (technologies) {
        if (typeof technologies === 'string') {
          parsedTechnologies = JSON.parse(technologies);
        } else {
          parsedTechnologies = technologies;
        }
      }
      if (members) {
        if (typeof members === 'string') {
          parsedMembers = JSON.parse(members);
        } else {
          parsedMembers = members;
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse array fields, using empty arrays');
    }

    // Update project data
    const updateData = {
      name: name || project.name,
      description: description || project.description,
      type: type || project.type || 'Web Application',
      tags: parsedTags.length > 0 ? parsedTags : project.tags || [],
      version: version || project.version || 'v1.0.0',
      technologies: parsedTechnologies.length > 0 ? parsedTechnologies : project.technologies || [],
      members: parsedMembers.length > 0 ? parsedMembers : project.members || [],
      updatedAt: new Date()
    };

    // Add image data if new image was uploaded
    if (imageData) {
      updateData.image = imageData;
    }

    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes made to project'
      });
    }

    // Create activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: 'project_updated',
      title: 'Project Updated',
      description: `Updated project: ${updateData.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        hasImage: !!imageData
      }
    });

    // Get updated project
    const updatedProject = await projectsCollection.findOne({
      _id: new ObjectId(projectId)
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
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
      
      // ADD THE MISSING IMAGE FIELD - THIS IS THE FIX!
      image: project.image || null,
      
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

    console.log('Sending project with image data:', !!formattedProject.image); // Debug log
    res.json(formattedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// GET /api/projects/:projectId/favorites-count - Get real favorites count
router.get('/:projectId/favorites-count', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const favoritesCollection = viewDocDB.getCollection('favorites');

    // Count how many users have favorited this project
    const favoritesCount = await favoritesCollection.countDocuments({
      projectId: new ObjectId(projectId)
    });

    res.json({
      success: true,
      favoritesCount: favoritesCount
    });
  } catch (error) {
    console.error('Error fetching favorites count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites count'
    });
  }
});
// GET /api/projects/:projectId/views - Get views count
router.get('/:projectId/views', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectsCollection = viewDocDB.getCollection('projects');

    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      viewsCount: project.views || 0
    });
  } catch (error) {
    console.error('Error fetching views count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch views count'
    });
  }
});

// POST /api/projects/:projectId/increment-views - Increment views count
router.post('/:projectId/increment-views', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectsCollection = viewDocDB.getCollection('projects');

    // Increment the views count
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $inc: { views: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to increment views'
      });
    }

    res.json({
      success: true,
      message: 'Views count incremented'
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment views'
    });
  }
});
// ===DEBUG ROUTE - REMOVE IN PRODUCTION=== //
// Add this temporary debug route to test the individual project endpoint
// In projects.js - UPDATE the debug route too
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
    console.log('Debug: Project image data:', project.image); // Add this
    
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
      
      // ADD IMAGE FIELD HERE TOO
      image: project.image || null,
      
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

// In projects.js - ADD THESE NEW ROUTES FOR MESSAGES

// POST /api/projects/:projectId/checkin-message - Add check-in message
router.post('/:projectId/checkin-message', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;
    const userName = req.user.name || req.user.username;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const projectsCollection = viewDocDB.getCollection('projects');

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

    // Create message object
    const newMessage = {
      user: userName,
      message: message,
      time: new Date().toISOString(),
      type: 'checkin',
      createdAt: new Date()
    };

    // Add message to project's messages array
    await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $push: { 
          messages: newMessage 
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    // Create activity for the message
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: 'project_message_added',
      title: 'Check-in Message Added',
      description: `Added check-in message to project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        messageType: 'checkin'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Check-in message added successfully',
      newMessage: newMessage
    });

  } catch (error) {
    console.error('Error adding check-in message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add check-in message'
    });
  }
});

// POST /api/projects/:projectId/checkout-message - Add check-out message
router.post('/:projectId/checkout-message', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;
    const userName = req.user.name || req.user.username;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const projectsCollection = viewDocDB.getCollection('projects');

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

    // Create message object
    const newMessage = {
      user: userName,
      message: message,
      time: new Date().toISOString(),
      type: 'checkout',
      createdAt: new Date()
    };

    // Add message to project's checkoutMessages array
    await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $push: { 
          checkoutMessages: newMessage 
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    // Create activity for the message
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: 'project_message_added',
      title: 'Check-out Message Added',
      description: `Added check-out message to project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        messageType: 'checkout'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Check-out message added successfully',
      newMessage: newMessage
    });

  } catch (error) {
    console.error('Error adding check-out message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add check-out message'
    });
  }
});
// In projects.js - REPLACE the file routes with these:

// POST /api/projects/:projectId/files - Add file or folder with proper pathing
router.post('/:projectId/files', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, content, type, path, changes, time } = req.body;
    const userId = req.user._id;
    const userName = req.user.name || req.user.username;

    const projectsCollection = viewDocDB.getCollection('projects');

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

    // Validate path format
    const normalizedPath = normalizePath(path || '');
    
    // Check if file/folder already exists in the same path
    const existingFile = project.files?.find(f => 
      f.name === name && f.path === normalizedPath
    );

    if (existingFile) {
      return res.status(400).json({ 
        success: false,
        message: `A ${type} with this name already exists in this location` 
      });
    }

    // For folders, ensure they don't have content
    const fileContent = type === 'folder' ? '' : (content || '');

    // Create new file/folder object
    const newFile = {
      name,
      content: fileContent,
      type: type || 'file',
      path: normalizedPath,
      changes: changes || userName,
      time: time || 'Just now',
      createdAt: new Date(),
      updatedAt: new Date(),
      fullPath: getFullPath(normalizedPath, name)
    };

    // Update project with new file
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $push: { files: newFile },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Failed to add file' 
      });
    }

    // Create activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: type === 'folder' ? 'folder_added' : 'file_added',
      title: type === 'folder' ? 'Folder Added' : 'File Added',
      description: `Added ${type === 'folder' ? 'folder' : 'file'}: ${name} to project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        fileName: name,
        fileType: type,
        filePath: normalizedPath
      }
    });

    res.json({ 
      success: true,
      message: `${type === 'folder' ? 'Folder' : 'File'} added successfully`, 
      file: newFile 
    });
  } catch (error) {
    console.error('Error adding file:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});
// GET /api/projects/:projectId/files/structure - Get file structure with proper nesting
router.get('/:projectId/files/structure', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectsCollection = viewDocDB.getCollection('projects');

    const project = await projectsCollection.findOne({ 
      _id: new ObjectId(projectId) 
    });

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    // Build hierarchical file structure
    const fileStructure = buildFileStructure(project.files || []);

    res.json({
      success: true,
      structure: fileStructure,
      flatFiles: project.files || []
    });
  } catch (error) {
    console.error('Error fetching file structure:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});
// POST /api/projects/:projectId/files/content - Get file content with proper pathing
router.post('/:projectId/files/content', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fileName, path } = req.body;

    const projectsCollection = viewDocDB.getCollection('projects');

    const project = await projectsCollection.findOne({ 
      _id: new ObjectId(projectId) 
    });

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    const normalizedPath = normalizePath(path || '');

    // Find the file in project's files array with exact path match
    const file = project.files?.find(f => 
      f.name === fileName && f.path === normalizedPath && f.type === 'file'
    );

    if (!file) {
      return res.status(404).json({ 
        success: false,
        message: 'File not found' 
      });
    }

    res.json({
      success: true,
      name: file.name,
      content: file.content || '',
      type: file.type,
      path: file.path,
      changes: file.changes,
      time: file.time,
      fullPath: file.fullPath
    });
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});
// POST /api/projects/:projectId/files/navigate - Navigate to folder
router.post('/:projectId/files/navigate', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path } = req.body;

    const projectsCollection = viewDocDB.getCollection('projects');

    const project = await projectsCollection.findOne({ 
      _id: new ObjectId(projectId) 
    });

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    const normalizedPath = normalizePath(path || '');
    
    // Get files and folders in the current path
    const currentItems = (project.files || []).filter(f => 
      f.path === normalizedPath
    );

    // Get breadcrumb path
    const breadcrumbs = getBreadcrumbs(normalizedPath);

    res.json({
      success: true,
      path: normalizedPath,
      items: currentItems,
      breadcrumbs: breadcrumbs
    });
  } catch (error) {
    console.error('Error navigating files:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});
// FIXED: PUT /api/projects/:projectId/files/content - Update file content
router.put('/:projectId/files/content', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fileName, path, content, changes } = req.body;
    const userId = req.user._id;
    const userName = req.user.name || req.user.username;

    console.log('File update request:', { projectId, fileName, path, contentLength: content?.length, changes });

    const projectsCollection = viewDocDB.getCollection('projects');

    // First, find the project to debug
    const project = await projectsCollection.findOne({ 
      _id: new ObjectId(projectId) 
    });

    if (!project) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    console.log('Project files:', project.files?.length);
    
    const normalizedPath = normalizePath(path || '');
    console.log('Looking for file:', { fileName, normalizedPath });

    // Find the specific file first to debug
    const fileToUpdate = project.files?.find(f => 
      f.name === fileName && 
      f.path === normalizedPath && 
      f.type === 'file'
    );

    if (!fileToUpdate) {
      console.log('File not found in project files array');
      console.log('Available files:', project.files?.map(f => ({ name: f.name, path: f.path, type: f.type })));
      return res.status(404).json({ 
        success: false,
        message: 'File not found' 
      });
    }

    console.log('Found file to update:', fileToUpdate);

    // Update the specific file in the files array
    const result = await projectsCollection.updateOne(
      { 
        _id: new ObjectId(projectId),
        'files.name': fileName,
        'files.path': normalizedPath
      },
      { 
        $set: { 
          'files.$.content': content,
          'files.$.changes': changes || userName,
          'files.$.time': 'Just now',
          'files.$.updatedAt': new Date()
        }
      }
    );

    console.log('Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    });

    if (result.matchedCount === 0) {
      console.log('No file matched the update criteria');
      return res.status(400).json({ 
        success: false,
        message: 'File not found for update' 
      });
    }

    if (result.modifiedCount === 0) {
      console.log('File matched but no changes made - possible duplicate content');
      // This might happen if content is the same, but we should still return success
    }

    // Create activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: 'file_updated',
      title: 'File Updated',
      description: `Updated file: ${fileName} in project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        fileName: fileName,
        filePath: normalizedPath,
        contentLength: content?.length
      }
    });

    console.log('File update successful');
    res.json({ 
      success: true,
      message: 'File updated successfully' 
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
});
// DELETE /api/projects/:projectId/files - Delete file or folder
router.delete('/:projectId/files', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fileName, path, type } = req.body;
    const userId = req.user._id;

    const projectsCollection = viewDocDB.getCollection('projects');

    const project = await projectsCollection.findOne({ 
      _id: new ObjectId(projectId) 
    });

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    const normalizedPath = normalizePath(path || '');

    // For folders, check if they contain any files
    if (type === 'folder') {
      const hasChildren = project.files?.some(f => 
        f.path.startsWith(`${normalizedPath}${normalizedPath ? '/' : ''}${fileName}/`)
      );

      if (hasChildren) {
        return res.status(400).json({ 
          success: false,
          message: 'Cannot delete folder that contains files' 
        });
      }
    }

    // Remove the file/folder
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $pull: { 
          files: { 
            name: fileName, 
            path: normalizedPath 
          } 
        },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'File not found or already deleted' 
      });
    }

    // Create activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: type === 'folder' ? 'folder_deleted' : 'file_deleted',
      title: type === 'folder' ? 'Folder Deleted' : 'File Deleted',
      description: `Deleted ${type === 'folder' ? 'folder' : 'file'}: ${fileName} from project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        fileName: fileName,
        fileType: type,
        filePath: normalizedPath
      }
    });

    res.json({ 
      success: true,
      message: `${type === 'folder' ? 'Folder' : 'File'} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Helper functions for file pathing
function normalizePath(path) {
  if (!path) return '';
  // Remove leading/trailing slashes and normalize
  return path.replace(/^\/+|\/+$/g, '');
}

function getFullPath(path, name) {
  if (!path) return name;
  return `${path}/${name}`;
}

function buildFileStructure(files) {
  const structure = {
    name: 'root',
    type: 'folder',
    path: '',
    children: []
  };

  files.forEach(file => {
    const pathParts = file.path ? file.path.split('/') : [];
    let currentLevel = structure.children;

    // Build the folder hierarchy
    pathParts.forEach((part, index) => {
      let folder = currentLevel.find(item => item.name === part && item.type === 'folder');
      
      if (!folder) {
        folder = {
          name: part,
          type: 'folder',
          path: pathParts.slice(0, index + 1).join('/'),
          children: []
        };
        currentLevel.push(folder);
      }
      
      currentLevel = folder.children;
    });

    // Add the file to the current level
    currentLevel.push({
      ...file,
      children: file.type === 'folder' ? [] : undefined
    });
  });

  return structure;
}

function getBreadcrumbs(path) {
  if (!path) return [{ name: 'root', path: '' }];
  
  const parts = path.split('/');
  const breadcrumbs = [{ name: 'root', path: '' }];
  
  let currentPath = '';
  parts.forEach(part => {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    breadcrumbs.push({
      name: part,
      path: currentPath
    });
  });
  
  return breadcrumbs;
}
// Add discussion to project
router.post('/:projectId/discussion', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, userName } = req.body;
    const userId = req.user._id;

    const projectsCollection = viewDocDB.getCollection('projects');

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

    // Create new discussion object
    const newDiscussion = {
      user: userName || req.user.name || req.user.username,
      content: content,
      time: new Date().toISOString(),
      createdAt: new Date(),
      userId: new ObjectId(userId)
    };

    // Update project with new discussion
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $push: { discussions: newDiscussion },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Failed to add discussion' 
      });
    }

    // Create activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: 'discussion_added',
      title: 'Discussion Added',
      description: `Added discussion to project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name
      }
    });

    res.json({ 
      success: true,
      message: 'Discussion added successfully', 
      discussion: newDiscussion 
    });
  } catch (error) {
    console.error('Error adding discussion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});
// GET /api/projects/:projectId/members - Get project members (FINAL FIXED VERSION)
router.get('/:projectId/members', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');

    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    console.log('Raw project members:', project.members);

    // Handle both old format (array of strings) and new format (array of objects)
    let members = [];
    
    if (project.members && Array.isArray(project.members)) {
      members = project.members.map((member, index) => {
        if (typeof member === 'string') {
          // Old format: string (username or ID)
          return { 
            id: `string-${index}`, // Create a temporary ID for string members
            name: member, 
            username: member 
          };
        } else if (typeof member === 'object' && member !== null) {
          // New format: object with properties
          return {
            id: member.id || member._id || `object-${index}`,
            name: member.name || member.username || 'Unknown Member',
            username: member.username || member.name || 'unknown'
          };
        }
        return { 
          id: `unknown-${index}`, 
          name: 'Unknown Member', 
          username: 'unknown' 
        };
      });
    }

    console.log('Processed members for frontend:', members);

    res.json({
      success: true,
      members: members
    });
  } catch (error) {
    console.error('Error fetching project members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project members'
    });
  }
});

// GET /api/projects/:projectId/available-friends - Get user's friends who are not project members
router.get('/:projectId/available-friends', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    
    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');

    // Get the project
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get current user's friends from users collection
    const currentUser = await usersCollection.findOne({
      _id: new ObjectId(userId)
    }, { projection: { friends: 1 } });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found'
      });
    }

    console.log('Current user friends:', currentUser.friends);

    // Get current project members
    const currentMemberIds = (project.members || [])
      .filter(memberId => memberId && ObjectId.isValid(memberId))
      .map(id => id.toString());

    // Add current user to member IDs (since owner is always a member)
    currentMemberIds.push(userId.toString());

    console.log('Current member IDs (including owner):', currentMemberIds);

    // Get friends who are not already project members
    const friendIds = (currentUser.friends || [])
      .filter(friendId => friendId && ObjectId.isValid(friendId))
      .map(id => id.toString())
      .filter(friendId => !currentMemberIds.includes(friendId));

    console.log('Available friend IDs:', friendIds);

    const availableFriends = await usersCollection.find({
      _id: { $in: friendIds.map(id => new ObjectId(id)) }
    }).toArray();

    const formattedFriends = availableFriends.map(friend => ({
      id: friend._id.toString(),
      name: friend.name || friend.username,
      username: friend.username,
      email: friend.email
    }));

    console.log('Formatted available friends:', formattedFriends.length);

    res.json({
      success: true,
      friends: formattedFriends
    });
  } catch (error) {
    console.error('Error fetching available friends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available friends'
    });
  }
});

// POST /api/projects/:projectId/members - Add member to project
router.post('/:projectId/members', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    // Validate memberId
    if (!memberId || !ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID'
      });
    }

    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');

    // Check if project exists and user has permission
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
      $or: [
        { userId: new ObjectId(userId) },
        { 'members': { $elemMatch: { id: userId.toString() } } }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or no permission'
      });
    }

    // Verify friendship using existing friends system
    const currentUser = await usersCollection.findOne({
      _id: new ObjectId(userId)
    }, { projection: { friends: 1 } });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found'
      });
    }

    const isFriend = currentUser.friends && 
      currentUser.friends.some(friendId => friendId.toString() === memberId);

    if (!isFriend) {
      return res.status(400).json({
        success: false,
        message: 'You can only add friends to the project'
      });
    }

    // Get member details to store name
    const newMemberUser = await usersCollection.findOne({ 
      _id: new ObjectId(memberId) 
    }, { projection: { name: 1, username: 1 } });

    if (!newMemberUser) {
      return res.status(404).json({
        success: false,
        message: 'User to add not found'
      });
    }

    // Create member object with name and ID
    const newMember = {
      id: memberId,
      name: newMemberUser.name || newMemberUser.username,
      username: newMemberUser.username
    };

    // Check if already a member
    const currentMembers = project.members || [];
    const isAlreadyMember = currentMembers.some(member => 
      member.id === memberId
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a project member'
      });
    }

    // Add member to project - store as object with name
    await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $addToSet: { members: newMember },
        $set: { updatedAt: new Date() }
      }
    );

    // Create activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: 'member_added',
      title: 'Member Added to Project',
      description: `Added ${newMemberUser.username} to project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        memberId: memberId,
        memberName: newMemberUser.username
      }
    });

    res.json({
      success: true,
      message: 'Member added successfully',
      member: newMember
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member'
    });
  }
});

// DELETE /api/projects/:projectId/members/:memberId - Remove member from project
router.delete('/:projectId/members/:memberId', authenticateUser, async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user._id;

    // Validate memberId
    if (!memberId || !ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID'
      });
    }

    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');

    // Check if project exists and user has permission (owner only)
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
      userId: new ObjectId(userId) // Only owner can remove members
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or no permission to remove members'
      });
    }

    // Remove member from project using the member object structure
    await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $pull: { members: { id: memberId } },
        $set: { updatedAt: new Date() }
      }
    );

    // Create activity
    const activitiesCollection = viewDocDB.getCollection('activities');
    const removedMemberUser = await usersCollection.findOne({ _id: new ObjectId(memberId) });
    
    await activitiesCollection.insertOne({
      userId: new ObjectId(userId),
      type: 'member_removed',
      title: 'Member Removed from Project',
      description: `Removed ${removedMemberUser?.username || 'user'} from project: ${project.name}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        memberId: memberId,
        memberName: removedMemberUser?.username
      }
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member'
    });
  }
});
// POST /api/projects/:projectId/transfer-ownership - Transfer project ownership
router.post('/:projectId/transfer-ownership', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { newOwnerId } = req.body;
    const currentUserId = req.user._id;

    // Validate newOwnerId
    if (!newOwnerId || !ObjectId.isValid(newOwnerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid new owner ID'
      });
    }

    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');

    // Check if project exists and current user is the owner
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
      userId: new ObjectId(currentUserId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not the owner'
      });
    }

    // Check if new owner is a project member
    const isMember = project.members && project.members.some(member => {
      const memberId = typeof member === 'object' ? member.id : member;
      return memberId.toString() === newOwnerId.toString();
    });

    if (!isMember && newOwnerId.toString() !== currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'New owner must be a project member'
      });
    }

    // Check if new owner exists
    const newOwner = await usersCollection.findOne({
      _id: new ObjectId(newOwnerId)
    });

    if (!newOwner) {
      return res.status(404).json({
        success: false,
        message: 'New owner user not found'
      });
    }

    // Update project ownership
    const updateResult = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $set: { 
          userId: new ObjectId(newOwnerId),
          updatedAt: new Date()
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to transfer ownership'
      });
    }

    // Create activity for ownership transfer
    const activitiesCollection = viewDocDB.getCollection('activities');
    await activitiesCollection.insertOne({
      userId: new ObjectId(currentUserId),
      type: 'ownership_transferred',
      title: 'Project Ownership Transferred',
      description: `Transferred ownership of project "${project.name}" to ${newOwner.username}`,
      date: new Date(),
      projectId: new ObjectId(projectId),
      metadata: {
        projectName: project.name,
        previousOwnerId: currentUserId,
        previousOwnerName: req.user.username,
        newOwnerId: newOwnerId,
        newOwnerName: newOwner.username
      }
    });

    res.json({
      success: true,
      message: 'Project ownership transferred successfully',
      newOwner: {
        id: newOwner._id.toString(),
        name: newOwner.name || newOwner.username,
        username: newOwner.username
      }
    });

  } catch (error) {
    console.error('Error transferring project ownership:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transfer project ownership'
    });
  }
});

// GET /api/projects/:projectId/transferable-members - Get members who can receive ownership
router.get('/:projectId/transferable-members', authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const currentUserId = req.user._id;

    const projectsCollection = viewDocDB.getCollection('projects');
    const usersCollection = viewDocDB.getCollection('users');

    // Check if project exists and current user is the owner
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
      userId: new ObjectId(currentUserId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not the owner'
      });
    }

    // Get all project members (excluding current owner)
    const memberIds = [];
    
    if (project.members && Array.isArray(project.members)) {
      project.members.forEach(member => {
        if (typeof member === 'object' && member.id) {
          if (member.id.toString() !== currentUserId.toString()) {
            memberIds.push(new ObjectId(member.id));
          }
        } else if (typeof member === 'string' && ObjectId.isValid(member)) {
          if (member.toString() !== currentUserId.toString()) {
            memberIds.push(new ObjectId(member));
          }
        }
      });
    }

    // Get member details
    const transferableMembers = await usersCollection.find({
      _id: { $in: memberIds }
    }).toArray();

    const formattedMembers = transferableMembers.map(member => ({
      id: member._id.toString(),
      name: member.name || member.username,
      username: member.username,
      email: member.email
    }));

    res.json({
      success: true,
      members: formattedMembers
    });

  } catch (error) {
    console.error('Error fetching transferable members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transferable members'
    });
  }
});

module.exports = router;