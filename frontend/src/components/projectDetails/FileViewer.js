import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // ADD Link import

const FileViewer = () => {
  const { projectId, fileName } = useParams();
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFileContent();
  }, [projectId, fileName]);

  const fetchFileContent = async () => {
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
          fileName: fileName,
          path: '' // You can modify this to handle nested paths
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }

      const fileData = await response.json();
      setFileContent(fileData.content || '');
    } catch (error) {
      console.error('Error fetching file content:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading file content...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="file-viewer-container">
      <div className="file-viewer-header">
        <div className="file-header-left">
          <Link to={`/projects/${projectId}`} className="back-link">
            ← Back to Project
          </Link>
          <h2 className="file-title">{fileName}</h2>
        </div>
        <div className="file-actions">
          <button className="btn btn-secondary">Download</button>
          <button className="btn btn-primary">Edit</button>
        </div>
      </div>
      
      <div className="file-content-container">
        <div className="file-content-header">
          <span className="file-path">{fileName}</span>
          <span className="file-size">{fileContent.length} characters</span>
        </div>
        
        <div className="code-viewer">
          <pre className="code-content">
            <code>{fileContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;