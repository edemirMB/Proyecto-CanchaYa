from sqlalchemy import or_
from backend.models.usuario import db, Usuario
from backend.services.auth_service import AuthService

class UsuarioService:
    """Servicio con la lógica del CRUD administrativo de usuarios y reglas de seguridad."""

    @staticmethod
    def listar_usuarios(query_str: str = None, rol: str = None, estado: str = None):
        """
        Retorna la lista de usuarios con soporte para búsqueda por nombre,
        apellido o correo, y filtros opcionales por rol o estado.
        """
        consulta = Usuario.query

        if query_str:
            termino = f"%{query_str.strip()}%"
            consulta = consulta.filter(
                or_(
                    Usuario.nombre.ilike(termino),
                    Usuario.apellido.ilike(termino),
                    Usuario.correo.ilike(termino)
                )
            )

        if rol and rol in Usuario.ROLES_PERMITIDOS:
            consulta = consulta.filter(Usuario.rol == rol)

        if estado and estado in Usuario.ESTADOS_PERMITIDOS:
            consulta = consulta.filter(Usuario.estado == estado)

        usuarios = consulta.order_by(Usuario.fecha_registro.desc()).all()
        return [u.to_dict() for u in usuarios], 200

    @staticmethod
    def obtener_por_id(usuario_id: int):
        """Retorna los datos de un usuario por su ID o 404 si no existe."""
        usuario = db.session.get(Usuario, usuario_id)
        if not usuario:
            return {"error": "Usuario no encontrado."}, 404
        return {"usuario": usuario.to_dict()}, 200

    @staticmethod
    def contar_administradores_activos() -> int:
        """Cuenta el número actual de administradores con estado 'activo'."""
        return Usuario.query.filter_by(rol="administrador", estado="activo").count()

    @staticmethod
    def crear_usuario_admin(data: dict):
        """
        Permite al administrador crear un usuario asignándole cualquier rol y estado.
        """
        nombre = (data.get("nombre") or "").strip()
        apellido = (data.get("apellido") or "").strip()
        correo = (data.get("correo") or "").strip().lower()
        telefono = (data.get("telefono") or "").strip()
        password = data.get("password") or ""
        rol = (data.get("rol") or "cliente").strip().lower()
        estado = (data.get("estado") or "activo").strip().lower()

        if not nombre or not apellido:
            return {"error": "El nombre y el apellido son obligatorios."}, 400

        if not correo or not AuthService.validar_formato_correo(correo):
            return {"error": "Debe proporcionar un correo electrónico válido."}, 400

        if not password or len(password) < 6:
            return {"error": "La contraseña debe tener al menos 6 caracteres."}, 400

        if rol not in Usuario.ROLES_PERMITIDOS:
            return {"error": f"Rol inválido. Debe ser uno de: {', '.join(Usuario.ROLES_PERMITIDOS)}."}, 400

        if estado not in Usuario.ESTADOS_PERMITIDOS:
            return {"error": f"Estado inválido. Debe ser uno de: {', '.join(Usuario.ESTADOS_PERMITIDOS)}."}, 400

        # Verificar unicidad de correo
        if Usuario.query.filter(Usuario.correo.ilike(correo)).first():
            return {"error": "El correo electrónico ya está registrado por otro usuario."}, 409

        nuevo_usuario = Usuario(
            nombre=nombre,
            apellido=apellido,
            correo=correo,
            telefono=telefono,
            rol=rol,
            estado=estado
        )
        nuevo_usuario.set_password(password)

        db.session.add(nuevo_usuario)
        db.session.commit()

        return {
            "mensaje": "Usuario creado exitosamente.",
            "usuario": nuevo_usuario.to_dict()
        }, 201

    @staticmethod
    def actualizar_usuario_admin(usuario_id: int, data: dict, current_admin_id: int):
        """
        Actualiza un usuario desde el panel de administración.
        Aplica reglas de negocio y salvaguardas:
        - Impide que el último administrador activo sea desactivado o degradado.
        - Impide que el administrador actual se auto-degrade o auto-desactive.
        """
        usuario = db.session.get(Usuario, usuario_id)
        if not usuario:
            return {"error": "Usuario no encontrado."}, 404

        nombre = (data.get("nombre") or "").strip()
        apellido = (data.get("apellido") or "").strip()
        correo = (data.get("correo") or "").strip().lower()
        telefono = (data.get("telefono") or "").strip()
        rol = (data.get("rol") or usuario.rol).strip().lower()
        estado = (data.get("estado") or usuario.estado).strip().lower()

        if not nombre or not apellido:
            return {"error": "El nombre y el apellido son obligatorios."}, 400

        if not correo or not AuthService.validar_formato_correo(correo):
            return {"error": "Debe proporcionar un correo electrónico válido."}, 400

        if rol not in Usuario.ROLES_PERMITIDOS:
            return {"error": f"Rol inválido. Debe ser uno de: {', '.join(Usuario.ROLES_PERMITIDOS)}."}, 400

        if estado not in Usuario.ESTADOS_PERMITIDOS:
            return {"error": f"Estado inválido. Debe ser uno de: {', '.join(Usuario.ESTADOS_PERMITIDOS)}."}, 400

        # Verificar correo duplicado en otros usuarios
        existente = Usuario.query.filter(
            Usuario.correo.ilike(correo),
            Usuario.id != usuario.id
        ).first()
        if existente:
            return {"error": "El correo ya está en uso por otro usuario."}, 409

        # --- REGLAS DE SEGURIDAD CRÍTICAS ---
        es_admin_activo = (usuario.rol == "administrador" and usuario.estado == "activo")
        cambia_a_no_admin = (rol != "administrador")
        cambia_a_inactivo = (estado != "activo")

        # Regla 1: Auto-protección del administrador en sesión
        if usuario.id == current_admin_id:
            if cambia_a_no_admin:
                return {"error": "No puedes revocar tu propio rol de administrador mientras estás en sesión."}, 400
            if cambia_a_inactivo:
                return {"error": "No puedes desactivar tu propia cuenta mientras estás en sesión."}, 400

        # Regla 2: Salvaguarda del último administrador activo
        if es_admin_activo and (cambia_a_no_admin or cambia_a_inactivo):
            total_activos = UsuarioService.contar_administradores_activos()
            if total_activos <= 1:
                return {
                    "error": "Operación rechazada: no es posible desactivar ni cambiar el rol del único administrador activo del sistema."
                }, 400

        # Aplicar actualizaciones
        usuario.nombre = nombre
        usuario.apellido = apellido
        usuario.correo = correo
        usuario.telefono = telefono
        usuario.rol = rol
        usuario.estado = estado

        # Si se envió una nueva contraseña opcional
        nueva_pass = data.get("password")
        if nueva_pass:
            if len(nueva_pass) < 6:
                return {"error": "La nueva contraseña debe tener al menos 6 caracteres."}, 400
            usuario.set_password(nueva_pass)

        db.session.commit()

        return {
            "mensaje": "Usuario actualizado exitosamente.",
            "usuario": usuario.to_dict()
        }, 200

    @staticmethod
    def eliminar_usuario_admin(usuario_id: int, current_admin_id: int):
        """
        Elimina un usuario de la base de datos.
        Aplica salvaguardas:
        - El administrador no puede auto-eliminarse.
        - No se puede eliminar al último administrador activo del sistema.
        """
        usuario = db.session.get(Usuario, usuario_id)
        if not usuario:
            return {"error": "Usuario no encontrado."}, 404

        # Regla 1: No auto-eliminarse
        if usuario.id == current_admin_id:
            return {"error": "No puedes eliminar tu propia cuenta de administrador mientras estás en sesión."}, 400

        # Regla 2: Proteger al último administrador activo
        if usuario.rol == "administrador" and usuario.estado == "activo":
            total_activos = UsuarioService.contar_administradores_activos()
            if total_activos <= 1:
                return {
                    "error": "Operación rechazada: no es posible eliminar al único administrador activo del sistema."
                }, 400

        db.session.delete(usuario)
        db.session.commit()

        return {"mensaje": f"El usuario {usuario.correo} ha sido eliminado correctamente."}, 200
