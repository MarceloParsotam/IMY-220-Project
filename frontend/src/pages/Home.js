import React from 'react';
import Sidebar from '../components/Sidebar';
import ActivityFeed from '../components/ActivityFeed';
import TrendingProjects from '../components/TrendingProjects';
import PossibleConnections from '../components/PossibleConnections';
import AdminAccess from '../components/admin/AdminAccess'; // Add this import
import '../styles/global.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-layout">
        {/* Left Sidebar */}
        <aside className="sidebar-left">
          <Sidebar />
        </aside>
        
        {/* Main Content */}
        <main className="main-content">
          <ActivityFeed />
        </main>
        
        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <AdminAccess /> {/* Add this line */}
          <TrendingProjects />
          <PossibleConnections />
        </aside>
      </div>
    </div>
  );
};

export default Home;