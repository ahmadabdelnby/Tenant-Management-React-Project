// ============================================
// Maintenance API Service
// ============================================

import api from './api';

const maintenanceService = {
  // Get all maintenance requests (with filters)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.category) queryParams.append('category', params.category);
    
    const query = queryParams.toString();
    return api.get(`/maintenance${query ? `?${query}` : ''}`);
  },

  // Get tenant's rented units for maintenance request
  getMyUnits: async () => {
    return api.get('/maintenance/my-units');
  },

  // Get maintenance request by ID
  getById: async (id) => {
    return api.get(`/maintenance/${id}`);
  },

  // Create new maintenance request
  create: async (data) => {
    return api.post('/maintenance', data);
  },

  // Update maintenance request
  update: async (id, data) => {
    return api.put(`/maintenance/${id}`, data);
  },

  // Delete maintenance request
  delete: async (id) => {
    return api.delete(`/maintenance/${id}`);
  },
};

export default maintenanceService;
