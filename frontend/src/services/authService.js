import api from './api';

const authService = {
  // Registrar un nuevo usuario (rol cliente por defecto)
  async registro(datos) {
    const response = await api.post('/auth/registro', datos);
    return response.data;
  },

  // Iniciar sesión con correo y contraseña
  async login(credenciales) {
    const response = await api.post('/auth/login', credenciales);
    return response.data;
  },

  // Cerrar sesión e invalidar token en el servidor
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } finally {
      localStorage.removeItem('canchaya_token');
      localStorage.removeItem('canchaya_user');
    }
  },

  // Obtener perfil del usuario autenticado
  async getPerfil() {
    const response = await api.get('/auth/perfil');
    return response.data;
  },

  // Actualizar datos personales y/o contraseña
  async updatePerfil(datos) {
    const response = await api.put('/auth/perfil', datos);
    return response.data;
  },
};

export default authService;
