import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 my-auto text-center">
      <div className="py-5">
        <div className="display-1 fw-bold text-success mb-2">404</div>
        <h2 className="fw-bold mb-3">Página No Encontrada</h2>
        <p className="text-muted mb-4 lead">
          La ruta a la que intentas acceder no existe en CanchaYa o fue movida.
        </p>
        <Link to="/" className="btn btn-canchaya-primary rounded-pill px-4">
          <i className="bi bi-house-door-fill me-2"></i> Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
