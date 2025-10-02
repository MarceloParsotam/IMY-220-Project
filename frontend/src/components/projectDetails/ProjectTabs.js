import React from 'react';
import FilesTab from './FilesTab';
import DiscussionTab from './DiscussionTab';

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
      </div>

      <div className="tab-content">
        {activeTab === 'files' && (
          <FilesTab 
            files={project.files || []} 
            currentUser={currentUser}  // Pass currentUser to FilesTab
            projectId={project._id}
            onRefreshProject={onRefreshProject}
          />
        )}
        {activeTab === 'discussion' && (
          <DiscussionTab 
            discussions={project.discussions || []} 
            currentUser={currentUser}  // Pass currentUser to DiscussionTab
            projectId={project._id}
            onRefreshProject={onRefreshProject}
          />
        )}
      </div>
    </>
  );
};

export default ProjectTabs;