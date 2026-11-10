from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from backend.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/registro", methods=["POST"])
def registro():
    """
    POST /api/auth/registro
    Registra un nuevo usuario con rol 'cliente'.
    """
    data = request.get_json(silent=True) or {}
    resultado, status_code = AuthService.registrar_usuario(data)
    return jsonify(resultado), status_code

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Inicia sesión con correo y contraseña, retornando token JWT.
    """
    data = request.get_json(silent=True) or {}
    correo = data.get("correo")
    password = data.get("password")

    resultado, status_code = AuthService.autenticar(correo, password)
    return jsonify(resultado), status_code

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    POST /api/auth/logout
    Invalida el token JWT actual agregándolo a la blocklist.
    """
    jwt_data = get_jwt()
    jti = jwt_data.get("jti")
    resultado, status_code = AuthService.revocar_token(jti)
    return jsonify(resultado), status_code

@auth_bp.route("/perfil", methods=["GET"])
@jwt_required()
def obtener_perfil():
    """
    GET /api/auth/perfil
    Retorna los datos del usuario autenticado actual.
    """
    usuario_id = int(get_jwt_identity())
    resultado, status_code = AuthService.obtener_perfil(usuario_id)
    return jsonify(resultado), status_code

@auth_bp.route("/perfil", methods=["PUT"])
@jwt_required()
def actualizar_perfil():
    """
    PUT /api/auth/perfil
    Actualiza datos personales y/o contraseña del usuario autenticado.
    """
    usuario_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    resultado, status_code = AuthService.actualizar_perfil(usuario_id, data)
    return jsonify(resultado), status_code
