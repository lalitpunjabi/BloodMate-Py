import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

// Intercept requests to automatically add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to drop token if unauthorized (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Force reload or redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login' && window.location.pathname !== '/register') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
