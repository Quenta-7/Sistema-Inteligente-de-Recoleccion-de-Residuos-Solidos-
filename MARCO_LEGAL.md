# ⚖️ MARCO LEGAL Y ANÁLISIS DE IMPACTO ÉTICO, LEGAL Y SOCIAL (AG-C01.2)
## Sistema Inteligente de Recolección de Residuos Sólidos Segregados - Cusco

Este documento sirve como evidencia formal del cumplimiento del indicador de desempeño **AG-C01.2** (*Asume responsabilidades éticas, legales y sociales en la práctica profesional de la computación dentro del contexto local y global*) para el proyecto semestral del curso **IF614 - Ingeniería de Software I** de la **Universidad Nacional de San Antonio Abad del Cusco (UNSAAC)**.

---

## 1. Normas y Leyes Aplicables

La implementación del sistema "Te Quiero Verde Cusco" se rige y fundamenta en el cumplimiento estricto de las siguientes normativas de la República del Perú:

### A. Ley N° 29733 – Ley de Protección de Datos Personales
Al ser una plataforma en línea que recopila y almacena datos de los ciudadanos del Cusco (nombres completos, números de teléfono, correos electrónicos, localización en zonas urbanas y registros fotográficos de las calles y fachadas de viviendas en las evidencias de reciclaje), el sistema implementa:
* **Principio de Consentimiento:** Se añadió un checkbox obligatorio en el formulario de registro para garantizar el consentimiento libre, previo, informado, expreso e inequívoco del usuario antes de almacenar sus datos.
* **Principio de Finalidad:** Los datos se capturan únicamente para la optimización de rutas de camiones y la adjudicación de EcoPuntos por segregación en la fuente.
* **Canal para Derechos ARCO:** Se establecieron las bases de la Política de Privacidad detallando cómo ejercer los derechos de Acceso, Rectificación, Cancelación y Oposición.

### B. Decreto Legislativo N° 1278 – Ley de Gestión Integral de Residuos Sólidos
Esta ley regula las competencias municipales en el Perú respecto al fomento de la segregación de residuos en la fuente. La plataforma apoya técnicamente esta normativa al:
* Proveer a los ciudadanos de un canal digital interactivo para consultar los horarios específicos de recolección selectiva (orgánico, reciclable, no reciclable) por zonas.
* Fomentar e incentivar la segregación domiciliaria a través de la acumulación de EcoPuntos.

### C. Ley N° 27806 – Ley de Transparencia y Acceso a la Información Pública
La plataforma provee una interfaz para el ciudadano donde puede auditar la asignación de sus EcoPuntos y visualizar en tiempo real (Mapa en Vivo) la ubicación simulada de los camiones recolectores, garantizando transparencia en la provisión del servicio público de limpieza urbana.

---

## 2. Matriz de Identificación y Mitigación de Riesgos (Éticos, Legales y Sociales)

Para asegurar la sostenibilidad social y el impacto ético del software, se han identificado cinco riesgos críticos y se han implementado sus respectivas mitigaciones técnicas en la base de código actual:

| ID | Tipo de Riesgo | Descripción del Riesgo | Impacto | Medida de Mitigación Implementada en el Código |
|---|---|---|---|---|
| **R-01** | **Legal** | Captura y almacenamiento ilegal de datos personales de ciudadanos cusqueños sin consentimiento. | Alto | Se modificó el modelo `Usuario` en Django para guardar de forma inalterable el consentimiento (`acepta_terminos`) y la marca de tiempo (`fecha_aceptacion_terminos`). En el frontend se implementaron las páginas de [Términos y Condiciones](file:///c:/Users/PC/Desktop/IS/version%20johan/Sistema-Inteligente-de-Recoleccion-v3/Sistema-Inteligente-de-Recoleccion-de-Residuos-Solidos--main/frontend/src/pages/TerminosCondiciones.tsx) y [Política de Privacidad](file:///c:/Users/PC/Desktop/IS/version%20johan/Sistema-Inteligente-de-Recoleccion-v3/Sistema-Inteligente-de-Recoleccion-de-Residuos-Solidos--main/frontend/src/pages/PoliticaPrivacidad.tsx). |
| **R-02** | **Ético** | Intento de fraude por parte de ciudadanos al subir fotos falsas de reciclaje para obtener EcoPuntos y beneficios ilegalmente. | Medio | Se rediseñó el flujo del backend (`EvidenciaViewSet`). Ahora, la creación de la evidencia **no** otorga EcoPuntos de forma automática; estos solo se acreditan cuando el rol de `admin` aprueba visualmente la imagen mediante el panel de control (`AdminDashboard`), cambiando su estado a `"resuelto"`. |
| **R-03** | **Social** | Brecha digital y exclusión de sectores de la población de la tercera edad o sin acceso a smartphones en Cusco. | Alto | En la interfaz de consulta de horarios y mapas, se diseñaron diseños responsivos, limpios y sencillos con soporte para pantallas táctiles de cualquier resolución, facilitando el uso guiado o asistido. |
| **R-04** | **Seguridad** | Manipulación de datos o suplantación de identidad en reportes y consulta de horarios. | Alto | Implementación de autenticación JWT segura con Django Rest Framework y roles restringidos. Los ciudadanos comunes no tienen permitido acceder a las APIs de listado completo de usuarios o de modificación de estados de evidencias de terceros. |
| **R-05** | **Social** | Desconfianza ciudadana por estimaciones de tiempos inexactos en el mapa. | Medio | El mapa interactivo cuenta con una simulación fluida y una telemetría realista. Además, los Términos de Uso expresan explícitamente que factores de fuerza mayor en Cusco (tránsito, clima) pueden alterar los horarios exactos. |

---

## 3. Checklist de Cumplimiento Normativo (DoD Legal)

Este checklist sirve como la **Definición de Hecho (Definition of Done - DoD)** respecto a la calidad ética y legal de cada incremento de software entregado en los Sprints:

* [x] **Consentimiento Explícito:** ¿El usuario debe aceptar de forma obligatoria las políticas legales para poder completar su registro? **(SÍ, implementado en Registro.tsx y validado en backend)**
* [x] **Auditoría de Aceptación:** ¿La base de datos registra la fecha y hora exacta de aceptación de las condiciones? **(SÍ, campo fecha_aceptacion_terminos en la base de datos)**
* [x] **Transparencia en el Tratamiento:** ¿Existen páginas informativas de libre acceso que detallen el tratamiento de los datos personales (Ley N° 29733)? **(SÍ, PoliticaPrivacidad.tsx)**
* [x] **Restricción de Privilegios (Roles):** ¿Los usuarios comunes tienen bloqueada la API de administración y visualización de datos de terceros? **(SÍ, protegido mediante token JWT e IsAuthenticated en views.py de Django)**
* [x] **Verificación Humana del Incentivo:** ¿Los puntos se entregan tras validación administrativa y no por automatización ciega? **(SÍ, validación por administrador en AdminDashboard.tsx)**

### Porcentaje de Cumplimiento de Normativas Aplicables: **100%**
Con la implementación de las políticas de privacidad, los checkboxes obligatorios de aceptación, el almacenamiento inmutable en el backend y la vista administrativa de control de roles, el sistema cuenta con total conformidad legal y ética para operar en Cusco, Perú.
