# HANDOFF #2 → Antigravity · A&M Piscinas

**Fecha:** 21 de julio de 2026
**Para:** el agente Antigravity, que continúa el trabajo.
**De:** sesión de Claude Code (nos quedamos sin tokens; te paso el testigo).

Este archivo es autosuficiente: tiene el contexto, cómo correr y probar, las convenciones a respetar y **4 tareas concretas** con la ubicación exacta (archivo:línea) de cada cosa y su criterio de aceptación. No necesitás la conversación previa.

---

## 0. Contexto del proyecto (mínimo indispensable)

A&M Piscinas es una empresa **multimarca** de piscinas (Córdoba, Argentina). El sitio convierte la compra en una experiencia tipo tienda online: el cliente elige un modelo, lo personaliza (color, luz, borde, accesorios), ve el precio en vivo y pide presupuesto (se lo manda por WhatsApp/Instagram y **queda registrado en un panel de gestión**).

**Stack:** HTML + CSS + JS puro, **sin build, sin frameworks, sin dependencias** (solo Google… no, ya se sacó Google Fonts). Backend = **Supabase** (Postgres + Auth). Se sirve como sitio estático.

**Archivos principales:**
- `index.html` / `styles.css` / `script.js` → **sitio del cliente** (vitrina).
- `panel.html` / `panel.css` / `panel.js` → **panel de gestión** del vendedor/admin (login Supabase Auth; pedidos, pagos/cuotas, escuadras, stock).
- `supabase-config.js` → URL + anon key del proyecto Supabase (ya cargadas, reales).
- `supabase/schema.sql`, `schema2.sql`, `schema3.sql`, `seed.sql` → esquema y datos de la base.

**Convenciones (RESPETAR SÍ O SÍ):**
- Todo en **español (es-AR)**: comentarios, variables, textos.
- **Sin build ni dependencias nuevas.** Nada de npm/frameworks. Vanilla JS.
- Estado del cliente en `estado` → `localStorage` (`aym_piscinas_config`).
- Precios internos SIEMPRE en **USD** (moneda de referencia del catálogo). La conversión a ARS es solo de **presentación**, con `cotizacionARS` (dolarapi.com blue, fallback 1400).
- Contacto en fuente única: `NUMERO_WHATSAPP`, `USUARIO_INSTAGRAM`, `WHATSAPP_DISPLAY`.
- Logo con `onerror` fallback (no tocar).

---

## 1. Cómo correr y probar

**Servir el sitio** (NO abrir con doble clic `file://`, porque Supabase Auth falla por el origin):
```
cd "C:\Users\bruno\Downloads\AYM PAGE OFICIAL"
python -m http.server 8137
```
- Sitio cliente: `http://localhost:8137/index.html`
- Panel: `http://localhost:8137/panel.html` (o desde el sitio con **Ctrl/Cmd + Shift + L**, o `index.html#panel`).

**Para probar el panel** necesitás un usuario en Supabase → Authentication → Users → Add user (con "Auto Confirm"). El login del panel usa ese email/contraseña.

**⚠️ PENDIENTE del dueño (no bloquea las 4 tareas de abajo, pero avisale):** falta correr `supabase/schema3.sql` en Supabase → SQL Editor. Crea la tabla `pagos` y la columna `leads.origen`. Sin eso, la gestión de cuotas del panel y el botón "+ Nuevo pedido" dan error. El registro de presupuestos del cliente SÍ funciona igual (se dejó compatible: el insert del cliente no manda `origen`, que tiene default 'web').

---

## 2. Estado actual del trabajo (lo ya hecho)

