# 📦 PRODUCT BACKLOG - MVP
## Sistema Inteligente de Recolección de Residuos - Cusco

---

## HISTORIAS DE USUARIO PRIORIZADAS

### ÉPICA 1: Autenticación y Gestión de Usuarios

#### HU-001: Registro de Ciudadano ⭐⭐⭐⭐ (CRÍTICA)
**Como:** Nuevo ciudadano  
**Quiero:** Registrarme con mi email, contraseña, nombre, teléfono y zona de residencia  
**Para:** Acceder al sistema y consultar mis horarios de recolección

**Criterios de Aceptación:**
- [ ] Formulario con campos: email, contraseña, nombre, teléfono, zona
- [ ] Validar email único en sistema
- [ ] Contraseña mínimo 8 caracteres
- [ ] Validar formato de teléfono
- [ ] Mensaje de éxito/error claros
- [ ] Email de confirmación (opcional para MVP)
- [ ] Redireccionar a login después del registro

**Tamaño: 8 puntos**  
**Sprint: 1**

---

#### HU-002: Inicio de Sesión ⭐⭐⭐⭐ (CRÍTICA)
**Como:** Ciudadano registrado  
**Quiero:** Iniciar sesión con email y contraseña  
**Para:** Acceder a mi cuenta y ver mis datos

**Criterios de Aceptación:**
- [ ] Formulario con email y contraseña
- [ ] Validar credenciales contra BD
- [ ] Generar token JWT válido
- [ ] Almacenar token en localStorage/sessionStorage
- [ ] Redireccionar a panel principal después de login
- [ ] Mostrar error si credenciales son incorrectas
- [ ] Opción "¿Olvidaste tu contraseña?" (para siguiente sprint)

**Tamaño: 5 puntos**  
**Sprint: 1**

---

#### HU-003: Editar Perfil ⭐⭐⭐ (IMPORTANTE)
**Como:** Ciudadano logueado  
**Quiero:** Editar mi perfil (nombre, teléfono, zona de residencia)  
**Para:** Mantener mis datos actualizados

**Criterios de Aceptación:**
- [ ] Página de perfil con datos precargados
- [ ] Campos editables: nombre, teléfono, zona
- [ ] Botón guardar cambios
- [ ] Validación de datos
- [ ] Mensaje de confirmación
- [ ] No permitir cambiar email (por seguridad en MVP)

**Tamaño: 3 puntos**  
**Sprint: 1**

---

#### HU-004: Cerrar Sesión ⭐⭐⭐ (IMPORTANTE)
**Como:** Ciudadano logueado  
**Quiero:** Cerrar sesión  
**Para:** Proteger mi cuenta cuando no la uso

**Criterios de Aceptación:**
- [ ] Botón logout en navbar
- [ ] Eliminar token JWT
- [ ] Redireccionar a página de login
- [ ] No permitir acceso a páginas protegidas sin sesión

**Tamaño: 2 puntos**  
**Sprint: 1**

---

### ÉPICA 2: Gestión de Zonas y Consulta de Horarios

#### HU-005: Listar Zonas de Recolección ⭐⭐⭐⭐ (CRÍTICA)
**Como:** Ciudadano  
**Quiero:** Ver la lista de todas las zonas de recolección de Cusco  
**Para:** Buscar la mía si aún no la he seleccionado

**Criterios de Aceptación:**
- [ ] Mostrar lista de zonas con nombre, código y descripción
- [ ] Zona seleccionada actualmente debe estar destacada
- [ ] Poder cambiar de zona
- [ ] Interfaz limpia y fácil de usar

**Tamaño: 3 puntos**  
**Sprint: 2**

---

#### HU-006: Consultar Horario de Mi Zona ⭐⭐⭐⭐ (CRÍTICA)
**Como:** Ciudadano  
**Quiero:** Ver el horario de recolección de mi zona (días y horas)  
**Para:** Saber cuándo dejar mi basura

