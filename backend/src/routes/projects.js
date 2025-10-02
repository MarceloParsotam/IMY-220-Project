const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const viewDocDB = require('../viewDocDB');
const { authenticateUser } = require('../middleware/auth');

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

module.exports = router;