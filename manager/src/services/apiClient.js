// manager/src/services/apiClient.js
import axios from 'axios';

// Apuntamos al backend en el puerto 3100
const apiClient = axios.create({
  baseURL: 'http://localhost:3100/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Inyecta el token en cada petición automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;