import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    password: '',
    confirm_password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones en frontend
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('Por favor complete su nombre y apellido.');
      return;
    }

    if (!formData.correo.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden. Verifique e intente nuevamente.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.registro(formData);
      setSuccess('¡Cuenta registrada exitosamente! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: formData.correo } });
      }, 1500);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Ocurrió un error al registrar la cuenta. Intente de nuevo.';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card card-canchaya p-4 p-sm-5 border-0 shadow">
            <div className="text-center mb-4">
              <span className="logo-badge mb-2 d-inline-flex" style={{ width: '48px', height: '48px', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-person-plus-fill fs-3 text-white"></i>
              </span>
              <h2 className="fw-bold">Crear Cuenta</h2>
              <p className="text-muted small">
                Únete a CanchaYa para reservar tus espacios deportivos favoritos
              </p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center small py-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-5 me-2 flex-shrink-0"></i>
                <div>{error}</div>
              </div>
            )}

            {success && (
              <div className="alert alert-success d-flex align-items-center small py-2" role="alert">
                <i className="bi bi-check-circle-fill fs-5 me-2 flex-shrink-0"></i>
                <div>{success}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control form-control-cy"
                    placeholder="Ej. Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    className="form-control form-control-cy"
                    placeholder="Ej. Perez"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Correo Electrónico *</label>
                  <input
                    type="email"
                    name="correo"
                    className="form-control form-control-cy"
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text small">Será tu usuario para iniciar sesión.</div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Teléfono / Celular</label>
                  <input
                    type="tel"
                    name="telefono"
                    className="form-control form-control-cy"
                    placeholder="Ej. 70012345"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Contraseña *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control form-control-cy"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    name="confirm_password"
                    className="form-control form-control-cy"
                    placeholder="Repita la contraseña"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="btn btn-canchaya-primary w-100 py-2 d-flex align-items-center justify-content-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Registrando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-check-fill me-2"></i> Registrarse
                    </>
                  )}
                </button>
              </div>

              <div className="text-center mt-4 pt-2 border-top">
                <span className="small text-muted">¿Ya tienes una cuenta? </span>
                <Link to="/login" className="small fw-bold text-success text-decoration-none">
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
