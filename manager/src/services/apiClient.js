import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://ds.logicielmx.cloud/api', 
  // OJO: Si estás en local usa 'http://localhost:3100/api'
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor de Solicitud (Pone el token automáticamente)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. INTERCEPTOR DE RESPUESTA (AQUI ESTÁ LA MAGIA)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detectar errores de Red o Token Vencido
    if (
        error.code === 'ERR_NETWORK' || 
        error.code === 'ERR_NAME_NOT_RESOLVED' ||
        error.code === 'ERR_CONNECTION_REFUSED' ||
        (error.response && error.response.status === 401)
    ) {
      console.warn("⚠️ Conexión perdida o sesión inválida. Redirigiendo...");
      
      // Limpiamos la sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');

      // Forzamos la recarga hacia el login (esto detiene los errores de React)
      // Usamos window.location en lugar de navigate porque estamos fuera de un componente React
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;