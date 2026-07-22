/* ============================================================
   A&M PISCINAS — lógica del prototipo
   Los precios se cargan en USD (moneda de referencia) y se
   convierten a ARS con la cotización del dólar en tiempo real.
   Estructura pensada para escalar: los datos de catálogo podrían
   venir de una API/CMS sin tocar el resto del código.
   ============================================================ */

// ---------- 0. COTIZACIÓN USD -> ARS ----------
// Se actualiza en vivo contra una API pública. Si falla (sin internet,
// API caída), se usa FALLBACK_COTIZACION para que la web nunca se rompa.
const FALLBACK_COTIZACION = 1400; // ARS por 1 USD — actualizar manualmente si hace falta
let cotizacionARS = FALLBACK_COTIZACION;

async function obtenerCotizacion() {
  try {
    // dolarapi.com — pública, sin API key. "blue" es la referencia habitual
    // para bienes de valor alto en Argentina; se puede cambiar a /oficial.
    const res = await fetch("https://dolarapi.com/v1/dolares/blue");
    const data = await res.json();
    if (data?.venta) cotizacionARS = data.venta;
  } catch {
    cotizacionARS = FALLBACK_COTIZACION;
  }
  // re-renderiza lo que esté visible para reflejar la cotización ya cargada
  document.querySelectorAll(".tab-panel.active").forEach(p => {
    if (p.id === "tab-catalogo") renderCatalogo();
    if (p.id === "tab-personalizador") renderPersonalizador();
    if (p.id === "tab-presupuesto") renderPresupuesto();
  });
}

// Formatea un monto en USD mostrando también su equivalente en ARS.
// Si el precio todavía no está cargado (null), muestra "Consultar precio".
function formatearPrecio(usd) {
  if (usd === null || usd === undefined) return `<span class="precio-pendiente">Consultar precio</span>`;
  const ars = Math.round(usd * cotizacionARS);
  return `$${ars.toLocaleString('es-AR')} ARS <span class="usd-equiv">≈ USD ${usd.toLocaleString('en-US')}</span>`;
}

// ---------- 1. DATOS DEL CATÁLOGO ----------
// A&M Piscinas trabaja como multimarca: cada gama corresponde a un
// proveedor distinto que terciarizamos.
//   - Gama media: PlastCar (datos técnicos REALES, tomados del catálogo oficial)
//   - Gama alta y baja: BOCETOS con datos y marcas de ejemplo, a reemplazar
//
// ⚠️ TODOS los precios son ILUSTRATIVOS (placeholder) hasta que se carguen
// los valores reales. Ver bandera PRECIOS_ILUSTRATIVOS más abajo.
let PRECIOS_ILUSTRATIVOS = true; // editable desde el panel de edición

// Orden en que se muestran las gamas, y su copy de presentación
const GAMAS = [
  {
    id: "alta",
    titulo: "Gama alta",
    bajada: "Hormigón proyectado y terminaciones premium. Obra a medida.",
    incluye: "Incluye proyecto, excavación, obra de hormigón e instalación del equipo de filtrado. Terminaciones a elección.",
    abiertaPorDefecto: true,
  },
  {
    id: "media",
    titulo: "Gama media",
    bajada: "Línea PlastCar en fibra de vidrio reforzada. Instalación rápida, 16 modelos.",
    incluye: "Incluye la piscina de fibra e instalación con equipo de filtrado. La excavación se cotiza según el terreno en la visita.",
    abiertaPorDefecto: true,
  },
  {
    id: "baja",
    titulo: "Gama de entrada",
    bajada: "Modelos compactos, listos para instalar. La opción más accesible.",
    incluye: "Incluye la piscina y el kit básico de filtrado. Instalación y movimiento de suelo a coordinar según el caso.",
    abiertaPorDefecto: true,
  },
];

// Orden de las líneas dentro de cada gama
const ORDEN_LINEAS = [
  "Exclusivo", "Solarium Mix", "Solarium M", "Solarium L", "Solarium XL", "Rectas",
  "Infinity", "Skimmer premium", "Compactas", "Prefabricadas",
];

let CATALOGO = [ // let: se reemplaza con los datos de Supabase si hay conexión
  // ============ GAMA ALTA — BOCETO (marcas y datos de ejemplo) ============
  { id: "hz-inf80", nombre: "Infinity 800", gama: "alta", linea: "Infinity", marca: "Hormigón a medida", largo: 8.00, ancho: 3.80, profundidad: 1.60, capacidadLitros: 42000, solarium: "2.00 x 1.20 m", escalones: 4, material: "Hormigón proyectado + revestimiento de gresite", precioBase: 24000, esBoceto: true },
  { id: "hz-inf1000", nombre: "Infinity 1000", gama: "alta", linea: "Infinity", marca: "Hormigón a medida", largo: 10.00, ancho: 4.20, profundidad: 1.80, capacidadLitros: 62000, solarium: "2.40 x 1.20 m", escalones: 4, material: "Hormigón proyectado + revestimiento de gresite", precioBase: 34000, esBoceto: true },
  { id: "hz-sk700", nombre: "Skimmer 700", gama: "alta", linea: "Skimmer premium", marca: "Hormigón a medida", largo: 7.00, ancho: 3.50, profundidad: 1.50, capacidadLitros: 32000, solarium: "1.80 x 1.00 m", escalones: 4, material: "Hormigón proyectado + microcemento", precioBase: 19500, esBoceto: true },
  { id: "hz-sk900", nombre: "Skimmer 900", gama: "alta", linea: "Skimmer premium", marca: "Hormigón a medida", largo: 9.00, ancho: 4.00, profundidad: 1.70, capacidadLitros: 52000, solarium: "2.20 x 1.20 m", escalones: 4, material: "Hormigón proyectado + microcemento", precioBase: 27500, esBoceto: true },

  // ============ GAMA MEDIA — PLASTCAR (datos reales) ============
  { id: "x300", nombre: "X300", gama: "media", linea: "Exclusivo", marca: "PlastCar", largo: 3.00, ancho: 2.00, profundidad: 1.20, capacidadLitros: 3500, solarium: "No aplica", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 4200 },

  { id: "m400", nombre: "M400", gama: "media", linea: "Solarium Mix", marca: "PlastCar", largo: 4.00, ancho: 2.30, profundidad: 1.40, capacidadLitros: 8000, solarium: "1.40 m", escalones: 4, material: "Fibra de vidrio reforzada", precioBase: 5600 },
  { id: "m465", nombre: "M465", gama: "media", linea: "Solarium Mix", marca: "PlastCar", largo: 4.65, ancho: 2.60, profundidad: 1.40, capacidadLitros: 11000, solarium: "1.25 x 0.75 m", escalones: 4, material: "Fibra de vidrio reforzada", precioBase: 6400 },
  { id: "m580", nombre: "M580", gama: "media", linea: "Solarium Mix", marca: "PlastCar", largo: 5.80, ancho: 2.80, profundidad: 1.40, capacidadLitros: 16000, solarium: "1.45 x 1.00 m", escalones: 4, material: "Fibra de vidrio reforzada", precioBase: 7800 },
  { id: "m710", nombre: "M710", gama: "media", linea: "Solarium Mix", marca: "PlastCar", largo: 7.10, ancho: 3.20, profundidad: 1.40, capacidadLitros: 24000, solarium: "1.70 x 1.00 m", escalones: 4, material: "Fibra de vidrio reforzada", precioBase: 10200 },

  { id: "s460", nombre: "S460", gama: "media", linea: "Solarium M", marca: "PlastCar", largo: 4.60, ancho: 2.50, profundidad: 1.40, capacidadLitros: 10000, solarium: "60 cm", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 6100 },
  { id: "s530", nombre: "S530", gama: "media", linea: "Solarium M", marca: "PlastCar", largo: 5.30, ancho: 2.70, profundidad: 1.40, capacidadLitros: 14000, solarium: "60 cm", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 7200 },
  { id: "s601", nombre: "S601", gama: "media", linea: "Solarium M", marca: "PlastCar", largo: 6.00, ancho: 3.10, profundidad: 1.40, capacidadLitros: 18000, solarium: "80 cm", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 8500 },

  { id: "s701", nombre: "S701", gama: "media", linea: "Solarium L", marca: "PlastCar", largo: 7.00, ancho: 3.10, profundidad: 1.40, capacidadLitros: 23000, solarium: "80 cm", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 9900 },
  { id: "s750", nombre: "S750", gama: "media", linea: "Solarium L", marca: "PlastCar", largo: 7.50, ancho: 3.25, profundidad: 1.40, capacidadLitros: 25000, solarium: "80 cm", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 10600 },

  { id: "s650", nombre: "S650", gama: "media", linea: "Solarium XL", marca: "PlastCar", largo: 6.50, ancho: 3.10, profundidad: 1.40, capacidadLitros: 22000, solarium: "1.00 m", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 9400 },
  { id: "s702", nombre: "S702", gama: "media", linea: "Solarium XL", marca: "PlastCar", largo: 7.00, ancho: 3.10, profundidad: 1.40, capacidadLitros: 23000, solarium: "1.00 m", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 10100 },
  { id: "s800", nombre: "S800", gama: "media", linea: "Solarium XL", marca: "PlastCar", largo: 8.00, ancho: 3.40, profundidad: 1.40, capacidadLitros: 27000, solarium: "1.00 m", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 11800 },
  { id: "s950", nombre: "S950", gama: "media", linea: "Solarium XL", marca: "PlastCar", largo: 9.50, ancho: 3.50, profundidad: 1.40, capacidadLitros: 36000, solarium: "1.00 m", escalones: 3, material: "Fibra de vidrio reforzada", precioBase: 14200 },

  { id: "r602", nombre: "R602", gama: "media", linea: "Rectas", marca: "PlastCar", largo: 6.00, ancho: 3.10, profundidad: 1.40, capacidadLitros: 18000, solarium: "No aplica", escalones: 4, material: "Fibra de vidrio reforzada", precioBase: 8100 },
  { id: "r700", nombre: "R700", gama: "media", linea: "Rectas", marca: "PlastCar", largo: 7.00, ancho: 3.25, profundidad: 1.40, capacidadLitros: 22000, solarium: "No aplica", escalones: 4, material: "Fibra de vidrio reforzada", precioBase: 9300 },

  // ============ GAMA DE ENTRADA — BOCETO (marcas y datos de ejemplo) ============
  { id: "cp-250", nombre: "Compacta 250", gama: "baja", linea: "Compactas", marca: "Proveedor a definir", largo: 2.50, ancho: 1.80, profundidad: 1.10, capacidadLitros: 2600, solarium: "No aplica", escalones: 2, material: "Fibra de vidrio", precioBase: 2400, esBoceto: true },
  { id: "cp-320", nombre: "Compacta 320", gama: "baja", linea: "Compactas", marca: "Proveedor a definir", largo: 3.20, ancho: 2.10, profundidad: 1.20, capacidadLitros: 4000, solarium: "No aplica", escalones: 3, material: "Fibra de vidrio", precioBase: 3100, esBoceto: true },
  { id: "pf-400", nombre: "Prefabricada 400", gama: "baja", linea: "Prefabricadas", marca: "Proveedor a definir", largo: 4.00, ancho: 2.20, profundidad: 1.20, capacidadLitros: 6000, solarium: "No aplica", escalones: 3, material: "Panel de acero + liner reforzado", precioBase: 3800, esBoceto: true },
  { id: "pf-500", nombre: "Prefabricada 500", gama: "baja", linea: "Prefabricadas", marca: "Proveedor a definir", largo: 5.00, ancho: 2.50, profundidad: 1.30, capacidadLitros: 9500, solarium: "No aplica", escalones: 3, material: "Panel de acero + liner reforzado", precioBase: 4700, esBoceto: true },
];

// ---------- 1.1 OBRAS REALIZADAS + TESTIMONIOS ----------
// Contenido de EJEMPLO para mostrar cómo se vería la galería y las reseñas.
// Reemplazar por obras/reseñas reales: cargar `imagen` con la ruta a la foto
// (ej: "obras/casa-lopez.jpg") y poner CONTENIDO_EJEMPLO en false.
let CONTENIDO_EJEMPLO = true; // editable desde el panel de edición

let OBRAS = [
  { titulo: "Piscina familiar con deck", localidad: "Villa Allende, Córdoba", modelo: "Solarium XL · 8,00 m", imagen: null },
  { titulo: "Fondo de jardín con cascada", localidad: "Córdoba Capital", modelo: "Solarium L · 7,00 m", imagen: null },
  { titulo: "Piscina compacta en patio urbano", localidad: "Nueva Córdoba", modelo: "Exclusivo · 3,00 m", imagen: null },
  { titulo: "Gama alta con borde infinito", localidad: "Mendiolaza", modelo: "Infinity · 10,00 m", imagen: null },
  { titulo: "Solárium amplio para toda la familia", localidad: "Río Ceballos", modelo: "Solarium XL · 9,50 m", imagen: null },
  { titulo: "Piscina de fibra lista en una semana", localidad: "Jesús María", modelo: "Solarium Mix · 5,80 m", imagen: null },
];

let TESTIMONIOS = [
  { texto: "El configurador nos ayudó a decidir sin presión. Llegamos a la visita técnica ya sabiendo qué queríamos.", nombre: "Familia López", localidad: "Villa Allende", estrellas: 5 },
  { texto: "Impecables de principio a fin. La piscina quedó tal cual la habíamos armado en la web.", nombre: "Marina G.", localidad: "Córdoba Capital", estrellas: 5 },
  { texto: "Nos pasaron el presupuesto al instante por WhatsApp y coordinamos la obra en pocos días.", nombre: "Diego y Sol", localidad: "Mendiolaza", estrellas: 5 },
];

