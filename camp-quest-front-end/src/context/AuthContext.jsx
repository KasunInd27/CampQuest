import React, { useEffect, useState, createContext, useContext } from 'react';

// API Configuration
const API_BASE_URL = 'http://localhost:5002/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include', // Include cookies for CORS
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  // Handle token expiration
  if (response.status === 401 && data.message?.includes('expired')) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('campquest_user');
    throw new Error('Session expired. Please login again.');
  }
  
  return { data, status: response.status, ok: response.ok };
};

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('campquest_user');
    const token = localStorage.getItem('authToken');
    
    if (storedUser && token) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('campquest_user');
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  // Real authentication functions
  const login = async (email, password, remember = false) => {
    setLoading(true);
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe: remember })
      });

      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        // Store tokens and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('campquest_user', JSON.stringify(user));
        
        setCurrentUser(user);
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone = '+1234567890') => {
    setLoading(true);
    try {
      console.log('Registering user:', { name, email, phone }); // Debug log
      
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          phone,
          address: {
            country: 'USA'
          }
        })
      });

      console.log('Registration response:', response); // Debug log

      if (response.data.success) {
        // Registration successful - show success message but don't auto-login
        return { 
          success: true, 
          message: response.data.message,
          user: response.data.data.user 
        };
      } else {
        console.error('Registration failed:', response.data);
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Call backend logout to blacklist token
        await apiCall('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless
      setCurrentUser(null);
      localStorage.removeItem('campquest_user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  const resetPassword = async (token, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // In a real app, this would validate the token and update the password
  };

  const updateProfile = async (data) => {
    if (!currentUser) return;
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const updatedUser = {
      ...currentUser,
      ...data,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('campquest_user', JSON.stringify(updatedUser));
  };

  const changePassword = async (oldPassword, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (oldPassword !== 'password') {
      throw new Error('Current password is incorrect');
    }
    // In a real app, this would update the password in the backend
  };

  const value = {
    user: currentUser,
    isAuthenticated: !!currentUser,
    isLoading: loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};