# Sistema Inteligente de Recolección de Residuos Sólidos - Cusco ("Te Quiero Verde Cusco")

Plataforma web premium para optimizar la gestión y recolección de residuos sólidos en Cusco, promoviendo la participación ciudadana a través de incentivos (EcoPuntos), facilitando el registro y validación de evidencias de reciclaje, y coordinando la labor logística de los camiones recolectores en tiempo real.

---

## 🚀 Historias de Usuario Implementadas

> Para despliegue seguro configure `DJANGO_DEBUG=0`, `DJANGO_SECRET_KEY`,
> `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` y `DJANGO_SECURE_SSL=1`.
> El proxy frontal debe aceptar solamente TLS 1.2 o superior.

El sistema cuenta con un abanico completo de Historias de Usuario desarrolladas y funcionales a nivel de frontend, backend y base de datos:

### 🔑 Autenticación, Seguridad y Registro
* **HU-001: Autenticación de Usuarios y Gestión de Sesiones:** Formulario de acceso con seguridad basada en tokens JWT (SimpleJWT). Encriptación de contraseñas mediante **BCrypt**.
* **HU-002: Registro Automatizado mediante Consulta de DNI (RENIEC):** Integración real y proxy seguro (backend) con el servicio de DNI de *Decolecta*. Los nombres y apellidos del ciudadano se completan y bloquean en modo solo lectura al consultar un DNI válido.
* **HU-003: Control de Acceso y Roles (Route Guards):** Protección de rutas a nivel cliente con `ProtectedRoute.tsx`. Redirección y banner animado si un usuario intenta saltar roles.

### ♻️ Gestión de Residuos y EcoPuntos
* **HU-004 y HU-008: Reporte y Validación de Evidencias:** Los ciudadanos registran sus evidencias de reciclaje (tipo de residuo, cantidad en kg, fotos y dirección). El administrador puede revisar, aprobar o rechazar estos reportes desde su panel dedicado, lo que desencadena notificaciones automáticas y asignación de EcoPuntos.
* **HU-005 y HU-009: Saldo de EcoPuntos e Historial:** Panel del ciudadano con la visualización en tiempo real de su saldo acumulado y la lista interactiva de sus reportes históricos.
* **HU-006 y HU-007: Tienda de Premios (Canjes):** Catálogo interactivo de premios y recompensas eco-amigables clasificadas por categorías. El usuario puede canjear sus EcoPuntos por recompensas reales, validando el stock disponible.

### 📅 Horarios y Sectores
* **HU-010 y HU-012: Horarios de Recolección por Sector:** Calendario interactivo semanal que resalta dinámicamente el día y horario del recolector que le corresponde al ciudadano según el sector de residencia registrado (San Jerónimo).

### 🚛 Logística de Recolectores
* **HU-011 y HU-015: Panel y Cumplimiento del Recolector:** El recolector inicia sesión y visualiza su lista de rutas asignadas para el día, pudiendo reportar el cumplimiento final de la jornada (Completada, Parcialmente Completada, etc.) con comentarios y bitácora.
* **HU-013 y HU-014: Mapa en Vivo y Simulación de Ruta:** Mapa interactivo basado en Leaflet para visualizar la trayectoria y simulación GPS del camión de basura en tiempo real. Cuenta con soporte para alertas de proximidad y bocina acústica.

---

## 🛠️ Stack Tecnológico

* **Backend:** Django 5.x, Django REST Framework (DRF), SimpleJWT, SQLite.
* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React (iconografía).
* **Mapas:** Leaflet.js para renderizado de mapas interactivos.
* **APIs de Integración:** API de Consulta RENIEC (Decolecta).
* **Entornos de Ejecución:** Node.js (v18+), Python (v3.10+).

---

## 📂 Estructura del Proyecto

La estructura actual del repositorio se describe a continuación:

