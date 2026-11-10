import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {/* 1. Hero Section (Fondo Oscuro Deportivo con Texto Blanco Nítido) */}
      <section className="hero-gradient py-5 text-white">
        <div className="container py-lg-5">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="badge bg-success px-3 py-2 rounded-pill mb-3 text-uppercase fw-bold shadow-sm">
                <i className="bi bi-shield-check me-1"></i> Subsistema de Seguridad &bull; Sprint 1
              </span>
              <h1 className="display-4 fw-extrabold mb-3 text-white">
                Tu Cancha Favorita, <span className="text-success">Al Instante</span>
              </h1>
              <p className="lead hero-lead mb-4">
                <strong>CanchaYa</strong> es la plataforma integral para la búsqueda, verificación de disponibilidad
                y reserva de canchas deportivas en Sucre. Conectamos deportistas con complejos deportivos de fútbol,
                futsal, básquet y vóley de forma rápida, moderna y confiable.
              </p>

              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-canchaya-primary btn-lg rounded-pill px-4">
                    <i className="bi bi-speedometer2 me-2"></i> Ir al Panel de Control ({user?.nombre})
                  </Link>
                ) : (
                  <>
                    <Link to="/registro" className="btn btn-canchaya-primary btn-lg rounded-pill px-4">
                      <i className="bi bi-person-plus-fill me-2"></i> Crear Cuenta Gratis
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg rounded-pill px-4">
                      <i className="bi bi-box-arrow-in-right me-2"></i> Iniciar Sesión
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="col-lg-5 text-center">
              <div className="hero-info-card p-4">
                <div className="d-flex justify-content-center mb-3">
                  <div className="bg-success text-white p-3 rounded-circle shadow">
                    <i className="bi bi-trophy-fill fs-1"></i>
                  </div>
                </div>
                <h3 className="h4 fw-bold text-white mb-2">Ingeniería de Software</h3>
                <p className="small text-light mb-3 opacity-90">
                  Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca
                </p>
                <div className="p-3 rounded-3 text-start small" style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="card-subtitle-label">Docente:</span>
                    <strong className="card-value-highlight">Ing. Ramiro Duran</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="card-subtitle-label">Sprint:</span>
                    <span className="badge bg-success">Sprint 1 - Usuarios</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="card-subtitle-label">Estado del Sistema:</span>
                    <span className="badge" style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 700 }}>
                      <i className="bi bi-check-circle-fill me-1"></i> 100% Funcional
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Deportes Soportados (Fondo Blanco con Texto Oscuro de Alto Contraste) */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <span className="fw-bold text-uppercase small tracking-wide d-block mb-1" style={{ color: '#047857' }}>
              Disciplinas Deportivas
            </span>
            <h2 className="fw-bold text-dark">Canchas Disponibles para tu Pasión</h2>
            <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto' }}>
              La plataforma centraliza los espacios deportivos más concurridos de la ciudad para agilizar la búsqueda y disponibilidad.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card card-canchaya sport-card card-hover h-100 p-4 text-center">
                <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3 mx-auto mb-3">
                  <i className="bi bi-dribbble fs-2"></i>
                </div>
                <h5 className="fw-bold mb-2 text-dark">Fútbol</h5>
                <p className="text-secondary small mb-0">
                  Canchas sintéticas y césped natural reglamentario para partidos de 7, 8 u 11 jugadores.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card card-canchaya sport-card card-hover h-100 p-4 text-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mx-auto mb-3">
                  <i className="bi bi-circle-fill fs-2"></i>
                </div>
                <h5 className="fw-bold mb-2 text-dark">Futsal</h5>
                <p className="text-secondary small mb-0">
                  Coliseos y canchas techadas con piso de parquet o cemento pulido bajo luz profesional.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card card-canchaya sport-card card-hover h-100 p-4 text-center">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3 mx-auto mb-3">
                  <i className="bi bi-record-circle fs-2"></i>
                </div>
                <h5 className="fw-bold mb-2 text-dark">Básquetbol</h5>
                <p className="text-secondary small mb-0">
                  Tableros profesionales de acrílico y canchas preparadas para torneos y entrenamientos.
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card card-canchaya sport-card card-hover h-100 p-4 text-center">
                <div className="bg-info bg-opacity-10 text-info rounded-circle d-inline-flex p-3 mx-auto mb-3">
                  <i className="bi bi-bullseye fs-2"></i>
                </div>
                <h5 className="fw-bold mb-2 text-dark">Vóley</h5>
                <p className="text-secondary small mb-0">
                  Redes reglamentarias, líneas bien demarcadas e iluminación adecuada para juegos nocturnos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Características del Subsistema de Seguridad (Fondo Gris Claro con Alto Contraste) */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-6">
              <span className="fw-bold text-uppercase small d-block mb-1" style={{ color: '#047857' }}>
                Arquitectura y Seguridad
              </span>
              <h2 className="fw-bold mb-3 text-dark">Gestión de Usuarios con Estándares Industriales</h2>
              <p className="text-secondary mb-4">
                El subsistema implementado en este Sprint 1 garantiza la integridad de los datos, el control de acceso
                basado en roles (RBAC) y la protección integral de las credenciales de los usuarios en SQLite.
              </p>

              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="d-flex align-items-start">
                    <div className="p-2 bg-success bg-opacity-10 text-success rounded-3 me-3">
                      <i className="bi bi-shield-lock-fill fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1 text-dark">Hash Seguro</h6>
                      <p className="small text-secondary mb-0">Cifrado de contraseñas con Werkzeug (Scrypt/PBKDF2).</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="d-flex align-items-start">
                    <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3 me-3">
                      <i className="bi bi-key-fill fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1 text-dark">Tokens JWT</h6>
                      <p className="small text-secondary mb-0">Autenticación sin estado con lista negra para cierre de sesión.</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="d-flex align-items-start">
                    <div className="p-2 bg-warning bg-opacity-10 text-warning rounded-3 me-3">
                      <i className="bi bi-person-check-fill fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1 text-dark">Roles y Permisos</h6>
                      <p className="small text-secondary mb-0">Tres roles diferenciados: Administrador, Propietario y Cliente.</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="d-flex align-items-start">
                    <div className="p-2 bg-info bg-opacity-10 text-info rounded-3 me-3">
                      <i className="bi bi-database-fill fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1 text-dark">SQLite & SQLAlchemy</h6>
                      <p className="small text-secondary mb-0">Persistencia relacional con ORM y validaciones de integridad.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card card-canchaya p-4 border-0 shadow">
                <h5 className="fw-bold mb-3 text-dark d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Casos de Uso Implementados (Sprint 1)
                </h5>
                <ul className="list-group list-group-flush small">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                    <span className="text-dark fw-semibold">Registro público de usuarios (rol cliente automático)</span>
                    <i className="bi bi-check2-circle text-success fs-5"></i>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                    <span className="text-dark fw-semibold">Inicio de sesión con validación de credenciales y estado activo</span>
                    <i className="bi bi-check2-circle text-success fs-5"></i>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                    <span className="text-dark fw-semibold">Cierre de sesión con revocación de token JWT en base de datos</span>
                    <i className="bi bi-check2-circle text-success fs-5"></i>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                    <span className="text-dark fw-semibold">CRUD completo de usuarios con búsqueda y filtros para Administrador</span>
                    <i className="bi bi-check2-circle text-success fs-5"></i>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                    <span className="text-dark fw-semibold">Protección contra eliminación o desactivación del último administrador</span>
                    <i className="bi bi-check2-circle text-success fs-5"></i>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                    <span className="text-dark fw-semibold">Consulta y actualización de perfil personal y contraseña segura</span>
                    <i className="bi bi-check2-circle text-success fs-5"></i>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
