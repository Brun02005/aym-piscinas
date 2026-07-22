# Prompt para Antigravity — Continuar el sitio de A&M Piscinas

> Copiá y pegá TODO lo de abajo como primer mensaje en Antigravity, con la carpeta
> del proyecto abierta. Está escrito para que retome el trabajo exactamente donde
> quedó, verifique lo hecho y complete lo que falta.

---

Sos un desarrollador que continúa un proyecto ya empezado. **No empieces de cero.**
Trabajá sobre los archivos existentes en esta carpeta y respetá el estilo y las
convenciones que ya están.

## Qué es el proyecto
Sitio web de **A&M Piscinas** (empresa multimarca de piscinas, Córdoba, Argentina).
Es un sitio **estático, sin build ni dependencias**, que se abre como archivo local
(`file://`). Archivos:
- `index.html` — estructura (3 pestañas: Catálogo, Personalizador, Presupuesto)
- `styles.css` — estilos
- `script.js` — toda la lógica (vanilla JS, sin frameworks)
- `logo.svg` — logo de la marca

**Objetivo de negocio:** convertir la compra de una piscina en una experiencia tipo
tienda online que conecta al cliente con el vendedor. El cliente elige un modelo, lo
personaliza, ve el precio y pide el presupuesto; un asesor lo contacta.

## Convenciones que TENÉS que respetar
- Todo en **español (es-AR)**. Comentarios y nombres de variables en español.
- **Sin dependencias nuevas, sin frameworks, sin build.** Solo se usan Google Fonts y
  `dolarapi.com` (cotización USD→ARS en vivo, con fallback 1400). Debe seguir andando
  como archivo local offline.
- Estado del usuario en el objeto `estado`, persistido en `localStorage`
  (`aym_piscinas_config`).
- Datos en arrays: `CATALOGO`, `OPCIONES`, `GAMAS`, `OBRAS`, `TESTIMONIOS`.
- **Contenido placeholder marcado con flags:** `PRECIOS_ILUSTRATIVOS`,
  `CONTENIDO_EJEMPLO`, y `esBoceto` en modelos. NO son datos reales; hay avisos
  visibles al usuario. No los borres: cuando llegue el contenido real, se cambian
  los flags y se cargan los datos.
- El croquis técnico (plano) se genera con `buildBlueprint(m, sfx)`.
- Contacto en una sola fuente: `NUMERO_WHATSAPP`, `USUARIO_INSTAGRAM`,
  `WHATSAPP_DISPLAY`.
- Los `<img>` del logo usan `src="logo.png"` con `onerror` que cae a `logo.svg` (si el
  dueño guarda su PNG exacto como `logo.png`, se usa automático).
- **Al probar en el navegador local, el archivo a veces queda cacheado.** Si no ves un
  cambio, agregá `?v=N` a los `<link>`/`<script>` de `index.html`, recargá, y **sacá el
  `?v=N` al terminar** para dejar los archivos limpios.

## Checklist — verificá cada punto contra el código real
Primero **revisá que lo marcado como hecho funcione de verdad** (abrí `index.html` y
probalo). Si algo está a medias o roto, arreglalo sin romper el resto.

### Ya hecho (verificar, no romper)
- [x] Catálogo con 3 gamas en acordeón
- [x] Personalizador: color, entorno, iluminación, borde, accesorios
- [x] Croquis técnico (plano) a escala, con cotas, solárium, escalones y adicionales dibujados
- [x] "Probá la piscina en tu patio": subir foto + pileta superpuesta arrastrable y escalable, con la proporción real del modelo
- [x] Presupuesto: detalle de ítems + plano + total en USD y ARS en vivo
- [x] Captura de datos del cliente (formulario) + envío por WhatsApp / Instagram (Instagram copia el presupuesto al portapapeles)
- [x] Exportar presupuesto a PDF (`window.print`) con logo, datos de contacto y el plano a todo el ancho
- [x] Quiz "Ayudame a elegir" (recomienda modelos según espacio/uso/presupuesto)
- [x] Sección "¿Cómo funciona?" + franja de confianza
- [x] Logo y favicon
- [x] Compartir diseño por link (config codificada en el hash `#d=`, SIN datos de contacto por privacidad)
- [x] Comparador de hasta 3 modelos lado a lado
- [x] Galería de "Obras realizadas" + "Testimonios" (con contenido de EJEMPLO, listo para reemplazar)

### Pendiente — implementá lo que se pueda sin material del cliente
- [ ] **"¿Entra en mi patio?"**: que el usuario ingrese las medidas de su terreno (largo x ancho) y se le muestre qué modelos del catálogo le entran (y cuáles no). Filtrar por `largo`/`ancho` de `CATALOGO`.
- [ ] **Vista de perfil / corte de la pileta**: un dibujo de costado (complemento del plano de planta) que muestre profundidad, escalones y solárium en corte. Mismo estilo que `buildBlueprint`.
- [ ] **FAQ / Preguntas frecuentes**: sección tipo acordeón (tiempos de obra, permisos municipales, mantenimiento, qué incluye el precio, garantía). Contenido genérico razonable, marcado para que el dueño ajuste.
- [ ] **Preferencia de turno** en el formulario de contacto: día y franja horaria preferida para la visita; incluirla en el mensaje de WhatsApp y en el payload del lead.

### Pendiente — requiere material/datos del dueño (dejá la estructura lista)
- [ ] Reemplazar contenido de ejemplo por real: precios reales (`PRECIOS_ILUSTRATIVOS = false`), datos reales de gama alta y baja (quitar `esBoceto`), fotos de modelos (campo `imagen` en `CATALOGO`), fotos de obras y testimonios reales (`CONTENIDO_EJEMPLO = false`, cargar `OBRAS`/`TESTIMONIOS`).
- [ ] **Simulador de financiación** real (cuotas y recargo) — necesita los números del plan de pago.
- [ ] (Opcional) Conectar `LEAD_ENDPOINT` (Formspree o una planilla de Google) para recibir los leads por email además de por WhatsApp.

## Cómo trabajar
1. Leé `index.html`, `styles.css` y `script.js` completos para entender la estructura.
2. Verificá el checklist "Ya hecho" abriendo el sitio; anotá y arreglá lo que falle.
3. Implementá los pendientes que **no** requieren material del cliente, uno por uno,
   probando cada cambio en el navegador.
4. Para lo que requiere material del dueño, dejá la estructura y datos de ejemplo
   marcados (como ya están `OBRAS`/`TESTIMONIOS`), así solo hay que reemplazar.
5. Mantené los archivos limpios (sin `?v=N`), sin dependencias nuevas, y todo debe
   seguir funcionando abriendo `index.html` directo (offline).
6. Al terminar, hacé un resumen de qué verificaste, qué arreglaste y qué implementaste.
