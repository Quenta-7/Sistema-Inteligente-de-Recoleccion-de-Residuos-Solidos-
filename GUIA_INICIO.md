# 🚀 PLANIFICACIÓN DEL MVP - ÍNDICE Y GUÍA DE INICIO
## Sistema Inteligente de Recolección de Residuos Sólidos - Cusco

---

## 📌 RESUMEN EJECUTIVO

Este proyecto busca resolver el problema de **comunicación deficiente y falta de participación ciudadana** en la gestión de residuos sólidos en Cusco.

**Solución:** Plataforma web que permite a ciudadanos:
- 📅 Consultar horarios de recolección por zona
- 🚨 Reportar acumulación de residuos
- 👨‍💼 Recibir respuesta del municipio

**MVP:** 4 Sprints de 6 semanas = Sistema 100% funcional listo para producción

---

## 📚 DOCUMENTOS DE PLANIFICACIÓN

Hemos creado **4 documentos de referencia** que cubren todos los aspectos:

### 1. 📋 [MVP_PLANIFICACION.md](MVP_PLANIFICACION.md)
**Para:** Visión general, alcance y estructura del proyecto

**Contiene:**
- Visión del MVP
- Funcionalidades incluidas y excluidas
- Stack tecnológico
- Estructura del proyecto
- Diagramas (casos de uso, arquitectura)
- Modelo de BD básico
- Riesgos y mitigación

**Cuándo usar:** Presentación ejecutiva, entendimiento general

---

### 2. 📦 [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md)
**Para:** Historias de usuario priorizadas y detalles de cada funcionalidad

**Contiene:**
- 15 historias de usuario (HU-001 a HU-015)
- Criterios de aceptación específicos
- Tamaño en puntos de Scrum
- Dependencias y relaciones
- Definición de Hecho (DoD)

**Cuándo usar:** Planning de sprints, desarrollo, testing

---

### 3. 🔧 [ESPECIFICACION_TECNICA.md](ESPECIFICACION_TECNICA.md)
**Para:** Equipo técnico de desarrollo

**Contiene:**
- Stack tecnológico detallado
- Estructura de carpetas del proyecto
- Variables de entorno (.env)
- Esquema de BD con SQL y Prisma
- Rutas API REST completas
- Consideraciones de seguridad
- Performance y escalabilidad
- Estrategia de testing

**Cuándo usar:** Setup del proyecto, desarrollo backend/frontend

---

### 4. 📅 [CRONOGRAMA_ENTREGAS.md](CRONOGRAMA_ENTREGAS.md)
**Para:** Timeline, entregables y seguimiento de proyecto

**Contiene:**
- Timeline general de 16 semanas
- Detalles de cada Sprint (1-4)
- Entregables por Sprint
- Entrega parcial (semana 6) - MVP 50%
- Entrega final (semana 16) - MVP 100%
- Hitos de control
- Métricas de seguimiento

**Cuándo usar:** Gestión del proyecto, seguimiento de progreso

---

## 🎯 CÓMO EMPEZAR

### Paso 1: Formar el Equipo SCRUM
```
Roles necesarios:
├─ Product Owner (1 persona)
│  └─ Responsable de Product Backlog y requisitos
├─ Scrum Master (1 persona)
│  └─ Facilita ceremonias, elimina obstáculos
└─ Development Team (2-3 personas)
   ├─ Backend developers (1-2)
   ├─ Frontend developer (1)
   └─ QA/Tester (1 si es posible)

Total recomendado: 4 personas (conforme con especificación del proyecto)
```

### Paso 2: Leer Documentación
```
1️⃣  MVP_PLANIFICACION.md (30 min)
    └─ Entender la visión y alcance

2️⃣  PRODUCT_BACKLOG.md (30 min)
    └─ Conocer las historias de usuario

3️⃣  ESPECIFICACION_TECNICA.md (1 hora)
    └─ Detalles técnicos antes de comenzar

4️⃣  CRONOGRAMA_ENTREGAS.md (20 min)
    └─ Entender el timeline
```

### Paso 3: Preparar Ambiente
```bash
# 1. Clonar repositorio
git clone <repo-url> proyecto-residuos
cd proyecto-residuos

# 2. Configurar backend
cd backend
cp .env.example .env
# Editar .env con configuración local
npm install
npm run setup-db  # Crear BD local

# 3. Configurar frontend
cd ../frontend
cp .env.example .env
npm install

# 4. Iniciar desarrollo
# Terminal 1: Backend
cd backend && npm run dev
# Terminal 2: Frontend
cd frontend && npm run dev
```

### Paso 4: Sprint Planning
```
SEMANA 1 - LUNES
├─ 09:00 AM: Kick-off del proyecto
├─ 10:00 AM: Sprint 1 Planning
│           └─ Distribuir tareas HU-001 a HU-004
├─ 12:00 PM: Setup ambiente de desarrollo
└─ 2:00 PM: Daily standup inicial

SEMANA 1 - MARTES A VIERNES
└─ Daily standup: 9:00 AM (15 min)
```

