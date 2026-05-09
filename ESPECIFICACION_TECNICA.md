# 🔧 ESPECIFICACIÓN TÉCNICA - MVP
## Sistema Inteligente de Recolección de Residuos

---

## 1. STACK TECNOLÓGICO SELECCIONADO

### Backend
```
Node.js 18+ / TypeScript
Framework: Express.js
ORM: Prisma
Base de Datos: PostgreSQL 13+
Autenticación: JWT (jsonwebtoken)
Validación: Joi/Zod
Testing: Jest
```

### Frontend
```
React 18+
TypeScript
Gestor de estado: Context API o Redux
Estilos: Tailwind CSS
Requests: Axios
Testing: React Testing Library
```

### DevOps & Herramientas
```
Git + GitHub
Docker (opcional para producción)
Environment: .env
Logging: Winston
CORS habilitado
```

---

## 2. ESTRUCTURA DEL PROYECTO

```
proyecto-residuos/
│
├── 📁 backend/
│   ├── src/
│   │   ├── config/              # Configuración (BD, JWT, etc)
│   │   ├── controllers/         # Controladores (lógica de rutas)
│   │   ├── middleware/          # Middlewares (autenticación, validación)
│   │   ├── models/              # Modelos Prisma
│   │   ├── routes/              # Definición de rutas
│   │   ├── services/            # Lógica de negocio
│   │   ├── types/               # TypeScript types/interfaces
│   │   ├── utils/               # Funciones utilitarias
│   │   └── app.ts               # Inicialización Express
│   ├── prisma/
│   │   ├── schema.prisma        # Esquema DB
│   │   └── migrations/          # Migraciones
│   ├── .env.example             # Variables de entorno (plantilla)
│   ├── .env                     # Variables de entorno (local)
│   ├── .env.production          # Variables de entorno (producción)
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── 📁 frontend/
│   ├── public/                  # Archivos estáticos
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # Componentes React reutilizables
│   │   │   ├── Auth/
│   │   │   ├── Layout/
│   │   │   ├── Common/
│   │   │   └── Dashboard/
│   │   ├── pages/               # Páginas principales
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── HorariosPage.tsx
│   │   │   ├── ReportesPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── services/            # Servicios API
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── usuariosService.ts
│   │   │   ├── zonasService.ts
│   │   │   ├── horariosService.ts
│   │   │   └── reportesService.ts
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # Context API
│   │   │   └── AuthContext.tsx
│   │   ├── styles/              # Estilos globales
│   │   ├── types/               # TypeScript types
│   │   └── App.tsx              # Componente principal
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── README.md
│
├── 📁 docs/
│   ├── API_DOCUMENTATION.md     # Documentación API
│   ├── DATABASE_SCHEMA.md       # Esquema BD
│   ├── MANUAL_USUARIO.md        # Manual de usuario
│   ├── SETUP.md                 # Guía de instalación
│   └── CONTRIBUTING.md          # Guía para contribuidores
│
├── docker-compose.yml           # Para PostgreSQL local
├── .gitignore
├── .env.example
└── README.md                    # Resumen general
```

---

## 3. CONFIGURACIÓN INICIAL

### 3.1 Variables de Entorno (.env)

```env
# Backend
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/residuos_db

# JWT
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-prod
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3001

# Email (para recuperar contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-app

# AWS S3 o servicio de almacenamiento (para imágenes)
AWS_S3_BUCKET=residuos-bucket
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
```

```env
# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Sistema de Residuos
```

---

## 4. ESQUEMA DE BASE DE DATOS

### Tabla: usuarios

```sql
CREATE TABLE "Usuario" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    zona_id INTEGER,
    rol VARCHAR(50) DEFAULT 'ciudadano' CHECK (rol IN ('ciudadano', 'admin')),
    activo BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zona_id) REFERENCES "Zona"(id) ON DELETE SET NULL
);

CREATE INDEX idx_usuario_email ON "Usuario"(email);
CREATE INDEX idx_usuario_zona ON "Usuario"(zona_id);
```