```
├── backend/
│   ├── config/             # Configuración del proyecto Django (settings, urls, views)
│   ├── core/               # App principal del backend (modelos, vistas, serializadores)
│   │   ├── management/     # Comandos de gestión personalizados de Django
│   │   │   └── commands/   # Comandos de consola
│   │   │       └── seed_db.py # Semilla para poblar la base de datos (Sectores de Cusco)
│   │   ├── migrations/     # Migraciones de base de datos
│   │   ├── admin.py        # Configuración del panel de administración Django
│   │   ├── models.py       # Modelos de base de datos (Usuario, Zona, Horario, Evidencia, Ruta, etc.)
│   │   ├── serializers.py  # Serializadores y lógica de validación de datos
│   │   └── views.py        # Endpoints y lógica de negocio (Login, Consulta DNI, CRUDs)
│   ├── manage.py           # Utilidad de línea de comandos de Django
│   ├── requirements.txt    # Dependencias de Python
│   └── db.sqlite3          # Base de datos SQLite
├── frontend/
│   ├── src/
│   │   ├── assets/         # Recursos estáticos y gráficos (logos, fondos)
│   │   ├── components/     # Componentes compartidos
│   │   │   └── ProtectedRoute.tsx # Route Guard para control de acceso y roles
│   │   ├── pages/          # Páginas y vistas del sistema
│   │   │   ├── AdminDashboard.tsx      # Dashboard del Administrador
│   │   │   ├── Dashboard.tsx           # Dashboard del Ciudadano
│   │   │   ├── Horarios.tsx            # Horarios de Recolección
│   │   │   ├── Login.tsx               # Inicio de sesión con soporte Light/Dark Mode
│   │   │   ├── MapaEnVivo.tsx          # Mapa interactivo y simulación GPS para Ciudadanos
│   │   │   ├── Perfil.tsx              # Perfil de usuario y foto
│   │   │   ├── PoliticaPrivacidad.tsx  # Aspectos legales de privacidad
│   │   │   ├── RecolectorDashboard.tsx # Dashboard de simulación del Recolector
│   │   │   ├── RecuperarContrasena.tsx # Recuperación de contraseña con soporte Light/Dark
│   │   │   ├── Registro.tsx            # Registro con consulta DNI RENIEC y soporte Light/Dark
│   │   │   ├── Reportes.tsx            # Formulario de envío de evidencias
│   │   │   ├── ReportesCiudadanos.tsx  # Validación de evidencias para Administrador
│   │   │   ├── TerminosCondiciones.tsx # Términos legales del servicio
│   │   │   └── TiendaEcoPuntos.tsx     # Catálogo y canje de premios
│   │   ├── utils/          # Utilidades y funciones auxiliares
│   │   │   └── theme.ts    # Configuración de tema/paleta de colores
│   │   ├── App.css         # Estilos específicos de la app
│   │   ├── App.tsx         # Componente principal de enrutamiento (React Router)
│   │   ├── api.ts          # Configuración del fetch autenticado (authedFetch)
│   │   ├── index.css       # Configuración e importación de Tailwind CSS
│   │   └── main.tsx        # Punto de entrada de React
│   ├── package.json        # Dependencias y scripts de Node.js
│   ├── package-lock.json   # Lockfile de dependencias npm
│   ├── tsconfig.json       # Configuración de TypeScript
│   └── vite.config.ts      # Configuración de Vite
├── Diagramas/              # Diagramas de Casos de Uso, Clases y Secuencias (PUML/PNG)
├── run-project.ps1         # Script de automatización de entorno para Windows (PowerShell)
├── run.bat                 # Lanzador rápido por lotes para Windows
├── HU.txt                  # Lista de historias de usuario (Backlog)
└── historias_de_usuario.txt # Detalles técnicos y criterios de aceptación de las historias
```

---

## ⚙️ Configuración y Ejecución

### Android (interfaz híbrida con Capacitor)

El frontend se reutiliza como aplicación Android; no hay una segunda base de
código. Antes de sincronizar, defina `VITE_API_BASE_URL` con la URL HTTPS
pública del backend y ejecute:

```powershell
cd frontend
npm run android:sync
npm run android:open
```

El proyecto nativo queda en `frontend/android` (Android 7/API 24 o superior).

### 🔑 Configuración del Entorno (Variables)
En el frontend (`frontend/.env`), asegúrate de tener definida la URL del backend:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 🚀 Ejecución Rápida (Recomendado para Windows)
Desde la raíz del proyecto, abre una terminal de PowerShell y ejecuta:
```powershell
.\run.bat
```
*Este comando automatiza la verificación del entorno, crea el virtual environment en Python, instala dependencias frontend y backend, ejecuta las migraciones, realiza la siembra inicial (seed) y levanta los servidores localmente.*

### 🧱 Compilación y Ejecución por Partes (Backend y Frontend)

Si prefieres compilar y ejecutar los componentes de manera independiente paso a paso:

#### 🐍 1. Backend (Django REST Framework)
1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Crea y activa un entorno virtual de Python:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Instala las dependencias necesarias:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   pip install Pillow
   ```
4. Aplica las migraciones de la base de datos e inicializa los datos iniciales (seed):
   ```bash
   python manage.py migrate
   python manage.py seed_db
   ```
5. Inicia el servidor de desarrollo del Backend:
   ```bash
   python manage.py runserver
   ```
   *El backend estará disponible en `http://127.0.0.1:8000`*

#### ⚛️ 2. Frontend (React + Vite + TypeScript)
1. Navega al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Node.js:
   ```bash
   npm install
   ```
3. Compila el proyecto frontend (opcional para verificar tipos y generar el build optimizado de producción):
   ```bash
   npm run build
   ```
4. Inicia el servidor de desarrollo del Frontend:
   ```bash
   npm run dev
   ```
   *El frontend estará disponible en `http://localhost:5173`*

---

## 🔗 Endpoints Clave de la API Backend

| Método | Endpoint | Descripción | Requiere Autenticación |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register/` | Registra un nuevo ciudadano (valida DNI y contraseña fuerte) | No |
| `POST` | `/api/auth/login/` | Inicia sesión y retorna tokens JWT (SimpleJWT) | No |
| `POST` | `/api/auth/logout/` | Invalida y elimina el token de sesión en el servidor | Sí |
| `GET` | `/api/consultar-dni/<dni>/` | Consulta de forma segura la API de Decolecta (RENIEC) | No |
| `GET` | `/api/perfil/` | Obtiene el perfil y los EcoPuntos del usuario logueado | Sí |
| `GET` | `/api/notificaciones/` | Lista las notificaciones del ciudadano autenticado | Sí |
| `POST` | `/api/auth/recuperar-contrasena/` | Simula el envío de restablecimiento de contraseña | No |
| `GET` | `/api/zonas/` | Devuelve el catálogo de sectores/zonas registradas | Sí |
| `GET` | `/api/horarios/` | Devuelve el catálogo de horarios de recolección | Sí |
| `GET` | `/api/recompensas/` | Listado de recompensas en la Tienda | Sí |
| `POST` | `/api/canjes/` | Registra un canje de premio descontando EcoPuntos | Sí |
| `GET` | `/api/rutas/` | Devuelve las rutas asignadas del recolector | Sí |
