import React from 'react';

const DeleteConfirmModal = ({ show, onClose, onConfirm, user, isDeleting }) => {
  if (!show || !user) return null;

  const isAdmin = user.rol === 'administrador';

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content card-canchaya border-0">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold text-danger d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
              Confirmar Eliminación
            </h5>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              disabled={isDeleting}
              aria-label="Cerrar"
            ></button>
          </div>

          <div className="modal-body py-4">
            <p className="text-secondary mb-3">
              ¿Estás seguro de que deseas eliminar permanentemente al siguiente usuario?
            </p>

            <div className="p-3 bg-light rounded-3 border mb-3">
              <div className="fw-bold fs-6 text-dark">
                {user.nombre} {user.apellido}
              </div>
              <div className="small text-muted">{user.correo}</div>
              <div className="mt-2">
                <span className="badge bg-secondary text-uppercase">{user.rol}</span>
                <span className={`badge ms-2 ${user.estado === 'activo' ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {user.estado}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="alert alert-warning py-2 small d-flex align-items-start">
                <i className="bi bi-shield-exclamation me-2 fs-5 flex-shrink-0"></i>
                <div>
                  <strong>Atención:</strong> Este usuario tiene rol de <strong>Administrador</strong>.
                  El sistema rechazará la eliminación si se trata del último administrador activo o si estás intentando auto-eliminarte.
                </div>
              </div>
            )}

            <div className="small text-muted">
              Esta acción no se puede deshacer y los datos se eliminarán de la base de datos SQLite.
            </div>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-light rounded-pill px-4"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger rounded-pill px-4 d-flex align-items-center"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span> Eliminando...
                </>
              ) : (
                <>
                  <i className="bi bi-trash3-fill me-1"></i> Eliminar Usuario
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
