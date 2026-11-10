import os
from datetime import timedelta
from dotenv import load_dotenv

# Cargar variables de entorno desde .env si existe
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, ".env"))

class Config:
    """Configuración base de la aplicación CanchaYa."""
    SECRET_KEY = os.getenv("SECRET_KEY", "canchaya_secret_key_development_2026_usfx")
    
    # Asegurar ruta absoluta para la base de datos SQLite dentro de backend/
    db_env = os.getenv("DATABASE_URL")
    if db_env and db_env.startswith("sqlite:///") and not os.path.isabs(db_env.replace("sqlite:///", "")):
        db_file = db_env.replace("sqlite:///", "")
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, db_file)}"
    else:
        SQLALCHEMY_DATABASE_URI = db_env or f"sqlite:///{os.path.join(basedir, 'canchaya.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuración de JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "canchaya_jwt_secret_key_development_2026_usfx")
    token_hours = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 24))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=token_hours)

    # Configuración de orígenes permitidos para CORS
    cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",") if origin.strip()]

class TestingConfig(Config):
    """Configuración para pruebas automatizadas."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