### Tabla: zonas

```sql
CREATE TABLE "Zona" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    geometria JSONB,  -- Para guardar coordenadas si es necesario
    activa BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zona_codigo ON "Zona"(codigo);
```

### Tabla: horarios

```sql
CREATE TABLE "Horario" (
    id SERIAL PRIMARY KEY,
    zona_id INTEGER NOT NULL,
    dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN (
        'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
    )),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipos_residuo VARCHAR(500),  -- JSON: ["orgánico", "reciclable", "no_reciclable"]
    activo BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zona_id) REFERENCES "Zona"(id) ON DELETE CASCADE,
    UNIQUE (zona_id, dia_semana, hora_inicio)
);

CREATE INDEX idx_horario_zona ON "Horario"(zona_id);
CREATE INDEX idx_horario_dia ON "Horario"(dia_semana);
```

### Tabla: reportes

```sql
CREATE TABLE "Reporte" (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    zona_id INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    foto_url VARCHAR(500),
    estado VARCHAR(50) DEFAULT 'nuevo' CHECK (estado IN (
        'nuevo', 'en_revision', 'resuelto'
    )),
    comentario_admin TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES "Usuario"(id) ON DELETE CASCADE,
    FOREIGN KEY (zona_id) REFERENCES "Zona"(id) ON DELETE CASCADE
);

CREATE INDEX idx_reporte_usuario ON "Reporte"(usuario_id);
CREATE INDEX idx_reporte_zona ON "Reporte"(zona_id);
CREATE INDEX idx_reporte_estado ON "Reporte"(estado);
CREATE INDEX idx_reporte_fecha ON "Reporte"(createdAt);
```

---

## 5. ESQUEMA PRISMA

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  contraseña      String
  nombre          String
  telefono        String?
  zonaId          Int?
  zona            Zona?     @relation(fields: [zonaId], references: [id], onDelete: SetNull)
  rol             String    @default("ciudadano") // "ciudadano" | "admin"
  activo          Boolean   @default(true)
  reportes        Reporte[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([email])
  @@index([zonaId])
}

