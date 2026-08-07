# Auditoría de historias de usuario

Fecha de revisión: 7 de agosto de 2026.

## HU-021 — Calificación del Servicio

Estado final: **implementada en la aplicación; despliegue HTTPS y SLA pendientes de validar en infraestructura real**.

- [x] Formulario de 1 a 5 estrellas y comentario opcional (`frontend/src/pages/Dashboard.tsx`).
- [x] Asociación con la ruta/servicio realizado (`CalificacionServicio.ruta`).
- [x] Respuesta exacta `Calificación registrada correctamente.` (`POST /api/calificaciones/`).
- [x] Historial exclusivo del ciudadano autenticado (`GET /api/calificaciones/` y panel ciudadano).
- [x] JWT obligatorio y rol ciudadano validado en servidor.
- [x] Solo permite rutas completadas o parcialmente completadas de la zona del ciudadano.
- [x] Unicidad por ciudadano+ruta en serializer y `UniqueConstraint` de base de datos.
- [x] No existe operación DELETE (devuelve HTTP 405) ni control de borrado en la UI.
- [x] Moderación visible/oculto exclusiva del administrador y control en el panel administrativo.
- [x] Registro persistente y bitácora `BitacoraAuditoria` al crear una calificación.
- [x] Pruebas de creación, duplicado, moderación, auditoría y prohibición de borrado.
- [~] TLS 1.2+ queda preparado con `DJANGO_SECURE_SSL=1`, HSTS, cookies seguras y URL HTTPS; la versión TLS se configura en el proxy de producción.
- [~] El SLA de 3 segundos requiere prueba de carga en el ambiente desplegado; las operaciones son consultas indexadas y la compilación/pruebas locales pasan.

## HU-013 — Seguimiento de Ruta en Mapa

Estado final: **implementada en la aplicación; SLA de carga pendiente de validar en red/dispositivo real**.

- [x] Mapa Leaflet móvil con geometría real de la ruta asignada (`RecolectorDashboard.tsx`).
- [x] Marcadores diferenciados de inicio, paradas y final, más zoom nativo de Leaflet.
- [x] Geolocalización HTML5 automática y marcador de la posición actual.
- [x] Sincronización GPS limitada a una transmisión cada 30 segundos.
- [x] Cálculo backend de distancia restante y visualización en kilómetros.
- [x] `RutaViewSet` devuelve al recolector solo sus rutas asignadas.
- [x] El backend rechaza GPS antes de iniciar o después de finalizar la ruta.
- [x] Al finalizar, se detiene `watchPosition` y se eliminan coordenadas/fecha GPS persistidas.
- [x] La API no transmite coordenadas si la ruta no está `en_progreso`.
- [x] Pruebas de bloqueo GPS, inicio, seguimiento y limpieza al finalizar.
- [~] HTTPS se exige mediante la configuración de despliegue descrita arriba.
- [~] El mapa base depende de OpenStreetMap y el trazado por calles de OSRM. Se dibuja primero la geometría persistida como fallback, pero el máximo de 5 segundos debe medirse en 4G real.

## HU-020 — Interfaz Móvil de Recolector

Estado final: **implementada y generada como proyecto Android; falta compilar/firmar el APK en un equipo con Android SDK**.

- [x] Interfaz responsive para cronogramas, mapa HU-013, cumplimiento, incidencias y alertas (`RecolectorDashboard.tsx`).
- [x] Respuestas administrativas generan notificaciones; el recolector las recibe mediante polling cada 15 segundos.
- [x] Acceso protegido por rol y JWT.
- [x] Sesión única: cada login genera un SID firmado; un login nuevo invalida el JWT anterior incluso antes de su expiración.
- [x] Identificador estable por dispositivo enviado desde el cliente.
- [x] Cierre automático al vencer el JWT mediante temporizador global y control central de respuestas 401.
- [x] Wrapper Capacitor Android reutilizando React (`frontend/capacitor.config.ts`, `frontend/android`).
- [x] Android API 24+, permisos GPS/Internet, tráfico HTTP bloqueado y backups desactivados.
- [x] Proyecto web compilado y sincronizado con Capacitor.
- [~] El APK no se pudo compilar en esta estación porque no existe Android SDK/`ANDROID_HOME`. Abrir `frontend/android` en Android Studio, instalar SDK 36 y compilar/firmar.
- [~] Rendimiento de 3 segundos y operación bajo 4G requieren pruebas instrumentadas contra el backend HTTPS desplegado.

