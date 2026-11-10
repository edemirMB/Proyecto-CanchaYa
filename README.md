# CanchaYa — Sistema Web para Búsqueda, Disponibilidad y Reserva de Canchas Deportivas

**Materia:** Ingeniería de Software  
**Institución:** Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca (USFX)  
**Facultad:** Facultad de Tecnología  
**Docente:** Ing. Ramiro Duran  
**Entrega:** Sprint 1 – Subsistema de Seguridad y Gestión de Usuarios  

### Integrantes del Grupo:
- **Mayta Baltazar Edemir**
- **Montalvo Ramirez Gunar**

---

## 1. Descripción del Proyecto

**CanchaYa** es una plataforma web orientada a la comunidad deportiva de Sucre y a propietarios de complejos deportivos. Su propósito fundamental es resolver la problemática actual de consultar disponibilidad y reservar turnos mediante llamadas telefónicas, mensajes dispersos o registros en cuadernos de papel.

En sus versiones completas, la plataforma permitirá:
- **Deportistas / Clientes:** Buscar canchas por disciplina (fútbol, futsal, básquetbol, vóley), consultar disponibilidad de horarios en tiempo real y realizar reservas seguras.
- **Propietarios de Complejos:** Registrar y administrar canchas, definir horarios de atención, configurar precios por turno y consultar su historial de reservas.
- **Administradores:** Supervisar la plataforma, gestionar usuarios y verificar la integridad operativa del sistema.

### Alcance de esta Entrega: Sprint 1 – Seguridad y Gestión de Usuarios
Para este primer sprint se implementó el **Subsistema de Seguridad** completo y funcional, estableciendo la base de autenticación, control de acceso basado en roles (RBAC), persistencia relacional en SQLite y gestión administrativa de usuarios requerida antes de incorporar los módulos de reserva.

---

## 2. Tecnologías Utilizadas

La arquitectura fue seleccionada para garantizar un código modular, mantenible, moderno y comprensible para una defensa universitaria:

### Backend
- **Python 3.10+**: Lenguaje base para el desarrollo del servidor.
- **Flask (v3.0.3)**: Microframework web ligero y eficiente.
- **Flask-SQLAlchemy (v3.1.1)**: ORM relacional para modelar las entidades y abstraer las consultas SQL.
- **Flask-JWT-Extended (v4.6.0)**: Manejo de autenticación basada en tokens JWT con revocación (Blocklist).
- **Werkzeug (v3.0.3)**: Generación y verificación de hash criptográfico seguro para contraseñas (nunca texto plano).
- **SQLite3**: Base de datos relacional autocontenida (`canchaya.db`).
- **Flask-CORS (v4.0.1)**: Control de acceso entre orígenes para comunicar de forma segura el frontend con la API.
- **python-dotenv**: Gestión de variables de entorno mediante archivos `.env`.
- **Pytest (v8.2.2)**: Suite para pruebas unitarias e integración de la API REST.

### Frontend
- **React 18**: Librería de interfaz de usuario con arquitectura de componentes funcionales y Hooks.
- **Vite 5**: Empaquetador y servidor de desarrollo ultrarrápido.
- **Bootstrap 5.3 & Bootstrap Icons**: Diseño visual responsivo, moderno y adaptable a pantallas de PC y dispositivos móviles.
- **Axios**: Cliente HTTP para el consumo de la API REST con interceptores JWT.
- **React Router DOM 6**: Enrutamiento del lado del cliente con rutas protegidas (`ProtectedRoute` y `AdminRoute`).

---

## 3. Roles del Sistema

El sistema implementa tres roles claramente diferenciados:

1. **Administrador (`administrador`)**:
   - Acceso total al panel de administración de usuarios.
   - Listar, buscar y filtrar todos los usuarios registrados.
   - Crear nuevos usuarios asignando cualquier rol y estado.
   - Editar información de cualquier usuario (nombre, apellido, correo, teléfono, rol, estado, contraseña).
   - Eliminar usuarios del sistema.
   - Activar o desactivar cuentas.
   - **Salvaguardas de seguridad:** 
     - No puede auto-eliminarse mientras está en sesión.
     - No puede revocar su propio rol de administrador mientras está en sesión.
     - El sistema rechaza cualquier intento de eliminar o desactivar al último administrador activo del sistema.

2. **Propietario de cancha (`propietario`)**:
   - Registro y login en la plataforma.
   - Consulta de sus datos en su panel y perfil.
   - Modificación de su información personal (nombre, apellido, teléfono).
   - Cambio seguro de contraseña (con validación de la contraseña actual).
   - Cierre de sesión seguro.

3. **Cliente o deportista (`cliente`)**:
   - Rol por defecto asignado a todo usuario registrado públicamente.
   - Iniciar y cerrar sesión.
   - Consultar su información personal en el dashboard y perfil.
   - Actualizar sus datos y cambiar su contraseña.

