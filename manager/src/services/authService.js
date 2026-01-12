import api from './apiClient';

export async function login({ identifier, password }) {
  const { data } = await api.post('/login', { identifier, password });
  return data;
}

export async function completeFirstLogin({ identifier, newPassword }) {
  const { data } = await api.post('/first-login', { identifier, newPassword });
  return data;
}