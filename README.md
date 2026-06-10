# Sistema Inteligente de Recoleccion de Residuos Solidos - Cusco

Plataforma web para apoyar la gestion de residuos en Cusco. Permite a los ciudadanos consultar horarios de recoleccion, registrar evidencias de reciclaje y sumar EcoPuntos.

## Funcionalidades clave
- Consulta de horarios de recoleccion por zona.
- Evidencias de reciclaje con carga de imagen y bonificacion de EcoPuntos.
- Autenticacion basica con login, registro y recuperacion de contrasena (plantillas).

## Stack tecnico
- Backend: Django (Python) con SQLite.
- Frontend: React + Vite + Tailwind CSS.
- API local: http://localhost:8000

## Estructura del proyecto
```
backend/
  manage.py
  db.sqlite3
  requirements.txt
frontend/
  src/
  package.json
GUIA_INICIO.md
CRONOGRAMA_ENTREGAS.md
```

## Requisitos
- Python 3.x
- Node.js 18+
- npm

## Inicio rapido

### Uso rápido en Windows
Ejecuta todo el proyecto con un solo archivo desde la carpeta raíz:

```powershell
.\run-project.ps1
```

Este script crea el entorno virtual del backend y el `node_modules` del frontend solo si no existen, aplica migraciones, inicializa la base de datos la primera vez y lanza backend y frontend en terminales separadas.

### Backend
```bash
cd backend
python -m venv .venv
# Activar entorno virtual
# Windows: .\venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_db
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

El frontend espera la API en http://localhost:8000. Si necesitas cambiarla, actualiza las rutas en el frontend.

## Scripts de frontend
- npm run dev
- npm run build
- npm run lint
- npm run preview

## Documentacion
- GUIA_INICIO.md
- CRONOGRAMA_ENTREGAS.md
- frontend/README.md
