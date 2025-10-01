// addSampleData.js
const { MongoClient, ObjectId } = require('mongodb');
const viewDocDB = require('./viewDocDB');

async function addSampleData() {
    try {
        await viewDocDB.connectToDatabase();
        const db = viewDocDB.getDatabase();

        // Get collections
        const usersCollection = db.collection('users');
        const projectsCollection = db.collection('projects');
        const activitiesCollection = db.collection('activities');
        const checkinsCollection = db.collection('checkins');

        // Clear existing sample data (optional)
        await projectsCollection.deleteMany({ isSample: true });
        await activitiesCollection.deleteMany({ isSample: true });
        await checkinsCollection.deleteMany({ isSample: true });

        // Get existing users
        const users = await usersCollection.find({}).toArray();
        
        if (users.length === 0) {
            console.log('No users found. Please register some users first.');
            return;
        }

        console.log(`Found ${users.length} users to add sample data for`);

        // Sample projects data
        const sampleProjects = [
            {
                name: "ViewDoc Platform",
                description: "A collaborative documentation platform for developers",
                type: "Web Application",
                tags: ["React", "Node.js", "MongoDB", "Express"],
                isPublic: true,
                userId: new ObjectId(users[0]._id),
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-20'),
                status: "active",
                isSample: true
            },
            {
                name: "Mobile Task Manager",
                description: "Cross-platform task management application with real-time sync",
                type: "Mobile Application",
                tags: ["React Native", "Firebase", "Redux"],
                isPublic: true,
                userId: new ObjectId(users[0]._id),
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-02-10'),
                status: "active",
                isSample: true
            },
            {
                name: "API Gateway Service",
                description: "Microservices API gateway with authentication and rate limiting",
                type: "Backend Service",
                tags: ["Node.js", "Docker", "Redis", "JWT"],
                isPublic: false,
                userId: new ObjectId(users[0]._id),
                createdAt: new Date('2024-01-25'),
                updatedAt: new Date('2024-02-05'),
                status: "completed",
                isSample: true
            },
            {
                name: "E-commerce Dashboard",
                description: "Analytics dashboard for online store performance metrics",
                type: "Web Application",
                tags: ["Vue.js", "D3.js", "Python", "FastAPI"],
                isPublic: true,
                userId: new ObjectId(users[1]?._id || users[0]._id),
                createdAt: new Date('2024-02-15'),
                updatedAt: new Date(),
                status: "active",
                isSample: true
            }
        ];

        // Sample activities data
        const sampleActivities = [
            {
                userId: new ObjectId(users[0]._id),
                type: "project_created",
                title: "Created New Project",
                description: "Created project: ViewDoc Platform",
                date: new Date('2024-01-15T10:30:00Z'),
                isSample: true
            },
            {
                userId: new ObjectId(users[0]._id),
                type: "project_updated",
                title: "Updated Project",
                description: "Added new features to ViewDoc Platform",
                date: new Date('2024-01-20T14:45:00Z'),
                isSample: true
            },
            {
                userId: new ObjectId(users[0]._id),
                type: "skill_added",
                title: "Added New Skills",
                description: "Added React and Node.js to skills",
                date: new Date('2024-01-18T09:15:00Z'),
                isSample: true
            },
            {
                userId: new ObjectId(users[0]._id),
                type: "profile_updated",
                title: "Updated Profile",
                description: "Updated bio and about sections",
                date: new Date('2024-02-01T16:20:00Z'),
                isSample: true
            },
            {
                userId: new ObjectId(users[1]?._id || users[0]._id),
                type: "project_created",
                title: "Created New Project",
                description: "Created project: E-commerce Dashboard",
                date: new Date('2024-02-15T11:00:00Z'),
                isSample: true
            }
        ];

        // Sample checkins data
        const sampleCheckins = [
            {
                userId: new ObjectId(users[0]._id),
                location: "Tech Hub Campus",
                notes: "Working on the ViewDoc platform UI components",
                checkinDate: new Date('2024-02-20T08:30:00Z'),
                isSample: true
            },
            {
                userId: new ObjectId(users[0]._id),
                location: "Central Library",
                notes: "Researching documentation best practices",
                checkinDate: new Date('2024-02-19T14:15:00Z'),
                isSample: true
            },
            {
                userId: new ObjectId(users[1]?._id || users[0]._id),
                location: "Coffee Shop Downtown",
                notes: "Meeting with client about dashboard requirements",
                checkinDate: new Date('2024-02-18T10:00:00Z'),
                isSample: true
            }
        ];

        // Insert sample data
        if (sampleProjects.length > 0) {
            const projectResult = await projectsCollection.insertMany(sampleProjects);
            console.log(`Added ${projectResult.insertedCount} sample projects`);
        }

        if (sampleActivities.length > 0) {
            const activityResult = await activitiesCollection.insertMany(sampleActivities);
            console.log(`Added ${activityResult.insertedCount} sample activities`);
        }

        if (sampleCheckins.length > 0) {
            const checkinResult = await checkinsCollection.insertMany(sampleCheckins);
            console.log(`Added ${checkinResult.insertedCount} sample checkins`);
        }

        // Update users with sample friends and skills
        if (users.length >= 2) {
            // Add sample friends relationship
            await usersCollection.updateOne(
                { _id: new ObjectId(users[0]._id) },
                { 
                    $set: { 
                        skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
                        friends: [new ObjectId(users[1]._id)],
                        bio: "Full-stack developer passionate about creating amazing user experiences",
                        about: "I have been developing web applications for over 3 years. I love working with modern technologies and solving complex problems.",
                        avatar: "/avatars/user1.jpg"
                    } 
                }
            );

            await usersCollection.updateOne(
                { _id: new ObjectId(users[1]._id) },
                { 
                    $set: { 
                        skills: ["Python", "Vue.js", "Data Analysis", "UI/UX Design"],
                        friends: [new ObjectId(users[0]._id)],
                        bio: "Data scientist and frontend developer focused on creating insightful visualizations",
                        about: "I specialize in data visualization and analytics. My goal is to make complex data understandable and actionable through beautiful interfaces.",
                        avatar: "/avatars/user2.jpg"
                    } 
                }
            );
        } else {
            // If only one user, add some sample data anyway
            await usersCollection.updateOne(
                { _id: new ObjectId(users[0]._id) },
                { 
                    $set: { 
                        skills: ["JavaScript", "React", "Node.js", "MongoDB", "CSS", "HTML"],
                        bio: "Software developer building the future one line of code at a time",
                        about: "Passionate about technology and innovation. I enjoy learning new frameworks and contributing to open source projects in my free time.",
                        avatar: "/avatars/default-user.jpg"
                    } 
                }
            );
        }

        console.log('Sample data added successfully!');
        console.log('You can now view profiles with projects, activities, and friends data.');

    } catch (error) {
        console.error('Error adding sample data:', error);
    } finally {
        process.exit();
    }
}

addSampleData();