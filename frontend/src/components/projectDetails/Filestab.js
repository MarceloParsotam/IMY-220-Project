// Enhanced FilesTab.js with file editing and larger viewer
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const FilesTab = ({ files = [], currentUser, projectId, onRefreshProject, projectName = "project" }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [currentItems, setCurrentItems] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [creatingType, setCreatingType] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [viewerSize, setViewerSize] = useState('large'); // 'compact' or 'large'

  useEffect(() => {
    navigateToPath(currentPath);
  }, [files, currentPath]);

  const navigateToPath = async (path) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/files/navigate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: path
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentItems(data.items || []);
        setBreadcrumbs(data.breadcrumbs || []);
      } else {
        console.error('Failed to navigate to path');
        filterFilesByPath(path);
      }
    } catch (error) {
      console.error('Error navigating:', error);
      filterFilesByPath(path);
    }
  };

  const filterFilesByPath = (path) => {
    const filtered = files.filter(file => file.path === path);
    setCurrentItems(filtered);
    
    if (!path) {
      setBreadcrumbs([{ name: 'root', path: '' }]);
    } else {
      const parts = path.split('/');
      const breadcrumbs = [{ name: 'root', path: '' }];
      let currentPath = '';
      parts.forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        breadcrumbs.push({
          name: part,
          path: currentPath
        });
      });
      setBreadcrumbs(breadcrumbs);
    }
  };

  const handleFileClick = async (file) => {
    if (file.type === 'folder') {
      const newPath = file.path ? `${file.path}/${file.name}` : file.name;
      setCurrentPath(newPath);
      setSelectedFile(null);
      setFileContent('');
      setEditingContent('');
      setIsEditing(false);
    } else {
      setSelectedFile(file);
      setIsEditing(false);
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
            path: file.path
          })
        });

        if (response.ok) {
          const fileData = await response.json();
          setFileContent(fileData.content || '');
          setEditingContent(fileData.content || '');
        } else {
          setFileContent('// Unable to load file content');
          setEditingContent('// Unable to load file content');
        }
      } catch (error) {
        console.error('Error fetching file content:', error);
        setFileContent('// Error loading file content');
        setEditingContent('// Error loading file content');
      }
    }
  };

  const handleEditFile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingContent(fileContent);
    setIsEditing(false);
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;

    setIsSaving(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/files/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          path: selectedFile.path,
          content: editingContent,
          changes: currentUser?.name || currentUser?.username || 'User'
        })
      });

      if (response.ok) {
        setFileContent(editingContent);
        setIsEditing(false);
        
        // Refresh the file list to show updated timestamp
        if (onRefreshProject) {
          onRefreshProject();
        }
        
        alert('File saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert(error.message || 'Error saving file. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadFile = () => {
    if (!selectedFile || !fileContent) return;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  };

  const handleDownloadProjectAsZip = async () => {
    setIsDownloadingZip(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';
      
      const zip = new JSZip();
      
      const addFilesToZip = async (fileList, currentPath = '') => {
        for (const file of fileList) {
          if (file.type === 'folder') {
            const folderPath = currentPath ? `${currentPath}/${file.name}` : file.name;
            const folder = zip.folder(folderPath);
            
            const folderFiles = files.filter(f => 
              f.path === (file.path ? `${file.path}/${file.name}` : file.name)
            );
            
            await addFilesToZip(folderFiles, folderPath);
          } else {
            try {
              const response = await fetch(`http://localhost:3000/api/projects/${projectId}/files/content`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  fileName: file.name,
                  path: file.path
                })
              });

              if (response.ok) {
                const fileData = await response.json();
                const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
                zip.file(filePath, fileData.content || '');
              }
            } catch (error) {
              console.error(`Error fetching file ${file.name}:`, error);
              const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
              zip.file(filePath, `// Unable to load content for ${file.name}`);
            }
          }
        }
      };

      await addFilesToZip(files.filter(f => !f.path));
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, `${projectName}-${projectId}.zip`);
      
    } catch (error) {
      console.error('Error creating project zip:', error);
      alert('Error downloading project as ZIP. Please try again.');
    } finally {
      setIsDownloadingZip(false);
    }
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
        navigateToPath(currentPath);
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

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Are you sure you want to delete ${file.type === 'folder' ? 'the folder' : 'the file'} "${file.name}"?`)) {
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/files`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: file.name,
          path: file.path,
          type: file.type
        })
      });

      if (response.ok) {
        if (onRefreshProject) {
          onRefreshProject();
        }
        navigateToPath(currentPath);
        
        if (selectedFile && selectedFile.name === file.name && selectedFile.path === file.path) {
          setSelectedFile(null);
          setFileContent('');
          setEditingContent('');
          setIsEditing(false);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
    }
  };

  const handleBreadcrumbClick = (path) => {
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent('');
    setEditingContent('');
    setIsEditing(false);
  };

  const toggleViewerSize = () => {
    setViewerSize(viewerSize === 'large' ? 'compact' : 'large');
  };

  return (
    <section className="project-section">
      <div className="files-header">
        <h2 className="section-title">Files</h2>
        <div className="files-actions">
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
          {currentUser && (
            <button 
              className="add-folder-btn"
              onClick={() => {
                setCreatingType('folder');
                setShowAddFileModal(true);
              }}
            >
              Add Folder
            </button>
          )}
          <button 
            className="download-project-btn"
            onClick={handleDownloadProjectAsZip}
            disabled={isDownloadingZip || files.length === 0}
          >
            {isDownloadingZip ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Packaging...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Download Project as ZIP
              </>
            )}
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <span className="breadcrumb-separator">/</span>}
            <button 
              className={`breadcrumb-item ${crumb.path === currentPath ? 'active' : ''}`}
              onClick={() => handleBreadcrumbClick(crumb.path)}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className={`files-container ${viewerSize === 'large' ? 'large-viewer' : 'compact-viewer'}`}>
        {/* Files List */}
        <div className="files-list">
          <div className="files-table">
            <div className="table-header">
              <span className="file-name">Name</span>
              <span className="file-changes">Last Updated By</span>
              <span className="file-time">Last Updated</span>
              {currentUser && <span className="file-actions">Actions</span>}
            </div>
            
            {/* Folders first */}
            {currentItems.filter(f => f.type === 'folder').map((folder, index) => (
              <div 
                key={index} 
                className={`table-row directory-row ${selectedFile?.name === folder.name && selectedFile?.path === folder.path ? 'selected' : ''}`}
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
                {currentUser && (
                  <span className="file-actions">
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(folder);
                      }}
                      title="Delete folder"
                    >
                      Delete
                    </button>
                  </span>
                )}
              </div>
            ))}

            {/* Files */}
            {currentItems.filter(f => f.type === 'file').map((file, index) => (
              <div 
                key={index} 
                className={`table-row ${selectedFile?.name === file.name && selectedFile?.path === file.path ? 'selected' : ''}`}
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
                {currentUser && (
                  <span className="file-actions">
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file);
                      }}
                      title="Delete file"
                    >
                      Delete
                    </button>
                  </span>
                )}
              </div>
            ))}

            {currentItems.length === 0 && (
              <div className="no-files">
                <p>No files or folders in this location</p>
              </div>
            )}
          </div>
        </div>

        {/* File Content Viewer - Enhanced with editing and size toggle */}
        {selectedFile && selectedFile.type === 'file' && (
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
                <div className="file-viewer-controls">
                  <button 
                    className="viewer-size-toggle"
                    onClick={toggleViewerSize}
                    title={viewerSize === 'large' ? 'Make viewer smaller' : 'Make viewer larger'}
                  >
                    {viewerSize === 'large' ? '⊖' : '⊕'}
                  </button>
                </div>
              </div>
              <div className="file-meta">
                <span>Path: {selectedFile.path || 'root'}</span>
                <span>Last updated: {selectedFile.time}</span>
                <span>By: {selectedFile.changes}</span>
                <span>Size: {fileContent.length} characters</span>
                {currentUser && !isEditing && (
                  <button 
                    className="edit-btn"
                    onClick={handleEditFile}
                    title="Edit this file"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                )}
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
              {isEditing ? (
                <div className="edit-mode">
                  <textarea
                    className="code-editor"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    spellCheck="false"
                    placeholder="Enter file content..."
                  />
                  <div className="edit-actions">
                    <button 
                      className="cancel-btn"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button 
                      className="save-btn"
                      onClick={handleSaveFile}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="code-content">
                  <code>{fileContent}</code>
                </pre>
              )}
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
                <label>Location:</label>
                <div className="current-path">
                  <strong>Current Path:</strong> {currentPath || 'root'}
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