// ============================================
// Tenancies API Service
// ============================================

import api from './api';

const tenanciesService = {
  // Get all tenancies
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/tenancies${queryString ? `?${queryString}` : ''}`);
  },

  // Get tenancy by ID
  getById: async (id) => {
    return api.get(`/tenancies/${id}`);
  },

  // Get my tenancies (for tenants)
  getMyTenancies: async () => {
    return api.get('/tenancies/my-tenancies');
  },

  // Create tenancy
  create: async (tenancyData) => {
    return api.post('/tenancies', tenancyData);
  },

  // Update tenancy
  update: async (id, tenancyData) => {
    return api.put(`/tenancies/${id}`, tenancyData);
  },

  // End tenancy
  end: async (id, data) => {
    return api.patch(`/tenancies/${id}/end`, data);
  },

  // Delete tenancy
  delete: async (id) => {
    return api.delete(`/tenancies/${id}`);
  },
};

export default tenanciesService;