function estrellas(n) {
  return `<span class="stars" aria-label="${n} de 5">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
}

function renderObras() {
  const cont = document.getElementById("obras-grid");
  if (!cont) return;
  document.getElementById("aviso-obras").hidden = !CONTENIDO_EJEMPLO;
  cont.innerHTML = OBRAS.map(o => `
    <figure class="obra-card">
      <div class="obra-foto">${o.imagen
        ? `<img src="${o.imagen}" alt="${o.titulo}" loading="lazy" onerror="this.parentNode.classList.add('obra-foto-fallback'); this.remove();">`
        : `<span>Foto de obra</span>`}</div>
      <figcaption>
        <b>${o.titulo}</b>
        <span>${o.modelo} · ${o.localidad}</span>
      </figcaption>
    </figure>
  `).join("");
}

function renderTestimonios() {
  const cont = document.getElementById("testi-grid");
  if (!cont) return;
  document.getElementById("aviso-testi").hidden = !CONTENIDO_EJEMPLO;
  cont.innerHTML = TESTIMONIOS.map(t => `
    <blockquote class="testi-card">
      ${estrellas(t.estrellas)}
      <p>“${t.texto}”</p>
      <footer><b>${t.nombre}</b><span>${t.localidad}</span></footer>
    </blockquote>
  `).join("");
}

// ---------- 1.2 FAQ / PREGUNTAS FRECUENTES ----------
// Contenido genérico razonable, marcado con flag para que el dueño ajuste.
// Cuando se cargue la información oficial, poner CONTENIDO_FAQ = false.
let CONTENIDO_FAQ = true; // editable desde el panel de edición

let FAQ_DATOS = [
  {
    pregunta: "¿Cuánto tarda la instalación de una piscina?",
    respuesta: `<p>Depende del tipo de piscina. Una piscina de fibra de vidrio puede estar instalada en <b>5 a 10 días hábiles</b> desde que arranca la obra. Las piscinas de hormigón proyectado (gama alta) llevan entre <b>30 y 60 días</b> según el tamaño y las terminaciones.</p><p>En la visita técnica te damos un cronograma detallado.</p>`,
  },
  {
    pregunta: "¿Necesito algún permiso municipal para instalar una piscina?",
    respuesta: `<p>En la mayoría de los municipios de Córdoba <b>sí se requiere un permiso de obra</b> o al menos una habilitación para excavación. Los requisitos varían según la localidad.</p><p>Nosotros te orientamos con los trámites y, si hace falta, coordinamos con un profesional matriculado para la presentación.</p>`,
  },
  {
    pregunta: "¿Qué mantenimiento requiere la piscina?",
    respuesta: `<p>El mantenimiento básico incluye:</p><p>• <b>Filtrado</b>: correr el filtro entre 6 y 8 horas diarias en temporada.</p><p>• <b>Químicos</b>: controlar el cloro y el pH semanalmente.</p><p>• <b>Limpieza</b>: barrer el fondo y limpiar el skimmer una vez por semana.</p><p>Te entregamos una guía de mantenimiento con la piscina y te acompañamos en la puesta en marcha.</p>`,
  },
  {
    pregunta: "¿Qué incluye el precio que se muestra en la web?",
    respuesta: `<p>El precio que ves es <b>orientativo</b> e incluye la piscina (con el modelo y las terminaciones elegidas) y el equipo de filtrado básico. La instalación (excavación, relleno, conexiones) se cotiza según el terreno en la visita técnica.</p><p>En la gama alta, el precio incluye además el proyecto de obra y la construcción en hormigón.</p>`,
  },
  {
    pregunta: "¿Tienen garantía las piscinas?",
    respuesta: `<p>Sí. Las piscinas de fibra de vidrio tienen <b>garantía del fabricante</b> que varía según la marca (generalmente entre 5 y 10 años sobre la estructura). Las piscinas de hormigón tienen garantía sobre la obra.</p><p>En la visita técnica te detallamos la garantía específica del modelo que elijas.</p>`,
  },
  {
    pregunta: "¿Puedo financiar la compra?",
    respuesta: `<p>Sí, trabajamos con <b>planes de pago en cuotas</b>. Las condiciones dependen del modelo y el momento, así que lo mejor es consultarnos directamente por WhatsApp o en la visita técnica para que te pasemos las opciones vigentes.</p>`,
  },
  {
    pregunta: "¿La visita técnica tiene algún costo?",
    respuesta: `<p><b>No, la visita técnica es sin cargo y sin compromiso.</b> Un asesor va a tu domicilio, mide el terreno, evalúa el acceso para la maquinaria y te confirma el presupuesto final con la instalación incluida.</p>`,
  },
  {
    pregunta: "¿Qué pasa si mi terreno tiene desnivel o poco acceso?",
    respuesta: `<p>No es problema. En la visita técnica evaluamos las condiciones del terreno (desnivel, tipo de suelo, acceso para excavadora). Si hay particularidades, ajustamos el presupuesto y te lo informamos antes de arrancar.</p>`,
  },
];

function renderFAQ() {
  const cont = document.getElementById("faq-list");
  if (!cont) return;
  document.getElementById("aviso-faq").hidden = !CONTENIDO_FAQ;
  cont.innerHTML = FAQ_DATOS.map(f => `
    <details class="faq-item">
      <summary>
        <span class="faq-chevron" aria-hidden="true">▸</span>
        ${f.pregunta}
      </summary>
      <div class="faq-answer">${f.respuesta}</div>
    </details>
  `).join("");
}

// Arma el string de dimensiones a partir de los valores numéricos
function dimensionesTexto(m) {
  return `${m.largo.toFixed(2)}m x ${m.ancho.toFixed(2)}m x ${m.profundidad.toFixed(2)}m`;
}

// Traduce el id de gama ("media") a su título legible ("Gama media")
function gamaTitulo(id) {
  return GAMAS.find(g => g.id === id)?.titulo || id;
}

// ---------- 2. OPCIONES DEL PERSONALIZADOR ----------
// precios en USD, mismos placeholders a reemplazar
const OPCIONES = {
  color: [
    { id: "azul",     nombre: "Azul clásico",  hex: "#16A2AE", precio: 0 },
    { id: "turquesa", nombre: "Turquesa",      hex: "#25C7C0", precio: 45 },
    { id: "gris",     nombre: "Gris pizarra",  hex: "#4A5A63", precio: 60 },
    { id: "blanco",   nombre: "Blanco arena",  hex: "#EDEAE2", precio: 55 },
  ],
  // Entorno: solo cambia cómo se ve el piso alrededor en la vista previa.
  // No modifica el precio (lo define el terreno real en la visita técnica).
  entorno: [
    { id: "cesped",      nombre: "Césped",       hex: "#8AA96B", precio: 0 },
    { id: "deck",        nombre: "Deck de madera", hex: "#B98A54", precio: 0 },
    { id: "porcelanato", nombre: "Porcelanato",  hex: "#DCD8CF", precio: 0 },
    { id: "hormigon",    nombre: "Hormigón",     hex: "#C9C3B8", precio: 0 },
  ],
  luz: [
    { id: "sin-luz",   nombre: "Sin iluminación", precio: 0 },
    { id: "led-blanca",nombre: "LED blanca",      precio: 180 },
    { id: "led-rgb",   nombre: "LED RGB con control", precio: 320 },
  ],
  borde: [
    { id: "borde-standard", nombre: "Borde standard", hex: "#cbb897", precio: 0 },
    { id: "borde-piedra",   nombre: "Borde piedra natural", hex: "#a9a191", precio: 240 },
    { id: "borde-porcelanato", nombre: "Borde porcelanato", hex: "#e7e2d8", precio: 210 },
  ],
  accesorios: [
    { id: "escalera",    nombre: "Escalera de acero inoxidable", precio: 150 },
    { id: "cascada",     nombre: "Cascada decorativa",          precio: 280 },
    { id: "climatizacion",nombre: "Climatización",              precio: 650 },
    { id: "cubierta",    nombre: "Cubierta automática",          precio: 720 },
  ],
};

// ---------- 3. ESTADO GLOBAL (persistido en localStorage) ----------
// Usamos localStorage (no sessionStorage) para que, si el cliente cierra la
// pestaña y vuelve mañana, retome su piscina donde la dejó.
const STORAGE_KEY = "aym_piscinas_config";

function getEstadoInicial() {
  return {
    modeloId: null,
    color: OPCIONES.color[0].id,
    entorno: OPCIONES.entorno[0].id,
    luz: OPCIONES.luz[0].id,
    borde: OPCIONES.borde[0].id,
    accesorios: [],
    contacto: { nombre: "", telefono: "", localidad: "", email: "", dia: "", horario: "" },
  };
}

function cargarEstado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEstadoInicial();
    // Merge con el inicial por si el guardado es de una versión anterior sin todos los campos
    return { ...getEstadoInicial(), ...JSON.parse(raw) };
  } catch {
    return getEstadoInicial();
  }
}

function guardarEstado() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch { /* almacenamiento lleno o bloqueado: seguimos sin persistir */ }
}

let estado = cargarEstado();

// ---------- 4. NAVEGACIÓN ENTRE PESTAÑAS ----------
// Muestra u oculta los botones de Personalizador y Presupuesto según si
// el usuario ya eligió un modelo. Así el primerizo solo ve el Catálogo.
function actualizarTabsVisibles() {
  const hayModelo = !!estado.modeloId;
  const btnPerso = document.querySelector('.tab-btn[data-tab="personalizador"]');
  const btnPresu = document.querySelector('.tab-btn[data-tab="presupuesto"]');
  if (btnPerso) btnPerso.hidden = !hayModelo;
  if (btnPresu) btnPresu.hidden = !hayModelo;
}

// Cambia la vista de pestaña sin tocar el historial (uso interno + popstate)
function _cambiarVistaTab(nombreTab) {
  actualizarTabsVisibles();
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === nombreTab));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === `tab-${nombreTab}`));
  if (nombreTab === "personalizador") renderPersonalizador();
  if (nombreTab === "presupuesto") renderPresupuesto();
}

// Cambia de pestaña Y registra en el historial (para que Atrás funcione)
function irATab(nombreTab) {
  _cambiarVistaTab(nombreTab);
  // Evitar duplicar la entrada actual en el historial
  if (!history.state || history.state.tab !== nombreTab) {
    history.pushState({ tab: nombreTab }, "");
  }
}

// Al pulsar Atrás/Adelante, volver a la pestaña correspondiente sin pushear
window.addEventListener("popstate", (e) => {
  if (e.state && e.state.tab) {
    _cambiarVistaTab(e.state.tab);
  } else {
    // Sin estado guardado → volver al catálogo (entrada inicial)
    _cambiarVistaTab("catalogo");
  }
});

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (btn) irATab(btn.dataset.tab);
});

// ---------- 5. RENDER: CATÁLOGO ----------
function renderCatalogo() {
  const cont = document.getElementById("catalogo-lista");

  const aviso = PRECIOS_ILUSTRATIVOS
    ? `<p class="aviso-precios">Los precios que se muestran son orientativos y sirven para probar el configurador. El valor final lo confirma un asesor.</p>`
    : "";

  cont.innerHTML = aviso + GAMAS.map(gama => {
    const modelosGama = CATALOGO.filter(m => m.gama === gama.id);
    if (!modelosGama.length) return "";

    // Líneas presentes en esta gama, en el orden definido
    const lineas = ORDEN_LINEAS.filter(l => modelosGama.some(m => m.linea === l));
    const esBoceto = modelosGama.every(m => m.esBoceto);

    const cuerpo = lineas.map(linea => {
      const modelos = modelosGama.filter(m => m.linea === linea);
      return `
        <div class="linea-block">
          <div class="linea-title">${linea} <span class="linea-marca">${modelos[0].marca}</span></div>
          <div class="cards-grid">
            ${modelos.map(m => `
              <div class="pool-card">
                <div class="thumb">${m.imagen
                  ? `<img src="${m.imagen}" alt="Piscina ${m.nombre}" loading="lazy" onerror="this.parentNode.classList.add('thumb-fallback'); this.remove();">`
                  : `<span>render / foto del modelo</span>`}</div>
                <div class="card-body">
                  <h3>${m.nombre}</h3>
                  <div class="meta">
                    <span>Dimensiones: ${dimensionesTexto(m)}</span>
                    <span>Capacidad: ${m.capacidadLitros.toLocaleString('es-AR')} L</span>
                    <span>Escalones: ${m.escalones} · Solarium: ${m.solarium}</span>
                    <span>Material: ${m.material}</span>
                  </div>
                  <div class="price">Desde ${formatearPrecio(m.precioBase)}</div>
                  <button class="btn-primary" data-modelo="${m.id}">Personalizar este modelo</button>
                  <label class="compare-toggle">
                    <input type="checkbox" data-compare="${m.id}" ${comparar.includes(m.id) ? "checked" : ""}> Comparar
                  </label>
                </div>
              </div>
            `).join("")}
          </div>
        </div>`;
    }).join("");

    return `
      <details class="gama-accordion" ${gama.abiertaPorDefecto ? "open" : ""}>
        <summary class="gama-summary">
          <span class="gama-chevron" aria-hidden="true">▸</span>
          <span class="gama-heading">
            <b>${gama.titulo}</b>
            ${esBoceto ? `<span class="badge-boceto">Boceto</span>` : ""}
            <span class="gama-bajada">${gama.bajada}</span>
          </span>
          <span class="gama-count">${modelosGama.length} modelos</span>
        </summary>
        <div class="gama-body">
          ${gama.incluye ? `<p class="gama-incluye">✔ ${gama.incluye}</p>` : ""}
          ${cuerpo}
        </div>
      </details>`;
  }).join("");

  cont.querySelectorAll("[data-modelo]").forEach(btn => {
    btn.addEventListener("click", () => {
      estado.modeloId = btn.dataset.modelo;
      guardarEstado();
      irATab("personalizador");
    });
  });

  cont.querySelectorAll("input[data-compare]").forEach(cb => {
    cb.addEventListener("change", () => toggleComparar(cb.dataset.compare, cb.checked));
  });
}

// ---------- 6. RENDER: PERSONALIZADOR ----------
function getModeloActual() {
  return CATALOGO.find(m => m.id === estado.modeloId) || CATALOGO[0];
}

function renderPersonalizador() {
  // Estado vacío: si el cliente no eligió modelo, mostrar invitación al catálogo
  if (!estado.modeloId) {
    document.getElementById("empty-personalizador").hidden = false;
    document.querySelector("#tab-personalizador .personalizer-grid").style.display = "none";
    return;
  }
  document.getElementById("empty-personalizador").hidden = true;
  document.querySelector("#tab-personalizador .personalizer-grid").style.display = "";

  const modelo = getModeloActual();

  document.getElementById("preview-modelo-nombre").textContent = modelo.nombre;
  document.getElementById("spec-dim").textContent = dimensionesTexto(modelo);
  document.getElementById("spec-gama").textContent = `${gamaTitulo(modelo.gama)} · ${modelo.linea}`;
  document.getElementById("spec-material").textContent = modelo.material;
  document.getElementById("spec-capacidad").textContent = `${modelo.capacidadLitros.toLocaleString('es-AR')} L`;
  document.getElementById("spec-escalones").textContent = modelo.escalones;
  document.getElementById("spec-solarium").textContent = modelo.solarium;
  document.getElementById("spec-marca").textContent = modelo.marca;

  // Swatches de color
  const colorCont = document.getElementById("opt-color");
  colorCont.innerHTML = OPCIONES.color.map(c => `
    <div class="swatch ${estado.color === c.id ? 'selected' : ''}"
         style="background:${c.hex}" data-id="${c.id}" title="${c.nombre}"></div>
  `).join("");
  colorCont.querySelectorAll(".swatch").forEach(el => {
    el.addEventListener("click", () => { estado.color = el.dataset.id; guardarEstado(); renderPersonalizador(); });
  });

  // Pills de entorno (piso del patio)
  const entornoCont = document.getElementById("opt-entorno");
  entornoCont.innerHTML = OPCIONES.entorno.map(e => `
    <div class="pill ${estado.entorno === e.id ? 'selected' : ''}" data-id="${e.id}">${e.nombre}</div>
  `).join("");
  entornoCont.querySelectorAll(".pill").forEach(el => {
    el.addEventListener("click", () => { estado.entorno = el.dataset.id; guardarEstado(); renderPersonalizador(); });
  });

  // Pills de luz
  const luzCont = document.getElementById("opt-luz");
  luzCont.innerHTML = OPCIONES.luz.map(l => `
    <div class="pill ${estado.luz === l.id ? 'selected' : ''}" data-id="${l.id}">${l.nombre}</div>
  `).join("");
  luzCont.querySelectorAll(".pill").forEach(el => {
    el.addEventListener("click", () => { estado.luz = el.dataset.id; guardarEstado(); renderPersonalizador(); });
  });

  // Pills de borde
  const bordeCont = document.getElementById("opt-borde");
  bordeCont.innerHTML = OPCIONES.borde.map(b => `
    <div class="pill ${estado.borde === b.id ? 'selected' : ''}" data-id="${b.id}">${b.nombre}</div>
  `).join("");
  bordeCont.querySelectorAll(".pill").forEach(el => {
    el.addEventListener("click", () => { estado.borde = el.dataset.id; guardarEstado(); renderPersonalizador(); });
  });

  // Checkboxes de accesorios
  const accCont = document.getElementById("opt-accesorios");
  accCont.innerHTML = OPCIONES.accesorios.map(a => `
    <label class="checkbox-item">
      <input type="checkbox" data-id="${a.id}" ${estado.accesorios.includes(a.id) ? 'checked' : ''}/>
      ${a.nombre} (+$${Math.round(a.precio * cotizacionARS).toLocaleString('es-AR')} ARS)
    </label>
  `).join("");
  accCont.querySelectorAll("input").forEach(el => {
    el.addEventListener("change", () => {
      if (el.checked) estado.accesorios.push(el.dataset.id);
      else estado.accesorios = estado.accesorios.filter(id => id !== el.dataset.id);
      guardarEstado();
      renderPersonalizador();
    });
  });

  actualizarRenderVisual();
  document.getElementById("ticker-total").innerHTML = formatearPrecio(calcularTotal());
}

// ---------- 6.2 VISTA DE PERFIL / CORTE DE LA PILETA ----------
// Dibujo de costado (complemento del plano de planta) que muestra profundidad,
// escalones y solárium en corte. Mismo estilo técnico que buildBlueprint.
function buildProfileView(m) {
  const color   = OPCIONES.color.find(c => c.id === estado.color);
  const borde   = OPCIONES.borde.find(b => b.id === estado.borde);

  const parts = [];

  // ---- Fondo papel + grilla ----
  parts.push(`
    <defs>
      <pattern id="pvgrid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M24 0H0V24" fill="none" stroke="${BP.grid}" stroke-width="1"/>
      </pattern>
      <pattern id="pvhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="${BP.ink}" stroke-width="1" opacity="0.28"/>
      </pattern>
    </defs>
    <rect width="600" height="250" fill="${BP.paper}"/>
    <rect width="600" height="250" fill="url(#pvgrid)"/>
  `);

  // ---- Layout del corte ----
  // Área de dibujo para el perfil
  const margenIzq = 80, margenDer = 40, margenTop = 40, margenBot = 50;
  const areaW = 600 - margenIzq - margenDer;
  const areaH = 250 - margenTop - margenBot;

  // Escalas: horizontal = largo del modelo, vertical = profundidad
  const escalaX = areaW / m.largo;
  const maxProf = Math.max(m.profundidad, 1.8); // para que no quede aplastado
  const escalaY = areaH / maxProf;

  const poolW = Math.round(m.largo * escalaX);
  const poolH = Math.round(m.profundidad * escalaY);
  const x0 = margenIzq; // borde izquierdo de la pileta
  const y0 = margenTop;  // línea del nivel del suelo

  // ---- Línea de nivel del suelo ----
  parts.push(`<line x1="${x0 - 30}" y1="${y0}" x2="${x0 + poolW + 30}" y2="${y0}" stroke="${BP.ink}" stroke-width="1.5" stroke-dasharray="6 4" opacity=".5"/>`);
  parts.push(`<text x="${x0 - 32}" y="${y0 + 4}" font-family="${BP.mono}" font-size="9" fill="${BP.ink}" text-anchor="end" opacity=".6">NIVEL</text>`);
  parts.push(`<text x="${x0 - 32}" y="${y0 + 14}" font-family="${BP.mono}" font-size="9" fill="${BP.ink}" text-anchor="end" opacity=".6">SUELO</text>`);

  // ---- Solárium en corte ----
  let solariumW = 0;
  if (m.solarium && m.solarium !== "No aplica") {
    solariumW = Math.min(Math.round(poolW * 0.22), 90);
    const solariumH = Math.round(poolH * 0.28);
    // Zona de solárium: parte elevada (menos profunda)
    parts.push(`<rect x="${x0}" y="${y0}" width="${solariumW}" height="${solariumH}" fill="url(#pvhatch)" stroke="${BP.ink}" stroke-width="1.2"/>`);
    parts.push(`<rect x="${x0}" y="${y0}" width="${solariumW}" height="${solariumH}" fill="${color.hex}" fill-opacity="0.08"/>`);
    // Escalón que baja del solárium a la zona profunda
    parts.push(`<line x1="${x0 + solariumW}" y1="${y0 + solariumH}" x2="${x0 + solariumW}" y2="${y0 + poolH}" stroke="${BP.ink}" stroke-width="1.5"/>`);
    // Rótulo solárium
    parts.push(`<text x="${x0 + solariumW / 2}" y="${y0 + solariumH / 2 + 3}" font-family="${BP.mono}" font-size="8" fill="${BP.ink}" text-anchor="middle" opacity=".7">SOL</text>`);
    // Pared izquierda del solárium
    parts.push(`<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + solariumH}" stroke="${BP.ink}" stroke-width="2"/>`);
    // Fondo del solárium
    parts.push(`<line x1="${x0}" y1="${y0 + solariumH}" x2="${x0 + solariumW}" y2="${y0 + solariumH}" stroke="${BP.ink}" stroke-width="1.5"/>`);
  } else {
    // Sin solárium: pared izquierda recta
    parts.push(`<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + poolH}" stroke="${BP.ink}" stroke-width="2"/>`);
  }

  // ---- Fondo de la pileta ----
  const fondoY = y0 + poolH;
  const fondoX1 = solariumW ? x0 + solariumW : x0;
  // Rellenar zona de agua
  if (solariumW) {
    // Zona solárium (agua poco profunda)
    const solariumH = Math.round(poolH * 0.28);
    parts.push(`<rect x="${x0 + 1}" y="${y0 + 1}" width="${solariumW - 1}" height="${solariumH - 1}" fill="${color.hex}" fill-opacity="0.06"/>`);
    // Zona profunda
    parts.push(`<rect x="${x0 + solariumW + 1}" y="${y0 + 1}" width="${poolW - solariumW - 1}" height="${poolH - 1}" fill="${color.hex}" fill-opacity="0.08"/>`);
  } else {
    parts.push(`<rect x="${x0 + 1}" y="${y0 + 1}" width="${poolW - 1}" height="${poolH - 1}" fill="${color.hex}" fill-opacity="0.08"/>`);
  }
  // Línea de fondo
  parts.push(`<line x1="${fondoX1}" y1="${fondoY}" x2="${x0 + poolW}" y2="${fondoY}" stroke="${BP.ink}" stroke-width="2"/>`);

  // ---- Pared derecha ----
  parts.push(`<line x1="${x0 + poolW}" y1="${y0}" x2="${x0 + poolW}" y2="${fondoY}" stroke="${BP.ink}" stroke-width="2"/>`);

  // ---- Escalones en corte (lado derecho, bajando) ----
  const nEsc = Math.min(m.escalones || 0, 5);
  if (nEsc > 0) {
    const escStepH = poolH / (nEsc + 1);
    const escStepW = Math.min(24, poolW / (nEsc + 2));
    const escX0 = x0 + poolW - escStepW * nEsc;
    for (let s = 0; s < nEsc; s++) {
      const sx = escX0 + s * escStepW;
      const sy = y0 + (s + 1) * escStepH;
      // Peldaño horizontal
      parts.push(`<line x1="${sx}" y1="${sy}" x2="${sx + escStepW}" y2="${sy}" stroke="${BP.ink}" stroke-width="1.3" opacity=".8"/>`);
      // Peldaño vertical
      if (s > 0) {
        parts.push(`<line x1="${sx}" y1="${y0 + s * escStepH}" x2="${sx}" y2="${sy}" stroke="${BP.ink}" stroke-width="1.3" opacity=".8"/>`);
      }
    }
    // Rótulo
    parts.push(`<text x="${escX0 + (escStepW * nEsc) / 2}" y="${y0 - 6}" font-family="${BP.mono}" font-size="8" fill="${BP.ink}" text-anchor="middle" opacity=".7">${m.escalones} esc.</text>`);
  }

  // ---- Ondas de agua ----
  const nivelAgua = y0 + 4;
  parts.push(`<path d="M${x0 + 4} ${nivelAgua} q ${poolW / 8} -3 ${poolW / 4} 0 t ${poolW / 4} 0 t ${poolW / 4} 0 t ${poolW / 4} 0" fill="none" stroke="${BP.ink}" stroke-width="1" opacity=".2"/>`);

  // ---- Borde (coronamiento) ----
  const bordeH = 5;
  parts.push(`<rect x="${x0 - 6}" y="${y0 - bordeH}" width="${poolW + 12}" height="${bordeH}" fill="${borde.hex}" stroke="${BP.ink}" stroke-width="1" rx="2"/>`);
  parts.push(`<text x="${x0 + poolW + 12}" y="${y0 - 1}" font-family="${BP.mono}" font-size="8" fill="${BP.ink}" opacity=".7">Borde</text>`);

  // ---- Cotas: profundidad (vertical, a la izquierda) ----
  const cotaX = x0 - 22;
  parts.push(`<line x1="${cotaX}" y1="${y0}" x2="${cotaX}" y2="${fondoY}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<line x1="${cotaX - 4}" y1="${y0}" x2="${cotaX + 4}" y2="${y0}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<line x1="${cotaX - 4}" y1="${fondoY}" x2="${cotaX + 4}" y2="${fondoY}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<rect x="${cotaX - 18}" y="${y0 + poolH / 2 - 7}" width="36" height="14" fill="${BP.paper}"/>`);
  parts.push(`<text x="${cotaX}" y="${y0 + poolH / 2 + 3}" font-family="${BP.mono}" font-size="10" fill="${BP.ink}" text-anchor="middle" font-weight="600">${m.profundidad.toFixed(2)} m</text>`);

  // ---- Cotas: largo (horizontal, abajo) ----
  const cotaY = fondoY + 22;
  parts.push(`<line x1="${x0}" y1="${cotaY}" x2="${x0 + poolW}" y2="${cotaY}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<line x1="${x0}" y1="${cotaY - 4}" x2="${x0}" y2="${cotaY + 4}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<line x1="${x0 + poolW}" y1="${cotaY - 4}" x2="${x0 + poolW}" y2="${cotaY + 4}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<rect x="${x0 + poolW / 2 - 22}" y="${cotaY - 7}" width="44" height="14" fill="${BP.paper}"/>`);
  parts.push(`<text x="${x0 + poolW / 2}" y="${cotaY + 4}" font-family="${BP.mono}" font-size="10" fill="${BP.ink}" text-anchor="middle" font-weight="600">${m.largo.toFixed(2)} m</text>`);

  // ---- Rótulo ----
  parts.push(`<text x="20" y="245" font-family="${BP.mono}" font-size="8" fill="${BP.ink}" opacity=".5">CORTE LONGITUDINAL ESQUEMÁTICO · ${m.nombre} · Prof. ${m.profundidad.toFixed(2)} m</text>`);

  return parts.join("");
}