---

## 🎪 CEREMONIASPRINTSCRUM

### Sprint Planning (Inicio de Sprint)
- **Duración:** 1-2 horas
- **Participantes:** Todo el equipo
- **Objetivo:** Seleccionar HU y descomponerlas en tareas
- **Entregable:** Sprint Backlog completo

### Daily Standup (Diario)
- **Duración:** 15 minutos
- **Hora:** 9:00 AM
- **Preguntas:**
  1. ¿Qué hice ayer?
  2. ¿Qué haré hoy?
  3. ¿Hay bloqueadores?

### Sprint Review (Fin de Sprint)
- **Duración:** 30-45 minutos
- **Participantes:** Todo el equipo + Product Owner
- **Objetivo:** Demostrar lo completado
- **Criterio:** HU completadas = Done según DoD

### Sprint Retrospective (Fin de Sprint)
- **Duración:** 30 minutos
- **Participantes:** Solo dev team + Scrum Master
- **Objetivo:** Mejorar proceso
- **Temas:** Qué funcionó, qué mejorar, acciones

---

## 📊 VELOCITY Y ESTIMACIÓN

### Puntos Scrum Utilizados
```
1 punto  = 1-2 horas
2 puntos = 2-4 horas
3 puntos = ½ día
5 puntos = 1 día
8 puntos = 2 días
13 puntos = 3+ días (considerar dividir)
```

### Velocidad Esperada por Sprint
```
Sprint 1: 18 puntos (2 semanas) = ~9 pts/semana
Sprint 2: 27 puntos (1 semana) = ~27 pts/semana
Sprint 3: 21 puntos (1 semana) = ~21 pts/semana
Sprint 4: 18 puntos (2 semanas) = ~9 pts/semana

Promedio: 16-20 puntos/semana
```

---

## 📋 CHECKLIST PRE-DESARROLLO

Antes de comenzar, verificar:

### Equipo y Roles
- [ ] Product Owner asignado
- [ ] Scrum Master asignado
- [ ] Developers seleccionados
- [ ] Reuniones programadas

### Ambiente
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL funcionando
- [ ] Git configurado
- [ ] Repositorio creado en GitHub
- [ ] .env configurado

### Documentación
- [ ] Todos leen MVP_PLANIFICACION.md
- [ ] Dev team lee ESPECIFICACION_TECNICA.md
- [ ] PO entiende PRODUCT_BACKLOG.md
- [ ] Scrum Master conoce CRONOGRAMA_ENTREGAS.md

