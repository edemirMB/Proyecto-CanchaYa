import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir directo al dashboard
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }

    // Si viene de registro exitoso, auto-rellenar correo
    if (location.state?.registeredEmail) {
      setCorreo(location.state.registeredEmail);
    }

    // Si fue redirigido por sesión expirada
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === '1') {
      setExpiredMsg(true);
    }
  }, [isAuthenticated, location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExpiredMsg(false);

    if (!correo.trim() || !password) {
      setError('Por favor ingrese su correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      await login(correo, password);
      navigate('/dashboard');
    } catch (err) {
      const serverMsg = err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else {
        setError('No fue posible conectar con el servidor. Verifique que el backend esté ejecutándose.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5">
          <div className="card card-canchaya p-4 p-sm-5 border-0 shadow">
            <div className="text-center mb-4">
              <span className="logo-badge mb-2 d-inline-flex" style={{ width: '48px', height: '48px', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-box-arrow-in-right fs-3 text-white"></i>
              </span>
              <h2 className="fw-bold">Iniciar Sesión</h2>
              <p className="text-muted small">
                Accede a tu panel en CanchaYa para gestionar tus actividades
              </p>
            </div>

            {expiredMsg && (
              <div className="alert alert-warning d-flex align-items-center small py-2" role="alert">
                <i className="bi bi-clock-history fs-5 me-2 flex-shrink-0"></i>
                <div>Tu sesión anterior expiró o fue cerrada. Por favor ingresa nuevamente.</div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center small py-2" role="alert">
                <i className="bi bi-shield-x fs-5 me-2 flex-shrink-0"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-cy border-start-0"
                    placeholder="nombre@ejemplo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">Contraseña</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control form-control-cy border-start-0"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-canchaya-primary w-100 py-2 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span> Iniciando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i> Iniciar Sesión
                  </>
                )}
              </button>

              <div className="text-center mt-4 pt-2 border-top">
                <span className="small text-muted">¿Aún no tienes una cuenta? </span>
                <Link to="/registro" className="small fw-bold text-success text-decoration-none">
                  Crear cuenta gratis
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