// Dibuja el croquis técnico (plano) del modelo. Pensado como reemplazo
// honesto de renders/IA: usa las medidas reales del modelo para dibujar la
// pileta a escala y va marcando en el plano cada opción y adicional elegido.
// El día de mañana, esto se puede reemplazar por un render/PNG sin tocar el resto.
function actualizarRenderVisual() {
  document.getElementById("pool-svg").innerHTML = buildBlueprint(getModeloActual());
  // Vista de perfil / corte
  const profileSvg = document.getElementById("profile-svg");
  if (profileSvg) profileSvg.innerHTML = buildProfileView(getModeloActual());
  // Si el cliente está probando la piscina sobre la foto de su patio,
  // mantenemos la piscina superpuesta con los mismos colores elegidos.
  if (patioActivo) dibujarPoolOverlay();
}

// Paleta del plano (monocromo tinta sobre papel + un acento azul sobrio)
const BP = { ink: "#0B1221", paper: "#F4F6FA", grid: "rgba(28,111,228,.08)", acc: "#16346E", mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' };

function buildBlueprint(m, sfx = "") {
  const color   = OPCIONES.color.find(c => c.id === estado.color);
  const borde   = OPCIONES.borde.find(b => b.id === estado.borde);
  const entorno = OPCIONES.entorno.find(e => e.id === estado.entorno) || OPCIONES.entorno[0];
  const luz     = OPCIONES.luz.find(l => l.id === estado.luz);
  const has = id => estado.accesorios.includes(id);

  // ---- Layout y escala: la pileta se dibuja proporcional a largo x ancho ----
  const ax = 96, ay = 44, aw = 372, ah = 196;               // área de dibujo
  const scale = Math.min(aw / m.largo, ah / m.ancho);
  const pw = Math.round(m.largo * scale), ph = Math.round(m.ancho * scale);
  const px = Math.round(ax + (aw - pw) / 2), py = Math.round(ay + (ah - ph) / 2);
  const ix = px + 7, iy = py + 7, iw = pw - 14, ih = ph - 14;  // agua (interior del borde)
  const cx = px + pw / 2, cy = py + ph / 2;

  const T = (x, y, txt, opt = {}) =>
    `<text x="${x}" y="${y}" font-family="${BP.mono}" font-size="${opt.s || 10}" fill="${opt.fill || BP.ink}" text-anchor="${opt.a || 'start'}"${opt.w ? ` font-weight="${opt.w}"` : ""}${opt.o ? ` opacity="${opt.o}"` : ""}${opt.r ? ` transform="rotate(${opt.r} ${x} ${y})"` : ""}>${txt}</text>`;

  const parts = [];

  // ---- Fondo papel + grilla ----
  parts.push(`
    <defs>
      <pattern id="bpgrid${sfx}" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M24 0H0V24" fill="none" stroke="${BP.grid}" stroke-width="1"/>
      </pattern>
      <pattern id="bphatch${sfx}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="${BP.ink}" stroke-width="1" opacity="0.28"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="${BP.paper}"/>
    <rect width="600" height="400" fill="url(#bpgrid${sfx})"/>`);

  // ---- Entorno: límite del terreno (dashed) + rótulo ----
  parts.push(`<rect x="${px - 22}" y="${py - 22}" width="${pw + 44}" height="${ph + 44}" fill="none" stroke="${BP.ink}" stroke-width="1" stroke-dasharray="3 5" opacity=".45"/>`);
  parts.push(T(px - 22, py - 28, `TERRENO · ${entorno.nombre.toUpperCase()}`, { s: 9, o: .6 }));

  // ---- Pileta: borde (doble línea) + agua con leve tinte del color elegido ----
  parts.push(`<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="12" fill="none" stroke="${BP.ink}" stroke-width="2.5"/>`);
  parts.push(`<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="7" fill="${color.hex}" fill-opacity="0.12" stroke="${BP.ink}" stroke-width="1.2"/>`);

  // Líneas de agua (ondas sutiles)
  for (let k = 1; k <= 3; k++) {
    const wy = iy + (ih * k) / 4;
    parts.push(`<path d="M${ix + 6} ${wy} q ${iw / 6} -5 ${iw / 3} 0 t ${iw / 3} 0 t ${iw / 3} 0" fill="none" stroke="${BP.ink}" stroke-width="1" opacity=".18"/>`);
  }

  // ---- Solárium (si aplica): franja hatched sobre un extremo ----
  if (m.solarium && m.solarium !== "No aplica") {
    const sw = Math.min(Math.round(iw * 0.26), 58);
    parts.push(`<rect x="${ix}" y="${iy}" width="${sw}" height="${ih}" fill="url(#bphatch${sfx})" stroke="${BP.ink}" stroke-width="1" stroke-dasharray="2 2"/>`);
    parts.push(T(ix + sw / 2, iy + ih / 2, "SOLÁRIUM", { s: 8, a: "middle", o: .7, r: -90 }));
  }

  // ---- Escalones: peldaños en una esquina interna ----
  const nEsc = Math.min(m.escalones || 0, 4);
  for (let s = 0; s < nEsc; s++) {
    const off = 8 + s * 7;
    parts.push(`<path d="M${ix + iw - off} ${iy + ih - 4} L${ix + iw - off} ${iy + ih - off} L${ix + iw - 4} ${iy + ih - off}" fill="none" stroke="${BP.ink}" stroke-width="1.2" opacity=".8"/>`);
  }
  if (nEsc) parts.push(T(ix + iw - 6, iy + ih + 12, `${m.escalones} escalones`, { s: 8, a: "end", o: .7 }));

  // ---- Iluminación: focos sobre las paredes largas ----
  if (estado.luz !== "sin-luz") {
    const n = 4;
    for (let i = 0; i < n; i++) {
      const lx = ix + (iw * (i + 0.5)) / n;
      parts.push(`<circle cx="${lx}" cy="${iy + 5}" r="2.6" fill="${BP.ink}"/>`);
      parts.push(`<circle cx="${lx}" cy="${iy + ih - 5}" r="2.6" fill="${BP.ink}"/>`);
    }
  }

  // ---- Adicionales dibujados sobre el plano ----
  // Cascada: vertedero en el borde superior + flechas
  if (has("cascada")) {
    parts.push(`<rect x="${cx - 12}" y="${py - 7}" width="24" height="7" fill="none" stroke="${BP.ink}" stroke-width="1.4"/>`);
    for (let a = -1; a <= 1; a++) parts.push(`<line x1="${cx + a * 7}" y1="${py}" x2="${cx + a * 7}" y2="${py + 9}" stroke="${BP.ink}" stroke-width="1"/>`);
    parts.push(T(cx + 18, py - 4, "Cascada", { s: 8, o: .75 }));
  }
  // Escalera: en la pared derecha
  if (has("escalera")) {
    const ex = px + pw - 8, ey = cy;
    parts.push(`<line x1="${ex}" y1="${ey - 12}" x2="${ex}" y2="${ey + 12}" stroke="${BP.ink}" stroke-width="1.3"/>`);
    parts.push(`<line x1="${ex - 5}" y1="${ey - 12}" x2="${ex - 5}" y2="${ey + 12}" stroke="${BP.ink}" stroke-width="1.3"/>`);
    for (let r = -1; r <= 1; r++) parts.push(`<line x1="${ex - 5}" y1="${ey + r * 7}" x2="${ex}" y2="${ey + r * 7}" stroke="${BP.ink}" stroke-width="1.3"/>`);
    parts.push(T(px + pw + 8, cy + 3, "Escalera", { s: 8, o: .75 }));
  }
  // Cubierta: capa punteada sobre la pileta + rodillo en un extremo (el rótulo va en el cajetín)
  if (has("cubierta")) {
    parts.push(`<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="12" fill="none" stroke="${BP.acc}" stroke-width="1.4" stroke-dasharray="6 4"/>`);
    parts.push(`<rect x="${px - 4}" y="${py + 4}" width="8" height="${ph - 8}" rx="4" fill="none" stroke="${BP.acc}" stroke-width="1.4"/>`);
    parts.push(T(px + 6, py + 13, "Cubierta", { s: 8, fill: BP.acc, o: .9 }));
  }
  // Climatización: equipo con símbolo de temperatura, fuera de la pileta (derecha)
  if (has("climatizacion")) {
    const qx = px + pw + 10, qy = py + 6;
    parts.push(`<rect x="${qx}" y="${qy}" width="34" height="24" rx="3" fill="none" stroke="${BP.ink}" stroke-width="1.3"/>`);
    parts.push(`<path d="M${qx + 6} ${qy + 15} q 3 -6 6 0 t 6 0 t 6 0" fill="none" stroke="${BP.ink}" stroke-width="1.2"/>`);
    parts.push(`<line x1="${px + pw}" y1="${py + 12}" x2="${qx}" y2="${qy + 12}" stroke="${BP.ink}" stroke-width="1" stroke-dasharray="2 2"/>`);
    parts.push(T(qx + 17, qy + 36, "Climatización", { s: 8, a: "middle", o: .75 }));
  }

  // ---- Cotas (dimension lines) con medidas reales ----
  // Largo (abajo)
  const dy = py + ph + 20;
  parts.push(`<line x1="${px}" y1="${dy}" x2="${px + pw}" y2="${dy}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<line x1="${px}" y1="${dy - 4}" x2="${px}" y2="${dy + 4}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<line x1="${px + pw}" y1="${dy - 4}" x2="${px + pw}" y2="${dy + 4}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<rect x="${cx - 26}" y="${dy - 8}" width="52" height="15" fill="${BP.paper}"/>`);
  parts.push(T(cx, dy + 3, `${m.largo.toFixed(2)} m`, { s: 10, a: "middle", w: 600 }));
  // Ancho (izquierda)
  const dx = px - 18;
  parts.push(`<line x1="${dx}" y1="${py}" x2="${dx}" y2="${py + ph}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<line x1="${dx - 4}" y1="${py}" x2="${dx + 4}" y2="${py}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<line x1="${dx - 4}" y1="${py + ph}" x2="${dx + 4}" y2="${py + ph}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(T(dx - 4, cy, `${m.ancho.toFixed(2)} m`, { s: 10, a: "middle", w: 600, r: -90 }));

  // ---- Cajetín (title block) tipo plano ----
  const by = 300, bh = 84;
  parts.push(`<rect x="20" y="${by}" width="560" height="${bh}" fill="none" stroke="${BP.ink}" stroke-width="1.5"/>`);
  parts.push(`<line x1="220" y1="${by}" x2="220" y2="${by + bh}" stroke="${BP.ink}" stroke-width="1"/>`);
  parts.push(`<line x1="410" y1="${by}" x2="410" y2="${by + bh}" stroke="${BP.ink}" stroke-width="1"/>`);
  // Celda 1: modelo
  parts.push(T(32, by + 20, "MODELO", { s: 8, o: .55 }));
  parts.push(T(32, by + 40, m.nombre, { s: 17, w: 700 }));
  parts.push(T(32, by + 58, `${m.marca}`, { s: 9, o: .7 }));
  parts.push(T(32, by + 74, `${gamaTitulo(m.gama)} · ${m.linea}`, { s: 9, o: .7 }));
  // Celda 2: datos técnicos
  parts.push(T(232, by + 20, "FICHA TÉCNICA", { s: 8, o: .55 }));
  parts.push(T(232, by + 38, `Prof.: ${m.profundidad.toFixed(2)} m`, { s: 9 }));
  parts.push(T(232, by + 52, `Cap.: ${m.capacidadLitros.toLocaleString('es-AR')} L`, { s: 9 }));
  parts.push(T(232, by + 66, `Sol.: ${m.solarium}`, { s: 9 }));
  parts.push(T(232, by + 80, `Mat.: ${m.material.length > 22 ? m.material.slice(0, 22) + "…" : m.material}`, { s: 9 }));
  // Celda 3: terminaciones + adicionales elegidos
  const adic = estado.accesorios.map(id => OPCIONES.accesorios.find(a => a.id === id)?.nombre.split(" ")[0]).filter(Boolean);
  const adicJoin = adic.join(", ");
  const adicTxt = !adic.length ? "Sin adicionales"
    : adicJoin.length <= 22 ? `Adic.: ${adicJoin}`
    : `Adic.: ${adic.length} seleccionados`;
  parts.push(T(422, by + 20, "TERMINACIONES", { s: 8, o: .55 }));
  parts.push(T(422, by + 36, `Revest.: ${color.nombre}`, { s: 9 }));
  parts.push(T(422, by + 49, `Borde: ${borde.nombre}`, { s: 9 }));
  parts.push(T(422, by + 62, `Luz: ${luz.nombre}`, { s: 9 }));
  parts.push(T(422, by + 76, adicTxt, { s: 9, o: adic.length ? 1 : .6 }));

  // Nota honesta
  parts.push(T(20, 396, "CROQUIS ESQUEMÁTICO A ESCALA APROX. · Medidas y terminaciones se confirman en la visita técnica.", { s: 8, o: .5 }));

  return parts.join("");
}

// ---------- 6.1 PROBÁ LA PISCINA EN TU PATIO ----------
// El cliente sube una foto de su patio y ubicamos la piscina encima
// (arrastrable y escalable). No se persiste la imagen para no llenar
// el almacenamiento; si recarga, vuelve a subirla.
let patioActivo = false;
const overlayEl = document.getElementById("pool-overlay");
const stageEl = document.getElementById("render-stage");

// Genera el SVG de la piscina para superponer sobre la foto del patio.
// Usa la PROPORCIÓN REAL del modelo (vista superior largo x ancho) y los
// colores elegidos, para que lo que se apoya sobre la foto coincida con la
// pileta que el cliente está configurando.
function poolOverlaySVG() {
  const m = getModeloActual();
  const color = OPCIONES.color.find(c => c.id === estado.color);
  const borde = OPCIONES.borde.find(b => b.id === estado.borde);
  const opLuz = estado.luz === "sin-luz" ? 0 : estado.luz === "led-blanca" ? 0.22 : 0.32;

  const vbW = 300;
  const vbH = Math.max(70, Math.round(vbW * (m.ancho / m.largo))); // alto proporcional al modelo
  const bw = Math.round(vbW * 0.045);                              // grosor del borde
  const rOut = Math.min(30, vbH * 0.22), rIn = Math.min(22, vbH * 0.16);
  const iw = vbW - 8 - 2 * bw, ih = vbH - 8 - 2 * bw;

  return `
    <svg viewBox="0 0 ${vbW} ${vbH + 22}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="${vbW / 2}" cy="${vbH + 10}" rx="${vbW * 0.46}" ry="11" fill="rgba(10,37,48,.28)"/>
      <rect x="4" y="4" width="${vbW - 8}" height="${vbH - 8}" rx="${rOut}" fill="${borde.hex}"/>
      <rect x="${4 + bw}" y="${4 + bw}" width="${iw}" height="${ih}" rx="${rIn}" fill="${color.hex}"/>
      <ellipse cx="${vbW / 2}" cy="${4 + bw + ih * 0.42}" rx="${iw * 0.36}" ry="${ih * 0.3}" fill="#ffffff" opacity="${opLuz}" style="mix-blend-mode:screen"/>
    </svg>`;
}

function dibujarPoolOverlay() {
  overlayEl.innerHTML = poolOverlaySVG();
  if (!overlayEl.hidden) clampOverlay(); // la altura cambió con la proporción: reencuadrar
}

function entrarModoPatio(dataURL) {
  patioActivo = true;
  const bg = document.getElementById("patio-bg");
  bg.src = dataURL;
  bg.hidden = false;
  overlayEl.hidden = false;
  stageEl.classList.add("photo-mode");
  document.getElementById("patio-clear").hidden = false;
  document.getElementById("patio-size-wrap").hidden = false;
  document.getElementById("btn-patio-label").firstChild.textContent = "📷 Cambiar foto ";

  dibujarPoolOverlay();
  // Posición y tamaño iniciales: centrada en la mitad inferior del patio
  const size = +document.getElementById("patio-size").value;
  aplicarTamañoOverlay(size);
  const st = stageEl.getBoundingClientRect();
  overlayEl.style.left = (st.width - overlayEl.offsetWidth) / 2 + "px";
  overlayEl.style.top = st.height * 0.5 + "px";
  clampOverlay();
}

function salirModoPatio() {
  patioActivo = false;
  document.getElementById("patio-bg").hidden = true;
  document.getElementById("patio-bg").removeAttribute("src");
  overlayEl.hidden = true;
  stageEl.classList.remove("photo-mode");
  document.getElementById("patio-clear").hidden = true;
  document.getElementById("patio-size-wrap").hidden = true;
  document.getElementById("btn-patio-label").firstChild.textContent = "📷 Probá la piscina en tu patio ";
  document.getElementById("patio-input").value = "";
}

function aplicarTamañoOverlay(pct) {
  const st = stageEl.getBoundingClientRect();
  overlayEl.style.width = (st.width * pct / 100) + "px";
}

// Mantiene la piscina dentro de los límites del escenario
function clampOverlay() {
  const st = stageEl.getBoundingClientRect();
  const maxL = st.width - overlayEl.offsetWidth;
  const maxT = st.height - overlayEl.offsetHeight;
  let l = parseFloat(overlayEl.style.left) || 0;
  let t = parseFloat(overlayEl.style.top) || 0;
  overlayEl.style.left = Math.max(0, Math.min(l, maxL)) + "px";
  overlayEl.style.top = Math.max(0, Math.min(t, maxT)) + "px";
}

// Carga de la foto
document.getElementById("patio-input").addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => entrarModoPatio(reader.result);
  reader.readAsDataURL(file);
});

document.getElementById("patio-clear").addEventListener("click", salirModoPatio);

document.getElementById("patio-size").addEventListener("input", (e) => {
  aplicarTamañoOverlay(+e.target.value);
  clampOverlay();
});

// Arrastrar la piscina con mouse o dedo (pointer events)
let dragData = null;
overlayEl.addEventListener("pointerdown", (e) => {
  if (!patioActivo) return;
  const st = stageEl.getBoundingClientRect();
  dragData = {
    offsetX: e.clientX - st.left - (parseFloat(overlayEl.style.left) || 0),
    offsetY: e.clientY - st.top - (parseFloat(overlayEl.style.top) || 0),
  };
  overlayEl.setPointerCapture(e.pointerId);
});
overlayEl.addEventListener("pointermove", (e) => {
  if (!dragData) return;
  const st = stageEl.getBoundingClientRect();
  overlayEl.style.left = (e.clientX - st.left - dragData.offsetX) + "px";
  overlayEl.style.top = (e.clientY - st.top - dragData.offsetY) + "px";
  clampOverlay();
});
overlayEl.addEventListener("pointerup", () => { dragData = null; });
overlayEl.addEventListener("pointercancel", () => { dragData = null; });

document.getElementById("btn-ver-presupuesto").addEventListener("click", () => irATab("presupuesto"));

// ---------- 7. CÁLCULO DE PRESUPUESTO ----------
function calcularTotal() {
  const modelo = getModeloActual();
  if (modelo.precioBase === null || modelo.precioBase === undefined) return null;
  let total = modelo.precioBase;
  total += OPCIONES.color.find(c => c.id === estado.color)?.precio || 0;
  total += OPCIONES.luz.find(l => l.id === estado.luz)?.precio || 0;
  total += OPCIONES.borde.find(b => b.id === estado.borde)?.precio || 0;
  estado.accesorios.forEach(id => {
    total += OPCIONES.accesorios.find(a => a.id === id)?.precio || 0;
  });
  return total;
}

function armarDetalle() {
  const modelo = getModeloActual();
  const color = OPCIONES.color.find(c => c.id === estado.color);
  const entorno = OPCIONES.entorno.find(e => e.id === estado.entorno) || OPCIONES.entorno[0];
  const luz = OPCIONES.luz.find(l => l.id === estado.luz);
  const borde = OPCIONES.borde.find(b => b.id === estado.borde);
  const accesorios = estado.accesorios.map(id => OPCIONES.accesorios.find(a => a.id === id));

  const filas = [
    { item: "Modelo base", detalle: `${modelo.nombre} — ${modelo.marca} (${modelo.linea})`, precio: modelo.precioBase },
    { item: "Revestimiento", detalle: color.nombre, precio: color.precio },
    { item: "Entorno", detalle: entorno.nombre, precio: entorno.precio },
    { item: "Iluminación", detalle: luz.nombre, precio: luz.precio },
    { item: "Borde", detalle: borde.nombre, precio: borde.precio },
    ...accesorios.map(a => ({ item: "Accesorio", detalle: a.nombre, precio: a.precio })),
  ];
  return filas;
}

function renderPresupuesto() {
  // Estado vacío: si el cliente no eligió modelo, mostrar invitación al catálogo
  if (!estado.modeloId) {
    document.getElementById("empty-presupuesto").hidden = false;
    document.querySelector("#tab-presupuesto .budget-wrap").style.display = "none";
    return;
  }
  document.getElementById("empty-presupuesto").hidden = true;
  document.querySelector("#tab-presupuesto .budget-wrap").style.display = "";

  // Croquis técnico de la configuración elegida (mismo generador que el personalizador)
  const plano = document.getElementById("budget-plano");
  if (plano) plano.innerHTML = buildBlueprint(getModeloActual(), "b");

  const filas = armarDetalle();
  const cont = document.getElementById("presupuesto-detalle");
  cont.innerHTML = filas.map(f => `
    <div class="bp-row">
      <span>${f.item}</span>
      <span>${f.detalle}</span>
      <span>${f.precio ? '$' + Math.round(f.precio * cotizacionARS).toLocaleString('es-AR') + ' <span class="usd-equiv">≈ USD ' + f.precio.toLocaleString('en-US') + '</span>' : '—'}</span>
    </div>
  `).join("");
  document.getElementById("bp-total").innerHTML = formatearPrecio(calcularTotal());
}

// ---------- 8. MENSAJE DE WHATSAPP / INSTAGRAM ----------
function generarMensaje() {
  const modelo = getModeloActual();
  const color = OPCIONES.color.find(c => c.id === estado.color);
  const entorno = OPCIONES.entorno.find(e => e.id === estado.entorno) || OPCIONES.entorno[0];
  const luz = OPCIONES.luz.find(l => l.id === estado.luz);
  const borde = OPCIONES.borde.find(b => b.id === estado.borde);
  const accesorios = estado.accesorios.map(id => OPCIONES.accesorios.find(a => a.id === id)?.nombre);
  const totalUSD = calcularTotal();
  const lineaPrecio = totalUSD === null
    ? "A confirmar con un asesor"
    : `$${Math.round(totalUSD * cotizacionARS).toLocaleString('es-AR')} ARS (≈ USD ${totalUSD.toLocaleString('en-US')})`;  

  const c = estado.contacto || {};
  const datosContacto = (c.nombre || c.telefono || c.localidad || c.email)
    ? `\n\n👤 Mis datos:${c.nombre ? `\nNombre: ${c.nombre}` : ""}${c.telefono ? `\nTel: ${c.telefono}` : ""}${c.localidad ? `\nLocalidad: ${c.localidad}` : ""}${c.email ? `\nEmail: ${c.email}` : ""}`
    : "";

  const turno = (c.dia || c.horario)
    ? `\n\n🗓️ Preferencia de visita:${c.dia ? ` ${c.dia}` : ""}${c.horario ? ` · ${c.horario}` : ""}`
    : "";

  return `¡Hola! 👋 Quiero armar mi piscina ideal.

🏊 Modelo: ${modelo.nombre} — ${modelo.marca} (${gamaTitulo(modelo.gama)}, línea ${modelo.linea})
📐 Dimensiones: ${dimensionesTexto(modelo)}
🎨 Revestimiento: ${color.nombre}
🌳 Entorno: ${entorno.nombre}
💡 Iluminación: ${luz.nombre}
🔲 Borde: ${borde.nombre}${accesorios.length ? `\n➕ Accesorios: ${accesorios.join(", ")}` : ""}

💰 Presupuesto estimado: ${lineaPrecio}${datosContacto}${turno}

¿Podemos coordinar una visita o llamada para avanzar?`;
}

// Número real de A&M Piscinas, formato internacional sin "+" ni espacios.
// Son `let` porque el panel de edición puede sobrescribirlos.
let NUMERO_WHATSAPP = "5493513394942";
let USUARIO_INSTAGRAM = "savarella_bruno";
// Versión legible del teléfono para mostrar (encabezado del PDF, etc.)
let WHATSAPP_DISPLAY = "+54 9 351 339 4942";

// Endpoint opcional para recibir los leads también por email/planilla (ej. Formspree).
// Dejar "" para desactivarlo; el lead siempre viaja igual dentro del mensaje de WhatsApp.
const LEAD_ENDPOINT = "";

// ---------- 8.1 FORMULARIO DE CONTACTO (LEAD) ----------
const leadInputs = {
  nombre: document.getElementById("lead-nombre"),
  telefono: document.getElementById("lead-tel"),
  localidad: document.getElementById("lead-localidad"),
  email: document.getElementById("lead-email"),
  dia: document.getElementById("lead-dia"),
  horario: document.getElementById("lead-horario"),
};

// Vuelca los datos guardados en los inputs (solo si están vacíos, para no
// pisar lo que el cliente esté tipeando)
function prefillLeadForm() {
  const c = estado.contacto || {};
  Object.keys(leadInputs).forEach(k => {
    if (leadInputs[k] && !leadInputs[k].value) leadInputs[k].value = c[k] || "";
  });
}

// Precarga los datos guardados y los persiste mientras el cliente escribe
function initLeadForm() {
  if (!estado.contacto) estado.contacto = { nombre: "", telefono: "", localidad: "", email: "", dia: "", horario: "" };
  // Asegurar que existan los campos nuevos en estados guardados de versiones anteriores
  if (estado.contacto.dia === undefined) estado.contacto.dia = "";
  if (estado.contacto.horario === undefined) estado.contacto.horario = "";
  prefillLeadForm();
  Object.keys(leadInputs).forEach(k => {
    const el = leadInputs[k];
    if (!el) return;
    const evtType = (el.tagName === "SELECT") ? "change" : "input";
    el.addEventListener(evtType, () => {
      if (el.classList) el.classList.remove("invalid");
      document.getElementById("lead-error").hidden = true;
      estado.contacto[k] = el.value.trim();
      guardarEstado();
    });
  });
  // Al recargar, algunos navegadores restauran los inputs a vacío DESPUÉS de
  // este script; reaplicamos los datos cuando el navegador restaura la página.
  window.addEventListener("pageshow", prefillLeadForm);
}

// Pide al menos nombre + un medio de contacto (tel o email) antes de enviar
function validarLead() {
  const c = estado.contacto || {};
  const errorEl = document.getElementById("lead-error");
  const faltaNombre = !c.nombre;
  const faltaContacto = !c.telefono && !c.email;
  leadInputs.nombre.classList.toggle("invalid", faltaNombre);
  leadInputs.telefono.classList.toggle("invalid", faltaContacto);
  if (faltaNombre || faltaContacto) {
    errorEl.textContent = "Dejanos tu nombre y un teléfono o email para poder contactarte.";
    errorEl.hidden = false;
    document.getElementById("lead-form").scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }
  errorEl.hidden = true;
  return true;
}

// Envía el lead a un endpoint externo si está configurado (no bloquea el flujo)
function enviarLeadEndpoint() {
  if (!LEAD_ENDPOINT) return;
  const modelo = getModeloActual();
  const payload = {
    ...estado.contacto,
    modelo: `${modelo.nombre} (${gamaTitulo(modelo.gama)})`,
    presupuestoUSD: calcularTotal(),
    turno: estado.contacto.dia || estado.contacto.horario
      ? `${estado.contacto.dia || ""} ${estado.contacto.horario || ""}`.trim()
      : "",
    detalle: generarMensaje(),
  };
  fetch(LEAD_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => { /* si falla, el lead igual llega por WhatsApp */ });
}

// ---------- 8.2 TOAST ----------
let toastTimer;
function mostrarToast(texto) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = texto;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

// ---------- 8.3 ACCIONES ----------
document.getElementById("btn-whatsapp").addEventListener("click", () => {
  if (!validarLead()) return;
  enviarLeadEndpoint();
  guardarLeadEnSupabase();
  const mensaje = generarMensaje();
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
});

document.getElementById("btn-instagram").addEventListener("click", async () => {
  if (!validarLead()) return;
  enviarLeadEndpoint();
  guardarLeadEnSupabase();
  // Instagram no permite precargar texto en el DM: copiamos el presupuesto al
  // portapapeles para que el cliente solo tenga que pegarlo en el chat.
  const mensaje = generarMensaje();
  try {
    await navigator.clipboard.writeText(mensaje);
    mostrarToast("📋 Copiamos tu presupuesto. Pegalo en el chat de Instagram (Ctrl/Cmd + V).");
  } catch {
    mostrarToast("Abrimos Instagram. Contanos tu modelo y te pasamos el presupuesto.");
  }
  setTimeout(() => window.open(`https://ig.me/m/${USUARIO_INSTAGRAM}`, "_blank"), 900);
});

// PDF: usamos el diálogo de impresión del navegador (permite "Guardar como PDF")
document.getElementById("btn-pdf").addEventListener("click", () => {
  guardarLeadEnSupabase(); // el presupuesto que se imprime también queda registrado
  document.getElementById("print-fecha").textContent = new Date().toLocaleDateString("es-AR");
  window.print();
});

document.getElementById("btn-editar").addEventListener("click", () => irATab("personalizador"));

// ---------- 8.4 QUIZ "AYUDAME A ELEGIR" ----------
const QUIZ_PREGUNTAS = [
  {
    clave: "espacio",
    pregunta: "¿Cuánto espacio tenés para la piscina?",
    opciones: [
      { txt: "Poco — un patio chico (hasta 4 m)", val: "chico" },
      { txt: "Medio — un jardín estándar (4 a 6,5 m)", val: "medio" },
      { txt: "Amplio — tengo lugar de sobra (más de 6,5 m)", val: "grande" },
    ],
  },
  {
    clave: "uso",
    pregunta: "¿Cuántas personas la van a usar habitualmente?",
    opciones: [
      { txt: "1 o 2 — algo íntimo", val: "pocas" },
      { txt: "Toda la familia (3 a 5)", val: "familia" },
      { txt: "Reuniones grandes / muchos chicos", val: "muchas" },
    ],
  },
  {
    clave: "presupuesto",
    pregunta: "¿Con qué presupuesto te sentís cómodo?",
    opciones: [
      { txt: "El más accesible posible", val: "baja" },
      { txt: "Equilibrio precio / calidad", val: "media" },
      { txt: "Quiero lo mejor, sin apuro", val: "alta" },
    ],
  },
];

let quizRespuestas = {};
let quizPaso = 0;

function abrirQuiz() {
  quizRespuestas = {};
  quizPaso = 0;
  document.getElementById("quiz-wrap").hidden = false;
  renderQuizPaso();
}
function cerrarQuiz() {
  document.getElementById("quiz-wrap").hidden = true;
}

function renderQuizPaso() {
  const body = document.getElementById("quiz-body");
  const p = QUIZ_PREGUNTAS[quizPaso];
  const barras = QUIZ_PREGUNTAS.map((_, i) => `<span class="${i < quizPaso ? "done" : ""}"></span>`).join("");
  body.innerHTML = `
    <div class="quiz-step-count">Paso ${quizPaso + 1} de ${QUIZ_PREGUNTAS.length}</div>
    <div class="quiz-question">${p.pregunta}</div>
    <div class="quiz-options">
      ${p.opciones.map(o => `<button class="quiz-opt" data-val="${o.val}">${o.txt}</button>`).join("")}
    </div>
    <div class="quiz-progress">${barras}</div>`;
  body.querySelectorAll(".quiz-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      quizRespuestas[p.clave] = btn.dataset.val;
      if (quizPaso < QUIZ_PREGUNTAS.length - 1) { quizPaso++; renderQuizPaso(); }
      else renderQuizResultados();
    });
  });
}

