import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSplashPage = location.pathname === '/';

  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing auth state)
    navigate('/');
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/assets/logo.png" alt="View Doc Logo" style={{ height: '40px' }} />
          {isSplashPage ? <span>View Doc</span> : <Link to="/home">View Doc</Link>}
        </div>
        <ul className="nav-menu">
          {!isSplashPage && <li><Link to="/home">Home</Link></li>}
          {!isSplashPage && <li><Link to="/projects">Projects</Link></li>}
          {!isSplashPage && <li><Link to="/friends">Friends</Link></li>}
        </ul>
        <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isSplashPage && (
            <>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                <FaUserCircle size={28} />
                <span>Username</span>
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