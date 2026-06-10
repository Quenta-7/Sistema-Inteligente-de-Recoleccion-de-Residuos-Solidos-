# 📅 CRONOGRAMA Y PLAN DE ENTREGAS - MVP
## Sistema Inteligente de Recolección de Residuos - Cusco

---

## TIMELINE GENERAL

```
Semana 1   ├─ Sprint 1 Inicio
Semana 2   ├─ Sprint 1 Fin + Sprint 2 Inicio
Semana 3   ├─ Sprint 2 Fin + Sprint 3 Inicio
Semana 4   ├─ Sprint 3 Fin + Sprint 4 Inicio
Semana 5   │
Semana 6   ├─ ✅ ENTREGA #1: MVP 50% + Documentación Parcial
Semana 7   │
Semana 8   │
Semana 9   │
Semana 10  │
Semana 11  │
Semana 12  ├─ ✅ ENTREGA #2: MVP 100% + Documentación Mejorada
Semana 13  │
Semana 14  │
Semana 15  │
Semana 16  ├─ ✅ ENTREGA #3: Sistema 100% + Documentación Completa + Exposición
```

---

## SPRINT 1: CONFIGURACIÓN BASE Y AUTENTICACIÓN
**Duración:** Semana 1-2 (10 días hábiles)

### Objetivos del Sprint
✅ Configurar stack tecnológico  
✅ Diseñar BD e implementar esquema  
✅ Implementar autenticación JWT  
✅ Crear interfaz de login/registro  

### Historias de Usuario
- [ ] HU-001: Registro de Ciudadano (8 pts)
- [ ] HU-002: Inicio de Sesión (5 pts)
- [ ] HU-003: Editar Perfil (3 pts)
- [ ] HU-004: Cerrar Sesión (2 pts)

**Total: 18 puntos**

### Tareas Técnicas
**Backend:**
- [ ] Inicializar proyecto Node.js + Express + TypeScript
- [ ] Configurar variables de entorno
- [ ] Conectar PostgreSQL
- [ ] Crear esquema BD con Prisma
- [ ] Implementar controlador de autenticación
- [ ] Implementar middleware JWT
- [ ] Crear endpoint POST /api/auth/register
- [ ] Crear endpoint POST /api/auth/login
- [ ] Hash de contraseñas con bcrypt
- [ ] Swagger/OpenAPI básico
- [ ] Tests unitarios (funciones clave)

**Frontend:**
- [ ] Inicializar proyecto React + TypeScript + Vite
- [ ] Configurar Tailwind CSS
- [ ] Crear estructura de carpetas
- [ ] Componente LoginPage
- [ ] Componente RegisterPage
- [ ] Servicio de autenticación (authService)
- [ ] Context de autenticación (AuthContext)
- [ ] Componente PrivateRoute (protección)
- [ ] Validación de formularios
- [ ] Almacenamiento de token en localStorage

**DevOps:**
- [ ] Crear .gitignore
- [ ] Configurar archivo .env.example
- [ ] Crear docker-compose.yml para BD local
- [ ] README.md con instrucciones de setup
- [ ] Configurar Prettier y ESLint

### Entregables
✅ Repositorio Git organizado  
✅ Sistema de login/registro funcional  
✅ Base de datos inicializada  
✅ API de autenticación documentada  

### Métricas de Éxito
- Todos los tests pasan ✅
- Registro y login sin errores ✅
- Tokens válidos por 7 días ✅
- Responsivo en mobile ✅

---

## SPRINT 2: ZONAS Y CONSULTA DE HORARIOS
**Duración:** Semana 3 (5 días hábiles)

### Objetivos del Sprint
✅ CRUD de zonas (admin)  
✅ CRUD de horarios (admin)  
✅ Interfaz de consulta de horarios (usuario)  

### Historias de Usuario
- [ ] HU-005: Listar Zonas de Recolección (3 pts)
- [ ] HU-006: Consultar Horario de Mi Zona (5 pts)
- [ ] HU-007: Ver Tipos de Residuos (3 pts)
- [ ] HU-008: Gestionar Zonas (Admin) (8 pts)
- [ ] HU-009: Gestionar Horarios (Admin) (8 pts)