// Puntúa cada modelo según las respuestas y devuelve los 3 mejores
function recomendarModelos() {
  const rangoEspacio = { chico: [0, 4], medio: [4, 6.5], grande: [6.5, 99] };
  const [minL, maxL] = rangoEspacio[quizRespuestas.espacio] || [0, 99];
  const capMin = quizRespuestas.uso === "muchas" ? 20000 : quizRespuestas.uso === "familia" ? 10000 : 0;

  return CATALOGO.map(m => {
    let score = 0;
    if (m.largo >= minL && m.largo <= maxL) score += 3;
    else score -= Math.min(3, Math.abs(m.largo - (minL + maxL) / 2));
    if (m.capacidadLitros >= capMin) score += 2;
    if (m.gama === quizRespuestas.presupuesto) score += 3;
    return { m, score };
  }).sort((a, b) => b.score - a.score).slice(0, 3).map(x => x.m);
}

function renderQuizResultados() {
  const body = document.getElementById("quiz-body");
  const recomendados = recomendarModelos();
  body.innerHTML = `
    <div class="quiz-results-title">Estos modelos encajan con vos 👌</div>
    <div class="quiz-results-sub">Según tus respuestas. Podés personalizar cualquiera y pedir el presupuesto.</div>
    ${recomendados.map(m => `
      <div class="quiz-result">
        <div class="qr-info">
          <b>${m.nombre}</b>
          <span>${gamaTitulo(m.gama)} · ${dimensionesTexto(m)}</span>
        </div>
        <div class="qr-price">${m.precioBase ? "Desde $" + Math.round(m.precioBase * cotizacionARS).toLocaleString("es-AR") + " ARS" : "Consultar"}</div>
        <button data-modelo="${m.id}">Personalizar</button>
      </div>`).join("")}
    <button class="quiz-restart" id="quiz-restart">Volver a empezar</button>`;
  body.querySelectorAll("[data-modelo]").forEach(btn => {
    btn.addEventListener("click", () => {
      estado.modeloId = btn.dataset.modelo;
      guardarEstado();
      cerrarQuiz();
      irATab("personalizador");
    });
  });
  document.getElementById("quiz-restart").addEventListener("click", abrirQuiz);
}

