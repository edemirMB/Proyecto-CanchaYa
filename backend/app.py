import os
import sys

# Asegurar que el directorio raíz del proyecto esté en PYTHONPATH
basedir = os.path.abspath(os.path.dirname(__file__))
parentdir = os.path.abspath(os.path.join(basedir, ".."))
if parentdir not in sys.path:
    sys.path.insert(0, parentdir)
if basedir not in sys.path:
    sys.path.insert(0, basedir)

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from backend.models.usuario import db
from backend.models.token_blocklist import TokenBlocklist
from backend.routes.auth_routes import auth_bp
from backend.routes.usuario_routes import usuario_bp

jwt = JWTManager()

def create_app(config_class=Config):
    """Fábrica de aplicaciones Flask para CanchaYa."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configuración de CORS restringido a los orígenes autorizados
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}},
        supports_credentials=True
    )

    # Inicialización de extensiones
    db.init_app(app)
    jwt.init_app(app)

    # Verificación de tokens revocados (Blocklist / Logout)
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
        jti = jwt_payload["jti"]
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None

    # Manejadores de errores personalizados para JWT
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "error": "El token ha sido revocado tras el cierre de sesión. Debe iniciar sesión nuevamente."
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "error": "La sesión ha expirado por tiempo límite. Por favor inicie sesión nuevamente."
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return jsonify({
            "error": "No se proporcionó token de autorización o es inválido."
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({
            "error": "El formato del token es inválido."
        }), 401

    # Registro de Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(usuario_bp)

    # Endpoint base de salud / info del sistema
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "estado": "activo",
            "proyecto": "CanchaYa",
            "modulo": "Seguridad y Gestión de Usuarios",
            "sprint": "Sprint 1",
            "universidad": "USFX - Chuquisaca"
        }), 200

    # Crear tablas automáticamente al iniciar
    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    puerto = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=puerto, debug=True)