---

## 4. Base de Datos SQLite (`canchaya.db`)

La base de datos se genera automáticamente en la carpeta `backend/` si no existe. El esquema incluye dos tablas principales:

### Tabla `usuarios`
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Identificador numérico único del usuario |
| `nombre` | VARCHAR(50) | NOT NULL | Nombre(s) del usuario |
| `apellido` | VARCHAR(50) | NOT NULL | Apellido(s) del usuario |
| `correo` | VARCHAR(120) | NOT NULL, UNIQUE, INDEX | Correo electrónico único para inicio de sesión |
| `telefono` | VARCHAR(20) | NULLABLE | Número de contacto telefónico |
| `password_hash` | VARCHAR(256) | NOT NULL | Hash criptográfico generado mediante Werkzeug |
| `rol` | VARCHAR(20) | NOT NULL, DEFAULT 'cliente' | `administrador`, `propietario` o `cliente` |
| `estado` | VARCHAR(20) | NOT NULL, DEFAULT 'activo' | `activo` o `inactivo` |
| `fecha_registro` | DATETIME | NOT NULL | Fecha y hora UTC del registro de la cuenta |

### Tabla `token_blocklist`
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Identificador del registro |
| `jti` | VARCHAR(36) | NOT NULL, UNIQUE, INDEX | Identificador único del token JWT revocado al hacer logout |
| `created_at` | DATETIME | NOT NULL | Marca de tiempo del momento de revocación |

---

## 5. Endpoints de la API REST

Todas las respuestas de la API utilizan formato JSON y códigos de estado HTTP semánticos (`200`, `201`, `400`, `401`, `403`, `404`, `409`). **El campo `password_hash` nunca es retornado en ninguna respuesta.**

### Módulo de Autenticación (`/api/auth`)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/registro` | Público | Registra un nuevo usuario con rol `cliente` y estado `activo`. |
| `POST` | `/api/auth/login` | Público | Inicia sesión con correo y contraseña. Retorna token JWT y datos del usuario. Valida que la cuenta esté en estado `activo`. |
| `POST` | `/api/auth/logout` | Autenticado | Invalida el token JWT actual agregando su identificador `jti` a la blocklist. |
| `GET` | `/api/auth/perfil` | Autenticado | Retorna los datos del usuario autenticado actual. |
| `PUT` | `/api/auth/perfil` | Autenticado | Permite editar nombre, apellido, teléfono y cambiar la contraseña requiriendo la actual. |

