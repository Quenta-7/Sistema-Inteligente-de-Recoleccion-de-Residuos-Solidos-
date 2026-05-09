# 📊 RESUMEN EJECUTIVO - MVP
## Sistema Inteligente de Recolección de Residuos Sólidos - Cusco

**Versión:** 1.0 | **Fecha:** Mayo 2026 | **Estado:** ✅ PLANIFICACIÓN COMPLETADA

---

## EL PROBLEMA

En Cusco, la recolección de residuos sufre de:
- ❌ **Falta de comunicación:** Ciudadanos desconocen horarios exactos
- ❌ **Sin participación ciudadana:** No hay forma de reportar problemas
- ❌ **Gestión reactiva:** La municipalidad no sabe dónde hay acumulación
- ❌ **Baja segregación:** Ciudadanos no saben cómo clasificar residuos

**Impacto:** Acumulación de basura → Contaminación → Problemas de salud

---

## LA SOLUCIÓN: MVP EN 4 SPRINTS

### Funcionalidades Clave
1. **Consulta de Horarios** 📅
   - Ciudadano selecciona zona → ve horario de recolección
   - Información clara sobre qué se acepta (orgánico, reciclable, etc)

2. **Sistema de Reportes** 🚨
   - Ciudadano reporta acumulación de residuos
   - Adjunta foto como evidencia
   - Recibe confirmación con número de ticket

3. **Panel Administrativo** 👨‍💼
   - Municipalidad visualiza todos los reportes
   - Asigna estados (nuevo → en revisión → resuelto)
   - Ve estadísticas básicas

4. **Autenticación Segura** 🔐
   - Registro e login de usuarios
   - Recuperación de contraseña
   - Control de acceso por roles

---

## STACK TECNOLÓGICO

```
Frontend          Backend              Database
┌──────────────┐  ┌──────────────┐    ┌──────────────┐
│ React 18+    │  │ Node.js +    │    │ PostgreSQL   │
│ TypeScript   │  │ Express.js   │    │              │
│ Tailwind CSS │  │ Prisma ORM   │    │ ~5 tablas    │
└──────────────┘  │ JWT Auth     │    └──────────────┘
                  └──────────────┘
```

---

## CRONOGRAMA: 16 SEMANAS TOTALES

### MVP (4 Sprints - 6 semanas)
```
Sprint 1 (Sem 1-2): Autenticación ✅
Sprint 2 (Sem 3):   Consulta horarios ✅
Sprint 3 (Sem 4):   Sistema reportes ✅
Sprint 4 (Sem 5-6): Dashboard admin ✅
```

### Entregas Parciales
```
📦 ENTREGA #1 (Semana 6):    MVP 50% + Documentación Cap I-II
📦 ENTREGA #2 (Semana 12):   MVP 100% + Documentación Cap I-III
📦 ENTREGA #3 (Semana 16):   Final + Exposición ✅
```

---

## EQUIPO SCRUM (4 PERSONAS)

| Rol | Persona | Responsabilidad |
|-----|---------|-----------------|
| 👨‍💼 Product Owner | [Nombre] | Requisitos, backlog, prioridades |
| 🎯 Scrum Master | [Nombre] | Proceso, ceremonias, obstáculos |
| 💻 Backend Dev | [Nombre] | API, BD, autenticación |
| 🎨 Frontend Dev | [Nombre] | UI/UX, componentes React |

---

## HISTORIAS DE USUARIO (15 TOTAL)

### Sprint 1: Autenticación (4 HU)
- [x] HU-001: Registro de usuario
- [x] HU-002: Login
- [x] HU-003: Editar perfil
- [x] HU-004: Logout

### Sprint 2: Horarios (5 HU)
- [x] HU-005: Listar zonas
- [x] HU-006: Consultar horarios
- [x] HU-007: Ver tipos de residuos
- [x] HU-008: Gestionar zonas (admin)
- [x] HU-009: Gestionar horarios (admin)

