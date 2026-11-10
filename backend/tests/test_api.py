import os
import sys
import pytest

# Asegurar importación de backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app import create_app
from backend.config import TestingConfig
from backend.models.usuario import db, Usuario

@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def admin_token(client):
    """Crea un usuario administrador y retorna su token de acceso JWT."""
    # Registro del admin
    admin = Usuario(
        nombre="Admin",
        apellido="Sistema",
        correo="admin@canchaya.com",
        telefono="70000001",
        rol="administrador",
        estado="activo"
    )
    admin.set_password("Admin123*")
    db.session.add(admin)
    db.session.commit()

    resp = client.post("/api/auth/login", json={
        "correo": "admin@canchaya.com",
        "password": "Admin123*"
    })
    return resp.get_json()["token"]

@pytest.fixture
def cliente_token(client):
    """Crea un usuario cliente normal y retorna su token de acceso JWT."""
    resp_reg = client.post("/api/auth/registro", json={
        "nombre": "Juan",
        "apellido": "Perez",
        "correo": "juan.perez@correo.com",
        "telefono": "71112233",
        "password": "Password123",
        "confirm_password": "Password123"
    })
    assert resp_reg.status_code == 201

    resp_log = client.post("/api/auth/login", json={
        "correo": "juan.perez@correo.com",
        "password": "Password123"
    })
    return resp_log.get_json()["token"]

# ----------------- PRUEBAS DE AUTENTICACIÓN -----------------

