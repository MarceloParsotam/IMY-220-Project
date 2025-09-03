import React from 'react';

const FilesTab = ({ files }) => {
  return (
    <section className="project-section">
      <h2 className="section-title">Project Files</h2>
      <div className="files-table">
        <div className="table-header">
          <span className="file-name">Name</span>
          <span className="file-changes">Changes</span>
          <span className="file-time">Last Updated</span>
        </div>
        {files.map((file, index) => (
          <div key={index} className="table-row">
            <span className="file-name">
              {file.type === 'folder' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2z"></path>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              )}
              {file.name}
            </span>
            <span className="file-changes">{file.changes}</span>
            <span className="file-time">{file.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FilesTab;