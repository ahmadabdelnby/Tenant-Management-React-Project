// ============================================
// Units API Service
// ============================================

import api from './api';

const unitsService = {
  // Get all units
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/units${queryString ? `?${queryString}` : ''}`);
  },

  // Get unit by ID
  getById: async (id) => {
    return api.get(`/units/${id}`);
  },

  // Create unit
  create: async (unitData) => {
    return api.post('/units', unitData);
  },

  // Update unit
  update: async (id, unitData) => {
    return api.put(`/units/${id}`, unitData);
  },

  // Delete unit
  delete: async (id) => {
    return api.delete(`/units/${id}`);
  },
};

export default unitsService;