**Total: 27 puntos**

### Tareas Técnicas
**Backend:**
- [ ] Crear controlador de Zonas
- [ ] Crear controlador de Horarios
- [ ] Endpoint GET /api/zonas
- [ ] Endpoint POST /api/zonas (admin)
- [ ] Endpoint PUT /api/zonas/:id (admin)
- [ ] Endpoint DELETE /api/zonas/:id (admin)
- [ ] Endpoint GET /api/zonas/:zonaId/horarios
- [ ] Endpoint POST /api/horarios (admin)
- [ ] Endpoint PUT /api/horarios/:id (admin)
- [ ] Endpoint DELETE /api/horarios/:id (admin)
- [ ] Validar acceso de admin en middlewares
- [ ] Seed de datos iniciales (zonas de Cusco)
- [ ] Tests de endpoints

**Frontend:**
- [ ] Página HorariosPage
- [ ] Componente ZonaSelector
- [ ] Componente HorarioDisplay
- [ ] Panel AdminZonas
- [ ] Panel AdminHorarios
- [ ] Servicios: zonasService, horariosService
- [ ] Formulario para crear/editar zona
- [ ] Formulario para crear/editar horario
- [ ] Validaciones de datos
- [ ] Manejo de errores

### Entregables
✅ Módulo de zonas y horarios funcional  
✅ Panel de administración básico  
✅ Datos iniciales de Cusco cargados  
✅ Interfaz amigable para consultar horarios  

### Métricas de Éxito
- Usuarios pueden consultar horarios ✅
- Admins pueden gestionar zonas ✅
- Datos persistidos en BD ✅
- Tests > 80% cobertura ✅

---

## SPRINT 3: SISTEMA DE REPORTES
**Duración:** Semana 4 (5 días hábiles)

### Objetivos del Sprint
✅ Formulario de reportes con foto  
✅ Listado de mis reportes  
✅ Panel admin de gestión de reportes  

### Historias de Usuario
- [ ] HU-010: Crear Reporte de Incidencia (8 pts)
- [ ] HU-011: Ver Mis Reportes (5 pts)
- [ ] HU-012: Gestionar Reportes (Admin) (8 pts)

**Total: 21 puntos**

### Tareas Técnicas
**Backend:**
- [ ] Crear controlador de Reportes
- [ ] Configurar almacenamiento de archivos (multer)
- [ ] Endpoint POST /api/reportes (crear)
- [ ] Endpoint GET /api/reportes/mis-reportes
- [ ] Endpoint GET /api/reportes (admin)
- [ ] Endpoint GET /api/reportes/:id
- [ ] Endpoint PUT /api/reportes/:id/estado (admin)
- [ ] Endpoint PUT /api/reportes/:id/comentario (admin)
- [ ] Endpoint DELETE /api/reportes/:id (admin)
- [ ] Validar tamaño/tipo de archivo
- [ ] Guardar archivos en servidor
- [ ] Tests de carga de archivos

**Frontend:**
- [ ] Página ReportesPage
- [ ] Componente FormularioReporte
- [ ] Componente GaleriaReportes
- [ ] Panel AdminReportes
- [ ] Servicio reportesService
- [ ] Upload de imágenes con preview
- [ ] Cambiar estado de reportes
- [ ] Agregar comentarios en reportes
- [ ] Filtrar reportes por estado/zona
- [ ] Confirmación de envío con número

### Entregables
✅ Sistema de reportes funcional  
✅ Carga de imágenes validada  
✅ Panel de gestión de reportes para admin  
✅ Notificación de reporte exitoso  

### Métricas de Éxito
- Usuarios pueden reportar incidencias ✅
- Fotos se cargan y visualizan ✅
- Admins pueden gestionar reportes ✅
- Validación de tamaño < 5MB ✅

---

## SPRINT 4: PULIDO Y DASHBOARD
**Duración:** Semana 5-6 (10 días hábiles)

### Objetivos del Sprint
✅ Dashboard admin con estadísticas  
✅ Recuperación de contraseña  
✅ Testing y corrección de bugs  
✅ Documentación y preparación para exposición  