document.getElementById("btn-abrir-quiz").addEventListener("click", abrirQuiz);
document.getElementById("quiz-close").addEventListener("click", cerrarQuiz);
document.getElementById("quiz-wrap").addEventListener("click", (e) => {
  if (e.target.id === "quiz-wrap") cerrarQuiz();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.getElementById("quiz-wrap").hidden) cerrarQuiz();
});

// ---------- 8.5 BOTÓN FLOTANTE + LINKS DE FOOTER ----------
function abrirWhatsAppSimple(e) {
  if (e) e.preventDefault();
  const mensaje = "¡Hola! 👋 Quiero hacer una consulta sobre las piscinas de A&M.";
  window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, "_blank");
}
document.getElementById("fab-whatsapp").addEventListener("click", abrirWhatsAppSimple);
document.getElementById("foot-wpp").addEventListener("click", abrirWhatsAppSimple);
document.getElementById("foot-ig").addEventListener("click", (e) => {
  e.preventDefault();
  window.open(`https://ig.me/m/${USUARIO_INSTAGRAM}`, "_blank");
});

// ---------- 8.6 COMPARTIR DISEÑO POR LINK ----------
// Codifica el diseño (NO los datos de contacto) en el hash de la URL, para
// que el cliente pueda compartir su piscina con su familia o el vendedor.
function codificarDiseño() {
  const d = { m: estado.modeloId, c: estado.color, e: estado.entorno, l: estado.luz, b: estado.borde, a: estado.accesorios };
  return encodeURIComponent(btoa(JSON.stringify(d)));
}

