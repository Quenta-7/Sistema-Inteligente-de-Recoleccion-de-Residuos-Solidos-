# 📋 PLANIFICACIÓN DEL PRODUCTO MÍNIMO VIABLE (MVP)
## Sistema Inteligente de Recolección de Residuos Sólidos Segregados - Cusco

**Proyecto:** IF614 - Ingeniería de Software I  
**Atributo AG-C01:** El Profesional y el Mundo  
**Fecha:** Mayo 2026

---

## 1. VISIÓN DEL MVP

Desarrollar una **plataforma web básica** que permita a los ciudadanos **consultar horarios de recolección** y reportar incidencias sobre residuos acumulados, resolviendo los dos problemas principales:
- ❌ **Problema 1:** Falta de comunicación - ciudadanos desconocen horarios de recolección
- ❌ **Problema 2:** Ausencia de mecanismos para reportar problemas de acumulación

---

## 2. ALCANCE DEL MVP

### Funcionalidades Incluidas:

#### **Módulo 1: Autenticación y Usuarios (Básico)**
- ✅ Registro de ciudadanos (nombre, email, teléfono, zona de residencia)
- ✅ Login/Logout
- ✅ Editar perfil básico

#### **Módulo 2: Consulta de Horarios**
- ✅ Visualizar zonas de recolección del Cusco
- ✅ Seleccionar zona de residencia
- ✅ Consultar horarios de recolección por zona
- ✅ Tipos de residuos aceptados (orgánico, reciclable, no reciclable)

#### **Módulo 3: Sistema de Reportes Básico**
- ✅ Reportar incidencia de residuos acumulados
- ✅ Adjuntar foto (opcional)
- ✅ Ver historial de reportes propios

#### **Módulo 4: Panel de Control Básico (Admin)**
- ✅ Gestión de usuarios
- ✅ Gestión de zonas
- ✅ Visualización de reportes recibidos

### Funcionalidades Excluidas (Para sprints posteriores):
- ❌ Monitoreo en tiempo real de camiones
- ❌ Notificaciones push
- ❌ Aplicación móvil
- ❌ Sistema de alertas automáticas
- ❌ Reportes y analítica avanzada
- ❌ Integración con GPS

---

## 3. STACK TECNOLÓGICO RECOMENDADO

### Backend
- **Lenguaje:** Node.js + TypeScript
- **Framework:** Express.js o NestJS
- **Autenticación:** JWT

### Frontend
- **Framework:** React o Vue.js
- **TypeScript**
- **Estilos:** Tailwind CSS o Bootstrap

### Base de Datos
- **DBMS:** PostgreSQL o MySQL
- **ORM:** Prisma o TypeORM

### Herramientas
- **Versionamiento:** Git + GitHub/GitLab
- **Gestión:** Trello o Jira
- **Documentación:** Notion o Confluence

---

## 4. ESTRUCTURA DEL PROYECTO

```
proyecto-residuos/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   └── app.ts
│   ├── database/
│   │   └── schema.sql
│   └── package.json
├── docs/
│   ├── README.md
│   ├── API.md
│   └── MANUAL_USUARIO.md
└── .gitignore
```

---

## 5. SPRINT PLANNING (MVP - 4-6 semanas)

### Sprint 1 (Semana 1-2): Configuración Base y Autenticación
**Objetivo:** Sentar las bases técnicas y autenticación de usuarios

**Historias de Usuario:**
1. Como ciudadano, quiero registrarme con mi email y contraseña
2. Como ciudadano, quiero iniciar sesión en la plataforma
3. Como ciudadano, quiero editar mi perfil (nombre, teléfono, zona)
4. Como administrador, quiero un panel para gestionar usuarios

**Tareas Técnicas:**
- [ ] Configurar estructura del proyecto (Frontend + Backend)
- [ ] Crear base de datos (PostgreSQL/MySQL)
- [ ] Implementar API de registro y login
- [ ] Crear componentes básicos de UI (Login, Registro, Home)
- [ ] Implementar JWT para autenticación

**Entregables:**
- Sistema de registro e login funcional
- Base de datos con esquema básico
- Interfaz de login/registro en frontend

---

### Sprint 2 (Semana 3): Módulo de Zonas y Horarios
**Objetivo:** Permitir a ciudadanos consultar horarios de recolección

**Historias de Usuario:**
1. Como ciudadano, quiero ver todas las zonas de recolección
2. Como ciudadano, quiero seleccionar mi zona de residencia
3. Como ciudadano, quiero ver el horario de recolección de mi zona
4. Como ciudadano, quiero ver los tipos de residuos aceptados
5. Como administrador, quiero gestionar las zonas y horarios