model Zona {
  id              Int       @id @default(autoincrement())
  nombre          String    @unique
  codigo          String    @unique
  descripcion     String?
  geometria       Json?     // Para mapas
  activa          Boolean   @default(true)
  usuarios        Usuario[]
  horarios        Horario[]
  reportes        Reporte[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Horario {
  id              Int       @id @default(autoincrement())
  zonaId          Int
  zona            Zona      @relation(fields: [zonaId], references: [id], onDelete: Cascade)
  dia_semana      String    // "lunes", "martes", etc
  hora_inicio     String    // HH:mm format
  hora_fin        String    // HH:mm format
  tipos_residuo   String    // JSON string
  activo          Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([zonaId, dia_semana, hora_inicio])
  @@index([zonaId])
}

model Reporte {
  id              Int       @id @default(autoincrement())
  usuarioId       Int
  usuario         Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  zonaId          Int
  zona            Zona      @relation(fields: [zonaId], references: [id], onDelete: Cascade)
  descripcion     String
  foto_url        String?
  estado          String    @default("nuevo") // "nuevo" | "en_revision" | "resuelto"
  comentario_admin String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([usuarioId])
  @@index([zonaId])
  @@index([estado])
}
```

---

## 6. RUTAS API (REST)

### Autenticación
```
POST   /api/auth/register          # Registrar nuevo usuario
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout
POST   /api/auth/forgot-password   # Solicitar reset de contraseña
POST   /api/auth/reset-password    # Reset de contraseña
```

### Usuarios
```
GET    /api/usuarios/me            # Obtener perfil actual
PUT    /api/usuarios/me            # Actualizar perfil actual
GET    /api/usuarios               # Listar usuarios (admin)
DELETE /api/usuarios/:id           # Eliminar usuario (admin)
PUT    /api/usuarios/:id/rol       # Cambiar rol (admin)
```

### Zonas
```
GET    /api/zonas                  # Listar todas las zonas
GET    /api/zonas/:id              # Obtener detalle zona
POST   /api/zonas                  # Crear zona (admin)
PUT    /api/zonas/:id              # Editar zona (admin)
DELETE /api/zonas/:id              # Eliminar zona (admin)
```

### Horarios
```
GET    /api/zonas/:zonaId/horarios # Obtener horarios de zona
POST   /api/horarios               # Crear horario (admin)
PUT    /api/horarios/:id           # Editar horario (admin)
DELETE /api/horarios/:id           # Eliminar horario (admin)
```

### Reportes
```
GET    /api/reportes/mis-reportes  # Mis reportes (usuario)
POST   /api/reportes               # Crear reporte (usuario)
GET    /api/reportes               # Listar reportes (admin)
GET    /api/reportes/:id           # Detalle reporte
PUT    /api/reportes/:id/estado    # Cambiar estado (admin)
PUT    /api/reportes/:id/comentario # Agregar comentario (admin)
DELETE /api/reportes/:id           # Eliminar reporte (admin)
```

---

## 7. CONSIDERACIONES DE SEGURIDAD

### Autenticación & Autorización
- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ JWT con expiración de 7 días
- ✅ Refresh tokens para acceso prolongado
- ✅ Validación de rol en cada endpoint sensible

### Validación
- ✅ Validar ALL inputs en backend
- ✅ Sanitizar inputs para prevenir SQL injection
- ✅ Limitar tamaño de requests
- ✅ Rate limiting en endpoints públicos

### CORS & Headers
- ✅ CORS configurado solo para frontend
- ✅ Headers de seguridad (Helmet.js)
- ✅ Content-Security-Policy
- ✅ X-Frame-Options: DENY

### Almacenamiento
- ✅ Imágenes en carpeta protegida del servidor
- ✅ Validación de tipo MIME
- ✅ Límite de 5MB por imagen
- ✅ Renombrar archivos aleatoriamente

---

## 8. PERFORMANCE & SCALABILITY

### Base de Datos
- ✅ Índices en campos frecuentes (email, zona_id, estado)
- ✅ Pagination en listados (20 items por página)
- ✅ Connection pooling con Prisma

### Backend
- ✅ Gzip compression
- ✅ Caching de datos estáticos (horarios)
- ✅ Logging estructurado
- ✅ Error handling centralizado

### Frontend
- ✅ Code splitting con React.lazy()
- ✅ Lazy loading de imágenes
- ✅ Bundle optimization con Vite
- ✅ Service worker para offline (opcional)

---

## 9. TESTING STRATEGY

### Unit Tests
```
Backend:
- Funciones de autenticación
- Validadores
- Servicios

Frontend:
- Componentes (React Testing Library)
- Hooks personalizados
- Servicios API
```

### Integration Tests
```
- Flujos de usuario completos
- API endpoints con DB
- Autenticación y autorización
```

### Manual Testing
- Navegadores (Chrome, Firefox, Safari)
- Dispositivos móviles (responsive)
- Flujos principales de usuario

---

## 10. DEPLOYMENT

### Local Development
```bash
# Backend
npm install
npx prisma migrate dev
npm run dev

# Frontend
npm install
npm run dev
```

### Production
```
- Variable NODE_ENV=production
- SSL/HTTPS habilitado
- Secrets en variables de entorno
- Base de datos en RDS/Cloud DB
- Frontend en Vercel/Netlify
- Backend en Heroku/Railway/DigitalOcean
```

---

## 11. HERRAMIENTAS RECOMENDADAS

- **Versionamiento:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Gestión de Proyecto:** Jira o Trello
- **Documentación:** Swagger/OpenAPI
- **Testing:** Jest + Postman
- **Monitoreo:** Sentry (errores)
- **Logging:** ELK Stack (opcional)

---

**Última actualización:** Mayo 2026  
**Responsable:** [Equipo Técnico]
