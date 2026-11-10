import axios from 'axios';

// Instancia global de Axios configurada para CanchaYa
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar automáticamente el Bearer Token en cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('canchaya_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores globales (ej: token revocado o expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el backend indica token revocado o expirado, limpiar almacenamiento local
      const isLoginRequest = error.config.url.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('canchaya_token');
        localStorage.removeItem('canchaya_user');
        // Opcionalmente redirigir a login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