**Tareas Técnicas:**
- [ ] Crear modelo de Zonas en la BD
- [ ] Crear modelo de Horarios en la BD
- [ ] Implementar CRUD de zonas (Admin)
- [ ] Crear página de consulta de horarios
- [ ] Implementar filtrado por zona

**Entregables:**
- Página de consulta de horarios
- API completa de zonas y horarios
- Panel admin para gestión de zonas

---

### Sprint 3 (Semana 4-5): Sistema de Reportes
**Objetivo:** Permitir que ciudadanos reporten incidencias

**Historias de Usuario:**
1. Como ciudadano, quiero reportar acumulación de residuos
2. Como ciudadano, quiero adjuntar una foto al reporte
3. Como ciudadano, quiero ver el estado de mis reportes
4. Como ciudadano, quiero ver el historial de mis reportes
5. Como administrador, quiero ver todos los reportes recibidos
6. Como administrador, quiero cambiar el estado del reporte (nuevo, en revisión, resuelto)

**Tareas Técnicas:**
- [ ] Crear modelo de Reportes en BD
- [ ] Implementar carga de imágenes (CloudStorage o Local)
- [ ] Crear formulario de reporte en frontend
- [ ] Implementar API de reportes
- [ ] Crear panel admin de reportes
- [ ] Implementar validaciones

**Entregables:**
- Formulario de reporte funcional
- Panel admin de gestión de reportes
- API completa de reportes
- Almacenamiento de imágenes

---

### Sprint 4 (Semana 5-6): Panel Admin y Pulido
**Objetivo:** Completar panel admin y preparar para presentación

**Historias de Usuario:**
1. Como administrador, quiero un dashboard con estadísticas básicas
2. Como administrador, quiero exportar reportes
3. Como usuario, quiero recuperar contraseña olvidada

**Tareas Técnicas:**
- [ ] Crear dashboard admin
- [ ] Implementar estadísticas básicas
- [ ] Testing y corrección de bugs
- [ ] Mejorar UI/UX
- [ ] Implementar recuperación de contraseña
- [ ] Documentar API

**Entregables:**
- Dashboard admin funcional
- Toda la aplicación estable y testeada
- Documentación de usuario

---

## 6. DIAGRAMA DE CASOS DE USO (MVP)

```
┌─────────────────────────────────────────────────────────┐
│                    Sistema de Residuos                   │
└─────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Ciudadano   │
                    └──────┬───────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
          ┌─────▼──────┐  │   ┌──────▼─────┐
          │ Registrarse│  │   │ Consultar  │
          └────────────┘  │   │ Horarios   │
                │         │   └────────────┘
                │    ┌────▼────────┐
                └───►│  Iniciar    │
                     │  Sesión     │
                     └────┬────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
          ┌─────▼──────┐      ┌─────▼──────┐
          │ Editar     │      │  Reportar  │
          │ Perfil     │      │ Incidencia │
          └────────────┘      └────────────┘

                    ┌──────────────┐
                    │ Administrador│
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────────┐  ┌──────▼────────┐  ┌─────▼──────┐
   │ Gestionar   │  │ Gestionar     │  │ Gestionar  │
   │ Usuarios    │  │ Zonas/Horarios│  │ Reportes   │
   └─────────────┘  └───────────────┘  └────────────┘
```

---

## 7. DIAGRAMA DE ARQUITECTURA

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React/Vue)              │
│  ┌────────────────────────────────────────────┐   │
│  │ - Login/Registro                           │   │
│  │ - Consulta de Horarios                     │   │
│  │ - Formulario de Reportes                   │   │
│  │ - Panel Admin Dashboard                    │   │
│  └────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────┘
                 │ REST API (HTTP/HTTPS)
┌────────────────▼────────────────────────────────────┐
│               BACKEND (Node.js + Express)           │
│  ┌────────────────────────────────────────────┐   │
│  │ Routes:                                    │   │
│  │ - /api/auth (registro, login)             │   │
│  │ - /api/usuarios                           │   │
│  │ - /api/zonas                              │   │
│  │ - /api/horarios                           │   │
│  │ - /api/reportes                           │   │
│  └────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────┐   │
│  │ Middleware:                                │   │
│  │ - JWT Authentication                      │   │
│  │ - Validación de datos                      │   │
│  │ - Manejo de errores                        │   │
│  └────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────┘
                 │ SQL
