from datetime import datetime, timezone
from backend.models.usuario import db

class TokenBlocklist(db.Model):
    """
    Tabla para almacenar identificadores únicos de tokens revocados (JTI).
    Permite invalidar tokens tras el cierre de sesión.
    """
    __tablename__ = "token_blocklist"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jti = db.Column(db.String(36), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<TokenBlocklist {self.jti}>"
