// ============================================
// Cities API Service
// ============================================

import api from './api';

const citiesService = {
  // Get all cities
  getAll: async () => {
    return api.get('/cities');
  },
};

export default citiesService;
