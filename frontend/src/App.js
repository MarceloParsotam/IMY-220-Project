import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import AuthContext
import Header from './components/Header';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import AdminPanel from './components/admin/AdminPanel';

// Protected Route component using AuthContext
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

// Header wrapper to use AuthContext
const HeaderWithAuth = () => {
  const { currentUser, isAuthenticated } = useAuth();
  return <Header isAuthenticated={isAuthenticated} user={currentUser} />;
};

function App() {
  return (
    <AuthProvider> {/* Wrap everything with AuthProvider */}
      <Router>
        <HeaderWithAuth />
        <Routes>
          <Route 
            path="/" 
            element={<SplashRoute />} 
          />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects/:projectId" 
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/friends" 
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminPanel />
              } 
            />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Separate component for splash route to use AuthContext
const SplashRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" /> : <Splash />;
};

export default App;