### Historias de Usuario
- [ ] HU-013: Dashboard Admin (5 pts)
- [ ] HU-014: Gestionar Usuarios (Admin) (5 pts)
- [ ] HU-015: Recuperar Contraseña (8 pts)

**Total: 18 puntos**

### Tareas Técnicas
**Backend:**
- [ ] Crear controlador de Dashboard
- [ ] Endpoint GET /api/dashboard/stats
- [ ] Estadísticas: total usuarios, reportes por estado, zonas activas
- [ ] Crear servicio de email para recuperación contraseña
- [ ] Endpoint POST /api/auth/forgot-password
- [ ] Endpoint POST /api/auth/reset-password
- [ ] Generar tokens de reset con expiración
- [ ] Validar token antes de reset
- [ ] Tests de flujo de reset
- [ ] Security audit básico
- [ ] Documentación de API (Swagger)

**Frontend:**
- [ ] Página AdminDashboard
- [ ] Componentes de estadísticas (cards, charts)
- [ ] Gráfico de reportes por estado (Chart.js/Recharts)
- [ ] Tabla de usuarios con opciones
- [ ] Panel de gestión de usuarios (cambiar rol, eliminar)
- [ ] Página de recuperación de contraseña
- [ ] Página de reset de contraseña
- [ ] Tests integración completos
- [ ] UI/UX polish y mejoras
- [ ] Dark mode (opcional)

**General:**
- [ ] Testing completo del sistema
- [ ] Corrección de bugs identificados
- [ ] Optimización de rendimiento
- [ ] Verificación de responsive design
- [ ] Documentación de usuario
- [ ] Guía de instalación
- [ ] Manual de usuario

### Entregables
✅ Dashboard admin funcional  
✅ Recuperación de contraseña operativa  
✅ Sistema completamente testeado  
✅ Documentación completa  
✅ Código limpio y listo para producción  

### Métricas de Éxito
- Todos los tests pasan ✅
- 80% de cobertura de código ✅
- Performance < 2s en consultas ✅
- Aplicación responsiva en móvil ✅

---

## ENTREGA #1 - SEMANA 6
### MVP 50% + Documentación Parcial

**Funcionalidades Completadas:**
✅ Autenticación (registro, login, logout)  
✅ Consulta de horarios de recolección  
✅ Sistema básico de reportes  
✅ Panel admin básico  

**Documentos a Entregar:**
📄 Capítulo I: Datos Generales (COMPLETO)
  - 1.1 Título del proyecto
  - 1.2 Objetivos (general y específicos)
  - 1.3 Alcance del sistema
  - 1.4 Justificación
  - 1.5 Tecnologías utilizadas
  - 1.6 Roles del equipo SCRUM
  - 1.7 Público objetivo

📄 Capítulo II: Método SCRUM Aplicado (BOSQUEJO)
  - 2.1 Product Backlog (listado inicial)
  - 2.2 Sprints realizados (Sprint 1-4)
  - 2.3 Herramientas de colaboración

📦 Código del Sistema
  - Backend con autenticación y API
  - Frontend con páginas clave
  - Base de datos poblada con datos

📊 Product Backlog priorizado
📋 Cronograma real vs planeado
🎥 Demo en video corto (2-3 minutos)

**Criterios de Evaluación:**
- Sistema funciona sin errores críticos
- Documentación clara y bien estructurada
- Cumplimiento del 50% de funcionalidades
- Impacto social está documentado

---

## ENTREGA #2 - SEMANA 12
### MVP 100% + Documentación Mejorada

**Funcionalidades Adicionales:**
✅ Dashboard admin completo con estadísticas  
✅ Recuperación de contraseña  
✅ Gestión de usuarios por admin  
✅ Validaciones y seguridad mejorada  
✅ Testing completo  

**Documentos a Entregar:**
📄 Capítulo I: Datos Generales (MEJORADO)
📄 Capítulo II: Método SCRUM Aplicado (COMPLETO)
📄 Capítulo III: Desarrollo por Sprint (BOSQUEJO)
  - 3.1-3.8 Detalles por cada sprint

