// ============================================
// Payments API Service
// ============================================

import api from './api';

const paymentsService = {
  // Get all payments
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/payments${queryString ? `?${queryString}` : ''}`);
  },

  // Get payment by ID
  getById: async (id) => {
    return api.get(`/payments/${id}`);
  },

  // Generate monthly payments
  generateMonthly: async (data) => {
    return api.post('/payments/generate', data);
  },

  // Update payment (mark as paid, etc.)
  update: async (id, data) => {
    return api.put(`/payments/${id}`, data);
  },

  // Create Tahseeel payment link
  createPaymentLink: async (id) => {
    return api.post(`/payments/${id}/create-link`);
  },

  // Get building payment summary
  getBuildingSummary: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/payments/building-summary?${queryString}`);
  },

  // Export payments to Excel (returns blob)
  exportExcel: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/payments/export${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to export');
    return response.blob();
  },
};

export default paymentsService;
