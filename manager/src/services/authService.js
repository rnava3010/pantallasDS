// manager/src/services/authService.js
import api from './apiClient';

const AUTH_BASE = '/manager/auth';

export async function login({ identifier, password }) {
  // POST http://localhost:3100/api/manager/auth/login
  const { data } = await api.post(`${AUTH_BASE}/login`, { identifier, password });
  return data;
}

export async function completeFirstLogin({ identifier, newPassword }) {
  // POST http://localhost:3100/api/manager/auth/first-login
  const { data } = await api.post(`${AUTH_BASE}/first-login`, { identifier, newPassword });
  return data;
}