### Módulo de Gestión de Usuarios (`/api/usuarios`)
*Exclusivo para usuarios con rol `administrador` y estado `activo`.*

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/usuarios` | Administrador | Lista todos los usuarios. Admite filtros de búsqueda: `?q=texto` (nombre, apellido, correo), `?rol=rol` y `?estado=estado`. |
| `GET` | `/api/usuarios/:id` | Administrador | Obtiene los datos detallados de un usuario por su ID. |
| `POST` | `/api/usuarios` | Administrador | Crea un usuario con cualquier rol (`administrador`, `propietario`, `cliente`) y estado (`activo`, `inactivo`). |
| `PUT` | `/api/usuarios/:id` | Administrador | Modifica datos, rol, estado o contraseña de un usuario. Aplica salvaguardas para proteger al último admin. |
| `DELETE` | `/api/usuarios/:id` | Administrador | Elimina a un usuario. Impide auto-eliminación y eliminación del último administrador activo. |

---

## 6. Estructura del Proyecto

```text
CanchaYa/
├── backend/
│   ├── app.py                     # Inicialización de Flask, extensiones, CORS y JWT
│   ├── config.py                  # Configuraciones de BD, JWT y variables de entorno
│   ├── create_admin.py            # Script interactivo y seguro para crear el 1er administrador
│   ├── requirements.txt           # Dependencias de Python
│   ├── .env.example               # Plantilla de variables de entorno para desarrollo
│   ├── .env                       # Variables de entorno locales
│   ├── models/
│   │   ├── __init__.py            # Exporta db, Usuario y TokenBlocklist
│   │   ├── usuario.py             # Modelo Usuario con métodos set_password y check_password
│   │   └── token_blocklist.py     # Modelo TokenBlocklist para invalidar tokens en logout
│   ├── routes/
│   │   ├── __init__.py            # Registro de Blueprints
│   │   ├── auth_routes.py         # Endpoints de autenticación, logout y perfil
│   │   └── usuario_routes.py      # Endpoints del CRUD administrativo con RBAC
│   ├── services/
│   │   ├── __init__.py            # Exporta servicios
│   │   ├── auth_service.py        # Lógica de registro, login, logout y perfil
│   │   └── usuario_service.py     # Lógica del CRUD y salvaguardas del administrador
│   └── tests/
│       ├── __init__.py
│       └── test_api.py            # 14 pruebas automatizadas con pytest
├── frontend/
│   ├── index.html                 # Plantilla HTML5 con fuentes e identidad deportiva
│   ├── package.json               # Dependencias de React, Vite, Bootstrap y Axios
│   ├── vite.config.js             # Configuración de Vite y proxy inverso hacia backend
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx         # Barra de navegación con logo e información de sesión
│       │   ├── Footer.jsx         # Pie de página con créditos académicos e integrantes
│       │   ├── ProtectedRoute.jsx # Guard para rutas de usuarios autenticados
│       │   ├── AdminRoute.jsx     # Guard para rutas exclusivas de Administrador
│       │   ├── UserModal.jsx      # Modal de creación y edición en el panel administrativo
│       │   └── DeleteConfirmModal.jsx # Modal de confirmación para eliminar usuarios
│       ├── context/
│       │   └── AuthContext.jsx    # Proveedor global de autenticación, usuario y token
│       ├── pages/
│       │   ├── Home.jsx           # Pantalla 1: Presentación deportiva y académica
│       │   ├── Register.jsx       # Pantalla 2: Registro de usuarios
│       │   ├── Login.jsx          # Pantalla 3: Inicio de sesión
│       │   ├── Dashboard.jsx      # Pantalla 4: Panel según rol y módulos futuros
│       │   ├── AdminUsers.jsx     # Pantalla 5: CRUD administrativo con búsqueda y filtros
│       │   ├── Profile.jsx        # Pantalla 6: Mi perfil con cambio seguro de contraseña
│       │   └── NotFound.jsx       # Pantalla 404
│       ├── services/
│       │   ├── api.js             # Instancia de Axios con interceptores JWT
│       │   ├── authService.js     # Consumo de endpoints de autenticación
│       │   └── usuarioService.js  # Consumo de endpoints del CRUD administrativo
│       ├── App.jsx                # Enrutador principal de la aplicación
│       ├── index.css              # Estilos visuales con paleta verde deportiva
│       └── main.jsx               # Entrada de la app con Bootstrap y estilos
├── .gitignore                     # Protección de secretos (.env), venv, node_modules y canchaya.db
└── README.md                      # Documentación integral del proyecto
```

---

## 7. Requisitos Previos

Asegúrate de tener instalados en tu computadora:
- **Python 3.10 o superior**: Comprobar con `python --version` o `py --version`.
- **Node.js 18 o superior y npm**: Comprobar con `node -v` y `npm -v`.
- **Visual Studio Code** (recomendado para el desarrollo y la defensa).

---

## 8. Guía de Instalación y Ejecución Paso a Paso

### Paso 1: Clonar o abrir el proyecto en Visual Studio Code
Abre la carpeta `CanchaYA` en Visual Studio Code.

---

### Paso 2: Configuración del Backend

Abre una primera terminal en la raíz del proyecto y ejecuta:

#### En Windows (PowerShell o CMD):
```bash
# 1. Crear el entorno virtual en la carpeta backend
py -m venv backend\venv

# 2. Activar el entorno virtual
# En CMD:
backend\venv\Scripts\activate.bat
# O en PowerShell:
.\backend\venv\Scripts\Activate.ps1

# 3. Instalar las dependencias
pip install -r backend\requirements.txt
```

*(Si la ejecución de scripts en PowerShell estuviera deshabilitada en tu equipo, puedes usar la terminal CMD en VS Code).*

---

### Paso 3: Inicializar el Primer Administrador de Forma Segura

Para cumplir estrictamente con las directrices de seguridad (sin contraseñas fijas, quemadas ni visibles en el historial de comandos), ejecuta el script de inicialización interactivo:

```bash
python backend/create_admin.py
```

El script solicitará interactivamente en la terminal:
1. **Nombre:** (por defecto: `Admin`)
2. **Apellido:** (por defecto: `Principal`)
3. **Correo electrónico:** Validación de formato (ejemplo: `admin@canchaya.com`)
4. **Teléfono de contacto:** (opcional)
5. **Contraseña segura:** Solicitada mediante `getpass` (completamente oculta mientras se teclea, mínimo 6 caracteres).
6. **Confirmación de contraseña:** Solicitada mediante `getpass` para verificar coincidencia.

El sistema procesa la contraseña con **Werkzeug** (`generate_password_hash`) y almacena **únicamente el hash criptográfico seguro** en la base de datos relacional SQLite (`canchaya.db`), destruyendo inmediatamente las variables de texto plano de la memoria.

---

### Paso 4: Ejecutar el Servidor Backend (Flask)

Con el entorno virtual activado, ejecuta:

```bash
python backend/app.py
```

El backend se iniciará en `http://127.0.0.1:5000`. Verás el mensaje:
`* Running on http://127.0.0.1:5000`