- **Sitio cliente completo:** catálogo 3 gamas (acordeón), personalizador (color/luz/borde/accesorios) con croquis técnico SVG a escala + vista de corte, "Probá la piscina en tu patio" (subir foto), presupuesto con detalle + plano + total USD/ARS + PDF (`window.print`), captura de datos → WhatsApp/Instagram, quiz "Ayudame a elegir", "¿Entra en mi patio?", FAQ, compartir diseño por link (`#d=`), comparador de modelos, galería de obras + testimonios.
- **Backend Supabase cableado:** el sitio lee contenido de la base (con fallback local) y **registra cada presupuesto** en la tabla `leads` ante cualquier acción (WhatsApp, Instagram, imprimir/PDF, compartir), con dedup por "firma" del diseño (`firmaPresupuesto()` en script.js) para no duplicar.
- **Panel de gestión (panel.html/js/css):** login, Resumen (estadísticas), **Pedidos** con filtros, cambio de estado, asignar escuadra, fecha de instalación, WhatsApp al cliente, **crear pedido a mano ("+ Nuevo pedido")** con modelo + personalización + precio automático, **gestión de pagos/cuotas** (una tabla `pagos` por cuota: monto/fecha/estado/medio), **clasificación por color** (🟢 completado / 🔴 en deuda / 🟡 en proceso / gris sin plan) y **orden alternable** (más pagados / más nuevos). Escuadras y Stock CRUD.
- **Editor de contenido** (`#editar` o Ctrl/Cmd+Shift+E) que guarda overrides en localStorage (a futuro migrar a Supabase).

---

## 3. TAREAS A HACER (feedback de usuarios de prueba)

> Todas las líneas son referencias del estado actual; verificá el contexto antes de editar. Después de cada tarea, probá en el navegador que `index.html` carga **sin errores de consola**.

### TAREA 1 — Precios: mostrar PRIMERO pesos (ARS), después dólares (USD)

**Qué quiere el dueño:** hoy el precio se muestra como `USD 11.800 ≈ $16.520.000 ARS` (dólar primero). Debe ser al revés: **el peso es el principal (grande/prominente) y el dólar el secundario** (chico, al lado). Ej: `$16.520.000 ARS · aprox. USD 11.800`.

**Dónde tocar (script.js):**
- **Función central `formatearPrecio(usd)` — script.js:35.** Hoy:
  ```js
  return `USD ${usd.toLocaleString('en-US')} <span class="ars-equiv">≈ $${ars.toLocaleString('es-AR')} ARS</span>`;
  ```
  Darla vuelta: primero `$${ars} ARS` grande, y el USD adentro de un `<span>` chico (crear clase `.usd-equiv` análoga a la actual `.ars-equiv`). Mantener el caso `null` → "Consultar precio".
- **Otros lugares con USD primero (revisarlos todos y darlos vuelta con el mismo criterio):**
  - script.js:461 — accesorios en el personalizador: `${a.nombre} (+USD ${a.precio}…)`. Mostrar `(+$… ARS)` (podés dejar el USD entre paréntesis chico).
  - script.js:~950 — fila de cada ítem del presupuesto (`<span>${f.precio ? 'USD '…`).
  - script.js:~967 — **total del presupuesto**: hoy `USD X (≈ $Y ARS)` → pasar a `$Y ARS (≈ USD X)`. Es el número más importante de la pantalla; que el peso quede grande.
  - script.js:~1221 — tarjeta de compartir/QR: `Desde USD X` → `Desde $Y ARS`.
- **CSS:** buscá `.ars-equiv` en styles.css (es el estilo del equivalente chico). Creá `.usd-equiv` (o renombrá el concepto) para que ahora **el USD** sea el texto secundario chico y **el ARS** el principal.

**Cuidados:**
- NO cambiar los `precioBase` del `CATALOGO` ni la lógica de `calcularTotal()` — siguen en USD. Es solo **presentación**.
- La cotización puede no haber llegado todavía (usa fallback 1400 y re-renderiza cuando llega, ver `obtenerCotizacion`). El ARS es aproximado: dejá el "aprox./≈" bien visible para no comprometer un precio exacto.
- **Panel (panel.js):** los helpers `fmtUSD`/`fmtARS` (panel.js:~33) también muestran USD primero. El dueño habló del **sitio del cliente**, pero para consistencia conviene aplicar el mismo orden en el panel. Coordiná/aplicá si da el tiempo; no es la prioridad.