### Sprint 3: Reportes (3 HU)
- [x] HU-010: Crear reporte
- [x] HU-011: Ver mis reportes
- [x] HU-012: Gestionar reportes (admin)

### Sprint 4: Admin & Pulido (3 HU)
- [x] HU-013: Dashboard admin
- [x] HU-014: Gestionar usuarios (admin)
- [x] HU-015: Recuperar contraseña

---

## ENTREGABLES POR SPRINT

### Sprint 1
✅ Backend: API auth (register, login)  
✅ Frontend: Páginas login/registro  
✅ BD: Tabla usuarios migrada  
✅ Tests: Autenticación validada  

### Sprint 2
✅ Backend: API de zonas y horarios  
✅ Frontend: Página consulta horarios  
✅ BD: Tablas zonas/horarios pobladas  
✅ Admin: Panel gestión zonas  

### Sprint 3
✅ Backend: API reportes con carga de archivos  
✅ Frontend: Formulario reporte con foto  
✅ Frontend: Listado de mis reportes  
✅ Admin: Panel gestión de reportes  

### Sprint 4
✅ Backend: Dashboard stats, email reset  
✅ Frontend: Dashboard admin, admin users  
✅ Testing: 80% cobertura  
✅ Docs: Documentación usuario  

---

## CRITERIOS DE ÉXITO

### Funcionalidad ✅
- Sistema sin crashes críticos
- Autenticación segura y funcional
- Ciudadano puede reportar incidencias
- Admin puede gestionar reportes

### Código 💻
- +80% test coverage
- Código limpio (linting)
- Documentación de API (Swagger)
- Migraciones de BD automáticas

### Documentación 📄
- Cap I-II en Semana 6
- Cap I-III en Semana 12
- Documentación completa en Semana 16
- Impacto social documentado

### Seguridad 🔒
- Contraseñas hasheadas (bcrypt)
- JWT con expiración
- Validación de inputs en backend
- CORS configurado

---

## RIESGOS Y MITIGACIÓN

| Riesgo | Mitigación |
|--------|-----------|
| Retrasos tecnológicos | Usar boilerplates y templates |
| Mal entendimiento de requisitos | Daily standups + feedback rápido |
| Testing insuficiente | 20% del tiempo dedicado a QA |
| Problemas de BD | Usar Prisma migrations desde día 1 |
| Cambios en alcance | "No" a features post-MVP |

---

## IMPACTO SOCIAL (Atributo AG-C01)

### Cómo Resolvemos Problemas Locales
✅ **Salud:** Reduce acumulación → menos plagas → menos enfermedades  
✅ **Ambiente:** Facilita segregación → reciclaje → menos contaminación  
✅ **Participación:** Empodera ciudadanía → responsabilidad compartida  
✅ **Gestión:** Datos para municipalidad → mejora planificación  

### Requisitos Éticos
✅ Privacidad de datos ciudadanos respetada  
✅ Acceso inclusivo (interfaz clara en español)  
✅ Transparencia en procesos  
✅ Cumplimiento de normativas locales  

---

## RECURSOS NECESARIOS

### Humanos
- 4 personas: 1 PO, 1 SM, 1 Backend, 1 Frontend
- Dedicación: Full-time por 16 semanas

### Técnicos
- Servidor local (PostgreSQL) o cloud (AWS, Railway)
- Repositorio Git (GitHub/GitLab)
- Herramienta Scrum (Jira, Trello)
- Hosting para producción (Vercel, Heroku)

### Costos Estimados
```
Local Development:     Gratis (open source)
Cloud DB (prod):       $10-20/mes
Hosting Backend:       $5-20/mes
Hosting Frontend:      Gratis (Vercel)
Herramientas:          Gratis (GitHub, Trello)
─────────────────────────────────────
Total MVP:             ~$50-100 por 16 semanas
```

---