## Revisión de las demás historias de los sprints

La etiqueta “TERMINADO” del tablero no equivale en todos los casos a cumplimiento completo de los criterios escritos.

| Historia | Estado auditado | Evidencia y brecha principal |
|---|---|---|
| HU-001 Autenticación | Implementada con condición de despliegue | Login, BCrypt, JWT, throttling y sesión única existen. HTTPS depende del proxy de producción. |
| HU-002 Registro por DNI | Implementada con condición externa | Formulario, validaciones y proxy RENIEC existen. Depende de credenciales/disponibilidad de Decolecta y HTTPS productivo. |
| HU-003 Panel principal | Parcial | Dashboard y guards por rol existen, pero varios ViewSets antiguos aún tienen permisos CRUD demasiado amplios; la autorización no es uniforme en backend. |
| HU-004 Disposición responsable | Parcial | Evidencias, GPS, estados, aprobación y EcoPuntos existen; falta bitácora de cada alta y endurecer que solo admin cambie estados. |
| HU-005 Saldo EcoPuntos | Implementada | Perfil y Dashboard muestran saldo actualizado del usuario autenticado. |
| HU-006 Catálogo recompensas | Implementada funcionalmente | Catálogo, stock, costo e interfaz existen; conviene optimizar imágenes y restringir completamente DELETE administrativo. |
| HU-007 Canje EcoPuntos | Implementada | Transacción atómica con bloqueo de filas, saldo, stock, registro y notificación. |
| HU-008 Validación reportes | Parcial | Panel, aprobación/rechazo, validador y fecha existen; el backend debe impedir explícitamente que un ciudadano actualice el estado de su evidencia. |
| HU-009 Historial/recepción de reportes | Parcial | Listados propios y códigos existen, pero faltan bitácora, validación mínima uniforme, inmutabilidad/DELETE y parte de filtros/detalle exigidos. |
| HU-010 Horarios recolección | Parcial | Vista y datos existen; el filtrado por zona ocurre principalmente en frontend, no se fuerza de manera uniforme en la API. |
| HU-011 Cronogramas recolector | Parcial | Lista y detalle de rutas asignadas existen; faltan filtro formal por fecha y bitácora de consultas. |
| HU-012 Consulta de horarios | Parcial | Consulta visual por sector existe; faltan búsqueda por dirección, bitácora y filtrado de seguridad por zona en servidor. |
| HU-014 Alertas proximidad | Parcial | Detección GPS a 50 m, alerta visual/sonora y detención con la ruta existen; faltan persistencia/historial, tipo de residuo y deduplicación definitiva por punto. |
| HU-015 Cumplimiento de ruta | Parcial | Estados finales, observaciones, fecha y restricciones de transición existen; falta bitácora de cada reporte/cambio. |
| HU-018 Retroalimentación incidencias | Parcial | Historial propio, respuesta admin y notificación al recolector existen; faltan bitácora de consultas e impedir DELETE de forma explícita. |
| HU-019 Historial ciudadano | Parcial | Los querysets aíslan datos propios y hay listados; faltan una vista unificada, filtros/orden configurables, inmutabilidad completa y bitácora de consultas. |

## Verificaciones ejecutadas

- `python manage.py makemigrations --check --dry-run`: sin cambios pendientes.
- `python manage.py test core`: 13/13 pruebas correctas.
- `npm run build`: compilación TypeScript/Vite correcta (2.27 s de build local).
- Lint focalizado de autenticación nueva: correcto.
- Lint global: mantiene 76 incidencias preexistentes en páginas antiguas; no impiden el build.
- `cap sync android`: correcto.
- `gradlew assembleDebug`: detenido únicamente por ausencia de Android SDK en el equipo.

