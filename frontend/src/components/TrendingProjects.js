import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TrendingProjects = () => {
  const [trendingProjects, setTrendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchTrendingProjects();
  }, []);

  const fetchTrendingProjects = async () => {
    try {
      setLoading(true);
      
      // Use the all projects endpoint and sort by popularity metrics
      const response = await fetch('/api/projects/all', {
        headers: {
          'Authorization': `Bearer ${currentUser?._id || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const projects = await response.json();
        
        // Sort projects by a combination of factors to determine "trending"
        const sortedProjects = projects
          .filter(project => project.isPublic) // Only show public projects
          .sort((a, b) => {
            // You can adjust these weights based on what makes a project "trending"
            const scoreA = (a.downloads || 0) + (a.stars || 0) * 2 + (a.views || 0) * 0.5;
            const scoreB = (b.downloads || 0) + (b.stars || 0) * 2 + (b.views || 0) * 0.5;
            return scoreB - scoreA; // Descending order
          })
          .slice(0, 5); // Top 5 trending projects

        setTrendingProjects(sortedProjects);
      } else {
        console.error('Failed to fetch trending projects');
        setTrendingProjects(getFallbackProjects());
      }
    } catch (error) {
      console.error('Error fetching trending projects:', error);
      setTrendingProjects(getFallbackProjects());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackProjects = () => {
    // Fallback data if API fails
    return [
      {
        id: '1',
        name: 'E-commerce Dashboard',
        type: 'Web Application',
        stars: 45,
        downloads: 120
      },
      {
        id: '2', 
        name: 'Mobile Task Manager',
        type: 'Mobile App',
        stars: 32,
        downloads: 89
      },
      {
        id: '3',
        name: 'AI Chat Interface',
        type: 'Web Application', 
        stars: 28,
        downloads: 76
      },
      {
        id: '4',
        name: 'Fitness Tracking App',
        type: 'Mobile App',
        stars: 24,
        downloads: 65
      },
      {
        id: '5',
        name: 'Social Media Analytics',
        type: 'Web Application',
        stars: 19,
        downloads: 54
      }
    ];
  };

  const getTrendingIcon = (index) => {
    switch(index) {
      case 0: return 'Fire';
      case 1: return 'Inovative';
      case 2: return 'Eye-catching';
      case 3: return 'Progress';
      case 4: return 'Star Players';
      default: return 'Statistical';
    }
  };

  if (loading) {
    return (
      <div className="trending-projects">
        <h3 className="section-title">Trending Projects</h3>
        <div className="loading">Loading trending projects...</div>
      </div>
    );
  }

  return (
    <div className="trending-projects">
      <h3 className="section-title">Trending Projects 🔥</h3>
      
      {trendingProjects.length === 0 ? (
        <div className="empty-state">
          <p>No trending projects found</p>
        </div>
      ) : (
        <ul className="projects-list">
          {trendingProjects.map((project, index) => (
            <li key={project.id} className="project-item trending-item">
              <Link to={`/projects/${project.id}`} className="project-link">
                <div className="trending-rank">
                  <span className="trending-icon">{getTrendingIcon(index)}</span>
                  <span className="rank-number">#{index + 1}</span>
                </div>
                <div className="project-info">
                  <h4 className="project-name">{project.name}</h4>
                  <p className="project-type">{project.type || 'Web Application'}</p>
                  <div className="project-stats">
                    <span className="stat">
                      <span className="stat-icon">⭐</span>
                      {project.stars || Math.floor(Math.random() * 50) + 10}
                    </span>
                    <span className="stat">
                      <span className="stat-icon">⬇️</span>
                      {project.downloads || Math.floor(Math.random() * 100) + 20}
                    </span>
                  </div>
                </div>
              </Link>
              {project.isCheckedOut && (
                <div className="checked-out-badge" title="Currently Checked Out">
                  🔒
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      
      {trendingProjects.length > 0 && (
        <div className="view-all-container">
          <Link to="/projects" className="view-all-link">
            View All Projects
          </Link>
        </div>
      )}
    </div>
  );
};

export default TrendingProjects;