### Herramientas
- [ ] Jira/Trello configurado
- [ ] Slack/Discord para comunicación
- [ ] GitHub con ramas (main, dev, feature/*)
- [ ] Documentación compartida (Notion/Confluence)

---

## 🚨 RIESGOS PRINCIPALES

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|-----------|
| Retrasos tecnológicos | Media | Usar templates/boilerplates |
| Claridad de requisitos | Media | Daily standups, feedback rápido |
| Testing insuficiente | Media | Dedicar 20% tiempo a testing |
| Comunicación en equipo | Baja | Scrum master activo, reuniones |
| Cambio scope | Media | Decir "no" a features post-MVP |

---

## 📞 CONTACTOS Y RESPONSABLES

```
Docentes (Consultas académicas):
├─ Jisbaj Gamarra Salas
├─ Stephan Jhoel Cosio Loaiza
└─ Luz Indira Ticona

Equipo de Desarrollo:
├─ Product Owner: [NOMBRE]
├─ Scrum Master: [NOMBRE]
├─ Backend Dev: [NOMBRE]
└─ Frontend Dev: [NOMBRE]
```

---

## 💡 TIPS PARA EL ÉXITO

### Técnicos
1. **Git workflows:** Feature branches (`git checkout -b feature/HU-001`)
2. **Commits claros:** `[HU-001] Implementar registro de usuario`
3. **PR reviews:** Revisar código antes de merge
4. **Tests:** Escribir tests al mismo tiempo que código
5. **DB migrations:** Usar Prisma, evitar scripts manuales

### Team
1. **Comunicación:** Slack diario, reuniones puntuales
2. **Transparencia:** Reportar problemas temprano
3. **Colaboración:** Pair programming si es necesario
4. **Iteración:** Feedback constante, pivotear si es necesario
5. **Documentación:** Actualizar mientras desarrollas, no al final

### Proyecto
1. **MVP First:** No agregar features más allá del alcance
2. **User-centric:** Pensar siempre en el ciudadano de Cusco
3. **Seguridad:** Validar inputs, hashear contraseñas desde día 1
4. **Testing:** Tests desde el sprint 1
5. **Impacto:** Documentar cómo el sistema impacta a la comunidad

---

## 🎬 PRIMERA SESIÓN (SEMANA 1, LUNES)

### 09:00 AM - Kick-off del Proyecto (1 hora)
```
Agenda:
├─ Bienvenida y presentación de equipo
├─ Lectura de documentos clave
├─ Entendimiento del problema en Cusco
├─ Demostración de visión del MVP
└─ Preguntas y respuestas
```

### 10:00 AM - Sprint 1 Planning (1.5 horas)
```
Agenda:
├─ Estimación de HU-001 a HU-004
├─ Identificación de tareas técnicas
├─ Asignación de responsables
├─ Setup de ambiente
└─ Primer commit en GitHub
```

### 12:00 PM - Setup Técnico (1.5 horas)
```
├─ Crear repositorio Git
├─ Inicializar proyectos backend/frontend
├─ Configurar BD local con Docker
├─ Primer push a GitHub
└─ Verificar que todos pueden ejecutar `npm run dev`
```

### 2:00 PM - Daily Standup #1 (15 min)
```
Cada persona:
├─ Qué aprendí hoy
├─ Qué voy a hacer mañana
└─ Bloqueadores o dudas
```

---

## 📱 HERRAMIENTAS RECOMENDADAS

### Gestión de Proyecto
- **Jira** (si quieren profesional)
- **Trello** (si quieren simple)
- **GitHub Projects** (integrado con repos)

### Comunicación
- **Slack** + Slack bot para CI/CD
- **Discord** (más casual)
- **Teams** (si prefieren Microsoft)

### Documentación
- **Notion** (todo en uno)
- **Confluence** (integrado con Jira)
- **Google Docs** (simple y colaborativo)

### Desarrollo
- **VS Code** (recomendado)
- **Insomnia** o **Postman** (testing API)
- **GitHub Desktop** (si no conocen Git CLI)
- **DBeaver** (visualizar BD)

### Hosting (Post MVP)
- **Backend:** Heroku, Railway, DigitalOcean, Render
- **Frontend:** Vercel, Netlify
- **BD:** AWS RDS, Railway, supabase

---

## 🏆 CRITERIOS DE ÉXITO

### Para el MVP (Semana 6)
✅ Sistema funciona sin crashes  
✅ Usuarios pueden registrarse y consultar horarios  
✅ Sistema de reportes operativo  
✅ Documentación parcial clara  
✅ Código en GitHub accesible  

### Para Entrega Final (Semana 16)
✅ Sistema 100% funcional y deployado  
✅ Documentación profesional completa  
✅ Exposición clara de impacto social  
✅ +80% cobertura de tests  
✅ Código limpio y mantenible  

---

## 📖 REFERENCIAS ÚTILES

### Documentación Externa
- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)

### Libros Recomendados
- "Scrum: The Art of Doing Twice the Work in Half the Time" - Sutherland
- "Clean Code" - Robert C. Martin
- "The Pragmatic Programmer" - Hunt & Thomas

### Cursos Online
- Scrum Master basics (Coursera, Udemy)
- Full Stack Development (FreeCodeCamp)
- PostgreSQL + Node.js (YouTube)

---

## ❓ FAQ

**P: ¿Cuánto tiempo toma cada historia de usuario?**
R: Ver PRODUCT_BACKLOG.md - varía de 2 a 8 puntos (0.5 a 2 días)

**P: ¿Qué pasa si no terminamos en 6 semanas?**
R: Priorizar HU críticas, aplazar deseable, extender si es necesario

**P: ¿Necesitamos tests desde el día 1?**
R: Sí, mínimo tests unitarios en funciones clave

**P: ¿Cómo manejamos cambios en requisitos?**
R: A través del Product Owner, documentar en Jira, no cambios directos

**P: ¿Cuándo escalamos para monitoreo en tiempo real?**
R: Post MVP, sprints 5-6 (semanas 7-12)

---

## 📞 SOPORTE Y DUDAS

Si tienen dudas:
1. **Requisitos del proyecto:** Contactar Product Owner
2. **Problemas técnicos:** Contactar Scrum Master + Dev Team
3. **Documentación/proceso:** Leer CRONOGRAMA_ENTREGAS.md
4. **Especificación técnica:** Revisar ESPECIFICACION_TECNICA.md

---

## 🎉 ¡LISTOS PARA COMENZAR!

Todos los documentos están preparados. El equipo tiene:
- ✅ Visión clara del producto
- ✅ Historias de usuario priorizadas
- ✅ Especificación técnica detallada
- ✅ Cronograma realista
- ✅ Estructura de proyecto definida

**Próximo paso:** Primera reunión - Lunes 9:00 AM 🚀

---

**Documento:** Guía de Inicio  
**Creado:** Mayo 2026  
**Versión:** 1.0  
**Estado:** ✅ LISTO PARA COMENZAR PROYECTO
