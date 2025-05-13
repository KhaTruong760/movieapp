// src/services/auth.js - Authentication service
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios to include credentials (cookies)
axios.defaults.withCredentials = true;

export const authService = {
  register: async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },
  
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      });
      
      const { user } = response.data;
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },
  
  // Add a function to check if user is authenticated
  checkAuthStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/user`);
      const { user } = response.data;
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      // Clear user data if not authenticated
      localStorage.removeItem('user');
      return null;
    }
  },
  
  logout: async () => {
    try {
      await axios.post(`${API_URL}/logout`);
      
      // Clean up localStorage
      localStorage.removeItem('user');
      
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { error: 'Logout failed' };
    }
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    
    if (user) {
      return JSON.parse(user);
    }
    
    return null;

    },
    getName: () => {
      const user = localStorage.getItem('user');
      
      if (user) {
          const userObj = JSON.parse(user);
          return userObj.username;
      }
      
      return null;
  }
}
