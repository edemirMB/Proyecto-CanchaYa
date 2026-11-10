import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();

  // Estados para datos personales
  const [personalData, setPersonalData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    password_actual: '',
    nueva_password: '',
    confirmar_nueva_password: '',
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setPersonalData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
      });
    }
  }, [user]);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!personalData.nombre.trim() || !personalData.apellido.trim()) {
      setFeedback({ type: 'danger', message: 'El nombre y el apellido no pueden quedar vacíos.' });
      return;
    }

    setSavingPersonal(true);
    try {
      const response = await authService.updatePerfil(personalData);
      if (response.usuario) {
        updateUser(response.usuario);
      }
      setFeedback({ type: 'success', message: response.mensaje || 'Datos personales actualizados correctamente.' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al actualizar los datos personales.';
      setFeedback({ type: 'danger', message: msg });
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!passwordData.password_actual) {
      setFeedback({ type: 'danger', message: 'Debe ingresar su contraseña actual.' });
      return;
    }

    if (passwordData.nueva_password.length < 6) {
      setFeedback({ type: 'danger', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (passwordData.nueva_password !== passwordData.confirmar_nueva_password) {
      setFeedback({ type: 'danger', message: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    setSavingPassword(true);
    try {
      const payload = {
        nombre: personalData.nombre,
        apellido: personalData.apellido,
        telefono: personalData.telefono,
        password_actual: passwordData.password_actual,
        nueva_password: passwordData.nueva_password,
        confirmar_nueva_password: passwordData.confirmar_nueva_password,
      };

      const response = await authService.updatePerfil(payload);
      if (response.usuario) {
        updateUser(response.usuario);
      }
      setFeedback({ type: 'success', message: '¡Contraseña actualizada con éxito!' });
      setPasswordData({
        password_actual: '',
        nueva_password: '',
        confirmar_nueva_password: '',
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al actualizar la contraseña.';
      setFeedback({ type: 'danger', message: msg });
    } finally {
      setSavingPassword(false);
    }
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'administrador':
        return <span className="badge badge-rol-admin fs-6">Administrador</span>;
      case 'propietario':
        return <span className="badge badge-rol-propietario fs-6">Propietario de cancha</span>;
      default:
        return <span className="badge badge-rol-cliente fs-6">Cliente / Deportista</span>;
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          {/* Encabezado */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h2 className="fw-bold mb-1">Mi Perfil</h2>
              <p className="text-muted small mb-0">
                Consulta y administra tu información personal y credenciales de acceso a CanchaYa.
              </p>
            </div>

            <button onClick={logout} className="btn btn-outline-danger btn-sm rounded-pill px-4 align-self-start">
              <i className="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
            </button>
          </div>

          {/* Feedback Alerta */}
          {feedback.message && (
            <div
              className={`alert alert-${feedback.type} alert-dismissible fade show d-flex align-items-center mb-4 small`}
              role="alert"
            >
              <i
                className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5 me-2 flex-shrink-0`}
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

          <div className="row g-4">
            {/* Tarjeta de Resumen */}
            <div className="col-12 col-md-4">
              <div className="card card-canchaya p-4 border-0 text-center shadow-sm">
                <div
                  className="rounded-circle bg-success bg-opacity-10 text-success fw-bold d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                >
                  {user?.nombre?.charAt(0).toUpperCase()}
                </div>

                <h5 className="fw-bold text-dark mb-1">
                  {user?.nombre} {user?.apellido}
                </h5>
                <p className="text-muted small mb-2">{user?.correo}</p>

                <div className="mb-3">{getRoleBadge(user?.rol)}</div>

                <div className="p-3 bg-light rounded-3 text-start small border">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Estado:</span>
                    <span className={`badge ${user?.estado === 'activo' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {user?.estado}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">ID de cuenta:</span>
                    <strong className="text-dark">#{user?.id}</strong>
                  </div>
                  <div className="text-muted mb-1">Fecha de registro:</div>
                  <div className="fw-semibold text-dark">{user?.fecha_registro}</div>
                </div>
              </div>
            </div>

            {/* Formularios de Edición */}
            <div className="col-12 col-md-8">
              {/* Formulario 1: Datos Personales */}
              <div className="card card-canchaya p-4 border-0 shadow-sm mb-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-person-lines-fill text-success me-2"></i>
                  Datos Personales
                </h5>

                <form onSubmit={handleUpdatePersonal}>
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Nombre *</label>
                      <input
                        type="text"
                        name="nombre"
                        className="form-control form-control-cy"
                        value={personalData.nombre}
                        onChange={handlePersonalChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Apellido *</label>
                      <input
                        type="text"
                        name="apellido"
                        className="form-control form-control-cy"
                        value={personalData.apellido}
                        onChange={handlePersonalChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        className="form-control form-control-cy"
                        value={personalData.telefono}
                        onChange={handlePersonalChange}
                        placeholder="Ej. 70012345"
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Correo (No modificable)</label>
                      <input
                        type="email"
                        className="form-control form-control-cy bg-light"
                        value={user?.correo || ''}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-end">
                    <button
                      type="submit"
                      className="btn btn-canchaya-primary rounded-pill px-4"
                      disabled={savingPersonal}
                    >
                      {savingPersonal ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span> Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2 me-1"></i> Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Formulario 2: Actualización Segura de Contraseña */}
              <div className="card card-canchaya p-4 border-0 shadow-sm">
                <h5 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-shield-lock text-primary me-2"></i>
                  Cambiar Contraseña
                </h5>

                <form onSubmit={handleUpdatePassword}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Contraseña Actual *</label>
                      <input
                        type="password"
                        name="password_actual"
                        className="form-control form-control-cy"
                        placeholder="Ingresa tu contraseña actual"
                        value={passwordData.password_actual}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Nueva Contraseña *</label>
                      <input
                        type="password"
                        name="nueva_password"
                        className="form-control form-control-cy"
                        placeholder="Mínimo 6 caracteres"
                        value={passwordData.nueva_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Confirmar Nueva Contraseña *</label>
                      <input
                        type="password"
                        name="confirmar_nueva_password"
                        className="form-control form-control-cy"
                        placeholder="Repite la nueva contraseña"
                        value={passwordData.confirmar_nueva_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-end">
                    <button
                      type="submit"
                      className="btn btn-outline-primary rounded-pill px-4"
                      disabled={savingPassword}
                    >
                      {savingPassword ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span> Actualizando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-key-fill me-1"></i> Actualizar Contraseña
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
