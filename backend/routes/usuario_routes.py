from functools import wraps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from backend.models.usuario import db, Usuario
from backend.services.usuario_service import UsuarioService

usuario_bp = Blueprint("usuarios", __name__, url_prefix="/api/usuarios")

def admin_required():
    """
    Decorador para proteger rutas exclusivas de rol administrador.
    Verifica tanto el claim del token JWT como la persistencia en la base de datos.
    """
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get("rol") != "administrador":
                return {
                    "error": "Acceso denegado: se requieren privilegios de administrador para realizar esta acción."
                }, 403

            usuario_id = int(get_jwt_identity())
            usuario = db.session.get(Usuario, usuario_id)

            if not usuario or usuario.rol != "administrador" or usuario.estado != "activo":
                return {
                    "error": "Acceso denegado: cuenta no autorizada o inactiva."
                }, 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper

@usuario_bp.route("", methods=["GET"])
@admin_required()
def listar():
    """
    GET /api/usuarios
    Lista usuarios con filtros opcionales de búsqueda (?q=), rol (?rol=) y estado (?estado=).
    """
    q = request.args.get("q", type=str)
    rol = request.args.get("rol", type=str)
    estado = request.args.get("estado", type=str)

    resultado, status_code = UsuarioService.listar_usuarios(query_str=q, rol=rol, estado=estado)
    return jsonify(resultado), status_code

@usuario_bp.route("/<int:usuario_id>", methods=["GET"])
@admin_required()
def obtener(usuario_id: int):
    """
    GET /api/usuarios/:id
    Obtiene un usuario específico por su ID.
    """
    resultado, status_code = UsuarioService.obtener_por_id(usuario_id)
    return jsonify(resultado), status_code

@usuario_bp.route("", methods=["POST"])
@admin_required()
def crear():
    """
    POST /api/usuarios
    Crea un nuevo usuario desde el panel de administración.
    """
    data = request.get_json(silent=True) or {}
    resultado, status_code = UsuarioService.crear_usuario_admin(data)
    return jsonify(resultado), status_code

@usuario_bp.route("/<int:usuario_id>", methods=["PUT"])
@admin_required()
def actualizar(usuario_id: int):
    """
    PUT /api/usuarios/:id
    Actualiza los datos de un usuario existente.
    """
    current_admin_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    resultado, status_code = UsuarioService.actualizar_usuario_admin(usuario_id, data, current_admin_id)
    return jsonify(resultado), status_code

@usuario_bp.route("/<int:usuario_id>", methods=["DELETE"])
@admin_required()
def eliminar(usuario_id: int):
    """
    DELETE /api/usuarios/:id
    Elimina un usuario del sistema (con salvaguardas de seguridad).
    """
    current_admin_id = int(get_jwt_identity())
    resultado, status_code = UsuarioService.eliminar_usuario_admin(usuario_id, current_admin_id)
    return jsonify(resultado), status_code
