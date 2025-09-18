import axios from 'axios';

const API_HOST = process.env.REACT_APP_API_URL || 'http://localhost:8000' || 'http://localhost:8080';
const API_BASE_URL = `${API_HOST.replace(/\/+$/, '')}/api`;
const API_TOKEN = process.env.REACT_APP_API_TOKEN;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1200000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    if (API_TOKEN) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${API_TOKEN}`,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getValidationTrends: () => api.get('/dashboard/charts/validation-trends'),
  getTableStatus: () => api.get('/dashboard/charts/table-status'),
  getGithubActionsStatus: () => api.get('/dashboard/github-actions'),
};

export const validationAPI = {
  getTables: () => api.get('/validation/tables'),
  runValidation: (tableName, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `/validation/run/${tableName}${params.toString() ? `?${params.toString()}` : ''}`;
    return api.post(url);
  },
  runAllValidations: (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `/validation/run-all${params.toString() ? `?${params.toString()}` : ''}`;
    return api.post(url);
  },
  getResults: (tableName = null, limit = 10) => {
    let url = '/dashboard/results';
    const params = new URLSearchParams();
    
    if (tableName) params.append('table_name', tableName);
    if (limit) params.append('limit', limit.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return api.get(url).then(response => {
      // Handle fallback responses
      if (response.data.source === 'local_storage') {
        console.warn('⚠️ Using local storage - database unavailable');
      }
      return response;
    });
  },
  getTableConfig: (tableName) => api.get(`/validation/config/${tableName}`),
  saveTableConfig: (tableName, payload) => api.post(`/validation/config/${tableName}`, payload),
};

// Sheet monitoring API
export const sheetAPI = {
  getSheetJson: () => api.get('/sheet', { params: { format: 'json' } }),
};

export default api;