┌────────────────▼────────────────────────────────────┐
│          DATABASE (PostgreSQL/MySQL)                │
│  - Usuarios                                         │
│  - Zonas                                            │
│  - Horarios                                         │
│  - Reportes                                         │
│  - Archivos (imágenes de reportes)                 │
└─────────────────────────────────────────────────────┘
```

---

## 8. MODELO DE BASE DE DATOS (MVP)

```sql
-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    zona_id INT,
    rol ENUM('ciudadano', 'admin') DEFAULT 'ciudadano',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zona_id) REFERENCES zonas(id)
);

-- Tabla de Zonas
CREATE TABLE zonas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    codigo VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla de Horarios
CREATE TABLE horarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zona_id INT NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipos_residuo VARCHAR(500),
    FOREIGN KEY (zona_id) REFERENCES zonas(id)
);

-- Tabla de Reportes
CREATE TABLE reportes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    zona_id INT NOT NULL,
    descripcion TEXT NOT NULL,
    foto_url VARCHAR(500),
    estado ENUM('nuevo', 'en_revision', 'resuelto') DEFAULT 'nuevo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (zona_id) REFERENCES zonas(id)
);
```

---

## 9. CRITERIOS DE ACEPTACIÓN (MVP)

### Funcional:
- ✅ Registro e login funcionan sin errores
- ✅ Ciudadano puede consultar horarios de su zona
- ✅ Ciudadano puede crear reportes con foto
- ✅ Admin puede gestionar usuarios, zonas y reportes
- ✅ No hay información personal expuesta en logs
- ✅ Contraseñas están hasheadas

### No Funcional:
- ⚡ Tiempo de respuesta < 2 segundos (consultas)
- 🔒 Autenticación con JWT segura
- 📱 Interfaz responsive (desktop/tablet)
- 📄 Documentación de API (Swagger/Postman)

---

## 10. PLAN DE TESTING

### Unit Testing:
- [ ] Funciones de autenticación
- [ ] Validadores de datos
- [ ] Servicios de base de datos

### Integration Testing:
- [ ] Flujo completo de registro
- [ ] Flujo de crear reporte
- [ ] Acceso a datos según permisos

### Manual Testing:
- [ ] Pruebas en navegadores (Chrome, Firefox, Safari)
- [ ] Pruebas de carga básicas
- [ ] Flujos de usuario principales

---

## 11. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Retrasos en BD | Alta | Alto | Usar ORM (Prisma) y schemas preconstruidas |
| Problemas de seguridad | Media | Alto | Implementar JWT, validar inputs, usar HTTPS |
| Falta de claridad en reqs | Media | Medio | Reuniones semanales con stakeholders |
| Testing insuficiente | Media | Medio | Dedicar 20% del tiempo a testing |

---

## 12. ENTREGA Y PRESENTACIÓN

### Primera Entrega (Semana 6):
**Documentación Parcial + MVP Funcional 50%**

Entregar:
- 📄 Capítulo I: Datos Generales (completo)
- 📄 Capítulo II: Método SCRUM (bosquejo)
- 💻 Sistema con Sprint 1-2 completados (autenticación + horarios)
- 📋 Product Backlog priorizado

### Requisitos de Presentación:
- Demostración en vivo del sistema funcionando
- Explicar problema resuelto vs no resuelto
- Mostrar impacto en comunidad de Cusco
- Tiempo: máximo 10 minutos

---

## 13. PRÓXIMAS FASES (POST-MVP)

### Sprint 5-6: Monitoreo en Tiempo Real
- Rastreo de camiones con GPS
- Mapa interactivo
- Notificaciones de cercanía

### Sprint 7-8: Sistema de Alertas
- Alertas automáticas por email/SMS
- Calendario personalizado
- Recordatorios

### Sprint 9: Aplicación Móvil
- App nativa (Android/iOS) o Flutter Web
- Push notifications

### Sprint 10: Reportes y Analítica
- Dashboard de estadísticas
- Gráficos de recolección
- Exportación de datos

---

## 14. CONCLUSIÓN

Este MVP resuelve los **dos problemas principales** de manera simple y directa:
1. ✅ Ciudadanos pueden consultar horarios de recolección
2. ✅ Sistema para reportar acumulación de residuos

El sistema está diseñado para ser:
- 🚀 **Rápido de implementar** (4-6 semanas)
- 📊 **Fácil de escalar** (arquitectura en capas)
- 🔒 **Seguro desde el inicio** (JWT, validación)
- 🎯 **Enfocado en valor** (solo lo necesario)

---

**Responsable:** [Nombre del Equipo]  
**Última actualización:** Mayo 2026  
**Estado:** En Planificación
