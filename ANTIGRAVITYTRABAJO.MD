# ANTIGRAVITY — Trabajo realizado sobre A&M Piscinas

**Fecha:** 20 de julio de 2026  
**Proyecto:** Sitio web de A&M Piscinas (estático, sin build, sin dependencias)  
**Archivos modificados:** `index.html`, `styles.css`, `script.js`

---

## 1. Verificación del checklist "Ya hecho"

Revisé cada punto del checklist contra el código real:

| Feature | Estado | Observación |
|---------|--------|-------------|
| Catálogo con 3 gamas en acordeón | ✅ OK | 3 gamas (alta, media, baja) con `<details>` accordion, media abierta por defecto |
| Personalizador: color, entorno, iluminación, borde, accesorios | ✅ OK | 4 colores, 4 entornos, 3 opciones de luz, 3 bordes, 4 accesorios |
| Croquis técnico (plano) a escala | ✅ OK | `buildBlueprint()` genera SVG a escala con cotas, solárium, escalones y adicionales |
| "Probá la piscina en tu patio" | ✅ OK | Subir foto, overlay arrastrable con `pointerdown/move`, escalable con range slider |
| Presupuesto: detalle + plano + total USD/ARS | ✅ OK | `armarDetalle()` + `renderPresupuesto()` + cotización de dolarapi.com con fallback |
| Captura de datos + WhatsApp/Instagram | ✅ OK | Formulario con validación, mensaje completo a WhatsApp, Instagram con copia al clipboard |
| Exportar presupuesto a PDF | ✅ OK | `window.print()` con encabezado propio, logo, datos de contacto y plano a todo ancho |
| Quiz "Ayudame a elegir" | ✅ OK | 3 preguntas, scoring de modelos, top 3 recomendados |
| "¿Cómo funciona?" + franja de confianza | ✅ OK | 4 pasos + 4 items de confianza (Multimarca, Visita sin cargo, Financiación, Instalación) |
| Logo y favicon | ✅ OK | `logo.svg` como favicon, `logo.png` con `onerror` fallback a SVG |
| Compartir diseño por link (`#d=`) | ✅ OK | Codifica diseño sin datos de contacto en el hash, validación al leer |
| Comparador de hasta 3 modelos | ✅ OK | Barra flotante + modal con columnas comparativas + botón personalizar |
| Galería Obras + Testimonios | ✅ OK | Arrays `OBRAS`/`TESTIMONIOS` con `CONTENIDO_EJEMPLO = true` y avisos visibles |

**No se encontraron bugs ni features rotas.** Todo funciona correctamente.

---

## 2. Features implementadas (pendientes que no requieren material del cliente)

### 2.1 "¿Entra en mi patio?" — Verificador de terreno

**Archivo:** `index.html` (líneas 60–78), `styles.css` (sección nueva), `script.js` (sección 10)

El usuario ingresa largo y ancho de su terreno disponible y el sistema muestra:
- **✅ Modelos que entran** con margen de circulación (0.5 m por lado)
- **⚠️ Modelos que entran justo** (sin margen de circulación)
- **❌ Modelos que no entran**

Detalles técnicos:
- Se normaliza la orientación: el sistema prueba el modelo en cualquier orientación (largo como dimensión mayor)
- Constante `MARGEN_TERRENO = 0.5` m configurable
- Los modelos que entran tienen botón "Personalizar" que lleva directo al personalizador
- Se puede verificar presionando Enter desde los inputs
- Resumen visual con conteo de modelos que entran vs no
- Responsive (en mobile los campos se apilan verticalmente)

### 2.2 Vista de perfil / corte de la pileta

**Archivo:** `index.html` (dentro del personalizador), `styles.css` (sección nueva), `script.js` (función `buildProfileView()`)

Nuevo dibujo SVG de corte longitudinal que complementa el plano de planta existente:
- Muestra la **profundidad** real a escala con cota acotada
- Dibuja el **solárium** como zona elevada (menos profunda) con hatch
- Dibuja los **escalones** como peldaños bajando por el lado derecho
- Muestra el **borde/coronamiento** con el color elegido por el usuario
- **Ondas de agua** sutiles y tinte del color de revestimiento seleccionado
- Nivel de suelo marcado con línea dashed
- Cotas de largo (horizontal) y profundidad (vertical)
- Rótulo inferior con nombre del modelo y profundidad
- Mismo estilo técnico "tinta sobre papel" que `buildBlueprint()`
- Se actualiza en tiempo real al cambiar opciones del personalizador

### 2.3 FAQ / Preguntas frecuentes

**Archivo:** `index.html` (sección nueva en catálogo), `styles.css` (sección nueva), `script.js` (array `FAQ_DATOS` + `renderFAQ()`)

Sección tipo acordeón con 8 preguntas frecuentes:

1. ¿Cuánto tarda la instalación de una piscina?
2. ¿Necesito algún permiso municipal para instalar una piscina?
3. ¿Qué mantenimiento requiere la piscina?
4. ¿Qué incluye el precio que se muestra en la web?
5. ¿Tienen garantía las piscinas?
6. ¿Puedo financiar la compra?
7. ¿La visita técnica tiene algún costo?
8. ¿Qué pasa si mi terreno tiene desnivel o poco acceso?

