<!--
  REGLA PERMANENTE: cada commit que cambie funcionalidad agrega UNA línea
  concisa bajo "[Sin publicar]". En cada checkpoint de versión, esas líneas
  se mueven a una nueva sección con el número de versión y la fecha.
-->

# Changelog

Contexto técnico para quien no conoce el proyecto: "Cuaderno de seguimiento"
es una app para que un profesor particular de matemática lleve el registro
de sus alumnos (exámenes, avance por tema, clases dictadas, resultados de
simulacros). El frontend (`web/app/`) es vanilla JS sin build ni bundler —
seis `<script>` clásicos cargados en orden fijo — empaquetado como PWA con
service worker (`sw.js`). El backend es un único proyecto Supabase
compartido (multi-tenant vía RLS), consumido con `fetch` crudo contra
Auth/PostgREST, sin SDK de `supabase-js`. El deploy es automático a GitHub
Pages en cada push a `main` que toque `web/**`. Las migraciones SQL del
backend viven versionadas aparte, en el repo privado `cuaderno-supabase`.
Los wrappers nativos (Tauri para escritorio, Capacitor para Android) también
viven en repos propios (`cuaderno-desktop`, `cuaderno-android`), ambos en
pausa.

Formato basado en [Keep a Changelog](https://keepachangelog.com/), adaptado
a una sola sección de viñetas por versión (sin subcategorías Added/Fixed/etc.).

## [Sin publicar]

## [2.0.6] - 2026-07-17
- Resumen semanal por email (`web/app/js/auth.js`, `sync.js`, `events.js`, `views.js`; `cuaderno-supabase`: `migraciones/014_resumen_semanal.sql`): switch "Recibir el resumen semanal por mail" en Cuenta (`perfiles.resumen_semanal`, apagado por defecto) que guarda la preferencia al toque (optimista, con rollback si falla el guardado). En el backend, `enviar_resumenes_semanales()` corre los domingos a la noche (hora Argentina) vía pg_cron y le arma a cada docente no inactivo un resumen simple — clases dadas, cobrado y pendiente, próximos exámenes/objetivos sin evaluar y alumnos que se están enfriando, calculado directo sobre el jsonb de `cuaderno` — y lo manda por `enviar_mail_brevo()` (reusada del paso 56). Arranca en modo simulacro (sólo loguea el HTML que mandaría, sin mandar nada) hasta activarlo a mano en el SQL Editor.
- Retención y salud del negocio (`web/app/js/views.js`): dos secciones nuevas al final de Estadísticas — "Retención" con la duración promedio de un alumno (meses de la primera a la última clase registrada) y altas/bajas por mes de los últimos 6 meses (altas por fecha de inicio, bajas por alumnos en estado "dejó", gráfico de barras con signo — verde crece, rojo baja — igual criterio que el histórico de Rentabilidad); y "Salud del mes" con activos recientes vs. "enfriándose" (3–6 semanas sin clase) vs. inactivos (6+ semanas o nunca), con un chip de alerta por cada alumno que se enfría o está inactivo para abrir su ficha directo. Se calcula todo sobre el historial ya guardado, sin backend nuevo; mismo estilo de gráficos CSS/SVG con valores siempre visibles (criterio del paso 57). Precache del service worker en `cuaderno-v69`.
- Ficha con pestañas y listas filtrables (`web/app/js/views.js`, `events.js`, `helpers.js`): la ficha de alumno pasa de 4 pestañas largas a 6 acotadas — Resumen (vistazo rápido con próxima clase/deuda/racha de objetivos/avance, más unidades, datos de contacto, informe/contrato y borrar), Clases (registrar + horarios + puntuales + simulacros), Pagos (tarifa/modalidad + pagos mensuales + seña), Objetivos (racha + historial con resultado) y Materiales (lectura de lo compartido con ese alumno) — Portal queda igual que antes. Lista de Estudiantes con dos filtros nuevos — deuda (debe/al día) y orden (por examen/por última clase/por nombre), con la deuda de cada uno como chip en la fila cuando corresponde — sumados al buscador y contador de resultados que ya existían. Precache del service worker en `cuaderno-v68`.
- Duplicar materia y acciones rápidas (`web/app/js/sync.js`, `views.js`, `events.js`, `helpers.js`, `styles.css`): botón "Duplicar" en cada materia de Materias copia su nombre, unidades y color a una nueva ("(copia)"), abre su editor directo y copia en segundo plano (best-effort, si hay conexión) los materiales de referencia guardados en Storage — sin tocar alumnos ni historial (`duplicateSubject()`). FAB (botón flotante "+") siempre visible con las 3 acciones más repetitivas — nuevo alumno, nueva clase, registrar pago —, arriba de la barra inferior en mobile / esquina inferior derecha en escritorio; precarga lo que puede según el contexto (con una ficha abierta va directo a su pestaña; si no, pregunta primero para quién con una lista simple de alumnos). Precache del service worker en `cuaderno-v67`.
- Papelera con deshacer (`web/app/js/config.js`, `helpers.js`, `sync.js`, `views.js`, `events.js`, `styles.css`): borrar un alumno o una materia ya no los saca del todo — quedan en una papelera (`catalog.trash` para materias, con sus unidades/color/packs; el ya existente `deleted` de alumnos, ahora con ventana de 7 días en vez de 90) restaurable completa desde una nueva sección "Papelera" en Cuenta, con cuánto le queda a cada uno y botones Restaurar/Eliminar definitivo; pasados los 7 días se purgan solos al abrir la app (`trashDaysLeft()`). Patrón único de confirmación de borrado en toda la app: reemplazo inline del botón por "¿Seguro? Sí, eliminar / Cancelar" para alumno/materia/pack, y un toast con botón "Deshacer" inmediato (`toast(text, tone, undo)`) en cualquier borrado — incluidas clases, horarios, clases puntuales, pagos, simulacros y costos fijos/variables. Los materiales guardados en Storage quedan afuera de la papelera (se manejan con su propio confirm, irreversible). Precache del service worker en `cuaderno-v66`.

## [2.0.5] - 2026-07-17
- Accesibilidad y teclado (`web/app/js/*.js`, `web/app/styles.css`, `web/app/portal.html`, `web/index.html`): tokens de texto sobre fondos saturados (`--on-accent`/`--on-green`/`--on-red`) y reuso de los `-fg` ya existentes (`status-*-fg`, `tarea-*-fg`, `subj-*-fg`) donde el blanco o el color plano no llegaban a 4.5:1 (botones primarios, chips activos, badges, seña, "Ejemplo"/packs, avisos en rojo, barras de la landing y el portal); reducción de movimiento ahora cubre también toasts y el pulso del chip de sync. Navegación por teclado: atajos "/" (buscar), "N" (nuevo alumno) y "C" (nueva clase, con una ficha abierta), trampa de foco y cierre con Escape en los diálogos (buscador, nuevo alumno), foco visible agregado a enlaces. Semántica: `aria-label` en los botones de sólo ícono que tenían nada más un "×" o un glifo (borrar, semáforo, cerrar aviso), `role="progressbar"` con su valor en todas las barras de progreso/estadísticas (app y portal). Tamaños de toque ~44px en móvil para borrar/seña/portal/swatch de color/WhatsApp. Atajos listados en el nuevo centro de ayuda (paso 74). Precache del service worker en `cuaderno-v64`.
- Onboarding y ayuda (`web/app/js/config.js`, `helpers.js`, `views.js`, `events.js`, `styles.css`): guía de "Primeros pasos" convertida en checklist de 4 pasos (crear materia → agregar alumno → registrar clase → activar portal) que se tilda sola en base a los datos reales y se oculta cuando ya están los 4 o se descarta a mano; iconitos "?" con popover corto junto a señas, política de cancelación, portal y rentabilidad (`helpTip()`, `HELP_TEXTS`); mini centro de ayuda (acordeón de preguntas frecuentes, `FAQ_ITEMS`) al final de Cuenta. Todo en el cliente, sin backend nuevo. Precache del service worker en `cuaderno-v63`.
- Color por materia e iconografía unificada (`web/app/js/config.js`, `helpers.js`, `views.js`, `events.js`, `sync.js`, `portal.js`, `styles.css`, `portal.html`): cada materia tiene un color elegible (8 opciones accesibles, `SUBJECT_COLOR_KEYS`) que se muestra siempre igual — lista de materias, editor de materia y materiales, agenda (borde + dot por evento, también en el tablero "Hoy"), barras de "tasa de aprobación"/"objetivos cumplidos" en Estadísticas y biblioteca del portal (`portal_publico`); las materias viejas sin color eligen uno estable por hash de su id, sin migrar nada a mano. Reemplazados los emojis sueltos (WhatsApp, objetivo de clase, racha, superposición de horario, resultado de objetivo sí/a medias/no, saludo del portal) por el mismo set de íconos de línea ya usado en el nav (documentado en `views.js` junto a `ICON_CHECK`), con contraste verificado en ambos temas. Precache del service worker en `cuaderno-v62`.
- Búsqueda global (`web/app/js/helpers.js`, `js/views.js`, `js/events.js`): ícono de lupa siempre visible en el nav y atajo de teclado "/" abren un overlay que busca por nombre entre alumnos, materias y materiales (`globalSearchResults`), agrupados por tipo; navegación por flechas + Enter además de click, todo local sobre `state.catalog`/`state.students` sin backend nuevo. Precache del service worker en `cuaderno-v61`.
- Rediseño del tablero como panel "Hoy" (`web/app/js/views.js`, `web/app/styles.css`): tres tarjetas arriba de todo — "Clases de hoy" (agenda del día con botón registrar/ver clase ya registrada), "Para cobrar" (reusa `cobrosAtrasadosSummary`/`vCobrosBanner`, el mismo recordatorio de cobro existente, ahora dentro de la tarjeta) y "Próximo" (exámenes dentro de 14 días, objetivos de clase por cerrar y clases de mañana) — cada una con su número grande, acceso directo a la vista completa y el estado vacío amable ya existente cuando no hay nada que mostrar; nuevos componentes `.hoy-grid`/`.hoy-card` en tarjetas, mobile-first (1 columna, 3 desde 860px) y con los mismos design tokens claro/oscuro que el resto de la app. Precache del service worker en `cuaderno-v60`.

## [2.0.4] - 2026-07-17
- Rediseño de la landing (`web/index.html`): paleta azul marino/verde-azulado, tipografías Poppins/Inter alojadas localmente en `web/fonts/` (sin CDN), header sticky, hero a dos columnas con mock del dashboard, grilla de características con íconos SVG inline y estilo nuevo para "Usala donde quieras"; conserva el selector de tema claro/oscuro/automático con variantes coherentes para ambos temas.
- Sistema visual de la app (`web/app/styles.css`): design tokens de color (claro/oscuro), tipografía Poppins/Inter local (`web/app/fonts/`, sin CDN), tamaños, radios, sombras y espaciados con la misma identidad que la landing (marino + acento teal); nuevos componentes reutilizables `.btn`/`.badge`/`.ds-*` como base para rediseñar las vistas; logo (check en cuadradito con degradé marino) aplicado al favicon, `icon-192`/`icon-512` y el `theme_color`/`background_color` del manifest. No cambia el HTML de las vistas todavía.
- Rediseño de todas las vistas de la app sobre esa base: navegación persistente con íconos (sidebar en escritorio, barra inferior en mobile) con estado activo y acceso directo al toggle de tema, en reemplazo de las pestañas/chips sueltas; encabezado de sección (eyebrow + título + acción principal) en tablero, estudiantes, ficha, pagos/rentabilidad, agenda, materias, estadísticas, cuenta y panel; logo de marca en las pantallas de login/registro/recuperación y en `portal.html` (que ahora comparte paleta y tipografía local con el resto de la app). Los documentos para imprimir (informe, contrato) quedan fuera del nav a propósito y siguen imprimiendo igual.
- Estados vacíos, feedback y microinteracciones: estados vacíos con ícono, frase y una acción clara (sin alumnos, sin clases de la semana, sin materiales, sin cobros del mes, portal apagado) en vez de espacio en blanco; toasts discretos y autodescartables tras guardar/borrar/copiar (clase, simulacro, pago, horario, resultado de examen, alta de alumno, exportar, copiar link) en reemplazo de los mensajes sueltos que quedaban pegados; chip de estado de datos (guardado/sincronizando/sin conexión/error) siempre visible en el nav, con el mismo `id="syncStatus"` que ya actualizaba `sync.js` en cada tick; skeletons con animación mientras cargan materiales, respaldos, portal y las pestañas del panel admin, en vez de un "Cargando…" seco; hover/active sutiles en tarjetas y botones, coherentes con la animación ya existente del cierre de objetivo de clase. Precache del service worker en `cuaderno-v59`.

## [2.0.3] - 2026-07-16
- Base del portal de invitados: tabla `portales` y RPC pública `portal_publico()` (migración 013), sección "Portal para tus alumnos" en Cuenta (activar/desactivar, copiar link, regenerar llave, publicar el nombre a mostrar) y página standalone `portal.html`/`js/portal.js` sin sesión y fuera del service worker.
- Biblioteca del portal: toggle "Compartir" por archivo en Materiales, "Publicar cambios" ahora firma URLs de Storage (30 días) y arma la biblioteca por materia, renovación automática silenciosa cuando quedan a 20+ días de vencer, republicado inmediato al dejar de compartir o borrar un archivo, y sección Biblioteca (agrupada, con buscador) como lo primero que ve el alumno en `portal.html`.
- Llave por alumno: card "Portal para este alumno" en la ficha (generar/copiar/regenerar/revocar su link individual) con checkboxes explícitos de qué ve (próxima clase, tarea de la última clase, avance por unidades) — nunca notas, pagos, señas ni comentarios privados; se actualiza solo al tildar o con "Publicar cambios"; en `portal.html` el alumno con llave propia ve primero su saludo y bloque personal, arriba de la biblioteca y links generales.

## [2.0.2] - 2026-07-16
- Generador de contratos de servicio: botón "Generar contrato" en la ficha del alumno, con un modelo precargado (docente, alumno, materia, tarifa y modalidad, horarios habituales, política de cancelación y señas) y campos editables (responsable, DNI opcional, fecha de inicio, cláusulas adicionales); datos del docente reutilizables cargados una sola vez en Cuenta; vista tipo documento con el mismo patrón que el informe (Descargar PDF / Copiar texto).
- Rentabilidad real: sub-pestaña dentro de Pagos con costos fijos mensuales y variables por clase (asignables a una materia o alumno puntual), $ neto por hora realmente dictada del mes (ingresos cobrados menos costos, sobre la duración cargada en cada clase), desglose por materia y por alumno, proyección del mes en curso y un histórico de 12 meses (ganancia neta y $/hora) con barras que admiten negativo y línea de tendencia, todo en CSS/SVG puro.
- Objetivos de clase: campo opcional al registrar una clase, mini-tarjeta de cierre con micro-animación al registrar la clase siguiente (o desde la ficha) para marcar si se cumplió, racha de objetivos cumplidos en la ficha, y tasa de cumplimiento en Estadísticas e informe compartible.
- Agenda con vista mensual (switch Semana/Mes, grilla del mes con mini-marcas por día, detalle de día con "Programar clase acá"); seña opcional por alumno (monto fijo o % de la tarifa) con estado por clase puntual (pendiente/cobrada/retenida/devuelta); política de cancelación configurable en Cuenta (horas mínimas de aviso, devolución o crédito a la próxima clase); avisos de seña sin cobrar al programar y al cancelar; señas como rubro propio en el resumen mensual de Pagos.
- Recordatorios de cobro: aviso desplegable en el tablero (clases sin cobrar + mensualidades vencidas + señas pendientes, con marcar-cobrada y WhatsApp por alumno), notificación del navegador opcional (permiso pedido recién al activarla) y configuración en Cuenta (sí/no, días de atraso mínimos).

## [2.0.1] - 2026-07-16
- Eliminado GoatCounter de la landing (métricas propias en `metricas_diarias`/`metricas_horarias` no se tocan).
- Límite total de materiales (20 MB por usuario entre todas sus materias), con índice liviano en el catálogo, reconciliación contra Storage y barra de uso en la sección Materiales.
- Tema elegible (automático/claro/oscuro) en la landing, con botón sol/luna en el header y la misma clave de localStorage que usa la app.
- Panel admin → Usuarios: última conexión reforzada server-side (`registrar_actividad`), orden por última conexión y botón para eliminar cuentas (con doble confirmación escribiendo el email) que usa la nueva RPC `admin_eliminar_usuario`.
- Panel admin → Actividad: valor de cada barra siempre visible (rotado en los gráficos de 30/48 puntos), etiquetas de eje abreviadas sin superponerse y total del período junto al título de cada gráfico.
- Cierre automático de cuentas inactivas (mail recordatorio a los 30 días, aviso final a los 5 meses, borrado a los 6, con modo simulacro que sólo registra en el log): cron diario `revisar_inactivos()` en el backend, mails transaccionales por Brevo, y en el Panel admin → Usuarios un chip "inactivo hace X" por fila más una nueva pestaña "Inactividad" con el log de notificaciones y cierres.

## [2.0.0] - 2026-07-16
- Registro de pagos por alumno.
- Informe de progreso compartible.
- Botones de contacto por WhatsApp.
- Carga de resultados de examen.
- Plantillas de materias para altas rápidas.
- Agenda semanal de clases.
- Landing actualizada con las características al día.

## [1.8.0] - 2026-07-15
- Login: envío con Enter y límite de intentos fallidos.
- Catálogo directo con materia de ejemplo al crear cuenta.
- Una ficha por alumno por materia (en vez de una ficha global por alumno).
- Packs de materias para altas rápidas de catálogo.
- Materiales adjuntos por materia.
- Fetch de métricas horarias para el panel de estadísticas.
- Actividad detallada por día y por hora en el panel.
- Lista de respaldos aligerada (menos payload por entrada).

## [1.7.0] - 2026-07-15
- Modo oscuro.
- Onboarding con alumno de ejemplo para cuentas nuevas.
- Buscador y filtros en la lista de alumnos.
- Cronómetro de clase y recordatorio de respaldo.

## [1.6.0] - 2026-07-15
- Estadísticas del profesor (panel agregado).
- "El aula": mapa visual de alumnos agrupados por materia.
- Vista de estadísticas por materia.

## [1.5.0] - 2026-07-15
- Panel de recursos.
- Integración de GoatCounter en la landing.
- Métricas de actividad y panel correspondiente.
- Panel admin de usuarios y presencia.
- Heartbeat de presencia de usuarios conectados.

## [1.4.0] - 2026-07-15
- Frontend separado en archivos (de script único a los seis `js/*.js` actuales).
- SQL de Supabase movido a repo propio versionado (`cuaderno-supabase`).
- Empaquetado de escritorio movido a `cuaderno-desktop` (en pausa).
- Empaquetado de Android movido a `cuaderno-android` (en pausa).
- Repo web limpiado y documentado.

## [1.3.0] - 2026-07-14
- Auditoría de seguridad.
- Roles profesor/administrador.
- Fix de ancla muerta en el aviso de nueva versión.
- Sync eficiente: solo se escribe cuando hay cambios reales.
- Landing simplificada a versión solo web.
- Auto-update de la app de escritorio (Tauri).
- Aviso de versión nueva en las apps nativas.
- Respaldos automáticos con historial.
- Techo de 24hs a la sesión web restaurada por el navegador.
- Sesión web por navegador, emails recordados y confirmación de cuenta.

## Antes de v1.3.0
- Firma de release de Android y versión 1.2.0.
- Cierre de versión 1.2.0.
- Reportes de problemas y branding genérico.
- Landing v2 y limpieza general.
- Fix de link a la app en la landing bajo `file://`.
- Referencias actualizadas al repo renombrado (`manugandini53-design.github.io`).
- Sitio del producto: landing separada de la app, app movida a `/app/`.
- Bump de versión a 1.1.0.
- Workflow de deploy automático a GitHub Pages.
- Login bloqueante y backend Supabase embebido (producto multi-tenant).
- Setup de Capacitor y proyecto Android nativo.
- Setup de Tauri: primer build de escritorio funcional (.exe/.msi).
- Versión estable de la PWA, previa a la migración a nativo.
- Carga inicial de archivos del proyecto.