---

### Paso 5: Configuración y Ejecución del Frontend (React + Vite)

Abre una **segunda terminal** en Visual Studio Code y ejecuta:

```bash
# 1. Ingresar a la carpeta del frontend
cd frontend

# 2. Instalar las dependencias de Node.js (si no lo hiciste antes)
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación web estará disponible en tu navegador en:  
👉 **`http://localhost:5173`**

---

## 9. Pruebas Automatizadas

El proyecto incluye una batería completa de **14 pruebas automatizadas** desarrolladas con `pytest` que verifican todos los casos exigidos:

1. Registro exitoso de nuevos usuarios (rol `cliente` por defecto).
2. Rechazo de correo electrónico duplicado (`HTTP 409 Conflict`).
3. Inicio de sesión con credenciales correctas.
4. Rechazo de credenciales incorrectas (`HTTP 401 Unauthorized`).
5. Rechazo de inicio de sesión para cuentas inactivas (`HTTP 403 Forbidden`).
6. Cierre de sesión efectivo (token revocado no puede reutilizarse).
7. Actualización de perfil personal y verificación de contraseña actual al cambiar clave.
8. Creación de usuarios por parte del administrador.
9. Listado y búsqueda de usuarios con filtros por nombre/correo.
10. Modificación de roles y estados por el administrador.
11. Eliminación de usuarios por el administrador.
12. Restricción del CRUD administrativo a usuarios sin rol administrador (`HTTP 403`).
13. Salvaguarda: Prevención de auto-eliminación o desactivación del último administrador activo.
14. Verificación de persistencia en SQLite.

### Para ejecutar las pruebas:
En la terminal del backend (con el entorno virtual activado):
```bash
pytest backend/tests -v
```

**Resultado esperado:**
```text
============================= 14 passed in ~13s =============================
```

---

## 10. Guía para la Defensa Universitaria ante el Docente

Al presentar el proyecto ante el docente **Ing. Ramiro Duran**, puedes estructurar la explicación en los siguientes puntos clave:

1. **Introducción y Alcance (Sprint 1):**
   - *"Buenas tardes estimado docente. El proyecto CanchaYa tiene como meta final la búsqueda y reserva de canchas deportivas. Para este primer sprint nos enfocamos con rigurosidad en el subsistema transversal más crítico: la Seguridad y Gestión de Usuarios."*

2. **Seguridad y Criptografía:**
   - *"Las contraseñas jamás se guardan como texto plano. Utilizamos `werkzeug.security` con algoritmos de derivación de claves que generan un hash unidireccional con sal (salt). Al iniciar sesión, el sistema compara el hash sin necesidad de reconstruir la contraseña original."*
   - *"La API jamás expone el campo `password_hash` en las respuestas JSON gracias al método `to_dict()` del modelo `Usuario`."*

3. **Autenticación JWT y Cierre de Sesión Real (Blocklist):**
   - *"Implementamos JSON Web Tokens con `Flask-JWT-Extended`. Para resolver el problema clásico de invalidar un token antes de su tiempo de expiración al hacer logout, creamos la tabla `token_blocklist` en SQLite donde guardamos el identificador único `jti` del token al cerrar sesión. Si un usuario intenta reutilizar ese token, el servidor lo rechaza con `HTTP 401`."*

4. **Control de Acceso Basado en Roles (RBAC):**
   - *"Protegemos tanto el Backend como el Frontend: en el backend implementamos el decorador `@admin_required` que valida el token y verifica en la base de datos que la cuenta sea de un administrador activo. En el frontend usamos componentes de orden superior `<ProtectedRoute>` y `<AdminRoute>` que impiden que clientes o visitantes vean pantallas administrativas."*

5. **Reglas de Integridad y Salvaguardas:**
   - *"Implementamos salvaguardas críticas: un administrador no puede auto-eliminarse ni degradar su propio rol mientras esté en sesión, y el sistema impide eliminar o desactivar al último administrador activo, garantizando que el sistema nunca quede huérfano sin administración."*

---

## 11. Comandos para Subir a GitHub

Para versionar el proyecto e inicializar el repositorio local:

```bash
# 1. Inicializar repositorio Git
git init

# 2. Agregar archivos respetando el archivo .gitignore (no incluye .env, base de datos ni node_modules)
git add .

# 3. Realizar el commit inicial
git commit -m "feat(security): implementacion de sprint 1 gestion de usuarios y seguridad CanchaYa"

# 4. Vincular con tu repositorio remoto de GitHub (reemplazar con tu URL de GitHub real)
# git remote add origin <URL_DE_TU_REPOSITORIO_EN_GITHUB>
# git branch -M main
# git push -u origin main
```
