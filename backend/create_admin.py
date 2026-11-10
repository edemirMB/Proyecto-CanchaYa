import os
import sys
import getpass

# Asegurar que el directorio raíz y backend estén en el PYTHONPATH
basedir = os.path.abspath(os.path.dirname(__file__))
parentdir = os.path.abspath(os.path.join(basedir, ".."))
if parentdir not in sys.path:
    sys.path.insert(0, parentdir)
if basedir not in sys.path:
    sys.path.insert(0, basedir)

from backend.app import create_app
from backend.models.usuario import db, Usuario
from backend.services.auth_service import AuthService

def solicitar_datos_interactivos():
    """
    Solicita los datos del administrador de forma interactiva en la terminal.
    La contraseña se captura de forma 100% oculta mediante getpass,
    sin quedar visible en consola, comandos ni historial del sistema.
    """
    print("\n" + "=" * 65)
    print("      CANCHAYA — CREACIÓN SEGURA DE USUARIO ADMINISTRADOR")
    print("=" * 65)
    print("Ingrese los datos para configurar la cuenta administrativa principal.")
    print("Las contraseñas no se mostrarán en pantalla mientras escribe.\n")

    # 1. Nombre
    nombre = input("• Ingrese Nombre [Admin]: ").strip() or "Admin"

    # 2. Apellido
    apellido = input("• Ingrese Apellido [Principal]: ").strip() or "Principal"

    # 3. Correo electrónico con validación de formato
    while True:
        correo = input("• Ingrese Correo Electrónico: ").strip().lower()
        if AuthService.validar_formato_correo(correo):
            break
        print("  [!] Formato de correo inválido. Ejemplo: admin@canchaya.com")

    # 4. Teléfono (opcional)
    telefono = input("• Ingrese Teléfono de contacto (opcional): ").strip()

    # 5. Contraseña segura mediante getpass (completamente oculta)
    while True:
        pass1 = getpass.getpass("• Ingrese Contraseña Segura (mínimo 6 caracteres): ")
        if len(pass1) < 6:
            print("  [!] Error: La contraseña debe tener al menos 6 caracteres por seguridad.")
            continue

        pass2 = getpass.getpass("• Confirme la Contraseña: ")
        if pass1 != pass2:
            print("  [!] Error: Las contraseñas ingresadas no coinciden. Intente de nuevo.")
            continue

        password_segura = pass1
        del pass1
        del pass2
        break

    return nombre, apellido, correo, telefono, password_segura

def registrar_administrador():
    """
    Registra o actualiza al administrador en SQLite almacenando ÚNICAMENTE
    el hash seguro generado por Werkzeug.
    """
    app = create_app()

    with app.app_context():
        # Asegurar creación de las tablas si no existen
        db.create_all()

        nombre, apellido, correo, telefono, password = solicitar_datos_interactivos()

        # Verificar si el usuario ya existe en la base de datos
        usuario_existente = Usuario.query.filter(Usuario.correo.ilike(correo)).first()

        if usuario_existente:
            print(f"\n>> El correo '{correo}' ya se encuentra registrado.")
            print(f">> Actualizando rol a 'administrador' y estado a 'activo'...")

            usuario_existente.nombre = nombre
            usuario_existente.apellido = apellido
            if telefono:
                usuario_existente.telefono = telefono
            usuario_existente.rol = "administrador"
            usuario_existente.estado = "activo"
            # Cifrado con hash seguro mediante Werkzeug (nunca texto plano)
            usuario_existente.set_password(password)

            db.session.commit()
            print(">> [ÉXITO] Usuario promovido y actualizado como ADMINISTRADOR activo.")
        else:
            nuevo_admin = Usuario(
                nombre=nombre,
                apellido=apellido,
                correo=correo,
                telefono=telefono,
                rol="administrador",
                estado="activo"
            )
            # Cifrado seguro
            nuevo_admin.set_password(password)

            db.session.add(nuevo_admin)
            db.session.commit()
            print(">> [ÉXITO] Administrador registrado exitosamente en la base de datos SQLite.")

        # Limpiar la variable de contraseña de memoria
        del password

        print("\n" + "=" * 65)
        print("  ¡Configuración completada con éxito!")
        print(f"  Usuario administrador: {correo}")
        print("  Base de datos: canchaya.db (contraseña protegida con hash seguro)")
        print("=" * 65 + "\n")

if __name__ == "__main__":
    try:
        registrar_administrador()
    except KeyboardInterrupt:
        print("\n\n[!] Operación cancelada por el usuario.")
        sys.exit(1)
