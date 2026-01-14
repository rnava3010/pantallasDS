import axios from 'axios';

// 1. Crear la instancia de Axios con tu URL base
const apiClient = axios.create({
  // Asegúrate de que esta URL sea la correcta de tu VPS
  baseURL: 'https://ds.logicielmx.cloud/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout de 10 segundos para no dejar esperando eternamente si la red es lenta
  timeout: 10000, 
});

// -----------------------------------------------------------------------------
// 2. INTERCEPTOR DE SOLICITUD (REQUEST)
// Antes de que salga la petición, le pegamos el Token si existe.
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// 3. INTERCEPTOR DE RESPUESTA (RESPONSE) - EL "GUARDIA"
// Aquí atrapamos los errores que vienen de regreso.
// -----------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response, // Si todo sale bien, deja pasar la respuesta.
  (error) => {
    
    // Extraemos info del error para analizarla
    const { response, code } = error;
    const status = response ? response.status : null;

    // CONDICIÓN DE EXPULSIÓN:
    // A) Error de Red (Internet caído, DNS fallando, Servidor apagado)
    // B) Error 401 (No autorizado / Token vencido)
    // C) Error 403 (Prohibido)
    if (
        code === 'ERR_NETWORK' || 
        code === 'ERR_NAME_NOT_RESOLVED' ||
        code === 'ERR_CONNECTION_REFUSED' ||
        status === 401 ||
        status === 403
    ) {
      console.warn("⚠️ Error crítico de sesión o red. Redirigiendo al Login...");
      
      // Solo limpiamos y redirigimos si NO estamos ya en el login
      // (Para evitar bucles infinitos si falla el login mismo)
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        // Usamos window.location para forzar una recarga limpia
        window.location.href = '/manager/login?msg=session';
		
      }
    }

    // Rechazamos la promesa para que el componente sepa que falló
    return Promise.reject(error);
  }
);

export default apiClient;