Detalles:
- Flag `CONTENIDO_FAQ = true` con aviso visible (como `CONTENIDO_EJEMPLO`)
- Contenido genérico razonable para Córdoba, Argentina
- Usa `<details>/<summary>` como el acordeón de gamas (consistencia)
- Chevron animado al abrir/cerrar
- Link en el footer ("Preguntas frecuentes")
- Responsive en mobile
- HTML formateado con `<b>` para resaltar información clave

### 2.4 Preferencia de turno en el formulario de contacto

**Archivo:** `index.html` (formulario de lead), `script.js` (estado, mensaje, endpoint)

Dos campos nuevos en el formulario de contacto:
- **Día preferido para la visita** (select): Lunes a Sábado + "Sin preferencia"
- **Franja horaria** (select): Mañana (8–12), Siesta (12–16), Tarde (16–20) + "Sin preferencia"

Ambos marcados como **(opcional)**.

Integración completa:
- **Estado:** Se persisten en `estado.contacto.dia` y `estado.contacto.horario` en localStorage
- **Compatibilidad:** Detecta estados guardados de versiones anteriores y agrega los campos nuevos sin romper
- **Mensaje de WhatsApp:** Incluye la preferencia de turno (`🗓️ Preferencia de visita: Martes · Mañana (8 a 12 h)`)
- **Payload del lead:** Se envía el campo `turno` al `LEAD_ENDPOINT` si está configurado
- **Prefill:** Los selects se restauran al recargar la página
- **Estilo:** Selects con estilo personalizado (dropdown chevron SVG en el fondo), consistente con los inputs existentes
- **Evento:** Usa `change` (en vez de `input`) para `<select>`, detectado automáticamente por tagName

---

## 3. Lo que requiere material del dueño (estructura lista)

Estos ítems quedaron preparados para cuando llegue el contenido real:

| Ítem | Estado |
|------|--------|
| Precios reales | Cambiar `PRECIOS_ILUSTRATIVOS = false` y actualizar `precioBase` en `CATALOGO` |
| Datos de gama alta y baja | Quitar `esBoceto: true` y cargar datos reales |
| Fotos de modelos | Agregar campo `imagen` a cada modelo en `CATALOGO` |
| Fotos de obras reales | Cargar `imagen` en `OBRAS`, poner `CONTENIDO_EJEMPLO = false` |
| Testimonios reales | Cargar `TESTIMONIOS` reales, poner `CONTENIDO_EJEMPLO = false` |
| FAQ oficial | Ajustar `FAQ_DATOS`, poner `CONTENIDO_FAQ = false` |
| Simulador de financiación | Necesita los números del plan de pago |
| LEAD_ENDPOINT | Conectar Formspree o Google Sheets para email |

---

## 4. Convenciones respetadas

- ✅ Todo en español (es-AR): comentarios, variables, contenido
- ✅ Sin dependencias nuevas, sin frameworks, sin build
- ✅ Solo Google Fonts y dolarapi.com (ya existentes)
- ✅ Estado en `estado` → `localStorage` (`aym_piscinas_config`)
- ✅ Contenido placeholder marcado con flags (`CONTENIDO_FAQ`)
- ✅ Archivos limpios (sin `?v=N`)
- ✅ Funciona offline como archivo local (`file://`)
- ✅ Logo con `onerror` fallback (no tocado)
- ✅ Contacto en fuente única (`NUMERO_WHATSAPP`, etc.)

---

## 5. Archivos modificados — resumen de cambios

### `index.html` (369 líneas, +55)
- Agregada sección "¿Entra en mi patio?" con inputs y botón verificar
- Agregada vista de perfil/corte con `<svg id="profile-svg">`
- Agregada sección FAQ con contenedor para acordeón
- Agregados selects de día y franja horaria en el formulario de contacto
- Agregado link a FAQ en el footer

### `styles.css` (685 líneas, +105)
- Estilos de "¿Entra en mi patio?": formulario, grid de resultados, items ok/no
- Estilos de vista de perfil/corte: wrapper y SVG
- Estilos de FAQ: acordeón con details/summary, chevron animado, respuestas
- Estilos de selects del formulario con dropdown chevron SVG personalizado
- Responsive para todas las nuevas secciones

### `script.js` (1475 líneas, +296)
- `CONTENIDO_FAQ` flag + `FAQ_DATOS[]` array (8 preguntas)
- `renderFAQ()` función de render del acordeón
- `buildProfileView(m)` generador SVG de corte longitudinal
- `actualizarRenderVisual()` actualizado para incluir perfil
- `estado.contacto` extendido con `dia` y `horario`
- `generarMensaje()` incluye turno de visita
- `leadInputs` extendido con `dia` y `horario`
- `initLeadForm()` compatibilidad con estados anteriores + `change` event para selects
- `enviarLeadEndpoint()` payload incluye campo `turno`
- `verificarTerreno()` lógica completa del verificador de terreno
- `MARGEN_TERRENO` constante configurable
- Event listeners para botón verificar y Enter en inputs


supabase: dtd!-tj_LSXY6.N