**Criterios de Aceptación:**
- [ ] Mostrar tabla con: día, hora inicio, hora fin
- [ ] Mostrar tipos de residuos aceptados
- [ ] Horario fácil de entender
- [ ] Poder visualizar horarios de otras zonas
- [ ] Mostrar si el próximo recolector viene hoy (opcional)

**Tamaño: 5 puntos**  
**Sprint: 2**

---

#### HU-007: Ver Tipos de Residuos ⭐⭐⭐ (IMPORTANTE)
**Como:** Ciudadano  
**Quiero:** Ver qué tipos de residuos se aceptan (orgánico, reciclable, no reciclable)  
**Para:** Segregar correctamente mis residuos

**Criterios de Aceptación:**
- [ ] Mostrar clasificación: Orgánico, Reciclable, No Reciclable
- [ ] Ejemplos de cada tipo
- [ ] Información clara y en español
- [ ] Iconos identificativos (opcional)

**Tamaño: 3 puntos**  
**Sprint: 2**

---

#### HU-008: Gestionar Zonas (Admin) ⭐⭐⭐ (IMPORTANTE)
**Como:** Administrador  
**Quiero:** Crear, editar y eliminar zonas de recolección  
**Para:** Mantener el sistema actualizado

**Criterios de Aceptación:**
- [ ] Acceso solo para usuarios con rol admin
- [ ] Formulario para crear/editar zona
- [ ] Campos: nombre, código, descripción, geometría (opcional)
- [ ] Validar código único
- [ ] Eliminar zona (advertencia si hay usuarios asignados)
- [ ] Listar zonas existentes con opciones de editar/eliminar

**Tamaño: 8 puntos**  
**Sprint: 2**

---

#### HU-009: Gestionar Horarios (Admin) ⭐⭐⭐ (IMPORTANTE)
**Como:** Administrador  
**Quiero:** Crear y editar horarios de recolección por zona  
**Para:** Mantener los horarios actualizados

**Criterios de Aceptación:**
- [ ] Acceso solo para administradores
- [ ] Seleccionar zona
- [ ] Agregar múltiples horarios por semana
- [ ] Campos: día, hora inicio, hora fin, tipos de residuo
- [ ] Editar horarios existentes
- [ ] Eliminar horarios

**Tamaño: 8 puntos**  
**Sprint: 2**

---

### ÉPICA 3: Sistema de Reportes

#### HU-010: Crear Reporte de Incidencia ⭐⭐⭐⭐ (CRÍTICA)
**Como:** Ciudadano  
**Quiero:** Reportar acumulación de residuos en mi zona  
**Para:** Notificar a la municipalidad para que actúe rápidamente

**Criterios de Aceptación:**
- [ ] Acceder desde botón en dashboard
- [ ] Campos obligatorios: descripción, zona (preseleccionada)
- [ ] Campo opcional: foto
- [ ] Validar descripción mínimo 10 caracteres
- [ ] Adjuntar foto (máx 5MB)
- [ ] Mostrar confirmación de envío
- [ ] Mensaje de éxito con número de ticket (opcional)

**Tamaño: 8 puntos**  
**Sprint: 3**

---

#### HU-011: Ver Mis Reportes ⭐⭐⭐ (IMPORTANTE)
**Como:** Ciudadano  
**Quiero:** Ver el historial de mis reportes y su estado  
**Para:** Saber si han sido atendidos

**Criterios de Aceptación:**
- [ ] Mostrar lista de reportes propios
- [ ] Mostrar: descripción, fecha, estado (nuevo/revisión/resuelto)
- [ ] Poder expandir para ver detalles
- [ ] Ver foto si la adjunté
- [ ] Filtrar por estado (opcional)

**Tamaño: 5 puntos**  
**Sprint: 3**

---

#### HU-012: Gestionar Reportes (Admin) ⭐⭐⭐⭐ (CRÍTICA)
**Como:** Administrador  
**Quiero:** Ver todos los reportes recibidos y cambiar su estado  
**Para:** Dar seguimiento y resolver incidencias

