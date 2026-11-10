import re
from flask_jwt_extended import create_access_token
from backend.models.usuario import db, Usuario
from backend.models.token_blocklist import TokenBlocklist

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

class AuthService:
    """Servicio para la lógica de negocio de autenticación y perfil."""

    @staticmethod
    def validar_formato_correo(correo: str) -> bool:
        if not correo or not isinstance(correo, str):
            return False
        return bool(re.match(EMAIL_REGEX, correo.strip()))

    @staticmethod
    def registrar_usuario(data: dict):
        """
        Registra un nuevo usuario en la plataforma con rol 'cliente' por defecto.
        Valida que los datos obligatorios estén presentes y que el correo no esté duplicado.
        """
        nombre = (data.get("nombre") or "").strip()
        apellido = (data.get("apellido") or "").strip()
        correo = (data.get("correo") or "").strip().lower()
        telefono = (data.get("telefono") or "").strip()
        password = data.get("password") or ""
        confirm_password = data.get("confirm_password")

        # Validaciones de campos obligatorios
        if not nombre or not apellido:
            return {"error": "El nombre y el apellido son obligatorios."}, 400

        if not correo or not AuthService.validar_formato_correo(correo):
            return {"error": "Debe proporcionar un correo electrónico válido."}, 400

        if not password or len(password) < 6:
            return {"error": "La contraseña debe tener al menos 6 caracteres."}, 400

        if confirm_password is not None and password != confirm_password:
            return {"error": "Las contraseñas no coinciden."}, 400

        # Verificar unicidad de correo
        if Usuario.query.filter(Usuario.correo.ilike(correo)).first():
            return {"error": "El correo electrónico ya se encuentra registrado."}, 409

        nuevo_usuario = Usuario(
            nombre=nombre,
            apellido=apellido,
            correo=correo,
            telefono=telefono,
            rol="cliente",  # Por defecto todo registro público es cliente
            estado="activo"
        )
        nuevo_usuario.set_password(password)

        db.session.add(nuevo_usuario)
        db.session.commit()

        return {
            "mensaje": "Usuario registrado exitosamente.",
            "usuario": nuevo_usuario.to_dict()
        }, 201

    @staticmethod
    def autenticar(correo: str, password: str):
        """
        Autentica al usuario mediante correo y contraseña.
        Genera un token JWT si las credenciales son válidas y la cuenta está activa.
        """
        if not correo or not password:
            return {"error": "Debe ingresar el correo y la contraseña."}, 400

        correo_limpio = correo.strip().lower()
        usuario = Usuario.query.filter(Usuario.correo.ilike(correo_limpio)).first()

        if not usuario or not usuario.check_password(password):
            return {"error": "Correo electrónico o contraseña incorrectos."}, 401

        if usuario.estado != "activo":
            return {
                "error": "Su cuenta se encuentra inactiva o desactivada por el administrador. Contacte a soporte."
            }, 403

        # Crear JWT con claims adicionales útiles en el frontend
        claims = {
            "rol": usuario.rol,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo
        }
        access_token = create_access_token(
            identity=str(usuario.id),
            additional_claims=claims
        )

        return {
            "mensaje": "Inicio de sesión exitoso.",
            "token": access_token,
            "usuario": usuario.to_dict()
        }, 200

    @staticmethod
    def revocar_token(jti: str):
        """Invalida el token JWT agregando su JTI a la lista negra."""
        if not jti:
            return {"error": "Identificador de token inválido."}, 400

        # Verificar si ya existe para evitar errores
        existente = TokenBlocklist.query.filter_by(jti=jti).first()
        if not existente:
            block = TokenBlocklist(jti=jti)
            db.session.add(block)
            db.session.commit()

        return {"mensaje": "Sesión cerrada exitosamente."}, 200

    @staticmethod
    def obtener_perfil(usuario_id: int):
        """Obtiene la información del perfil del usuario autenticado."""
        usuario = db.session.get(Usuario, usuario_id)
        if not usuario:
            return {"error": "Usuario no encontrado."}, 404
        return {"usuario": usuario.to_dict()}, 200

    @staticmethod
    def actualizar_perfil(usuario_id: int, data: dict):
        """
        Permite que el usuario autenticado actualice sus datos personales
        (nombre, apellido, teléfono) y opcionalmente su contraseña.
        No permite alterar el rol ni el correo desde este endpoint.
        """
        usuario = db.session.get(Usuario, usuario_id)
        if not usuario:
            return {"error": "Usuario no encontrado."}, 404

        nombre = (data.get("nombre") or "").strip()
        apellido = (data.get("apellido") or "").strip()
        telefono = (data.get("telefono") or "").strip()

        if not nombre or not apellido:
            return {"error": "El nombre y el apellido no pueden quedar vacíos."}, 400

        usuario.nombre = nombre
        usuario.apellido = apellido
        usuario.telefono = telefono

        # Cambio de contraseña opcional
        nueva_password = data.get("nueva_password")
        if nueva_password:
            password_actual = data.get("password_actual")
            if not password_actual:
                return {"error": "Debe ingresar su contraseña actual para establecer una nueva."}, 400

            if not usuario.check_password(password_actual):
                return {"error": "La contraseña actual ingresada es incorrecta."}, 400

            if len(nueva_password) < 6:
                return {"error": "La nueva contraseña debe tener al menos 6 caracteres."}, 400

            confirmar_nueva = data.get("confirmar_nueva_password")
            if confirmar_nueva is not None and nueva_password != confirmar_nueva:
                return {"error": "La confirmación de la nueva contraseña no coincide."}, 400

            usuario.set_password(nueva_password)

        db.session.commit()

        return {
            "mensaje": "Perfil actualizado exitosamente.",
            "usuario": usuario.to_dict()
        }, 200