function linkDeDiseño() {
  return location.href.split("#")[0] + "#d=" + codificarDiseño();
}

// Lee un diseño desde la URL al abrir un link compartido. Valida cada id.
function aplicarDiseñoDesdeURL() {
  const m = location.hash.match(/[#&]d=([^&]+)/);
  if (!m) return false;
  try {
    const d = JSON.parse(atob(decodeURIComponent(m[1])));
    if (!CATALOGO.find(x => x.id === d.m)) return false;
    estado.modeloId = d.m;
    if (OPCIONES.color.find(c => c.id === d.c)) estado.color = d.c;
    if (OPCIONES.entorno.find(e => e.id === d.e)) estado.entorno = d.e;
    if (OPCIONES.luz.find(l => l.id === d.l)) estado.luz = d.l;
    if (OPCIONES.borde.find(b => b.id === d.b)) estado.borde = d.b;
    if (Array.isArray(d.a)) estado.accesorios = d.a.filter(id => OPCIONES.accesorios.find(a => a.id === id));
    guardarEstado();
    return true;
  } catch { return false; }
}

async function compartirDiseño() {
  guardarLeadEnSupabase(); // el presupuesto que se comparte también queda registrado
  const url = linkDeDiseño();
  const modelo = getModeloActual();
  const texto = `Mirá la piscina que armé en A&M Piscinas: ${modelo.nombre} (${gamaTitulo(modelo.gama)}).`;
  // En celular abre el menú nativo de compartir; en desktop copia al portapapeles
  if (navigator.share) {
    try { await navigator.share({ title: "A&M Piscinas", text: texto, url }); return; }
    catch { return; /* el usuario canceló */ }
  }
  try {
    await navigator.clipboard.writeText(url);
    mostrarToast("🔗 Link copiado — mandáselo a tu familia o al asesor para mostrarle tu diseño.");
  } catch {
    mostrarToast("Copiá este link para compartir tu diseño: " + url);
  }
}

document.getElementById("btn-compartir").addEventListener("click", compartirDiseño);
document.getElementById("btn-compartir-perso").addEventListener("click", compartirDiseño);

// ---------- 8.7 COMPARADOR DE MODELOS ----------
let comparar = [];
const MAX_COMPARAR = 3;

function toggleComparar(id, checked) {
  if (checked) {
    if (comparar.length >= MAX_COMPARAR) {
      mostrarToast(`Podés comparar hasta ${MAX_COMPARAR} modelos a la vez.`);
      const cb = document.querySelector(`input[data-compare="${id}"]`);
      if (cb) cb.checked = false;
      return;
    }
    if (!comparar.includes(id)) comparar.push(id);
  } else {
    comparar = comparar.filter(x => x !== id);
  }
  actualizarBarraComparar();
}

function actualizarBarraComparar() {
  const bar = document.getElementById("compare-bar");
  bar.hidden = comparar.length === 0;
  document.getElementById("compare-count").textContent =
    comparar.length === 1 ? "1 modelo seleccionado" : `${comparar.length} modelos seleccionados`;
}

function abrirComparador() {
  if (comparar.length < 2) { mostrarToast("Elegí al menos 2 modelos para comparar."); return; }
  const modelos = comparar.map(id => CATALOGO.find(m => m.id === id));
  document.getElementById("compare-body").innerHTML = `
    <div class="compare-cols">${modelos.map(m => `
      <div class="compare-col">
        <div class="cc-name">${m.nombre}</div>
        <div class="cc-gama">${gamaTitulo(m.gama)} · ${m.marca}</div>
        <dl>
          <div><dt>Dimensiones</dt><dd>${dimensionesTexto(m)}</dd></div>
          <div><dt>Capacidad</dt><dd>${m.capacidadLitros.toLocaleString('es-AR')} L</dd></div>
          <div><dt>Profundidad</dt><dd>${m.profundidad.toFixed(2)} m</dd></div>
          <div><dt>Solárium</dt><dd>${m.solarium}</dd></div>
          <div><dt>Escalones</dt><dd>${m.escalones}</dd></div>
          <div><dt>Material</dt><dd>${m.material}</dd></div>
          <div><dt>Desde</dt><dd>${m.precioBase ? formatearPrecio(m.precioBase) : 'Consultar'}</dd></div>
        </dl>
        <button data-modelo-comp="${m.id}">Personalizar este</button>
      </div>`).join("")}</div>`;
  document.getElementById("compare-body").querySelectorAll("[data-modelo-comp]").forEach(btn => {
    btn.addEventListener("click", () => {
      estado.modeloId = btn.dataset.modeloComp;
      guardarEstado();
      cerrarComparador();
      irATab("personalizador");
    });
  });
  document.getElementById("compare-modal").hidden = false;
}

function cerrarComparador() { document.getElementById("compare-modal").hidden = true; }

document.getElementById("compare-open").addEventListener("click", abrirComparador);
document.getElementById("compare-clear").addEventListener("click", () => {
  comparar = [];
  actualizarBarraComparar();
  renderCatalogo();
});
document.getElementById("compare-close").addEventListener("click", cerrarComparador);
document.getElementById("compare-modal").addEventListener("click", (e) => {
  if (e.target.id === "compare-modal") cerrarComparador();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.getElementById("compare-modal").hidden) cerrarComparador();
});

// ---------- 8.8 PANEL DE EDICIÓN (ADMIN) ----------
// Permite que A&M edite contenido (contacto, textos, precios, obras,
// testimonios, FAQ, avisos) sin tocar código. Los cambios se guardan como
// "overrides" en localStorage y se aplican sobre los datos por defecto.
// Se pueden exportar a un archivo para publicarlos para todos los visitantes.
const OVERRIDES_KEY = "aym_overrides";
function cargarOverrides() { try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}; } catch { return {}; } }
function guardarOverridesLS(o) { try { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(o)); } catch {} }
let overrides = cargarOverrides();