**Criterio de aceptación:** en catálogo, personalizador y presupuesto, el precio en **pesos aparece primero y más prominente**, con el USD como referencia secundaria. Modelos boceto sin precio siguen mostrando "Consultar precio".

---

### TAREA 2 — Catálogo: abrir las 3 gamas por defecto (y que sigan plegables)

**Qué quiere el dueño:** hoy en el catálogo solo la **gama media** aparece abierta; las otras dos (alta y baja) arrancan cerradas. Quiere que **las tres arranquen abiertas**, pero que se puedan **plegar/colapsar** igual que ahora.

**Dónde tocar (script.js):**
- **`GAMAS` — script.js:52-74.** Cada gama tiene la bandera `abiertaPorDefecto`. Hoy: `alta:false`, `media:true`, `baja:false`. **Poné las tres en `true`.**
- El render ya soporta plegado nativo: `renderCatalogo` (script.js:371) usa `<details class="gama-accordion" ${gama.abiertaPorDefecto ? "open" : ""}>`. Con las tres en `true`, las tres abren y **siguen siendo `<details>`**, o sea plegables con el `<summary>`. No hace falta tocar nada más.

**Criterio de aceptación:** al abrir la página, las 3 gamas (alta, media, entrada) se ven expandidas; cada una se puede colapsar/expandir haciendo clic en su encabezado.

---

### TAREA 3 — BUG: al usar "Atrás" desde el personalizador, sale a Google

**Síntoma (reportado por usuarios de prueba):** estando en el Personalizador (o Presupuesto), al querer "volver" (botón Atrás del navegador/celular), **el sitio se cierra y salta a Google** (o a la página anterior), en vez de volver a la pestaña anterior (Catálogo).

**Diagnóstico (CONFIRMADO en esta sesión):** la navegación entre pestañas (`irATab`, **script.js:311**) cambia clases CSS pero **NO toca el historial del navegador** (verifiqué que `history.length` no cambia al cambiar de tab, y el hash tampoco). Por eso el botón Atrás no tiene "a dónde volver dentro del sitio" y navega fuera (a Google, de donde llegó el usuario). Es el clásico problema de SPA sin history.

**Fix sugerido:**
- En `irATab(nombreTab)` (script.js:311), al cambiar de pestaña hacer `history.pushState({ tab: nombreTab }, "", "#tab=" + nombreTab)` (o el esquema de hash que prefieras), y agregar un listener `window.addEventListener("popstate", …)` que, al recibir el evento, llame a `irATab` de la pestaña del estado **sin volver a pushear** (para no entrar en loop — separá la lógica de "cambiar la vista" de la de "pushear historial").
- **CUIDADO con los deep-links existentes** que ya usan el hash y tienen manejo propio en el `init` (buscar en script.js): `#editar` (abre el editor), `#panel` (abre el panel), `#como-funciona` (ancla del catálogo), y `#d=…` (diseño compartido). No los pises: usá un prefijo distinto para las tabs (ej. `#tab=personalizador`) y, en el handler de `popstate`/carga, **solo** tratá como "tab" los hash que empiecen con ese prefijo; el resto que siga con su lógica actual.
- Al cargar la página con un `#tab=…` (o sin hash → catálogo), setear la pestaña correcta.

**Criterio de aceptación:** estando en Personalizador o Presupuesto, el botón **Atrás** del navegador/celular vuelve a la pestaña anterior dentro del sitio (típicamente Catálogo) **sin salir del sitio**. Los deep-links `#editar`, `#panel`, `#como-funciona` y los links compartidos `#d=` siguen funcionando igual.

---

### TAREA 4 — Primera visita: Personalizador y Presupuesto deben estar VACÍOS

**Qué quiere el dueño:** si un cliente entra por **primera vez** (no eligió ningún modelo todavía), las pestañas Personalizador y Presupuesto **no deben mostrar nada armado** (hoy muestran una piscina ya elegida). Por lógica, si recién entró, no hizo nada: debería ver un estado vacío que lo invite a elegir un modelo en el catálogo.