## COMPARACIÓN: PROBLEMA vs SOLUCIÓN

### Antes (Situación Actual)
```
Ciudadano                      Municipalidad
    │                              │
    ├─ ¿Cuándo pasan?             ├─ ¿Dónde hay problemas?
    ├─ ¿Qué tipos?                ├─ ¿Cómo priorizar rutas?
    ├─ No puede reportar          └─ Información dispersa
    └─ No siente participación
```

### Después (Con MVP)
```
Ciudadano                      Municipalidad
    │                              │
    ├─ Consulta horario → App     ├─ Ve reportes → Dashboard
    ├─ Reporta problema → App     ├─ Asigna estado → responde
    ├─ Recibe confirmación        ├─ Analiza tendencias
    └─ Siente que aporta          └─ Planifica mejor
```

---

## PRÓXIMAS FASES (POST-MVP)

Después del MVP, posibles expansiones:

### Fase 2: Monitoreo en Tiempo Real (Sprints 5-6)
- GPS tracking de camiones
- Mapa interactivo
- Notificaciones de cercanía

### Fase 3: Automatización (Sprints 7-8)
- Emails/SMS automáticos
- Push notifications
- Recordatorios personalizados

### Fase 4: Aplicación Móvil (Sprint 9)
- App Android/iOS nativa
- Offline-first capabilities
- Cámara integrada para fotos

### Fase 5: Inteligencia (Sprint 10+)
- Dashboards de analítica
- Predicción de demanda
- Optimización de rutas con ML

---

## DOCUMENTOS DETALLADOS

Este resumen ejecutivo se acompaña de 4 documentos técnicos:

1. **MVP_PLANIFICACION.md** (Visión general)
   - Alcance, stack, arquitectura, riesgos

2. **PRODUCT_BACKLOG.md** (Historias de usuario)
   - 15 HU detalladas con criterios de aceptación

3. **ESPECIFICACION_TECNICA.md** (Para desarrolladores)
   - BD, API, seguridad, testing, deployment

4. **CRONOGRAMA_ENTREGAS.md** (Timeline de 16 semanas)
   - Detalles por sprint, entregas, ceremonias

5. **GUIA_INICIO.md** (Cómo empezar)
   - Setup, ambiente, primer día de proyecto

---

## PRÓXIMOS PASOS

### Semana 1 - Lunes
```
09:00 AM ├─ Kick-off del proyecto
10:00 AM ├─ Sprint 1 Planning
12:00 PM ├─ Setup técnico
02:00 PM └─ Daily standup #1
```

### Semana 1-2 (Sprint 1)
- Implementar autenticación
- Setup de BD
- Primeras interfaces

### Semana 3 (Sprint 2)
- Módulo de horarios
- Panel admin básico

### Semana 4 (Sprint 3)
- Sistema de reportes

### Semana 5-6 (Sprint 4)
- Dashboard admin
- Pulido y testing

---

## CONCLUSIÓN

Este MVP propone una solución **simple, escalable y de alto impacto** para mejorar la gestión de residuos en Cusco.

**Objetivos:**
✅ Resolver problema de comunicación  
✅ Empoderar participación ciudadana  
✅ Proveer datos para gestión municipal  
✅ Aplicar metodología SCRUM  
✅ Demostrar impacto social del software  

**Entrega:** Sistema 100% funcional en 6 semanas, documentación completa en 16 semanas.

---

## 📞 CONTACTO

**Equipo de Proyecto:**
- Docentes: Jisbaj Gamarra, Stephan Cosio, Luz Ticona
- Product Owner: [Nombre]
- Scrum Master: [Nombre]
- Dev Team: [Nombres]

**Repositorio:** GitHub (por determinar)  
**Documentación:** [Esta carpeta]

---

**DOCUMENTO APROBADO Y LISTO PARA EJECUTAR** ✅

---

*Creado: Mayo 2026 | Versión: 1.0 | Estado: Planificación Completada*
