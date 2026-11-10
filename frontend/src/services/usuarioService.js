import api from './api';

const usuarioService = {
  // Listar usuarios con filtros opcionales de búsqueda, rol y estado
  async getUsuarios(params = {}) {
    const response = await api.get('/usuarios', { params });
    return response.data;
  },

  // Obtener un usuario por ID
  async getUsuarioById(id) {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Crear nuevo usuario (solo administrador)
  async createUsuario(datos) {
    const response = await api.post('/usuarios', datos);
    return response.data;
  },

  // Actualizar usuario existente (solo administrador)
  async updateUsuario(id, datos) {
    const response = await api.put(`/usuarios/${id}`, datos);
    return response.data;
  },

  // Eliminar usuario (solo administrador)
  async deleteUsuario(id) {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};

export default usuarioService;
