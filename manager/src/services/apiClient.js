// manager/src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://ds.logicielmx.cloud/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;