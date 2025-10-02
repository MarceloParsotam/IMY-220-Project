import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const FileView = () => {
  const { projectId, fileId } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFileContent();
  }, [projectId, fileId]);

  const fetchFileContent = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id || '';

      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }

      const fileData = await response.json();
      setFile(fileData);
    } catch (error) {
      console.error('Error fetching file:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading file...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!file) return <div className="error">File not found</div>;

  return (
    <div className="file-view-container">
      <div className="file-header">
        <Link to={`/project/${projectId}`} className="back-button">
          ← Back to Project
        </Link>
        <h2 className="file-title">{file.name}</h2>
        <div className="file-meta">
          <span>Path: {file.path || '/'}</span>
          <span>Last updated: {new Date(file.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="file-content">
        <pre className="code-block">
          <code>{file.content}</code>
        </pre>
      </div>
    </div>
  );
};

export default FileView;