**Diagnóstico (CONFIRMADO):** con `localStorage` vacío, `estado.modeloId` arranca en `null` (`getEstadoInicial`, script.js:279-289). PERO al entrar al personalizador, `renderPersonalizador` (script.js:406) tiene en la **línea 408**:
```js
if (!estado.modeloId) estado.modeloId = modelo.id;   // ← auto-elige CATALOGO[0]
```
que auto-selecciona el primer modelo del catálogo (Infinity 800). Además `getModeloActual()` (script.js:402-404) tiene fallback `|| CATALOGO[0]`.

**Fix sugerido:**
- **Quitar / condicionar** la auto-asignación de la línea 408 (que NO se autoelija un modelo).
- Al principio de `renderPersonalizador()` **y** de `renderPresupuesto()`: si `!estado.modeloId`, renderizar un **estado vacío** y `return`. Ej: un mensaje tipo *"Todavía no elegiste tu piscina. Volvé al catálogo y elegí un modelo para personalizarlo."* con un botón que haga `irATab("catalogo")`. Usá los estilos existentes para no inventar UI nueva.
- **NO cambies `getModeloActual()`** (el fallback `|| CATALOGO[0]`): otras funciones dependen de que devuelva algo (p.ej. `guardarLeadEnSupabase`, `generarMensaje`, `compartirDiseño`). Es más seguro **gatear en los render** que tocar `getModeloActual`. Igual, esas acciones no deberían dispararse si no hay modelo elegido (el usuario está en el estado vacío).
- **El flujo de selección ya existe y hay que respetarlo:** el modelo se setea con `estado.modeloId = …` desde varios puntos — tarjeta del catálogo "Personalizar este modelo" (script.js:359 y bind 388-390), quiz (1222/1225-1227), comparador (1352-1356), "¿Entra en mi patio?" (1846/1863-1865) y link compartido (1277). En **todos** esos casos `estado.modeloId` deja de ser null y el personalizador debe poblarse normalmente. Verificá que después de elegir por cualquiera de esas vías, el personalizador muestre el modelo elegido.

**Criterio de aceptación:** primera visita (localStorage limpio) → Personalizador y Presupuesto muestran un mensaje vacío con CTA al catálogo, sin ningún modelo pre-elegido. Al elegir un modelo (por cualquier vía), ambas pestañas se pueblan con ese modelo. Si el cliente ya había elegido antes (localStorage), se mantiene su elección al recargar.

---

## 4. Qué NO romper (regresiones a evitar)

- El **registro de presupuestos** en Supabase (script.js `guardarLeadEnSupabase` + `firmaPresupuesto`): no toques el insert del cliente ni le agregues `origen` (rompería si falta schema3).
- El **fallback local**: si Supabase no responde, el sitio usa los datos locales de `CATALOGO/OBRAS/…`. No lo rompas.
- La conversión USD→ARS y el re-render cuando llega la cotización.
- Los **deep-links** (`#editar`, `#panel`, `#como-funciona`, `#d=`) — sobre todo al tocar la navegación (Tarea 3).
- El PDF/impresión (`@media print` en styles.css): imprime solo el presupuesto en claro. Si cambiás el formato de precios (Tarea 1), revisá que el PDF siga legible.
- **Español** y **cero dependencias**.

## 5. Cómo verificar al terminar
1. Servir con `python -m http.server 8137` y abrir `index.html`. **Consola sin errores.**
2. Tarea 1: mirar precios en catálogo, personalizador y presupuesto → pesos primero.
3. Tarea 2: las 3 gamas abiertas y colapsables.
4. Tarea 3: entrar al Personalizador y apretar Atrás → vuelve al Catálogo, no sale del sitio. Probar `#editar`/`#panel` que sigan andando.
5. Tarea 4: en una ventana incógnito (localStorage limpio), Personalizador y Presupuesto vacíos con CTA; elegir un modelo del catálogo → se pueblan.
6. `node --check script.js` para validar sintaxis.
