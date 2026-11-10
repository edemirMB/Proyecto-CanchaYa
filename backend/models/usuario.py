from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

# Instancia compartida de SQLAlchemy
db = SQLAlchemy()

class Usuario(db.Model):
    """
    Modelo de Usuario para el sistema CanchaYa.
    Cumple con el esquema de base de datos solicitado para el subsistema de Seguridad.
    """
    __tablename__ = "usuarios"

    ROLES_PERMITIDOS = ("administrador", "propietario", "cliente")
    ESTADOS_PERMITIDOS = ("activo", "inactivo")

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(50), nullable=False)
    correo = db.Column(db.String(120), unique=True, nullable=False, index=True)
    telefono = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default="cliente")
    estado = db.Column(db.String(20), nullable=False, default="activo")
    fecha_registro = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def set_password(self, password: str):
        """Genera y almacena el hash seguro de la contraseña."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verifica la contraseña ingresada contra el hash seguro almacenado."""
        if not self.password_hash or not password:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """
        Retorna la representación en diccionario del usuario.
        IMPORTANTE: La contraseña jamás debe devolverse en las respuestas de la API.
        """
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "correo": self.correo,
            "telefono": self.telefono or "",
            "rol": self.rol,
            "estado": self.estado,
            "fecha_registro": self.fecha_registro.strftime("%Y-%m-%d %H:%M:%S") if self.fecha_registro else None
        }

    def __repr__(self):
        return f"<Usuario {self.correo} - Rol: {self.rol}>"
