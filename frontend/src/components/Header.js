import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ isAuthenticated, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSplashPage = location.pathname === '/';

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to splash page and reload to reset state
    window.location.href = '/';
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
          {isAuthenticated && user && (
            <>
              <Link to={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                <FaUserCircle size={28} />
                <span>{user.name || user.username}</span>
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