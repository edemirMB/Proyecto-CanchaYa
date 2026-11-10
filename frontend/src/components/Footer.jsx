import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-canchaya py-4 mt-auto">
      <div className="container">
        <div className="row gy-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center mb-2">
              <span className="logo-badge me-2" style={{ background: '#10b981', padding: '4px 8px', borderRadius: '8px' }}>
                <i className="bi bi-dribbble text-white"></i>
              </span>
              <span className="text-white fw-bold fs-5">Cancha<span className="text-success">Ya</span></span>
            </div>
            <p className="small text-muted mb-0">
              Sistema web para búsqueda, disponibilidad y reserva de canchas deportivas.
              Desarrollado para la materia de <strong>Ingeniería de Software</strong>.
            </p>
          </div>

          <div className="col-12 col-md-4">
            <div className="small">
              <div className="text-white fw-semibold mb-1">
                <i className="bi bi-mortarboard-fill me-1 text-success"></i> U.M.R.P.S.F.X.CH.
              </div>
              <div className="text-muted">Facultad de Tecnología — Sucre, Bolivia</div>
              <div className="text-muted">Docente: <strong>Ing. Ramiro Duran</strong></div>
            </div>
          </div>

          <div className="col-12 col-md-3 text-md-end">
            <div className="small">
              <div className="text-white fw-semibold mb-1">
                <i className="bi bi-people-fill me-1 text-success"></i> Integrantes:
              </div>
              <div className="text-muted">Mayta Baltazar Edemir</div>
              <div className="text-muted">Montalvo Ramirez Gunar</div>
              <span className="badge bg-dark border border-secondary text-success mt-1">Sprint 1 - Seguridad</span>
            </div>
          </div>
        </div>

        <hr className="my-3 border-secondary opacity-25" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-muted">
          <span>&copy; {new Date().getFullYear()} CanchaYa. Todos los derechos reservados.</span>
          <span>Práctica Académica Universitaria</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
