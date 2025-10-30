// Update ProjectTabs.js
import React from 'react';
import FilesTab from './FilesTab';
import DiscussionTab from './DiscussionTab';
import ProjectMembersTab from './ProjectMembersTab'; // Add this import

const ProjectTabs = ({ activeTab, setActiveTab, project, currentUser, onRefreshProject }) => {
  return (
    <>
      <div className="project-tabs">
        <button 
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
        <button 
          className={`tab-button ${activeTab === 'discussion' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          Discussion
        </button>
        <button 
          className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'files' && (
          <FilesTab 
            files={project.files || []} 
            currentUser={currentUser}
            projectId={project._id}
            onRefreshProject={onRefreshProject}
          />
        )}
        {activeTab === 'discussion' && (
          <DiscussionTab 
            discussions={project.discussions || []} 
            currentUser={currentUser}
            projectId={project._id}
            onRefreshProject={onRefreshProject}
          />
        )}
        {activeTab === 'members' && (
          <ProjectMembersTab 
            project={project}
            currentUser={currentUser}
            onRefreshProject={onRefreshProject}
          />
        )}
      </div>
    </>
  );
};

export default ProjectTabs;