// src/services/authService.js
import api from "../utils/api";

export const loginUser = (data, config = {}) =>
  api.post("/users/login", data, config);

export const registerUser = (data, config = {}) =>
  api.post("/users/register", data, config);

export const getProfile = (userId, config = {}) => {
  const finalUserId = userId || localStorage.getItem('userId');
  if (!finalUserId) return Promise.reject('No userId provided');
  return api.get(`/users/${finalUserId}`, config);
};

export const updateProfile = (userId, data, config = {}) => {
  const finalUserId = userId || localStorage.getItem('userId');
  return api.put(`/users/${finalUserId}`, data, config);
};
