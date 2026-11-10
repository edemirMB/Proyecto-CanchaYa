import React, { useState, useEffect } from 'react';

const UserModal = ({ show, onClose, onSave, user, isSaving }) => {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    rol: 'cliente',
    estado: 'activo',
    password: '',
  });

  const [errorLocal, setErrorLocal] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        correo: user.correo || '',
        telefono: user.telefono || '',
        rol: user.rol || 'cliente',
        estado: user.estado || 'activo',
        password: '',
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        rol: 'cliente',
        estado: 'activo',
        password: '',
      });
    }
    setErrorLocal('');
  }, [user, show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setErrorLocal('El nombre y el apellido son obligatorios.');
      return;
    }

    if (!formData.correo.trim()) {
      setErrorLocal('El correo electrónico es obligatorio.');
      return;
    }

    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      setErrorLocal('Para un nuevo usuario, la contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (isEditing && formData.password && formData.password.length < 6) {
      setErrorLocal('Si desea cambiar la contraseña, debe tener al menos 6 caracteres.');
      return;
    }

    onSave(formData);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content card-canchaya border-0">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
              <i className={`bi ${isEditing ? 'bi-pencil-square text-primary' : 'bi-person-plus-fill text-success'} me-2 fs-4`}></i>
              {isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </h5>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Cerrar"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body py-4">
              {errorLocal && (
                <div className="alert alert-danger py-2 small d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                  {errorLocal}
                </div>
              )}

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control form-control-cy"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Juan"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    className="form-control form-control-cy"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Ej. Perez"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Correo Electrónico *</label>
                  <input
                    type="email"
                    name="correo"
                    className="form-control form-control-cy"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="ejemplo@canchaya.com"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    className="form-control form-control-cy"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej. 70012345"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Rol *</label>
                  <select
                    name="rol"
                    className="form-select form-control-cy"
                    value={formData.rol}
                    onChange={handleChange}
                    required
                  >
                    <option value="cliente">Cliente / Deportista</option>
                    <option value="propietario">Propietario de cancha</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Estado *</label>
                  <select
                    name="estado"
                    className="form-select form-control-cy"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Contraseña {isEditing ? '(Opcional)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control form-control-cy"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isEditing ? 'Sin cambios' : 'Mínimo 6 caract.'}
                    required={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-canchaya-primary rounded-pill px-4 d-flex align-items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span> Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-1"></i> {isEditing ? 'Actualizar' : 'Crear Usuario'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
