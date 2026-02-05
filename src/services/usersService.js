// ============================================
// Users API Service
// ============================================

import api from './api';

const usersService = {
  // Get all users
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/users${queryString ? `?${queryString}` : ''}`);
  },

  // Get user by ID
  getById: async (id) => {
    return api.get(`/users/${id}`);
  },

  // Create user
  create: async (userData) => {
    return api.post('/users', userData);
  },

  // Update user
  update: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  // Delete user
  delete: async (id) => {
    return api.delete(`/users/${id}`);
  },

  // Activate user
  activate: async (id) => {
    return api.patch(`/users/${id}/activate`);
  },

  // Deactivate user
  deactivate: async (id) => {
    return api.patch(`/users/${id}/deactivate`);
  },

  // Get profile
  getProfile: async () => {
    return api.get('/users/profile');
  },

  // Update profile
  updateProfile: async (data) => {
    return api.put('/users/profile', data);
  },
};

export default usersService;
