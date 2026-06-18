# Sistema Inteligente de Recolección de Residuos Sólidos - Cusco ("Te Quiero Verde Cusco")

Plataforma web premium para optimizar la gestión y recolección de residuos sólidos en Cusco, promoviendo la participación ciudadana a través de incentivos (EcoPuntos) y facilitando el registro y validación de evidencias de reciclaje.

---

## 🚀 Historias de Usuario Implementadas (HU-001 a HU-004)

El sistema cuenta con las primeras 4 Historias de Usuario completamente desarrolladas y funcionales a nivel de frontend, backend y base de datos:

### 1. HU-001: Autenticación de Usuarios y Gestión de Sesiones
* **Registro y Login:** Formulario de creación de cuenta y acceso con autenticación basada en tokens seguros (DRF Token Auth).
* **Cierre de Sesión Seguro:** Endpoint `/api/auth/logout/` que invalida y elimina el token de autenticación activo en el servidor.
* **Seguridad de Contraseñas:** Validación de complejidad de contraseñas tanto en el frontend como en el backend (mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial).
* **Recuperación de Contraseña:** Flujo conectado a un endpoint mock para simular el envío de correos de restablecimiento.

### 2. HU-002: Registro Automatizado mediante Consulta de DNI (RENIEC)
* **Integración con API Decolecta:** Conexión real con el servicio externo de Decolecta para consultar los datos de la RENIEC usando Bearer Authentication (`sk_14327...`).
* **Autocompletado y Bloqueo:** Al ingresar un DNI válido de 8 dígitos en el formulario de registro, el sistema consulta el backend y este a su vez a la API de Decolecta. Los nombres y apellidos del ciudadano se completan automáticamente y el campo se bloquea en modo **Solo Lectura** (`readOnly`) para asegurar la veracidad de la identidad.
* **Seguridad CORS:** El backend actúa como proxy seguro para evitar la exposición del token API de Decolecta en el navegador.

### 3. HU-003: Control de Acceso y Roles (Route Guards)
* **Protección de Rutas:** Filtros de ruta en React (`ProtectedRoute.tsx`) para asegurar que solo los usuarios con rol de administrador puedan acceder al panel de control `/admin-dashboard`.
* **Redirección Amigable y Alertas:** Si un ciudadano intenta forzar la entrada a una ruta administrativa, es redirigido automáticamente a su panel de ciudadano (`/dashboard`) y se le presenta un banner de advertencia animado mediante el parámetro `?denied=true`.

### 4. HU-004: Registro de Evidencias, Horarios de Zona y Notificaciones
* **Registro Completo de Evidencia:** El ciudadano puede reportar residuos indicando tipo, cantidad, descripción, cargando una fotografía y especificando de manera obligatoria la **dirección de entrega** y el **horario de recolección**.
* **Filtro Dinámico de Horarios:** Los horarios de entrega disponibles se listan dinámicamente basándose en la zona residencial seleccionada por el usuario al registrarse.
* **Campanita de Notificaciones Interactiva:** Implementación de un buzón de alertas con un dropdown animado en el dashboard del ciudadano. Cuando un administrador cambia el estado de un reporte a **Aprobado** (`resuelto`) o **Rechazado** (`rechazado`), se genera una notificación en tiempo real. El ciudadano puede ver los detalles del cambio y marcar las alertas como leídas.
* **EcoPuntos:** Al aprobarse un reporte, se calculan y suman automáticamente los EcoPuntos al perfil del ciudadano.

---

## 🛠️ Stack Tecnológico

* **Backend:** Django 5.x, Django REST Framework (DRF), SQLite.
* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React (Iconografía).
* **APIs de Integración:** API de Consulta RENIEC (Decolecta).
* **Entornos de Ejecución:** Node.js (v18+), Python (v3.10+).

---

## 📂 Estructura del Proyecto y Base de Datos

```
├── backend/
│   ├── config/             # Configuración del proyecto Django (settings, urls)
│   ├── core/               # App principal del backend (modelos, vistas, serializadores)
│   │   ├── migrations/     # Migraciones de base de datos
│   │   ├── models.py       # Definición de Usuario (con DNI), Evidencia y Notificacion
│   │   ├── serializers.py  # Serialización y validaciones de datos
│   │   └── views.py        # Lógica de negocio (Login, Registro, Consulta DNI, Notificaciones)
│   ├── manage.py
│   ├── requirements.txt    # Dependencias de Python
│   └── db.sqlite3          # Base de datos SQLite
├── frontend/
│   ├── src/
│   │   ├── assets/         # Recursos gráficos (logos, fondos)
│   │   ├── components/     # Componentes compartidos y Layouts
│   │   ├── pages/          # Vistas (Login, Registro, Dashboard, Reportes, etc.)
│   │   ├── ProtectedRoute.tsx # Guardián de rutas y roles
│   │   └── App.tsx         # Enrutamiento principal
│   ├── package.json        # Dependencias de Node
│   └── tailwind.config.js  # Configuración de Tailwind CSS
└── run-project.ps1         # Script de automatización para Windows
```

### 🗄️ Modelos de Base de Datos Principales
* **Usuario (AbstractUser):** Añadidos los campos `dni` (único, 8 dígitos), `zona` (relación ForeignKey) y `ecopuntos`.
* **Evidencia:** Añadidos los campos `direccion_entrega`, `horario_entrega` (ForeignKey al horario de la zona) y estados traducidos.
* **Notificacion:** Modelo creado para almacenar mensajes personalizados dirigidos a los ciudadanos sobre el estado de sus evidencias (`leida`, `mensaje`, `usuario`, `fecha_creacion`).

---

## ⚙️ Configuración y Ejecución

### 🔑 Configuración del Entorno (Variables)
En el frontend (`frontend/.env`), asegúrate de tener definida la URL del backend:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 🚀 Ejecución Rápida (Recomendado para Windows)
Desde la raíz del proyecto, abre una terminal de PowerShell como administrador y ejecuta:
```powershell
.\run-project.ps1
```
*Este script instalará las dependencias necesarias (`node_modules` y entorno virtual `.venv`), aplicará las migraciones de Django, precargará la base de datos con zonas y horarios iniciales, y levantará los servidores backend (puerto 8000) y frontend (puerto 5173).*

### 🛠️ Ejecución Manual

#### 1. Levantar el Backend (Django)
```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_db
python manage.py runserver
```

#### 2. Levantar el Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
Accede a la aplicación a través de: [http://localhost:5173](http://localhost:5173)

---

## 🔗 Endpoints Clave de la API Backend

| Método | Endpoint | Descripción | Requiere Autenticación |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register/` | Registra un nuevo ciudadano (valida DNI y contraseña fuerte) | No |
| `POST` | `/api/login/` | Inicia sesión y retorna Token DRF e información del rol | No |
| `POST` | `/api/auth/logout/` | Invalida y elimina el token del usuario en el servidor | Sí |
| `GET` | `/api/consultar-dni/<dni>/` | Consulta de forma segura la API de Decolecta (RENIEC) | No |
| `GET` | `/api/notificaciones/` | Lista las notificaciones del ciudadano autenticado | Sí |
| `POST` | `/api/notificaciones/<id>/marcar_leida/` | Marca una notificación específica como leída | Sí |
| `POST` | `/api/auth/recuperar-contrasena/` | Simula el restablecimiento de contraseñas | No |
