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
      
      const response = await fetch('/api/projects/all', {
        headers: {
          'Authorization': `Bearer ${currentUser?._id || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        let projects = await response.json();
        
        // Filter public projects and get projects with real stats
        const publicProjects = projects.filter(project => project.isPublic);
        
        // Fetch real stats for each project
        const projectsWithRealStats = await Promise.all(
          publicProjects.slice(0, 10).map(async (project) => {
            try {
              // Fetch favorites count
              const favoritesResponse = await fetch(`/api/projects/${project.id}/favorites-count`, {
                headers: {
                  'Authorization': `Bearer ${currentUser?._id || ''}`,
                  'Content-Type': 'application/json'
                }
              });
              
              // Fetch views count
              const viewsResponse = await fetch(`/api/projects/${project.id}/views`, {
                headers: {
                  'Authorization': `Bearer ${currentUser?._id || ''}`,
                  'Content-Type': 'application/json'
                }
              });

              const favoritesData = favoritesResponse.ok ? await favoritesResponse.json() : { favoritesCount: 0 };
              const viewsData = viewsResponse.ok ? await viewsResponse.json() : { viewsCount: 0 };

              return {
                ...project,
                favoritesCount: favoritesData.favoritesCount || 0,
                viewsCount: viewsData.viewsCount || 0
              };
            } catch (error) {
              console.error(`Error fetching stats for project ${project.id}:`, error);
              return {
                ...project,
                favoritesCount: 0,
                viewsCount: 0
              };
            }
          })
        );

        // Sort by trending score (favorites + views)
        const sortedProjects = projectsWithRealStats.sort((a, b) => {
          const scoreA = (a.favoritesCount || 0) + (a.viewsCount || 0);
          const scoreB = (b.favoritesCount || 0) + (b.viewsCount || 0);
          return scoreB - scoreA;
        }).slice(0, 5);

        setTrendingProjects(sortedProjects);
      } else {
        console.error('Failed to fetch trending projects');
        setTrendingProjects([]);
      }
    } catch (error) {
      console.error('Error fetching trending projects:', error);
      setTrendingProjects([]);
    } finally {
      setLoading(false);
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
      <h3 className="section-title">Trending Projects</h3>
      
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
                  <span className="rank-number">#{index + 1}</span>
                </div>
                <div className="project-info">
                  <h4 className="project-name">{project.name}</h4>
                  <p className="project-type">{project.type || 'Web Application'}</p>
                  <div className="project-stats">
                    <span className="stat">
                      {project.favoritesCount || 0} favorites
                    </span>
                    <span className="stat">
                      {project.viewsCount || 0} views
                    </span>
                  </div>
                </div>
              </Link>
              {project.isCheckedOut && (
                <div className="checked-out-badge" title="Currently Checked Out">
                  Checked Out
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