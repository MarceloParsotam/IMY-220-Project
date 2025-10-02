import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext'; // Import AuthContext

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth(); // Use AuthContext
  const isSplashPage = location.pathname === '/';

  const handleLogout = () => {
    logout(); // Use AuthContext logout function
    navigate('/'); // Navigate to splash page
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/assets/logo.png" alt="View Doc Logo" style={{ height: '40px' }} />
          {isSplashPage ? <span>View Doc</span> : <Link to="/home">View Doc</Link>}
        </div>
        
        {isAuthenticated && (
          <ul className="nav-menu">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/projects">Projects</Link></li>
            <li><Link to="/friends">Friends</Link></li>
          </ul>
        )}
        
        <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isAuthenticated && currentUser && (
            <>
              <Link 
                to={`/profile/${currentUser._id || currentUser.id}`} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  textDecoration: 'none', 
                  color: 'inherit' 
                }}
              >
                <FaUserCircle size={28} />
                <span>{currentUser.username}</span> {/* Use username instead of name */}
              </Link>
              <FaSignOutAlt 
                size={24} 
                style={{ marginLeft: '0.5rem', cursor: 'pointer', color: '#e74c3c' }} 
                title="Logout"
                onClick={handleLogout}
              />
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;