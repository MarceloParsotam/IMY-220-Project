import React from 'react';

const ProjectFilters = ({ 
  tabs, 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  filterType, 
  setFilterType, 
  filterTypes 
}) => {
  return (
    <div className="project-filters">
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.name}
            className={`filter-btn ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name} <span className="projects-count">{tab.count}</span>
          </button>
        ))}
      </div>
      
      <div className="search-filter">
        <div className="search-container">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          {filterTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProjectFilters;