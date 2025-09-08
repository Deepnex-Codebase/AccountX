import axios from 'axios';
import { authService } from './authService';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshed = await authService.refreshToken();
        
        if (refreshed) {
          // Update the authorization header
          const token = authService.getToken();
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout the user
        authService.logout();
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Generic methods
  get: async (url, params = {}) => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  post: async (url, data = {}) => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  put: async (url, data = {}) => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  patch: async (url, data = {}) => {
    try {
      const response = await api.patch(url, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  delete: async (url) => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  // Specific API endpoints
  // These would be implemented based on your backend API structure
  
  // Chart of Accounts
  getChartOfAccounts: () => {
    return apiService.get('/accounts');
  },
  
  getAccount: (id) => {
    return apiService.get(`/accounts/${id}`);
  },
  
  createAccount: (accountData) => {
    return apiService.post('/accounts', accountData);
  },
  
  updateAccount: (id, accountData) => {
    return apiService.put(`/accounts/${id}`, accountData);
  },
  
  deleteAccount: (id) => {
    return apiService.delete(`/accounts/${id}`);
  },
  
  // Journal Entries
  getJournalEntries: (params) => {
    return apiService.get('/journal-entries', params);
  },
  
  getJournalEntry: (id) => {
    return apiService.get(`/journal-entries/${id}`);
  },
  
  createJournalEntry: (entryData) => {
    return apiService.post('/journal-entries', entryData);
  },
  
  updateJournalEntry: (id, entryData) => {
    return apiService.put(`/journal-entries/${id}`, entryData);
  },
  
  deleteJournalEntry: (id) => {
    return apiService.delete(`/journal-entries/${id}`);
  },
  
  postJournalEntry: (id) => {
    return apiService.post(`/journal-entries/${id}/post`);
  },
  
  // Financial Reports
  getBalanceSheet: (params) => {
    return apiService.get('/reports/balance-sheet', params);
  },
  
  getIncomeStatement: (params) => {
    return apiService.get('/reports/income-statement', params);
  },
  
  getCashFlow: (params) => {
    return apiService.get('/reports/cash-flow', params);
  },
  
  getTrialBalance: (params) => {
    return apiService.get('/reports/trial-balance', params);
  },
  
  // Users and Administration
  getUsers: () => {
    return apiService.get('/users');
  },
  
  getUser: (id) => {
    return apiService.get(`/users/${id}`);
  },
  
  createUser: (userData) => {
    return apiService.post('/users', userData);
  },
  
  updateUser: (id, userData) => {
    return apiService.put(`/users/${id}`, userData);
  },
  
  deleteUser: (id) => {
    return apiService.delete(`/users/${id}`);
  },
  
  // Roles and Permissions
  getRoles: () => {
    return apiService.get('/roles');
  },
  
  getRole: (id) => {
    return apiService.get(`/roles/${id}`);
  },
  
  createRole: (roleData) => {
    return apiService.post('/roles', roleData);
  },
  
  updateRole: (id, roleData) => {
    return apiService.put(`/roles/${id}`, roleData);
  },
  
  deleteRole: (id) => {
    return apiService.delete(`/roles/${id}`);
  },
};

// Helper function to handle API errors
const handleApiError = (error) => {
  // You can implement custom error handling here
  // For example, showing notifications, logging, etc.
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    console.error('Status:', error.response.status);
    
    // You could dispatch to a notification system here
    // For example: notificationService.showError(error.response.data.message);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', error.request);
    
    // You could show a network error notification
    // For example: notificationService.showError('Network error. Please check your connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error:', error.message);
    
    // You could show a generic error notification
    // For example: notificationService.showError('An unexpected error occurred.');
  }
};

export default apiService;