def test_registro_exitoso(client):
    """1. Registro exitoso de un nuevo usuario."""
    resp = client.post("/api/auth/registro", json={
        "nombre": "Carlos",
        "apellido": "Gomez",
        "correo": "carlos.gomez@test.com",
        "telefono": "78965412",
        "password": "Password123*",
        "confirm_password": "Password123*"
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert "usuario" in data
    assert data["usuario"]["correo"] == "carlos.gomez@test.com"
    assert data["usuario"]["rol"] == "cliente"
    assert "password_hash" not in data["usuario"]

def test_rechazo_correo_duplicado(client):
    """2. Rechazo de un correo electrónico duplicado."""
    payload = {
        "nombre": "Carlos",
        "apellido": "Gomez",
        "correo": "duplicado@test.com",
        "telefono": "78965412",
        "password": "Password123*",
        "confirm_password": "Password123*"
    }
    resp1 = client.post("/api/auth/registro", json=payload)
    assert resp1.status_code == 201

    # Intento de registro con el mismo correo
    resp2 = client.post("/api/auth/registro", json=payload)
    assert resp2.status_code == 409
    assert "ya se encuentra registrado" in resp2.get_json()["error"]

def test_login_credenciales_correctas(client):
    """3. Login con credenciales correctas."""
    client.post("/api/auth/registro", json={
        "nombre": "Ana",
        "apellido": "Lopez",
        "correo": "ana.lopez@test.com",
        "password": "Password123*"
    })

    resp = client.post("/api/auth/login", json={
        "correo": "ana.lopez@test.com",
        "password": "Password123*"
    })
    assert resp.status_code == 200
    data = resp.get_json()
    assert "token" in data
    assert data["usuario"]["correo"] == "ana.lopez@test.com"

def test_rechazo_credenciales_incorrectas(client):
    """4. Rechazo de credenciales incorrectas."""
    client.post("/api/auth/registro", json={
        "nombre": "Ana",
        "apellido": "Lopez",
        "correo": "ana2.lopez@test.com",
        "password": "Password123*"
    })

    resp = client.post("/api/auth/login", json={
        "correo": "ana2.lopez@test.com",
        "password": "ContraseñaEquivocada"
    })
    assert resp.status_code == 401
    assert "incorrectos" in resp.get_json()["error"]

def test_rechazo_login_cuenta_desactivada(client):
    """Rechazo de inicio de sesión para cuenta inactiva/desactivada."""
    inactivo = Usuario(
        nombre="Inactivo",
        apellido="Usuario",
        correo="inactivo@test.com",
        rol="cliente",
        estado="inactivo"
    )
    inactivo.set_password("Password123*")
    db.session.add(inactivo)
    db.session.commit()

    resp = client.post("/api/auth/login", json={
        "correo": "inactivo@test.com",
        "password": "Password123*"
    })
    assert resp.status_code == 403
    assert "inactiva o desactivada" in resp.get_json()["error"]

def test_cierre_sesion_efectivo(client, cliente_token):
    """5. Cierre de sesión efectivo e invalidación de token."""
    headers = {"Authorization": f"Bearer {cliente_token}"}

    # Verificar que el token funciona en /perfil
    resp1 = client.get("/api/auth/perfil", headers=headers)
    assert resp1.status_code == 200

    # Cerrar sesión
    resp_logout = client.post("/api/auth/logout", headers=headers)
    assert resp_logout.status_code == 200

    # Intentar usar el token revocado -> debe ser 401
    resp2 = client.get("/api/auth/perfil", headers=headers)
    assert resp2.status_code == 401
    assert "revocado" in resp2.get_json()["error"].lower()

# ----------------- PRUEBAS DE GESTIÓN Y PERFIL -----------------

def test_actualizacion_perfil_personal(client, cliente_token):
    """11. Actualización del perfil personal (datos y contraseña)."""
    headers = {"Authorization": f"Bearer {cliente_token}"}

    # Actualizar datos personales
    resp = client.put("/api/auth/perfil", headers=headers, json={
        "nombre": "Juan Modificado",
        "apellido": "Perez Actualizado",
        "telefono": "79998877"
    })
    assert resp.status_code == 200
    assert resp.get_json()["usuario"]["nombre"] == "Juan Modificado"

    # Actualizar contraseña con verificación de actual
    resp_pass = client.put("/api/auth/perfil", headers=headers, json={
        "nombre": "Juan Modificado",
        "apellido": "Perez Actualizado",
        "password_actual": "Password123",
        "nueva_password": "NuevoPassword456",
        "confirmar_nueva_password": "NuevoPassword456"
    })
    assert resp_pass.status_code == 200

    # Login con la nueva contraseña
    resp_relogin = client.post("/api/auth/login", json={
        "correo": "juan.perez@correo.com",
        "password": "NuevoPassword456"
    })
    assert resp_relogin.status_code == 200

# ----------------- PRUEBAS DEL CRUD ADMINISTRATIVO -----------------

def test_creacion_usuarios_por_admin(client, admin_token):
    """6. Creación de usuarios por el administrador con rol y estado específicos."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = client.post("/api/usuarios", headers=headers, json={
        "nombre": "Dueño",
        "apellido": "Canchas",
        "correo": "propietario@canchaya.com",
        "telefono": "72223344",
        "password": "PropietarioPass123",
        "rol": "propietario",
        "estado": "activo"
    })
    assert resp.status_code == 201
    data = resp.get_json()["usuario"]
    assert data["rol"] == "propietario"
    assert data["correo"] == "propietario@canchaya.com"

def test_listado_y_busqueda_usuarios_admin(client, admin_token):
    """7. Listado y búsqueda de usuarios."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Listar todos
    resp = client.get("/api/usuarios", headers=headers)
    assert resp.status_code == 200
    usuarios = resp.get_json()
    assert len(usuarios) >= 1

    # Búsqueda por término
    resp_search = client.get("/api/usuarios?q=admin", headers=headers)
    assert resp_search.status_code == 200
    resultados = resp_search.get_json()
    assert any("admin" in u["correo"].lower() for u in resultados)

def test_actualizacion_usuarios_por_admin(client, admin_token):
    """8. Actualización de usuarios por el administrador."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Crear usuario objetivo
    resp_c = client.post("/api/usuarios", headers=headers, json={
        "nombre": "Pedro",
        "apellido": "Picapiedra",
        "correo": "pedro@test.com",
        "password": "Password123",
        "rol": "cliente",
        "estado": "activo"
    })
    u_id = resp_c.get_json()["usuario"]["id"]

    # Modificar rol a propietario y cambiar estado a inactivo
    resp_u = client.put(f"/api/usuarios/{u_id}", headers=headers, json={
        "nombre": "Pedro",
        "apellido": "Picapiedra",
        "correo": "pedro@test.com",
        "rol": "propietario",
        "estado": "inactivo"
    })
    assert resp_u.status_code == 200
    actualizado = resp_u.get_json()["usuario"]
    assert actualizado["rol"] == "propietario"
    assert actualizado["estado"] == "inactivo"

def test_eliminacion_usuarios_por_admin(client, admin_token):
    """9. Eliminación de usuarios por el administrador."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp_c = client.post("/api/usuarios", headers=headers, json={
        "nombre": "Usuario",
        "apellido": "Temporal",
        "correo": "temporal@test.com",
        "password": "Password123",
        "rol": "cliente",
        "estado": "activo"
    })
    u_id = resp_c.get_json()["usuario"]["id"]

    # Eliminar
    resp_d = client.delete(f"/api/usuarios/{u_id}", headers=headers)
    assert resp_d.status_code == 200

    # Verificar que ya no existe
    resp_check = client.get(f"/api/usuarios/{u_id}", headers=headers)
    assert resp_check.status_code == 404

