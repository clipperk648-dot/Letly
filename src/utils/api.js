// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://social-media-backend-1-5l20.onrender.com/api",
});

api.interceptors.request.use((config) => {
  return config;
});

// Add response interceptor to handle 401/403 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear authentication data
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
      } catch {}
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
