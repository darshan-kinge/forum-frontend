import axios from 'axios';
import config from '../config/config.js';

const serverUrl = config.serverUrl || 'http://localhost:5000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: `${serverUrl}/api/${config.apiVersion}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Only redirect if not already on login page to prevent loops
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received');
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods for different endpoints
export const galleryAPI = {
  getAll: () => api.get('/gallery/all'),
  upload: (formData) => api.post('/gallery/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`/gallery/delete/${id}`),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getUser: () => api.get('/auth/user'),
};

export const blogAPI = {
  getAll: () => api.get('/blog/all'),
  getById: (id) => api.get(`/blog/${id}`),
  create: (blogData) => api.post('/blog/create', blogData),
  update: (id, blogData) => api.put(`/blog/update/${id}`, blogData),
  delete: (id) => api.delete(`/blog/delete/${id}`),
};

export const eventAPI = {
  getAll: () => api.get('/events/all'),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events/create', eventData),
  update: (id, eventData) => api.put(`/events/update/${id}`, eventData),
  delete: (id) => api.delete(`/events/delete/${id}`),
};

export const memberAPI = {
  getAll: () => api.get('/member/all'),
  create: (memberData) => api.post('/member/create', memberData),
  update: (id, memberData) => api.put(`/member/update/${id}`, memberData),
  delete: (id) => api.delete(`/member/delete/${id}`),
};

export const teamAPI = {
  getAll: () => api.get('/team/all'),
  create: (teamData) => api.post('/team/create', teamData),
  update: (id, teamData) => api.put(`/team/update/${id}`, teamData),
  delete: (id) => api.delete(`/team/delete/${id}`),
};

export default api; 