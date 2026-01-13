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
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.href = '/manager/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;