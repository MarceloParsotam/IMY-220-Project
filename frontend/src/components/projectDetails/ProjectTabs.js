import React from 'react';
import OverviewTab from './OverviewTab';
import FilesTab from './FilesTab';
import DiscussionTab from './DiscussionTab';

const ProjectTabs = ({ activeTab, setActiveTab, project }) => {
  return (
    <>
      <div className="project-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
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
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'files' && <FilesTab files={project.files} />}
        {activeTab === 'discussion' && <DiscussionTab discussions={project.discussions} />}
      </div>
    </>
  );
};

export default ProjectTabs;