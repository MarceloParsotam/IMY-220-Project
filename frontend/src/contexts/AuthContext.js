import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call the logout endpoint
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?._id || userData?.id;
      
      if (token) {
        const response = await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.warn('Logout endpoint returned non-200 status:', response.status);
        }
      }
    } catch (error) {
      console.warn('Error calling logout endpoint:', error);
      // Continue with logout even if endpoint fails
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Register function
  const register = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  };

  // Update user function (for profile updates)
  const updateUser = (updatedUserData) => {
    try {
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setCurrentUser(updatedUserData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};