// Aplica los overrides guardados sobre los datos y textos por defecto.
function aplicarOverrides() {
  const o = overrides || {};
  if (o.contacto) {
    if (o.contacto.whatsapp) NUMERO_WHATSAPP = o.contacto.whatsapp;
    if (o.contacto.instagram) USUARIO_INSTAGRAM = o.contacto.instagram;
    if (o.contacto.whatsappDisplay) WHATSAPP_DISPLAY = o.contacto.whatsappDisplay;
  }
  if (o.flags) {
    if (typeof o.flags.precios === "boolean") PRECIOS_ILUSTRATIVOS = o.flags.precios;
    if (typeof o.flags.ejemplo === "boolean") CONTENIDO_EJEMPLO = o.flags.ejemplo;
    if (typeof o.flags.faq === "boolean") CONTENIDO_FAQ = o.flags.faq;
  }
  if (o.precios) {
    Object.entries(o.precios).forEach(([id, val]) => {
      const m = CATALOGO.find(x => x.id === id);
      if (m && val !== "" && val != null && !isNaN(+val)) m.precioBase = +val;
    });
  }
  if (Array.isArray(o.obras)) OBRAS = o.obras;
  if (Array.isArray(o.testimonios)) TESTIMONIOS = o.testimonios;
  if (Array.isArray(o.faq)) FAQ_DATOS = o.faq;
  if (o.hero) {
    const ht = document.getElementById("hero-titulo"), hs = document.getElementById("hero-sub");
    if (o.hero.titulo && ht) ht.textContent = o.hero.titulo;
    if (o.hero.subtitulo && hs) hs.textContent = o.hero.subtitulo;
  }
}

let adminDraft = null; // copia de trabajo mientras el panel está abierto
const adminBody = () => document.getElementById("admin-body");
const escA = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function abrirAdmin() {
  adminDraft = JSON.parse(JSON.stringify(overrides || {}));
  document.getElementById("admin-overlay").hidden = false;
  activarAdminTab("contacto");
}
function cerrarAdmin() { document.getElementById("admin-overlay").hidden = true; }

function activarAdminTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(b => b.classList.toggle("active", b.dataset.atab === tab));
  ({ contacto: adminContacto, textos: adminTextos, precios: adminPrecios,
     obras: adminObras, testimonios: adminTestimonios, faq: adminFAQ, datos: adminDatos }[tab] || adminContacto)();
}

function adminContacto() {
  const c = adminDraft.contacto || {};
  const body = adminBody();
  body.innerHTML = `
    <h3 class="admin-section-title">Datos de contacto</h3>
    <p class="admin-section-desc">Se usan en los botones de WhatsApp/Instagram, el footer y el PDF.</p>
    <div class="admin-field"><label>WhatsApp (código de país, sin + ni espacios)</label><input id="ac-wpp"></div>
    <div class="admin-field"><label>WhatsApp visible (como se muestra)</label><input id="ac-disp"></div>
    <div class="admin-field"><label>Usuario de Instagram (sin @)</label><input id="ac-ig"></div>`;
  const wpp = body.querySelector("#ac-wpp"), disp = body.querySelector("#ac-disp"), ig = body.querySelector("#ac-ig");
  wpp.value = c.whatsapp ?? NUMERO_WHATSAPP;
  disp.value = c.whatsappDisplay ?? WHATSAPP_DISPLAY;
  ig.value = c.instagram ?? USUARIO_INSTAGRAM;
  const setC = (k, v) => { adminDraft.contacto = { ...(adminDraft.contacto || {}), [k]: v }; };
  wpp.addEventListener("input", e => setC("whatsapp", e.target.value.trim()));
  disp.addEventListener("input", e => setC("whatsappDisplay", e.target.value));
  ig.addEventListener("input", e => setC("instagram", e.target.value.trim().replace(/^@/, "")));
}

function adminTextos() {
  const h = adminDraft.hero || {};
  const body = adminBody();
  const tActual = document.getElementById("hero-titulo").textContent;
  const sActual = document.getElementById("hero-sub").textContent;
  body.innerHTML = `
    <h3 class="admin-section-title">Textos principales</h3>
    <p class="admin-section-desc">El título grande y el texto de bienvenida de la portada.</p>
    <div class="admin-field"><label>Título</label><textarea id="at-tit"></textarea></div>
    <div class="admin-field"><label>Subtítulo</label><textarea id="at-sub"></textarea></div>`;
  const tit = body.querySelector("#at-tit"), sub = body.querySelector("#at-sub");
  tit.value = h.titulo ?? tActual;
  sub.value = h.subtitulo ?? sActual;
  tit.addEventListener("input", e => { adminDraft.hero = { ...(adminDraft.hero || {}), titulo: e.target.value }; });
  sub.addEventListener("input", e => { adminDraft.hero = { ...(adminDraft.hero || {}), subtitulo: e.target.value }; });
}

function adminPrecios() {
  const body = adminBody();
  if (!adminDraft.precios) adminDraft.precios = {};
  body.innerHTML = `
    <h3 class="admin-section-title">Precios base (USD)</h3>
    <p class="admin-section-desc">Precio de referencia de cada modelo en dólares. Se convierte a pesos solo.</p>
    ${CATALOGO.map(m => `
      <div class="admin-price-row">
        <div class="apr-name">${escA(m.nombre)}<small>${escA(gamaTitulo(m.gama))} · ${escA(m.linea)}</small></div>
        <input type="number" min="0" step="100" data-price="${m.id}">
      </div>`).join("")}`;
  body.querySelectorAll("[data-price]").forEach(inp => {
    const id = inp.dataset.price;
    inp.value = adminDraft.precios[id] ?? CATALOGO.find(x => x.id === id).precioBase ?? "";
    inp.addEventListener("input", e => {
      const v = e.target.value;
      if (v === "") delete adminDraft.precios[id];
      else adminDraft.precios[id] = +v;
    });
  });
}

// Editor de lista genérico (obras, testimonios, faq usan el mismo patrón)
function adminObras() {
  const body = adminBody();
  if (!adminDraft.obras) adminDraft.obras = JSON.parse(JSON.stringify(OBRAS));
  const pintar = () => {
    body.innerHTML = `
      <h3 class="admin-section-title">Obras realizadas</h3>
      <p class="admin-section-desc">Cada tarjeta de la galería. En "Foto" poné la ruta a la imagen (ej: obras/casa.jpg) o dejalo vacío para el placeholder.</p>
      ${adminDraft.obras.map((o, i) => `
        <div class="admin-card">
          <button class="admin-del" data-del="${i}" title="Eliminar">🗑</button>
          <div class="admin-field"><label>Título</label><input data-f="titulo" data-i="${i}"></div>
          <div class="admin-field"><label>Modelo</label><input data-f="modelo" data-i="${i}"></div>
          <div class="admin-field"><label>Localidad</label><input data-f="localidad" data-i="${i}"></div>
          <div class="admin-field"><label>Foto (ruta, opcional)</label><input data-f="imagen" data-i="${i}"></div>
        </div>`).join("")}
      <button class="admin-add" id="obra-add">+ Agregar obra</button>`;
    body.querySelectorAll("input[data-f]").forEach(inp => {
      const i = +inp.dataset.i, f = inp.dataset.f;
      inp.value = adminDraft.obras[i][f] ?? "";
      inp.addEventListener("input", e => { adminDraft.obras[i][f] = e.target.value; });
    });
    body.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { adminDraft.obras.splice(+b.dataset.del, 1); pintar(); }));
    body.querySelector("#obra-add").addEventListener("click", () => { adminDraft.obras.push({ titulo: "Nueva obra", modelo: "", localidad: "", imagen: "" }); pintar(); });
  };
  pintar();
}

function adminTestimonios() {
  const body = adminBody();
  if (!adminDraft.testimonios) adminDraft.testimonios = JSON.parse(JSON.stringify(TESTIMONIOS));
  const pintar = () => {
    body.innerHTML = `
      <h3 class="admin-section-title">Testimonios</h3>
      <p class="admin-section-desc">Reseñas de clientes. Estrellas de 1 a 5.</p>
      ${adminDraft.testimonios.map((t, i) => `
        <div class="admin-card">
          <button class="admin-del" data-del="${i}" title="Eliminar">🗑</button>
          <div class="admin-field"><label>Texto</label><textarea data-f="texto" data-i="${i}"></textarea></div>
          <div class="admin-field"><label>Nombre</label><input data-f="nombre" data-i="${i}"></div>
          <div class="admin-field"><label>Localidad</label><input data-f="localidad" data-i="${i}"></div>
          <div class="admin-field"><label>Estrellas (1-5)</label><input type="number" min="1" max="5" data-f="estrellas" data-i="${i}"></div>
        </div>`).join("")}
      <button class="admin-add" id="testi-add">+ Agregar testimonio</button>`;
    body.querySelectorAll("[data-f]").forEach(inp => {
      const i = +inp.dataset.i, f = inp.dataset.f;
      inp.value = adminDraft.testimonios[i][f] ?? "";
      inp.addEventListener("input", e => {
        adminDraft.testimonios[i][f] = f === "estrellas" ? Math.max(1, Math.min(5, +e.target.value || 5)) : e.target.value;
      });
    });
    body.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { adminDraft.testimonios.splice(+b.dataset.del, 1); pintar(); }));
    body.querySelector("#testi-add").addEventListener("click", () => { adminDraft.testimonios.push({ texto: "", nombre: "", localidad: "", estrellas: 5 }); pintar(); });
  };
  pintar();
}

function adminFAQ() {
  const body = adminBody();
  if (!adminDraft.faq) adminDraft.faq = JSON.parse(JSON.stringify(FAQ_DATOS));
  const pintar = () => {
    body.innerHTML = `
      <h3 class="admin-section-title">Preguntas frecuentes</h3>
      <p class="admin-section-desc">La respuesta admite HTML simple (ej: &lt;b&gt;negrita&lt;/b&gt;, &lt;p&gt;párrafo&lt;/p&gt;).</p>
      ${adminDraft.faq.map((f, i) => `
        <div class="admin-card">
          <button class="admin-del" data-del="${i}" title="Eliminar">🗑</button>
          <div class="admin-field"><label>Pregunta</label><input data-f="pregunta" data-i="${i}"></div>
          <div class="admin-field"><label>Respuesta</label><textarea data-f="respuesta" data-i="${i}" style="min-height:100px"></textarea></div>
        </div>`).join("")}
      <button class="admin-add" id="faq-add">+ Agregar pregunta</button>`;
    body.querySelectorAll("[data-f]").forEach(inp => {
      const i = +inp.dataset.i, f = inp.dataset.f;
      inp.value = adminDraft.faq[i][f] ?? "";
      inp.addEventListener("input", e => { adminDraft.faq[i][f] = e.target.value; });
    });
    body.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { adminDraft.faq.splice(+b.dataset.del, 1); pintar(); }));
    body.querySelector("#faq-add").addEventListener("click", () => { adminDraft.faq.push({ pregunta: "Nueva pregunta", respuesta: "<p>Respuesta</p>" }); pintar(); });
  };
  pintar();
}

function adminDatos() {
  const body = adminBody();
  const f = adminDraft.flags || {};
  body.innerHTML = `
    <h3 class="admin-section-title">Avisos de contenido</h3>
    <p class="admin-section-desc">Destildá estos avisos cuando cargues los datos reales.</p>
    <label class="admin-toggle"><input type="checkbox" id="fl-precios"><span>Aviso "precios orientativos"<span class="at-desc">Tildado mientras los precios no sean definitivos.</span></span></label>
    <label class="admin-toggle"><input type="checkbox" id="fl-ejemplo"><span>Aviso "galería/testimonios de ejemplo"<span class="at-desc">Destildá cuando cargues obras y reseñas reales.</span></span></label>
    <label class="admin-toggle"><input type="checkbox" id="fl-faq"><span>Aviso "FAQ de referencia"<span class="at-desc">Destildá cuando la FAQ sea la oficial.</span></span></label>
    <h3 class="admin-section-title" style="margin-top:22px">Copia de seguridad</h3>
    <p class="admin-section-desc">Los cambios se guardan en este navegador. Para publicarlos para todos, descargá el archivo y pasáselo a tu desarrollador, o importalo en otra compu.</p>
    <div class="admin-datos-actions">
      <button class="admin-btn" id="dt-export">⬇ Descargar cambios (JSON)</button>
      <label class="admin-btn" style="cursor:pointer">⬆ Importar cambios<input type="file" id="dt-import" accept="application/json" hidden></label>
      <button class="admin-btn danger" id="dt-reset">↺ Restablecer todo a los valores originales</button>
    </div>`;
  const setF = (k, v) => { adminDraft.flags = { ...(adminDraft.flags || {}), [k]: v }; };
  const pc = body.querySelector("#fl-precios"); pc.checked = f.precios ?? PRECIOS_ILUSTRATIVOS; pc.addEventListener("change", e => setF("precios", e.target.checked));
  const pe = body.querySelector("#fl-ejemplo"); pe.checked = f.ejemplo ?? CONTENIDO_EJEMPLO; pe.addEventListener("change", e => setF("ejemplo", e.target.checked));
  const pf = body.querySelector("#fl-faq"); pf.checked = f.faq ?? CONTENIDO_FAQ; pf.addEventListener("change", e => setF("faq", e.target.checked));
  body.querySelector("#dt-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(adminDraft, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "aym-contenido.json"; a.click();
    URL.revokeObjectURL(a.href);
  });
  body.querySelector("#dt-import").addEventListener("change", e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { guardarOverridesLS(JSON.parse(reader.result)); location.reload(); }
      catch { mostrarToast("El archivo no es válido."); }
    };
    reader.readAsText(file);
  });
  body.querySelector("#dt-reset").addEventListener("click", () => {
    if (confirm("¿Borrar todos los cambios y volver a los valores originales?")) {
      localStorage.removeItem(OVERRIDES_KEY); location.reload();
    }
  });
}

