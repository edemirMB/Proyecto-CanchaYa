import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAdmin, isPropietario, logout } = useAuth();

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'administrador':
        return <span className="badge badge-rol-admin fs-6">Administrador del Sistema</span>;
      case 'propietario':
        return <span className="badge badge-rol-propietario fs-6">Propietario de Cancha</span>;
      default:
        return <span className="badge badge-rol-cliente fs-6">Cliente / Deportista</span>;
    }
  };

  const getRoleDescription = (rol) => {
    switch (rol) {
      case 'administrador':
        return 'Tienes control total sobre la plataforma: puedes gestionar usuarios, roles, estados y supervisar la seguridad.';
      case 'propietario':
        return 'Podrás administrar tus complejos deportivos, canchas, horarios de atención y tarifas en los siguientes sprints.';
      default:
        return 'Podrás buscar canchas, consultar horarios en tiempo real y reservar tus partidos en los siguientes sprints.';
    }
  };

  return (
    <div className="container py-5">
      {/* Banner de Bienvenida */}
      <div className="card card-canchaya border-0 p-4 p-md-5 mb-4 hero-gradient text-white shadow-lg">
        <div className="row align-items-center gy-3">
          <div className="col-lg-8">
            <div className="d-flex align-items-center mb-2">
              <span className="me-2">{getRoleBadge(user?.rol)}</span>
              <span className="badge badge-estado-activo">Cuenta {user?.estado}</span>
            </div>
            <h1 className="h2 fw-bold text-white mb-2">
              ¡Bienvenido a CanchaYa, {user?.nombre} {user?.apellido}!
            </h1>
            <p className="lead text-light fs-6 mb-3" style={{ opacity: 0.95 }}>
              {getRoleDescription(user?.rol)}
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/perfil" className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-dark">
                <i className="bi bi-person-gear me-1"></i> Mi Perfil
              </Link>
              {isAdmin && (
                <Link to="/admin/usuarios" className="btn btn-success btn-sm rounded-pill px-3 fw-bold">
                  <i className="bi bi-people-fill me-1"></i> Administrar Usuarios
                </Link>
              )}
              <button onClick={logout} className="btn btn-outline-light btn-sm rounded-pill px-3">
                <i className="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="col-lg-4 text-lg-end">
            <div className="p-3 rounded-3 text-start small border border-white border-opacity-25" style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}>
              <div className="text-light opacity-75 mb-1 fw-semibold">Detalles de la sesión:</div>
              <div className="text-white mb-1">
                <strong className="text-light opacity-75">Correo:</strong> {user?.correo}
              </div>
              <div className="text-white mb-1">
                <strong className="text-light opacity-75">Teléfono:</strong> {user?.telefono || 'No registrado'}
              </div>
              <div className="text-white">
                <strong className="text-light opacity-75">Fecha de alta:</strong> {user?.fecha_registro}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo Activo - Sprint 1 */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="fw-bold mb-0">
            <i className="bi bi-shield-check text-success me-2"></i>
            Módulo Activo — Sprint 1 (Gestión de Usuarios y Seguridad)
          </h4>
        </div>

        <div className="row g-4">
          {isAdmin && (
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card card-canchaya card-hover h-100 p-4 border-start border-4 border-danger">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                    <i className="bi bi-people-fill fs-3"></i>
                  </div>
                  <span className="badge bg-danger">Exclusivo Admin</span>
                </div>
                <h5 className="fw-bold">Gestión de Usuarios</h5>
                <p className="text-muted small mb-3">
                  Crea, consulta, edita o elimina usuarios. Asigna roles (Admin, Propietario, Cliente) y activa/desactiva cuentas.
                </p>
                <Link to="/admin/usuarios" className="btn btn-outline-danger btn-sm mt-auto rounded-pill">
                  Acceder al CRUD <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          )}

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card card-canchaya card-hover h-100 p-4 border-start border-4 border-success">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <i className="bi bi-person-badge-fill fs-3"></i>
                </div>
                <span className="badge bg-success">Disponible</span>
              </div>
              <h5 className="fw-bold">Mi Perfil de Usuario</h5>
              <p className="text-muted small mb-3">
                Visualiza tus datos personales, actualiza tu nombre, apellido y teléfono, y cambia tu contraseña de forma segura.
              </p>
              <Link to="/perfil" className="btn btn-canchaya-outline btn-sm mt-auto rounded-pill">
                Ver Mi Perfil <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card card-canchaya card-hover h-100 p-4 border-start border-4 border-info">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                  <i className="bi bi-lock-fill fs-3"></i>
                </div>
                <span className="badge bg-info text-dark">Seguridad</span>
              </div>
              <h5 className="fw-bold">Cierre de Sesión Seguro</h5>
              <p className="text-muted small mb-3">
                Tu sesión utiliza tokens JWT con invalidación en base de datos al cerrar sesión, impidiendo reutilización no autorizada.
              </p>
              <button onClick={logout} className="btn btn-outline-secondary btn-sm mt-auto rounded-pill">
                Cerrar Sesión Ahora
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos Futuros - "Próximamente" */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="fw-bold mb-0 text-dark">
            <i className="bi bi-hourglass-split text-success me-2"></i>
            Módulos de la Plataforma (Próximas Entregas)
          </h4>
          <span className="badge bg-secondary">En Planificación</span>
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card card-canchaya h-100 p-4 border bg-white shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <i className="bi bi-search fs-3"></i>
                </div>
                <span className="badge bg-warning text-dark fw-bold">Próximamente</span>
              </div>
              <h5 className="fw-bold text-dark">Búsqueda y Disponibilidad</h5>
              <p className="text-secondary small mb-0">
                Búsqueda de canchas por deporte (Fútbol, Futsal, Básquet, Vóley), ubicación geográfica y consulta de disponibilidad de horarios en tiempo real.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card card-canchaya h-100 p-4 border bg-white shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <i className="bi bi-calendar-check-fill fs-3"></i>
                </div>
                <span className="badge bg-warning text-dark fw-bold">Próximamente</span>
              </div>
              <h5 className="fw-bold text-dark">Reservas de Canchas</h5>
              <p className="text-secondary small mb-0">
                Selección de fecha y horario, confirmación de reserva, prevención de duplicidad y control de reservas para clientes.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card card-canchaya h-100 p-4 border bg-white shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                  <i className="bi bi-building-gear fs-3"></i>
                </div>
                <span className="badge bg-warning text-dark fw-bold">Próximamente</span>
              </div>
              <h5 className="fw-bold text-dark">Gestión de Complejos</h5>
              <p className="text-secondary small mb-0">
                Panel exclusivo para propietarios: registro de canchas, configuración de tarifas por turno, bloqueo por mantenimiento e historial de cobros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
