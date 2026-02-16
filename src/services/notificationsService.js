// ============================================
// Notifications API Service
// ============================================

import api from './api';

const notificationsService = {
  // Get user's notifications
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/notifications${queryString ? `?${queryString}` : ''}`);
  },

  // Get unread count
  getUnreadCount: async () => {
    return api.get('/notifications/unread-count');
  },

  // Mark notification as read
  markAsRead: async (id) => {
    return api.patch(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async () => {
    return api.patch('/notifications/read-all');
  },

  // Delete notification
  delete: async (id) => {
    return api.delete(`/notifications/${id}`);
  },
};

export default notificationsService;