function guardarAdmin() {
  overrides = adminDraft;
  guardarOverridesLS(overrides);
  location.reload(); // recarga para aplicar los cambios en toda la página
}

// Acceso al editor SOLO para A&M (empleado/vendedor), separado de la experiencia
// del cliente: no hay ningún botón visible. Se abre con la URL terminada en
// "#editar" o con el atajo de teclado Ctrl/Cmd + Shift + E.
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
    e.preventDefault();
    document.getElementById("admin-overlay").hidden ? abrirAdmin() : cerrarAdmin();
  }
});
document.getElementById("admin-close").addEventListener("click", cerrarAdmin);
document.getElementById("admin-overlay").addEventListener("click", e => { if (e.target.id === "admin-overlay") cerrarAdmin(); });
document.getElementById("admin-tabs").addEventListener("click", e => {
  const b = e.target.closest(".admin-tab"); if (b) activarAdminTab(b.dataset.atab);
});
document.getElementById("admin-save").addEventListener("click", guardarAdmin);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !document.getElementById("admin-overlay").hidden) cerrarAdmin();
});

// ---------- 8.9 SUPABASE (BACKEND) ----------
// Si supabase-config.js tiene una URL y clave reales (no el placeholder), nos
// conectamos para leer el contenido (modelos, obras, testimonios, FAQ, textos)
// y guardar los leads. Si no hay configuración, o la conexión falla (sin
// internet, proyecto pausado, etc.), el sitio sigue funcionando 100% con los
// datos locales de este archivo: nunca se rompe por culpa del backend.
const SUPABASE_CONFIGURADO =
  typeof window.SUPABASE_URL === "string" && window.SUPABASE_URL && !window.SUPABASE_URL.includes("TU-PROYECTO") &&
  typeof window.SUPABASE_ANON_KEY === "string" && window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.includes("TU_CLAVE");

const supabaseClient = (SUPABASE_CONFIGURADO && window.supabase)
  ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
  : null;

// Trae el contenido desde Supabase y reemplaza los datos locales por los de
// la base. Tiene un límite de tiempo para no colgar el arranque de la página
// si la conexión es lenta; ante cualquier error, no toca nada y seguimos con
// el contenido local.
async function cargarDatosDeSupabase() {
  if (!supabaseClient) return false;
  try {
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 6000));
    const consulta = Promise.all([
      supabaseClient.from("config_sitio").select("*").eq("id", 1).maybeSingle(),
      supabaseClient.from("modelos").select("*").eq("activo", true).order("orden"),
      supabaseClient.from("obras").select("*").order("orden"),
      supabaseClient.from("testimonios").select("*").order("orden"),
      supabaseClient.from("faq").select("*").order("orden"),
    ]);
    const [cfgRes, modelosRes, obrasRes, testiRes, faqRes] = await Promise.race([consulta, timeout]);

    if (modelosRes.data?.length) {
      CATALOGO = modelosRes.data.map(m => ({
        id: m.id, nombre: m.nombre, gama: m.gama, linea: m.linea, marca: m.marca,
        largo: +m.largo, ancho: +m.ancho, profundidad: +m.profundidad,
        capacidadLitros: m.capacidad_litros, solarium: m.solarium, escalones: m.escalones,
        material: m.material, precioBase: m.precio_base, esBoceto: m.es_boceto, imagen: m.imagen,
      }));
    }
    if (obrasRes.data?.length) {
      OBRAS = obrasRes.data.map(o => ({ titulo: o.titulo, modelo: o.modelo, localidad: o.localidad, imagen: o.imagen }));
    }
    if (testiRes.data?.length) {
      TESTIMONIOS = testiRes.data.map(t => ({ texto: t.texto, nombre: t.nombre, localidad: t.localidad, estrellas: t.estrellas }));
    }
    if (faqRes.data?.length) {
      FAQ_DATOS = faqRes.data.map(f => ({ pregunta: f.pregunta, respuesta: f.respuesta }));
    }
    if (cfgRes.data) {
      const c = cfgRes.data;
      if (c.hero_titulo) document.getElementById("hero-titulo").textContent = c.hero_titulo;
      if (c.hero_sub) document.getElementById("hero-sub").textContent = c.hero_sub;
      if (c.whatsapp) NUMERO_WHATSAPP = c.whatsapp;
      if (c.whatsapp_display) WHATSAPP_DISPLAY = c.whatsapp_display;
      if (c.instagram) USUARIO_INSTAGRAM = c.instagram;
      if (typeof c.flag_precios === "boolean") PRECIOS_ILUSTRATIVOS = c.flag_precios;
      if (typeof c.flag_ejemplo === "boolean") CONTENIDO_EJEMPLO = c.flag_ejemplo;
      if (typeof c.flag_faq === "boolean") CONTENIDO_FAQ = c.flag_faq;
    }
    return true;
  } catch {
    return false; // sin conexión, timeout, o tablas vacías: seguimos con lo local
  }
}

// Registra el presupuesto en la base para que aparezca en el panel de gestión.
// Se llama ante CUALQUIER acción sobre el presupuesto (WhatsApp, Instagram,
// imprimir/PDF o compartir), así ningún pedido "se desvanece".
//
// Nota de seguridad (RLS): el cliente anónimo SOLO puede insertar leads (no
// puede leer ni actualizar los de otros). Por eso no podemos deduplicar con un
// UPDATE: en su lugar guardamos una "firma" del presupuesto y solo insertamos
// una fila nueva cuando el diseño/contacto cambió respecto de la última vez.
// Así, tocar WhatsApp y después Imprimir con el MISMO diseño no crea duplicados,
// pero un diseño distinto sí queda registrado como un pedido nuevo.
// Si falla (sin conexión, etc.) no interrumpe al cliente: el lead igual le llega
// al vendedor por el chat.
let ultimaFirmaGuardada = null;

function firmaPresupuesto() {
  const c = estado.contacto || {};
  return JSON.stringify({
    m: estado.modeloId, co: estado.color, e: estado.entorno, lz: estado.luz,
    b: estado.borde, a: [...estado.accesorios].sort(),
    n: c.nombre || "", t: c.telefono || "", em: c.email || "",
  });
}

async function guardarLeadEnSupabase() {
  if (!supabaseClient) return;
  const firma = firmaPresupuesto();
  if (firma === ultimaFirmaGuardada) return; // este presupuesto exacto ya se registró
  const modelo = getModeloActual();
  const c = estado.contacto || {};
  try {
    const { error } = await supabaseClient.from("leads").insert({
      nombre: c.nombre || null,
      telefono: c.telefono || null,
      email: c.email || null,
      localidad: c.localidad || null,
      dia: c.dia || null,
      horario: c.horario || null,
      modelo_id: modelo.id,
      config: { color: estado.color, entorno: estado.entorno, luz: estado.luz, borde: estado.borde, accesorios: estado.accesorios },
      presupuesto_usd: calcularTotal(),
      // 'origen' no se envía: la columna tiene default 'web' en la base, así el
      // guardado sigue funcionando aunque todavía no se haya corrido schema3.sql.
    });
    if (!error) ultimaFirmaGuardada = firma;
  } catch { /* sin conexión: el lead igual llega por WhatsApp */ }
}

// ---------- 8.10 PANEL DE EMPLEADO ----------
// Acceso SOLO para A&M (vendedor/empleado): no hay botón visible para el
// cliente. Se abre con la URL terminada en "#panel" o con Ctrl/Cmd+Shift+L.

function abrirPanel() {
  // El panel de empleado es una PÁGINA PROPIA (panel.html), separada de
  // la vitrina del cliente: estadísticas, pedidos, escuadras y stock.
  location.href = "panel.html";
}

// Atajo de teclado para empleados: Ctrl/Cmd+Shift+L abre la página del panel
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "L" || e.key === "l")) {
    e.preventDefault();
    abrirPanel();
  }
});

// ---------- 9. INIT ----------
(async function init() {
  // 1) Intentar traer el contenido desde Supabase (si está configurado).
  await cargarDatosDeSupabase();
  // 2) Aplicar por encima los cambios guardados localmente (panel de edición).
  aplicarOverrides();
  document.getElementById("foot-year").textContent = new Date().getFullYear();
  document.getElementById("ph-contact").textContent = `WhatsApp ${WHATSAPP_DISPLAY} · Instagram @${USUARIO_INSTAGRAM}`;
  // Si se abrió un link de diseño compartido, lo aplicamos y llevamos al personalizador
  const vinoDeLinkCompartido = aplicarDiseñoDesdeURL();
  initLeadForm();
  renderCatalogo();
  renderObras();
  renderTestimonios();
  renderFAQ();

  // --- Navegación inicial con soporte de historial ---
  // Determinar la pestaña inicial según el contexto
  let tabInicial = "catalogo";
  if (vinoDeLinkCompartido) {
    tabInicial = "personalizador";
  }
  // Marcar el estado inicial en el historial (replace, no push)
  history.replaceState({ tab: tabInicial }, "");
  actualizarTabsVisibles(); // mostrar u ocultar tabs según si hay modelo
  if (tabInicial !== "catalogo") _cambiarVistaTab(tabInicial);

  // Deep-links especiales (overlays, no tabs)
  if (location.hash === "#editar") abrirAdmin(); // acceso directo al editor
  if (location.hash === "#panel") abrirPanel();  // acceso directo al panel de empleado
  obtenerCotizacion(); // no bloquea el render inicial; re-renderiza cuando llega
})();

// ---------- 10. ¿ENTRA EN MI PATIO? ----------
// El usuario ingresa largo y ancho de su terreno y ve qué modelos del catálogo
// le entran (y cuáles no). Se añade un margen de 0.5 m por lado para excavación
// y circulación, pero se muestra también el modelo justo si entra sin margen.
const MARGEN_TERRENO = 0.5; // metros extra por lado que se recomienda

function verificarTerreno() {
  const largoInput = parseFloat(document.getElementById("terreno-largo").value);
  const anchoInput = parseFloat(document.getElementById("terreno-ancho").value);

  if (!largoInput || !anchoInput || largoInput <= 0 || anchoInput <= 0) {
    mostrarToast("Ingresá el largo y ancho de tu terreno para verificar.");
    return;
  }

  // Normalizar: largo siempre la dimensión mayor
  const terrenoLargo = Math.max(largoInput, anchoInput);
  const terrenoAncho = Math.min(largoInput, anchoInput);

  const resultados = CATALOGO.map(m => {
    // El modelo puede ir en cualquier orientación, así que probamos ambas
    const mLargo = Math.max(m.largo, m.ancho);
    const mAncho = Math.min(m.largo, m.ancho);

    const entraCon = mLargo + MARGEN_TERRENO * 2 <= terrenoLargo &&
                     mAncho + MARGEN_TERRENO * 2 <= terrenoAncho;
    const entraJusto = mLargo <= terrenoLargo && mAncho <= terrenoAncho;

    return { modelo: m, entraCon, entraJusto };
  });

  const entran = resultados.filter(r => r.entraCon);
  const justos = resultados.filter(r => !r.entraCon && r.entraJusto);
  const noEntran = resultados.filter(r => !r.entraJusto);

  const cont = document.getElementById("entra-resultados");
  cont.hidden = false;

  const renderItem = (r, tipo) => {
    const m = r.modelo;
    const icono = tipo === "ok" ? "✅" : tipo === "justo" ? "⚠️" : "❌";
    const clase = tipo === "ok" ? "entra-ok" : tipo === "justo" ? "entra-ok" : "entra-no";
    const nota = tipo === "justo" ? " (sin margen de circulación)" : "";
    return `
      <div class="entra-item ${clase}">
        <span class="entra-icon">${icono}</span>
        <div class="entra-info">
          <b>${m.nombre}</b>
          <span>${dimensionesTexto(m)} · ${gamaTitulo(m.gama)}${nota}</span>
        </div>
        ${tipo !== "no" ? `<button class="btn-primary" data-modelo-entra="${m.id}">Personalizar</button>` : ""}
      </div>`;
  };

  cont.innerHTML = `
    <div class="entra-resumen">
      🏠 Terreno: ${terrenoLargo.toFixed(1)}m × ${terrenoAncho.toFixed(1)}m
      · ${entran.length + justos.length} modelo${(entran.length + justos.length) !== 1 ? "s" : ""} entran
      · ${noEntran.length} no entran
    </div>
    <div class="entra-grid">
      ${entran.map(r => renderItem(r, "ok")).join("")}
      ${justos.map(r => renderItem(r, "justo")).join("")}
      ${noEntran.map(r => renderItem(r, "no")).join("")}
    </div>`;

  // Bind de los botones "Personalizar"
  cont.querySelectorAll("[data-modelo-entra]").forEach(btn => {
    btn.addEventListener("click", () => {
      estado.modeloId = btn.dataset.modeloEntra;
      guardarEstado();
      irATab("personalizador");
    });
  });

  // Scroll a los resultados
  cont.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("btn-verificar-patio").addEventListener("click", verificarTerreno);
// Permitir verificar con Enter desde los inputs
["terreno-largo", "terreno-ancho"].forEach(id => {
  document.getElementById(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") verificarTerreno();
  });
});
