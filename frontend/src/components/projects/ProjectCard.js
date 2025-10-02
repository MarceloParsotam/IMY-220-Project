import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProjectCard = ({ project, onCheckoutUpdate }) => {
  const [isCheckedOut, setIsCheckedOut] = useState(project.isCheckedOut || false);
  const [currentCheckout, setCurrentCheckout] = useState(project.currentCheckout || null);
  const [isFavorite, setIsFavorite] = useState(project.isFavorite || false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Get token from localStorage
  const getToken = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?._id || userData?.id || '';
  };

  // Fetch current checkout status
  const fetchCheckoutStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/projects/checkout-status/${project.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsCheckedOut(data.isCheckedOut);
        setCurrentCheckout(data.currentCheckout);
      }
    } catch (error) {
      console.error('Error fetching checkout status:', error);
    }
  };

  useEffect(() => {
    fetchCheckoutStatus();
  }, [project.id]);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const response = await fetch('http://localhost:3000/api/projects/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: project.id,
          expectedReturn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          notes: 'Working on project updates'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setIsCheckedOut(true);
        setCurrentCheckout(result.checkout);
        if (onCheckoutUpdate) {
          onCheckoutUpdate(project.id, true, result.checkout);
        }
        alert('Project checked out successfully!');
        
        // Refresh checkout status to ensure data is current
        await fetchCheckoutStatus();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to check out project');
      }
    } catch (error) {
      console.error('Error checking out project:', error);
      alert('Failed to check out project');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const response = await fetch('http://localhost:3000/api/projects/checkin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: project.id,
          notes: 'Completed work on project'
        })
      });

      if (response.ok) {
        setIsCheckedOut(false);
        setCurrentCheckout(null);
        if (onCheckoutUpdate) {
          onCheckoutUpdate(project.id, false, null);
        }
        alert('Project checked in successfully!');
        
        // Refresh checkout status to ensure data is current
        await fetchCheckoutStatus();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to check in project');
      }
    } catch (error) {
      console.error('Error checking in project:', error);
      alert('Failed to check in project');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Add API call here for actual favorite functionality
  };

  const canCheckIn = currentCheckout && 
                   currentCheckout.userId === (currentUser?._id || currentUser?.id);

  const isOwnedByUser = project.userId === (currentUser?._id || currentUser?.id);

  return (
    <div className="project-card message-card">
      <div className="project-header">
        <div className="project-title-section">
          <h3 className="project-title">{project.name}</h3>
          <div className="project-type">{project.type}</div>
        </div>
        <div className="project-status-container">
          <div className={`project-status ${isCheckedOut ? 'status-checked-out' : 'status-checked-in'}`}>
            {isCheckedOut ? `Checked Out (${currentCheckout?.userName || 'Someone'})` : 'Checked In'}
          </div>
          <div 
            className={`project-favorite ${isFavorite ? 'favorite-active' : ''}`}
            onClick={toggleFavorite}
            style={{ cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {isFavorite ? 'FAVORITE' : 'Add to Favorites'}
          </div>
        </div>
      </div>
      
      <p className="project-description">{project.description}</p>
      
      <div className="project-meta">
        <span className="project-version">{project.version || 'v1.0.0'}</span>
        <span className="project-created">Created: {project.created}</span>
        <span className="project-updated">Updated: {project.lastUpdated}</span>
        {isCheckedOut && currentCheckout?.expectedReturn && (
          <span className="project-due">Due: {new Date(currentCheckout.expectedReturn).toLocaleDateString()}</span>
        )}
      </div>
      
      <div className="project-tags">
        {project.tags && project.tags.map((tag, index) => (
          <span key={index} className="project-tag">#{tag}</span>
        ))}
      </div>
      
      <div className="project-actions">
        {isCheckedOut ? (
          <button 
            className={`project-btn ${canCheckIn ? 'primary-btn' : 'secondary-btn'}`} 
            onClick={canCheckIn ? handleCheckin : undefined}
            disabled={loading || !canCheckIn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"></path>
            </svg>
            {loading ? 'Processing...' : (canCheckIn ? 'Check In' : 'Checked Out')}
          </button>
        ) : (
          <button 
            className="project-btn primary-btn" 
            onClick={handleCheckout}
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5-5-5 5M12 4.2v10.3"></path>
            </svg>
            {loading ? 'Processing...' : 'Check Out'}
          </button>
        )}
        <Link to={`/projects/${project.id}`} className="project-btn secondary-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View
        </Link>
        {isOwnedByUser && (
          <button className="project-btn secondary-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;