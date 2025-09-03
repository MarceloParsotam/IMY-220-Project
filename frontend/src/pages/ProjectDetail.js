import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import  ProjectHeader  from '../components/projectDetails/ProjectHeader';
import  ProjectAbout  from '../components/projectDetails/ProjectAbout';
import MessagesSection from '../components/projectDetails/MessagesSection';
import  ProjectTabs  from '../components/projectDetails/ProjectTabs';


const ProjectDetail = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample project data - in a real app, this would come from an API
  const project = {
    id: projectId,
    name: 'React Dashboard',
    username: 'developer123',
    startDate: '15 Jan 2023',
    views: 1250,
    languages: ['JavaScript', 'TypeScript', 'CSS'],
    description: 'A customizable admin dashboard built with React and Material UI. Features data visualization and user management.',
    members: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
    downloads: 543,
    stars: 128,
    version: 'v1.2.5',
    messages: [
      { user: 'John Doe', time: '2 hours ago', message: 'Fixed responsive issues' },
      { user: 'Jane Smith', time: '5 hours ago', message: 'Updated dependencies' },
      { user: 'Mike Johnson', time: '1 day ago', message: 'Added new chart component' }
    ],
    files: [
      { name: 'src/components', type: 'folder', changes: 'Member 1', time: '2 hours ago' },
      { name: 'src/utils', type: 'folder', changes: 'Member 2', time: '5 hours ago' },
      { name: 'src/styles', type: 'folder', changes: 'Member 3', time: '1 day ago' },
      { name: 'package.json', type: 'file', changes: 'Member 1', time: '2 hours ago' },
      { name: 'README.md', type: 'file', changes: 'Member 2', time: '5 hours ago' }
    ],
    discussions: [
      {
        user: 'User 1',
        time: '3 days ago',
        content: 'Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa. Sit nulla nihil est aspernatur itaque hic consequuntur corrupti eos iusto iste. Ut totam provident et exercitationem cumque aut dolores vitae qui voluptatem voluptate.'
      },
      {
        user: 'User 2',
        time: '1 week ago',
        content: 'Ut fugit autem est sunt quis qui repudiandae consequatur qui repudiandae tenetur qui voluptates tenetur aut suscipit fugiti. Lorem ipsum dolor sit amet. Et facilis ducimus non laboriosam sunt et nesciunt quasi et ipsa voluptatem a quidem culpa.'
      }
    ]
  };

  return (
    <div className="home-container">
      <div className="project-detail-container">
        <ProjectHeader project={project} />

        <hr className="divider" />

        <ProjectAbout project={project} />

        <hr className="divider" />

        <MessagesSection messages={project.messages} />

        <hr className="divider" />

        <ProjectTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          project={project} 
        />
      </div>
    </div>
  );
};

export default ProjectDetail;