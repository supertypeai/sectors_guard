import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getValidationTrends: () => api.get('/dashboard/charts/validation-trends'),
  getTableStatus: () => api.get('/dashboard/charts/table-status'),
};

export const validationAPI = {
  getTables: () => api.get('/validation/tables'),
  runValidation: (tableName) => api.post(`/validation/run/${tableName}`),
  getResults: () => api.get('/validation/results'),
};

export default api;