def test_restriccion_crud_a_usuarios_sin_permisos(client, cliente_token):
    """10. Restricción del CRUD administrativo a usuarios sin rol administrador."""
    # Sin token
    resp_no_auth = client.get("/api/usuarios")
    assert resp_no_auth.status_code == 401

    # Con token de cliente normal
    headers = {"Authorization": f"Bearer {cliente_token}"}
    resp_forbidden = client.get("/api/usuarios", headers=headers)
    assert resp_forbidden.status_code == 403
    assert "Acceso denegado" in resp_forbidden.get_json()["error"]

    resp_post = client.post("/api/usuarios", headers=headers, json={
        "nombre": "Hack",
        "apellido": "Intent",
        "correo": "hack@test.com",
        "password": "Password123",
        "rol": "administrador"
    })
    assert resp_post.status_code == 403

def test_proteccion_ultimo_administrador(client, admin_token):
    """Salvaguarda: no se puede eliminar ni desactivar al único administrador activo."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Obtener el ID del admin actual
    admin = Usuario.query.filter_by(correo="admin@canchaya.com").first()

    # Intentar eliminar a sí mismo (último admin)
    resp_del = client.delete(f"/api/usuarios/{admin.id}", headers=headers)
    assert resp_del.status_code == 400
    assert "No puedes eliminar tu propia cuenta" in resp_del.get_json()["error"]

    # Intentar desactivar a sí mismo
    resp_deact = client.put(f"/api/usuarios/{admin.id}", headers=headers, json={
        "nombre": admin.nombre,
        "apellido": admin.apellido,
        "correo": admin.correo,
        "rol": "administrador",
        "estado": "inactivo"
    })
    assert resp_deact.status_code == 400
    assert "No puedes desactivar tu propia cuenta" in resp_deact.get_json()["error"]

def test_persistencia_sqlite(app):
    """12. Persistencia de los datos en la base de datos."""
    with app.app_context():
        nuevo = Usuario(
            nombre="Persistente",
            apellido="Prueba",
            correo="persistente@canchaya.com",
            rol="cliente",
            estado="activo"
        )
        nuevo.set_password("Persist123*")
        db.session.add(nuevo)
        db.session.commit()

        # Consultar directamente desde otra consulta de sesión
        db.session.expire_all()
        encontrado = Usuario.query.filter_by(correo="persistente@canchaya.com").first()
        assert encontrado is not None
        assert encontrado.nombre == "Persistente"
        assert encontrado.check_password("Persist123*")
