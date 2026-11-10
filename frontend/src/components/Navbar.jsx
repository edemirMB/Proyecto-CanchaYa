import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'administrador':
        return <span className="badge badge-rol-admin me-2">Administrador</span>;
      case 'propietario':
        return <span className="badge badge-rol-propietario me-2">Propietario</span>;
      default:
        return <span className="badge badge-rol-cliente me-2">Cliente</span>;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-canchaya sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="logo-badge">
            <i className="bi bi-dribbble fs-5"></i>
          </span>
          <span className="fw-bold tracking-tight">Cancha<span className="text-success">Ya</span></span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCanchaYa"
          aria-controls="navbarCanchaYa"
          aria-expanded="false"
          aria-label="Alternar navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarCanchaYa">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/">
                <i className="bi bi-house-door me-1"></i> Inicio
              </NavLink>
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/dashboard">
                  <i className="bi bi-grid-fill me-1"></i> Panel
                </NavLink>
              </li>
            )}

            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/usuarios">
                  <i className="bi bi-people-fill me-1"></i> Usuarios
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <div className="text-end d-none d-md-block">
                  <div className="d-flex align-items-center justify-content-end">
                    {getRoleBadge(user?.rol)}
                    <span className="text-white fw-semibold small">
                      {user?.nombre} {user?.apellido}
                    </span>
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.correo}</small>
                </div>

                <Link to="/perfil" className="btn btn-outline-light btn-sm rounded-pill px-3" title="Mi Perfil">
                  <i className="bi bi-person-circle me-1"></i> Mi Perfil
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm rounded-pill px-3"
                  title="Cerrar Sesión"
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Salir
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill px-3">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión
                </Link>
                <Link to="/registro" className="btn btn-canchaya-primary btn-sm rounded-pill px-3">
                  <i className="bi bi-person-plus-fill me-1"></i> Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
