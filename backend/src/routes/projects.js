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

// GET /api/projects/user/:userId - Get user's projects
router.get('/user/:userId', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const projectsCollection = viewDocDB.getCollection('projects');

        const projects = await projectsCollection.find({ 
            userId: new ObjectId(userId) 
        })
        .sort({ createdAt: -1 })
        .toArray();

        const transformedProjects = projects.map(project => ({
            id: project._id,
            initials: project.name.substring(0, 2).toUpperCase(),
            title: project.name,
            description: project.description,
            type: project.type,
            tags: project.tags || []
        }));

        res.json(transformedProjects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
});

module.exports = router;