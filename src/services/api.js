import axios from 'axios';

// Base URL configuration (keep env override support)
const API_HOST = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
// If REACT_APP_API_URL already ends with /api, don't append it again.
const API_BASE_URL = /\/api$/.test(API_HOST) ? API_HOST : `${API_HOST}/api`;

// Token management (runtime, persisted in localStorage)
const TOKEN_STORAGE_KEY = 'api_token';
let runtimeToken = null;

export const getAuthToken = () => {
  return runtimeToken || (typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null);
};

export const setAuthToken = (token) => {
  runtimeToken = token || null;
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
      else localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (_) {
    // ignore storage errors
  }
};

export const clearAuthToken = () => {
  runtimeToken = null;
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (_) {
    // ignore
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1200000,
});

// Request interceptor: attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      clearAuthToken();
      // Redirect to access page on auth failure
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/access') {
          window.location.assign('/access');
        }
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getValidationTrends: () => api.get('/dashboard/charts/validation-trends'),
  getTableStatus: () => api.get('/dashboard/charts/table-status'),
  getGithubActionsStatus: () => api.get('/dashboard/github-actions'),
  getCronJobs: (limit = 200) => api.get('/dashboard/cron-jobs', { params: { limit } }),
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
  getResultsByTable: (tableName, limit = 5) => {
    return api.get(`/dashboard/results/by-table/${tableName}?limit=${limit}`).then(response => {
      // Handle fallback responses
      if (response.data.source === 'local_storage') {
        console.warn('⚠️ Using local storage - database unavailable');
      }
      return response;
    });
  },
  getRPCResults: (functionName = null, limit = 20) => {
    let url = '/dashboard/rpc-results';
    const params = new URLSearchParams();
    
    if (functionName) params.append('function_name', functionName);
    if (limit) params.append('limit', limit.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return api.get(url).then(response => {
      if (response.data.source === 'local_storage') {
        console.warn('⚠️ Using local storage - database unavailable');
      }
      return response;
    });
  },
  getRPCResultsByFunction: (functionName, limit = 5) => {
    return api.get(`/dashboard/rpc-results/by-function/${functionName}?limit=${limit}`).then(response => {
      if (response.data.source === 'local_storage') {
        console.warn('⚠️ Using local storage - database unavailable');
      }
      return response;
    });
  },
  getTableConfig: (tableName) => api.get(`/validation/config/${tableName}`),
  saveTableConfig: (tableName, payload) => api.post(`/validation/config/${tableName}`, payload),
  runSingleRPCValidation: (functionName) => api.post(`/validation/run/rpc-functions/${functionName}`),
  runAllRPCValidation: () => api.post('/validation/run/rpc-functions'),
};

// Sheet monitoring API
export const sheetAPI = {
  getSheetJson: (sheet = 'workflows') => api.get('/sheet', { params: { format: 'json', sheet } }),
};

export default api;
