import os
import sys
import tempfile
import sqlite3

basedir = os.path.abspath(os.path.dirname(__file__))
parentdir = os.path.abspath(os.path.join(basedir, ".."))
if parentdir not in sys.path:
    sys.path.insert(0, parentdir)

from backend.app import create_app
from backend.config import Config
from backend.models.usuario import db

def test_fresh_installation():
    with tempfile.TemporaryDirectory() as temp_dir:
        test_db_path = os.path.join(temp_dir, "test_fresh.db")
        print(f"Probando creación de base de datos en entorno nuevo: {test_db_path}")

        class FreshConfig(Config):
            SQLALCHEMY_DATABASE_URI = f"sqlite:///{test_db_path}"

        app = create_app(FreshConfig)
        with app.app_context():
            db.create_all()
            db.engine.dispose()

        assert os.path.exists(test_db_path), "La base de datos no fue creada"

        conn = sqlite3.connect(test_db_path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cur.fetchall()]
        conn.close()

        print(f"Tablas creadas automáticamente en entorno nuevo: {tables}")
        assert "usuarios" in tables, "Falta tabla usuarios"
        assert "token_blocklist" in tables, "Falta tabla token_blocklist"
        print(">> VERIFICACIÓN EXITOSA: Una instalación limpia inicializa su propia base de datos sin depender de archivos existentes.")

if __name__ == "__main__":
    test_fresh_installation()
