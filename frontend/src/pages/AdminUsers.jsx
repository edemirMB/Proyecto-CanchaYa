import React, { useState, useEffect, useCallback } from 'react';
import usuarioService from '../services/usuarioService';
import UserModal from '../components/UserModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mensajes de alerta
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (roleFilter) params.rol = roleFilter;
      if (statusFilter) params.estado = statusFilter;

      const data = await usuarioService.getUsuarios(params);
      setUsuarios(data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al cargar la lista de usuarios.';
      setFeedback({ type: 'danger', message: msg });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsuarios();
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleSaveUser = async (formData) => {
    setIsSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      if (selectedUser) {
        // Actualizar
        const response = await usuarioService.updateUsuario(selectedUser.id, formData);
        setFeedback({
          type: 'success',
          message: response.mensaje || 'Usuario actualizado correctamente.',
        });
      } else {
        // Crear
        const response = await usuarioService.createUsuario(formData);
        setFeedback({
          type: 'success',
          message: response.mensaje || 'Usuario creado exitosamente.',
        });
      }
      setModalOpen(false);
      fetchUsuarios();
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo guardar la información del usuario.';
      setFeedback({ type: 'danger', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await usuarioService.deleteUsuario(userToDelete.id);
      setFeedback({
        type: 'success',
        message: response.mensaje || 'Usuario eliminado correctamente.',
      });
      setDeleteModalOpen(false);
      fetchUsuarios();
    } catch (err) {
      const msg = err.response?.data?.error || 'No fue posible eliminar al usuario.';
      setFeedback({ type: 'danger', message: msg });
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderRoleBadge = (rol) => {
    switch (rol) {
      case 'administrador':
        return <span className="badge badge-rol-admin">Administrador</span>;
      case 'propietario':
        return <span className="badge badge-rol-propietario">Propietario</span>;
      default:
        return <span className="badge badge-rol-cliente">Cliente</span>;
    }
  };

  const renderStatusBadge = (estado) => {
    return estado === 'activo' ? (
      <span className="badge badge-estado-activo">
        <i className="bi bi-check-circle me-1"></i> Activo
      </span>
    ) : (
      <span className="badge badge-estado-inactivo">
        <i className="bi bi-dash-circle me-1"></i> Inactivo
      </span>
    );
  };

  return (
    <div className="container py-5">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="badge bg-danger bg-opacity-10 text-danger mb-2 px-3 py-1 fw-bold">
            <i className="bi bi-shield-lock-fill me-1"></i> Módulo Administrativo
          </span>
          <h2 className="fw-bold mb-1">Administración de Usuarios</h2>
          <p className="text-muted small mb-0">
            Control de usuarios registrados, asignación de roles, gestión de estados y auditoría de cuentas.
          </p>
        </div>

        <div>
          <button onClick={handleOpenCreate} className="btn btn-canchaya-primary rounded-pill px-4 shadow-sm">
            <i className="bi bi-person-plus-fill me-2"></i> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Alertas de retroalimentación */}
      {feedback.message && (
        <div
          className={`alert alert-${feedback.type} alert-dismissible fade show d-flex align-items-center mb-4 small`}
          role="alert"
        >
          <i
            className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-octagon-fill'} fs-5 me-2 flex-shrink-0`}
          ></i>
          <div>{feedback.message}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setFeedback({ type: '', message: '' })}
            aria-label="Cerrar"
          ></button>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="card card-canchaya p-3 p-md-4 mb-4 border-0 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-end">
          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold text-secondary">Buscar usuario</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-cy border-start-0"
                placeholder="Nombre, apellido o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold text-secondary">Filtrar por Rol</label>
            <select
              className="form-select form-control-cy"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="administrador">Administrador</option>
              <option value="propietario">Propietario</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-secondary">Estado</label>
            <select
              className="form-select form-control-cy"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="col-12 col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-outline-success w-100 rounded-pill">
              Filtrar
            </button>
            {(searchTerm || roleFilter || statusFilter) && (
              <button
                type="button"
                className="btn btn-light rounded-pill"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
                title="Limpiar filtros"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de Usuarios */}
      <div className="card card-canchaya border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark small">
              <tr>
                <th className="py-3 px-3">ID</th>
                <th className="py-3">Usuario</th>
                <th className="py-3">Correo</th>
                <th className="py-3">Teléfono</th>
                <th className="py-3 text-center">Rol</th>
                <th className="py-3 text-center">Estado</th>
                <th className="py-3">Registro</th>
                <th className="py-3 text-end px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Cargando usuarios...</span>
                    </div>
                    <div className="small text-muted mt-2">Consultando base de datos SQLite...</div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => {
                  const isCurrentAdmin = u.id === currentAdmin?.id;
                  return (
                    <tr key={u.id} className={isCurrentAdmin ? 'table-light' : ''}>
                      <td className="px-3 fw-bold text-muted small">#{u.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-success bg-opacity-10 text-success fw-bold d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                            style={{ width: '36px', height: '36px' }}
                          >
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark">
                              {u.nombre} {u.apellido}
                            </span>
                            {isCurrentAdmin && (
                              <span className="badge bg-secondary ms-2" style={{ fontSize: '0.65rem' }}>
                                Tú
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="small text-secondary">{u.correo}</td>
                      <td className="small text-secondary">{u.telefono || <span className="text-muted">—</span>}</td>
                      <td className="text-center">{renderRoleBadge(u.rol)}</td>
                      <td className="text-center">{renderStatusBadge(u.estado)}</td>
                      <td className="small text-muted">{u.fecha_registro}</td>
                      <td className="text-end px-3">
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="btn btn-outline-primary"
                            title="Editar usuario"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            onClick={() => handleOpenDelete(u)}
                            className="btn btn-outline-danger"
                            title="Eliminar usuario"
                            disabled={isCurrentAdmin}
                          >
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-top py-3 px-3 d-flex justify-content-between align-items-center small text-muted">
          <span>
            Total de usuarios registrados:{' '}
            <strong className="text-dark">{usuarios.length}</strong>
          </span>
          <span>Base de datos: <span className="badge bg-light text-dark border">canchaya.db</span></span>
        </div>
      </div>

      {/* Modal para Crear / Editar */}
      <UserModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        isSaving={isSaving}
      />

      {/* Modal para Confirmar Eliminación */}
      <DeleteConfirmModal
        show={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        user={userToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminUsers;