**Criterios de Aceptación:**
- [ ] Acceso solo para administradores
- [ ] Listar todos los reportes con: usuario, descripción, zona, fecha, estado
- [ ] Cambiar estado: nuevo → revisión → resuelto
- [ ] Ver foto del reporte
- [ ] Contacto del usuario (email/teléfono)
- [ ] Agregar comentario/nota (opcional)
- [ ] Filtrar por zona y estado

**Tamaño: 8 puntos**  
**Sprint: 3**

---

### ÉPICA 4: Panel de Control Admin

#### HU-013: Dashboard Admin ⭐⭐⭐ (IMPORTANTE)
**Como:** Administrador  
**Quiero:** Ver un resumen de: usuarios, reportes, zonas  
**Para:** Tener una visión general del sistema

**Criterios de Aceptación:**
- [ ] Mostrar: total usuarios, total reportes (nuevo/revisión/resuelto)
- [ ] Mostrar número de zonas activas
- [ ] Gráfico simple de reportes por estado (pie chart)
- [ ] Acciones rápidas (crear zona, ver reportes)
- [ ] Diseño limpio

**Tamaño: 5 puntos**  
**Sprint: 4**

---

#### HU-014: Gestionar Usuarios (Admin) ⭐⭐⭐ (IMPORTANTE)
**Como:** Administrador  
**Quiero:** Ver usuarios registrados y poder eliminar cuentas  
**Para:** Mantener la calidad de usuarios en el sistema

**Criterios de Aceptación:**
- [ ] Listar usuarios con: email, nombre, zona, fecha registro
- [ ] Cambiar rol (ciudadano/admin)
- [ ] Eliminar usuario (con confirmación)
- [ ] Buscar usuario por email
- [ ] Ver detalles del usuario

**Tamaño: 5 puntos**  
**Sprint: 4**

---

#### HU-015: Recuperar Contraseña ⭐⭐ (DESEABLE)
**Como:** Usuario  
**Quiero:** Recuperar mi contraseña si la olvido  
**Para:** Volver a acceder a mi cuenta

**Criterios de Aceptación:**
- [ ] Ingreso de email
- [ ] Generar enlace de reset con token temporal
- [ ] Enviar email con enlace (usar servicio como SendGrid)
- [ ] Página para cambiar contraseña
- [ ] Token válido por 24 horas
- [ ] Confirmar nueva contraseña

**Tamaño: 8 puntos**  
**Sprint: 4**

---

## RESUMEN POR SPRINT

| Sprint | Duración | HU | Puntos | Estado |
|--------|----------|-----|--------|--------|
| 1 | Semana 1-2 | HU-001 a HU-004 | 18 | Planificado |
| 2 | Semana 3 | HU-005 a HU-009 | 27 | Planificado |
| 3 | Semana 4 | HU-010 a HU-012 | 21 | Planificado |
| 4 | Semana 5-6 | HU-013 a HU-015 | 18 | Planificado |
| **Total** | **6 semanas** | **15 HU** | **84 puntos** | **MVP** |

---

## CRITERIOS DE DEFINICIÓN DE HECHO (DoD)

✅ El código cumple con estándares de limpieza  
✅ Pruebas unitarias cubren el 80% del código  
✅ Código documentado (JSDoc/Docstrings)  
✅ Revisión de código aprobada (peer review)  
✅ Funcionalidad testeada manualmente  
✅ No hay vulnerabilidades de seguridad críticas  
✅ Documentación actualizada  
✅ Base de datos migrada correctamente  

---

## NOTAS IMPORTANTES

- 📌 Las HU marcadas con ⭐⭐⭐⭐ **CRÍTICAS** no pueden aplazarse
- 📌 Cada HU debe incluir pruebas unitarias
- 📌 Se puede ajustar si se identifica que el tiempo no es suficiente
- 📌 Los sprints tienen duración de 1-2 semanas
- 📌 Reuniones de planificación: inicio de cada sprint
- 📌 Daily standup: 15 minutos cada mañana
- 📌 Sprint review: final de cada sprint
- 📌 Retrospectiva: final de cada sprint

---

**Última actualización:** Mayo 2026  
**Estado:** MVP - Planificado  
**Responsable:** [Equipo SCRUM]
