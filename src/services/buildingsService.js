// ============================================
// Buildings API Service
// ============================================

import api from './api';

const buildingsService = {
  // Get all buildings
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/buildings${queryString ? `?${queryString}` : ''}`);
  },

  // Get building by ID
  getById: async (id) => {
    return api.get(`/buildings/${id}`);
  },

  // Create building
  create: async (buildingData) => {
    return api.post('/buildings', buildingData);
  },

  // Update building
  update: async (id, buildingData) => {
    return api.put(`/buildings/${id}`, buildingData);
  },

  // Delete building
  delete: async (id) => {
    return api.delete(`/buildings/${id}`);
  },
};

export default buildingsService;
