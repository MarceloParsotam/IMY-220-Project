import React, { useState } from 'react';

const FilesTab = ({ files = [], currentUser, projectId, onRefreshProject }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [creatingType, setCreatingType] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');

  const getFilesInCurrentPath = () => {
    return files.filter(file => {
      const filePath = file.path || '';
      return filePath === currentPath;
    });
  };

  const getSubdirectories = () => {
    const dirs = new Set();
    files.forEach(file => {
      if (file.type === 'folder') {
        dirs.add(file.name + '/');
      }
    });
    return Array.from(dirs);
  };

  const handleFileClick = async (file) => {
    if (file.type === 'folder') {
      setCurrentPath(file.name + '/');
      setSelectedFile(null);
      setFileContent('');
    } else {
      // For files, fetch and display content
      setSelectedFile(file);
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = userData?._id || userData?.id || '';

        const response = await fetch(`http://localhost:3000/api/projects/${projectId}/files/content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: file.name,
            path: currentPath
          })
        });

        if (response.ok) {
          const fileData = await response.json();
          setFileContent(fileData.content || '');
        } else {
          setFileContent('// Unable to load file content');
        }
      } catch (error) {
        console.error('Error fetching file content:', error);
        setFileContent('// Error loading file content');
      }
    }
  };

  const handleDownloadFile = () => {
    if (!selectedFile || !fileContent) return;

    // Create a blob with the file content
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    setIsCreatingFile(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFileName.trim(),
          content: newFileContent,
          type: creatingType,
          path: currentPath,
          changes: currentUser?.name || currentUser?.username || 'User',
          time: 'Just now'
        })
      });

      if (response.ok) {
        setNewFileName('');
        setNewFileContent('');
        setShowAddFileModal(false);
        if (onRefreshProject) {
          onRefreshProject();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add file');
      }
    } catch (error) {
      console.error('Error adding file:', error);
      alert(error.message);
    } finally {
      setIsCreatingFile(false);
    }
  };

  const navigateToPath = (path) => {
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent('');
  };

  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <section className="project-section">
      <div className="files-header">
        <h2 className="section-title">Files</h2>
        {currentUser && (
          <button 
            className="add-file-btn"
            onClick={() => {
              setCreatingType('file');
              setShowAddFileModal(true);
            }}
          >
            Add File
          </button>
        )}
      </div>

      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <button 
          className="breadcrumb-item" 
          onClick={() => {
            setCurrentPath('');
            setSelectedFile(null);
            setFileContent('');
          }}
        >
          root
        </button>
        {breadcrumbs.map((crumb, index) => {
          const path = breadcrumbs.slice(0, index + 1).join('/') + '/';
          return (
            <React.Fragment key={path}>
              <span className="breadcrumb-separator">/</span>
              <button 
                className="breadcrumb-item"
                onClick={() => navigateToPath(path)}
              >
                {crumb}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <div className="files-container">
        {/* Files List */}
        <div className="files-list">
          <div className="files-table">
            <div className="table-header">
              <span className="file-name">Name</span>
              <span className="file-changes">Last Updated By</span>
              <span className="file-time">Last Updated</span>
            </div>
            
            {/* Folders first */}
            {files.filter(f => f.type === 'folder').map((folder, index) => (
              <div 
                key={index} 
                className={`table-row directory-row ${selectedFile?.name === folder.name ? 'selected' : ''}`}
                onClick={() => handleFileClick(folder)}
              >
                <span className="file-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {folder.name}
                </span>
                <span className="file-changes">{folder.changes}</span>
                <span className="file-time">{folder.time}</span>
              </div>
            ))}

            {/* Files */}
            {files.filter(f => f.type === 'file').map((file, index) => (
              <div 
                key={index} 
                className={`table-row ${selectedFile?.name === file.name ? 'selected' : ''}`}
                onClick={() => handleFileClick(file)}
              >
                <span className="file-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  {file.name}
                </span>
                <span className="file-changes">{file.changes}</span>
                <span className="file-time">{file.time}</span>
              </div>
            ))}

            {files.length === 0 && (
              <div className="no-files">
                <p>No files in this project</p>
              </div>
            )}
          </div>
        </div>

        {/* File Content Viewer */}
        {selectedFile && (
          <div className="file-content-panel">
            <div className="file-content-header">
              <div className="file-header-top">
                <h3 className="file-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  {selectedFile.name}
                </h3>
              </div>
              <div className="file-meta">
                <span>Last updated: {selectedFile.time}</span>
                <span>By: {selectedFile.changes}</span>
                <span>Size: {fileContent.length} characters</span>
                <button 
                  className="download-btn"
                  onClick={handleDownloadFile}
                  title="Download this file"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="code-viewer">
              <pre className="code-content">
                <code>{fileContent}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Add File/Folder Modal */}
      {showAddFileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New {creatingType === 'folder' ? 'Folder' : 'File'}</h3>
            <form onSubmit={handleAddFile}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder={creatingType === 'folder' ? 'folder-name' : 'filename.js'}
                  required
                />
              </div>
              
              {creatingType === 'file' && (
                <div className="form-group">
                  <label>Content:</label>
                  <textarea
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    placeholder="File content..."
                    rows="6"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Type:</label>
                <div className="type-selector">
                  <button
                    type="button"
                    className={`type-btn ${creatingType === 'file' ? 'active' : ''}`}
                    onClick={() => setCreatingType('file')}
                  >
                    File
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${creatingType === 'folder' ? 'active' : ''}`}
                    onClick={() => setCreatingType('folder')}
                  >
                    Folder
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAddFileModal(false)}
                  disabled={isCreatingFile}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!newFileName.trim() || isCreatingFile}
                >
                  {isCreatingFile ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default FilesTab;