💻 Código del Sistema 100% funcional
🗄️ Diagramas UML (casos de uso, clases, secuencia)
📊 Estadísticas del proyecto
🎥 Demo actualizado (3-5 minutos)

**Criterios de Evaluación:**
- Sistema completamente funcional
- Documentación mejorada y coherente
- Diagramas UML presentes
- Testing evidence (screenshots de tests)
- Análisis de riesgos y mitigación

---

## ENTREGA #3 - SEMANA 16 (FINAL)
### Sistema 100% + Documentación Completa + Exposición

**Funcionalidades Finales:**
✅ Todo lo anterior
✅ Optimizaciones finales
✅ Seguridad auditada
✅ Documentación de usuario
✅ Manual técnico

**Documentos a Entregar:**
📄 Capítulo I: Datos Generales (FINAL)
📄 Capítulo II: Método SCRUM (FINAL)
📄 Capítulo III: Desarrollo por Sprint (COMPLETO)
📄 Capítulo IV: Diseño y Arquitectura (COMPLETO)
  - 4.1 Arquitectura general
  - 4.2 Modelo de BD
  - 4.3 Modelo UML consolidado
  - 4.4 Patrones de diseño
  - 4.5 Escalabilidad

📄 Capítulo V: Resultados y Conclusiones
  - 5.1 Resultados obtenidos
  - 5.2 Dificultades y riesgos
  - 5.3 Conclusiones
  - 5.4 Recomendaciones

📄 Capítulo VI: Manual de Usuario
📄 Capítulo VII: Anexos

💻 Código fuente 100% documentado
🎥 Video de exposición (máximo 10 minutos)
📊 Capturas de Jira/Trello
📋 Feedback de usuarios
✉️ Encuestas/entrevistas con stakeholders

**Criterios de Evaluación:**
- Sistema deploying y funcional en web
- Documentación completa y profesional
- Exposición clara y coherente
- Impacto social bien articulado
- Responsabilidades éticas consideradas

---

## REUNIONES Y HITOS CLAVE

### Reuniones Semanales Obligatorias
```
LUNES 9:00 AM
├─ Sprint Planning (si es nueva semana)
├─ Daily Standup (restantes de la semana)
│
VIERNES 4:00 PM
├─ Sprint Review
└─ Sprint Retrospective
```

### Hitos de Control
```
📍 Fin Sprint 1 (Semana 2)    → Autenticación funcional
📍 Fin Sprint 2 (Semana 3)    → Horarios consultables
📍 Fin Sprint 3 (Semana 4)    → Reportes operativos
📍 ENTREGA 1 (Semana 6)       → MVP 50% ✅
📍 Fin Sprint 4 (Semana 6)    → MVP 100%
📍 ENTREGA 2 (Semana 12)      → MVP + Doc mejorada ✅
📍 ENTREGA 3 (Semana 16)      → FINAL + Exposición ✅
```

---

## CONTINGENCIAS Y BUFFER

### Si hay retrasos:
- Priorizar HU críticas (⭐⭐⭐⭐)
- Aplazar HU deseable (⭐⭐)
- Extender sprints si es necesario
- Comunicar cambios al docente

### Sprints en Paralelo (Post MVP):
- Sprint 5-6: Monitoreo en tiempo real
- Sprint 7-8: Notificaciones automáticas
- Sprint 9-10: Aplicación móvil
- Sprint 11+: Reportes avanzados

---

## MÉTRICAS DE SEGUIMIENTO

| Métrica | Meta | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|---------|------|---------|---------|---------|---------|
| Velocidad (pts) | 18-27 | 18 | 27 | 21 | 18 |
| Completitud | 100% | __ | __ | __ | __ |
| Bugs encontrados | < 5 | __ | __ | __ | __ |
| Tests pasados | 100% | __ | __ | __ | __ |
| Cobertura de código | 80%+ | __ | __ | __ | __ |

---

**Última actualización:** Mayo 2026  
**Responsable:** [Equipo SCRUM]  
**Estado:** Planificado y listo para comenzar ✅
