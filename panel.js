/* ============================================================
   PANEL A&M — lógica de la página de gestión (vendedor/admin)
   Habla con el MISMO Supabase que el sitio del cliente:
   todo lo que capta la vitrina (leads) aparece acá.
   Secciones: Resumen (estadísticas) · Pedidos · Escuadras · Stock
   ============================================================ */

const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Cotización USD→ARS (misma fuente que el sitio, con fallback)
let cotizacionARS = 1400;
fetch("https://dolarapi.com/v1/dolares/blue")
  .then(r => r.json()).then(d => { if (d?.venta) cotizacionARS = d.venta; })
  .catch(() => {});

// Espejo de las OPCIONES del sitio (con precios) para poder ARMAR y COTIZAR un
// pedido desde el panel igual que en la web. Si cambian los precios en
// script.js, actualizarlos también acá.
const OPC = {
  color: [
    { id: "azul",     nombre: "Azul clásico", precio: 0 },
    { id: "turquesa", nombre: "Turquesa",     precio: 45 },
    { id: "gris",     nombre: "Gris pizarra", precio: 60 },
    { id: "blanco",   nombre: "Blanco arena", precio: 55 },
  ],
  luz: [
    { id: "sin-luz",    nombre: "Sin iluminación",     precio: 0 },
    { id: "led-blanca", nombre: "LED blanca",          precio: 180 },
    { id: "led-rgb",    nombre: "LED RGB con control", precio: 320 },
  ],
  borde: [
    { id: "borde-standard",    nombre: "Borde standard",       precio: 0 },
    { id: "borde-piedra",      nombre: "Borde piedra natural", precio: 240 },
    { id: "borde-porcelanato", nombre: "Borde porcelanato",    precio: 210 },
  ],
  accesorios: [
    { id: "escalera",     nombre: "Escalera de acero inoxidable", precio: 150 },
    { id: "cascada",      nombre: "Cascada decorativa",           precio: 280 },
    { id: "climatizacion",nombre: "Climatización",                precio: 650 },
    { id: "cubierta",     nombre: "Cubierta automática",          precio: 720 },
  ],
};

const ESTADOS = ["nuevo", "contactado", "cerrado", "descartado"];
const MEDIOS = [
  { id: "efectivo",      nombre: "Efectivo" },
  { id: "transferencia", nombre: "Transferencia" },
  { id: "debito",        nombre: "Débito" },
  { id: "credito",       nombre: "Tarjeta de crédito" },
  { id: "cheque",        nombre: "Cheque" },
  { id: "otro",          nombre: "Otro" },
];
const GAMAS = { alta: "Gama alta", media: "Gama media", baja: "Gama baja" };
const gamaNombre = g => GAMAS[g] || g || "—";

// Datos en memoria (se recargan de la base)
const DB = { leads: [], escuadras: [], stock: [], modelos: [], pagos: [] };
let tabActiva = "resumen";
let filtroLeads = "todos";
let ordenPedidos = "pagos";           // "pagos" (más pagados primero) | "nuevos"
const cuotasAbiertas = new Set();     // ids de pedidos con el detalle de pagos desplegado

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtUSD = n => "USD " + (+n || 0).toLocaleString("en-US");
const fmtARS = n => "$" + Math.round((+n || 0) * cotizacionARS).toLocaleString("es-AR") + " ARS";
const nomOpc = (tipo, id) => OPC[tipo]?.find(o => o.id === id)?.nombre || id;

function fechaMas(meses) {
  const d = new Date();
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().slice(0, 10);
}

// ---------- SESIÓN ----------
async function init() {
  const { data } = await sb.auth.getSession();
  if (data.session) mostrarApp(data.session);
  else mostrarLogin();
}

function mostrarLogin() {
  $("login-screen").hidden = false;
  $("app").hidden = true;
}

async function mostrarApp(session) {
  $("login-screen").hidden = true;
  $("app").hidden = false;
  $("app-user").textContent = session.user.email;
  await cargarTodo();
  renderTab();
}

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("login-btn"), err = $("login-error");
  btn.disabled = true; btn.textContent = "Ingresando…"; err.textContent = "";
  const { data, error } = await sb.auth.signInWithPassword({
    email: $("login-email").value.trim(),
    password: $("login-pass").value,
  });
  btn.disabled = false; btn.textContent = "Ingresar";
  if (error) { err.textContent = "Email o contraseña incorrectos."; return; }
  mostrarApp(data.session);
});

$("btn-logout").addEventListener("click", async () => {
  await sb.auth.signOut();
  mostrarLogin();
});

// ---------- CARGA DE DATOS ----------
async function cargarTodo() {
  $("app-main").innerHTML = `<p class="cargando">Cargando datos…</p>`;
  const [leads, escuadras, stock, modelos, pagos] = await Promise.all([
    sb.from("leads").select("*").order("created_at", { ascending: false }),
    sb.from("escuadras").select("*").order("id"),
    sb.from("stock").select("*").order("categoria").order("nombre"),
    sb.from("modelos").select("id, nombre, gama, linea, precio_base").order("orden"),
    sb.from("pagos").select("*").order("nro"),
  ]);
  DB.leads = leads.data || [];
  DB.escuadras = escuadras.data || [];
  DB.stock = stock.data || [];
  DB.modelos = modelos.data || [];
  DB.pagos = pagos.data || [];
  actualizarBadge();
}

function actualizarBadge() {
  const nuevos = DB.leads.filter(l => (l.estado || "nuevo") === "nuevo").length;
  const b = $("badge-nuevos");
  b.hidden = nuevos === 0;
  b.textContent = nuevos;
}

function nombreModelo(id) {
  const m = DB.modelos.find(x => x.id === id);
  return m ? m.nombre : (id || "—");
}

// ---------- PAGOS / CUOTAS ----------
function pagosDe(leadId) {
  return DB.pagos.filter(p => p.lead_id === leadId);
}

// Resume el estado de pago de un pedido y define su color de clasificación:
//   verde  = completado (todas las cuotas pagadas)
//   rojo   = en deuda   (hay cuotas que "debe": ni pagadas ni en proceso)
//   amarillo = en proceso (falta cobrar pero todo lo pendiente está en proceso)
//   gris   = sin plan de pago cargado
function resumenPago(lead) {
  const ps = pagosDe(lead.id);
  const total = ps.length;
  const pagadas = ps.filter(p => p.estado === "pagado").length;
  const proceso = ps.filter(p => p.estado === "proceso").length;
  const debe = ps.filter(p => p.estado === "pendiente").length;
  const montoPagado = ps.filter(p => p.estado === "pagado").reduce((s, p) => s + (+p.monto || 0), 0);
  const montoTotal = ps.reduce((s, p) => s + (+p.monto || 0), 0) || (+lead.presupuesto_usd || 0);

  let clase = "sinplan", etiqueta = "Sin plan de pago";
  if (total > 0) {
    if (pagadas === total)   { clase = "completado"; etiqueta = "Completado"; }
    else if (debe > 0)       { clase = "deuda";      etiqueta = "En deuda"; }
    else                     { clase = "pendiente";  etiqueta = "En proceso"; }
  }
  return { total, pagadas, proceso, debe, montoPagado, montoTotal, clase, etiqueta };
}

// Ordena los pedidos: por más cuotas pagadas (prioridad de cobro) o por más nuevos.
function ordenarLeads(list) {
  const arr = [...list];
  if (ordenPedidos === "pagos") {
    arr.sort((a, b) => {
      const ra = resumenPago(a), rb = resumenPago(b);
      if (rb.pagadas !== ra.pagadas) return rb.pagadas - ra.pagadas;
      if (rb.montoPagado !== ra.montoPagado) return rb.montoPagado - ra.montoPagado;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  } else {
    arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  return arr;
}

// Calcula el precio de un pedido armado desde el panel (mismo criterio que la web)
function calcPrecio(modeloId, cfg) {
  const m = DB.modelos.find(x => x.id === modeloId);
  if (!m || m.precio_base == null) return null;
  let t = +m.precio_base;
  t += OPC.color.find(o => o.id === cfg.color)?.precio || 0;
  t += OPC.luz.find(o => o.id === cfg.luz)?.precio || 0;
  t += OPC.borde.find(o => o.id === cfg.borde)?.precio || 0;
  (cfg.accesorios || []).forEach(id => { t += OPC.accesorios.find(o => o.id === id)?.precio || 0; });
  return t;
}

// ---------- TABS ----------
$("app-tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".app-tab");
  if (!btn) return;
  tabActiva = btn.dataset.tab;
  document.querySelectorAll(".app-tab").forEach(t => t.classList.toggle("active", t === btn));
  renderTab();
});

function renderTab() {
  ({ resumen: renderResumen, pedidos: renderPedidos, escuadras: renderEscuadras, stock: renderStock }[tabActiva] || renderResumen)();
}

// ---------- RESUMEN (estadísticas) ----------
function renderResumen() {
  const L = DB.leads;
  const por = e => L.filter(l => (l.estado || "nuevo") === e).length;
  const activos = L.filter(l => ["nuevo", "contactado"].includes(l.estado || "nuevo"));
  const valorActivo = activos.reduce((s, l) => s + (+l.presupuesto_usd || 0), 0);
  const hace7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const ultimos7 = L.filter(l => new Date(l.created_at).getTime() >= hace7).length;
  const enDeuda = L.filter(l => resumenPago(l).clase === "deuda").length;
  const cobrado = L.reduce((s, l) => s + resumenPago(l).montoPagado, 0);

  // Top de modelos más pedidos
  const cuenta = {};
  L.forEach(l => { if (l.modelo_id) cuenta[l.modelo_id] = (cuenta[l.modelo_id] || 0) + 1; });
  const top = Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = top[0]?.[1] || 1;

  $("app-main").innerHTML = `
    <div class="stats-grid">
      <div class="stat-card st-accent"><div class="st-num">${por("nuevo")}</div><div class="st-label">Pedidos nuevos sin contactar</div></div>
      <div class="stat-card"><div class="st-num">${L.length}</div><div class="st-label">Pedidos totales</div></div>
      <div class="stat-card"><div class="st-num">${ultimos7}</div><div class="st-label">Últimos 7 días</div></div>
      <div class="stat-card st-ok"><div class="st-num">${por("cerrado")}</div><div class="st-label">Ventas cerradas</div></div>
      <div class="stat-card ${enDeuda ? "st-danger" : ""}"><div class="st-num">${enDeuda}</div><div class="st-label">Pedidos en deuda</div></div>
      <div class="stat-card st-ok"><div class="st-num">${fmtUSD(cobrado)}</div><div class="st-label">Cobrado en cuotas · ≈ ${fmtARS(cobrado)}</div></div>
    </div>

    <div class="panel-section">
      <h2>Modelos más pedidos</h2>
      ${top.length ? `<div class="bars">${top.map(([id, n]) => `
        <div class="bar-row">
          <span class="bar-name">${esc(nombreModelo(id))}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round(n / max * 100)}%"></div></div>
          <span class="bar-val">${n}</span>
        </div>`).join("")}</div>`
      : `<p class="leads-empty">Todavía no hay pedidos para analizar.</p>`}
    </div>

    <div class="panel-section">
      <h2>Últimos pedidos</h2>
      ${L.slice(0, 5).map(l => leadHTML(l)).join("") || `<p class="leads-empty">Sin pedidos aún.</p>`}
    </div>`;
  bindLeadActions();
  bindPagoActions();
}

// ---------- PEDIDOS ----------
function resumenConfig(cfg) {
  if (!cfg) return "";
  const p = [];
  if (cfg.color) p.push("Revest.: " + nomOpc("color", cfg.color));
  if (cfg.luz) p.push("Luz: " + nomOpc("luz", cfg.luz));
  if (cfg.borde) p.push("Borde: " + nomOpc("borde", cfg.borde));
  if (cfg.accesorios?.length) p.push("Adic.: " + cfg.accesorios.map(a => nomOpc("accesorios", a)).join(", "));
  return p.join(" · ");
}

function linkWpp(tel) {
  if (!tel) return null;
  let d = String(tel).replace(/\D/g, "");
  if (!d) return null;
  if (!d.startsWith("54")) d = "549" + d.replace(/^0/, "");
  return "https://wa.me/" + d;
}

// Detalle desplegable de cuotas de un pedido
function cuotasHTML(l) {
  const ps = pagosDe(l.id).slice().sort((a, b) => (a.nro || 0) - (b.nro || 0));
  const filas = ps.map(p => `
    <div class="cuota-row" data-pago-id="${p.id}">
      <span class="cuota-nro">#${p.nro ?? "—"}</span>
      <input type="number" min="0" data-campo="monto" value="${p.monto ?? 0}" title="Monto (USD)">
      <input type="date" data-campo="fecha" value="${p.fecha || ""}" title="Vencimiento / fecha de pago">
      <select data-campo="estado" class="cuota-estado est-${p.estado}">
        <option value="pendiente" ${p.estado === "pendiente" ? "selected" : ""}>Debe</option>
        <option value="proceso" ${p.estado === "proceso" ? "selected" : ""}>En proceso</option>
        <option value="pagado" ${p.estado === "pagado" ? "selected" : ""}>Pagado</option>
      </select>
      <select data-campo="medio">
        <option value="">Medio…</option>
        ${MEDIOS.map(m => `<option value="${m.id}" ${p.medio === m.id ? "selected" : ""}>${m.nombre}</option>`).join("")}
      </select>
      <button class="cuota-del" data-pago-del="${p.id}" title="Eliminar cuota">✕</button>
    </div>`).join("");
  return `
    ${filas || `<p class="cuotas-vacio">Todavía no hay cuotas cargadas. Generá un plan o agregá una.</p>`}
    <div class="cuotas-tools">
      <button type="button" data-add-cuota="${l.id}">+ Agregar cuota</button>
      <span class="gen-plan">
        Plan de <input type="number" min="1" max="60" value="3" data-gen-n="${l.id}"> cuotas por
        <input type="number" min="0" value="${Math.round(l.presupuesto_usd || 0)}" data-gen-total="${l.id}"> USD
        <button type="button" data-gen-plan="${l.id}">Generar</button>
      </span>
    </div>`;
}

function leadHTML(l) {
  const fecha = l.created_at ? new Date(l.created_at).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
  const wpp = linkWpp(l.telefono);
  const cfg = resumenConfig(l.config);
  const turno = (l.dia || l.horario) ? "🗓️ Prefiere: " + [l.dia, l.horario].filter(Boolean).join(" · ") : "";
  const r = resumenPago(l);
  const abierto = cuotasAbiertas.has(l.id);
  const origenTag = l.origen === "oficina" ? `<span class="tag-origen">Oficina</span>` : "";
  const escuadrasOpts = DB.escuadras.filter(e => e.activa)
    .map(e => `<option value="${e.id}" ${l.escuadra_id === e.id ? "selected" : ""}>${esc(e.nombre)}</option>`).join("");
  return `
    <div class="lead-item" data-estado="${l.estado || "nuevo"}" data-pago="${r.clase}">
      <div class="lead-top">
        <span class="lead-name">${esc(l.nombre || "Sin nombre")} ${origenTag}</span>
        <span class="lead-date">${fecha}</span>
      </div>
      <div class="lead-contacto">
        ${l.telefono ? `<span>📞 ${esc(l.telefono)}</span>` : ""}
        ${l.email ? `<span>✉️ ${esc(l.email)}</span>` : ""}
        ${l.localidad ? `<span>📍 ${esc(l.localidad)}</span>` : ""}
      </div>
      <div class="lead-config">
        🏊 ${esc(nombreModelo(l.modelo_id))}${cfg ? "<br>" + esc(cfg) : ""}${turno ? "<br>" + esc(turno) : ""}
      </div>
      ${l.presupuesto_usd != null ? `<div class="lead-presu">${fmtUSD(l.presupuesto_usd)} · ≈ ${fmtARS(l.presupuesto_usd)}</div>` : ""}

      <div class="pago-bar">
        <span class="pago-badge ${r.clase}">${r.etiqueta}</span>
        <span class="pago-detalle">${r.total
          ? `${r.pagadas} pagada(s) · ${r.proceso} en proceso · ${r.debe} debe · <b>${fmtUSD(r.montoPagado)}</b> de ${fmtUSD(r.montoTotal)}`
          : "Sin cuotas cargadas"}</span>
        <button type="button" class="pago-toggle" data-toggle-cuotas="${l.id}">${abierto ? "Ocultar cuotas ▴" : "Gestionar pagos ▾"}</button>
      </div>
      <div class="cuotas-panel"${abierto ? "" : " hidden"}>${cuotasHTML(l)}</div>

      <div class="lead-actions">
        <label>Estado</label>
        <select data-accion="estado" data-id="${l.id}">
          ${ESTADOS.map(e => `<option value="${e}" ${(l.estado || "nuevo") === e ? "selected" : ""}>${e}</option>`).join("")}
        </select>
        <label>Escuadra</label>
        <select data-accion="escuadra" data-id="${l.id}">
          <option value="">Sin asignar</option>
          ${escuadrasOpts}
        </select>
        <label>Instalación</label>
        <input type="date" data-accion="fecha" data-id="${l.id}" value="${l.fecha_instalacion || ""}">
        ${wpp ? `<a class="lead-wpp" href="${wpp}" target="_blank" rel="noopener">Escribir por WhatsApp →</a>` : ""}
      </div>
    </div>`;
}

// Formulario para crear un pedido desde el panel (cliente presencial)
function pedidoFormHTML() {
  const modelosOpts = DB.modelos.map(m =>
    `<option value="${m.id}">${esc(m.nombre)} — ${esc(gamaNombre(m.gama))}${m.precio_base != null ? ` (USD ${(+m.precio_base).toLocaleString("en-US")})` : ""}</option>`).join("");
  const opt = arr => arr.map(o => `<option value="${o.id}">${esc(o.nombre)}${o.precio ? ` (+${o.precio})` : ""}</option>`).join("");
  const acc = OPC.accesorios.map(a =>
    `<label class="acc-check"><input type="checkbox" data-acc="${a.id}"> ${esc(a.nombre)} <span>+${a.precio}</span></label>`).join("");
  return `
    <form id="form-pedido" class="pedido-form" hidden>
      <h3>Nuevo pedido — cliente en oficina</h3>
      <div class="pf-grid">
        <div class="f-field"><label>Nombre del cliente *</label><input id="pf-nombre" required></div>
        <div class="f-field"><label>Teléfono</label><input id="pf-tel"></div>
        <div class="f-field"><label>Email</label><input id="pf-email" type="email"></div>
        <div class="f-field"><label>Localidad</label><input id="pf-loc"></div>
      </div>
      <div class="pf-grid">
        <div class="f-field"><label>Modelo</label><select id="pf-modelo">${modelosOpts}</select></div>
        <div class="f-field"><label>Revestimiento</label><select id="pf-color">${opt(OPC.color)}</select></div>
        <div class="f-field"><label>Iluminación</label><select id="pf-luz">${opt(OPC.luz)}</select></div>
        <div class="f-field"><label>Borde</label><select id="pf-borde">${opt(OPC.borde)}</select></div>
      </div>
      <div class="f-field"><label>Accesorios</label><div class="acc-list">${acc}</div></div>
      <div class="pf-grid">
        <div class="f-field"><label>Precio total USD (se calcula solo, editable)</label><input id="pf-precio" type="number" min="0"></div>
        <div class="f-field"><label>Plan: nº de cuotas (0 = sin plan)</label><input id="pf-cuotas" type="number" min="0" value="0"></div>
        <div class="f-field"><label>Medio de pago</label><select id="pf-medio">${MEDIOS.map(m => `<option value="${m.id}">${m.nombre}</option>`).join("")}</select></div>
      </div>
      <div class="pf-actions">
        <button type="submit">Guardar pedido</button>
        <button type="button" id="pf-cancel" class="pf-cancel">Cancelar</button>
        <span class="pf-error" id="pf-error"></span>
      </div>
    </form>`;
}

function renderPedidos() {
  const base = filtroLeads === "todos" ? DB.leads : DB.leads.filter(l => (l.estado || "nuevo") === filtroLeads);
  const lista = ordenarLeads(base);
  $("app-main").innerHTML = `
    <div class="pedidos-head">
      <button id="btn-nuevo-pedido" class="btn-primary">+ Nuevo pedido</button>
      <span class="leads-count"><b>${DB.leads.length}</b> pedidos en total</span>
      <div class="orden-toggle">
        <span>Ordenar:</span>
        <button data-orden="pagos" class="${ordenPedidos === "pagos" ? "active" : ""}">Más pagados</button>
        <button data-orden="nuevos" class="${ordenPedidos === "nuevos" ? "active" : ""}">Más nuevos</button>
      </div>
    </div>
    ${pedidoFormHTML()}
    <div class="leads-filter">
      ${["todos", ...ESTADOS].map(f => `<button data-filtro="${f}" class="${filtroLeads === f ? "active" : ""}">${f}</button>`).join("")}
    </div>
    ${lista.length ? lista.map(leadHTML).join("") : `<p class="leads-empty">No hay pedidos con este filtro.</p>`}`;

  $("app-main").querySelectorAll("[data-filtro]").forEach(b =>
    b.addEventListener("click", () => { filtroLeads = b.dataset.filtro; renderPedidos(); }));
  $("app-main").querySelectorAll("[data-orden]").forEach(b =>
    b.addEventListener("click", () => { ordenPedidos = b.dataset.orden; renderPedidos(); }));
  bindPedidoForm();
  bindLeadActions();
  bindPagoActions();
}

// Alta de un pedido desde el panel
function bindPedidoForm() {
  const form = $("form-pedido");
  if (!form) return;
  const cfgActual = () => ({
    color: $("pf-color").value,
    entorno: "cesped",
    luz: $("pf-luz").value,
    borde: $("pf-borde").value,
    accesorios: [...form.querySelectorAll("[data-acc]:checked")].map(c => c.dataset.acc),
  });
  const recalcular = () => {
    const precio = calcPrecio($("pf-modelo").value, cfgActual());
    if (precio != null) $("pf-precio").value = precio;
  };
  ["pf-modelo", "pf-color", "pf-luz", "pf-borde"].forEach(id => $(id).addEventListener("change", recalcular));
  form.querySelectorAll("[data-acc]").forEach(c => c.addEventListener("change", recalcular));
  recalcular();

  $("btn-nuevo-pedido").addEventListener("click", () => {
    form.hidden = !form.hidden;
    if (!form.hidden) { recalcular(); $("pf-nombre").focus(); }
  });
  $("pf-cancel").addEventListener("click", () => { form.hidden = true; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("pf-error");
    const nombre = $("pf-nombre").value.trim();
    if (!nombre) { err.textContent = "Poné al menos el nombre del cliente."; return; }
    const precio = +$("pf-precio").value || 0;
    const nCuotas = Math.max(0, Math.floor(+$("pf-cuotas").value || 0));
    const medio = $("pf-medio").value;
    err.textContent = "";

    const { data: lead, error } = await sb.from("leads").insert({
      nombre,
      telefono: $("pf-tel").value.trim() || null,
      email: $("pf-email").value.trim() || null,
      localidad: $("pf-loc").value.trim() || null,
      modelo_id: $("pf-modelo").value,
      config: cfgActual(),
      presupuesto_usd: precio,
      estado: "nuevo",
      origen: "oficina",
    }).select().single();
    if (error) { err.textContent = "No se pudo guardar: " + error.message; return; }

    if (nCuotas > 0) {
      const monto = Math.round((precio / nCuotas) * 100) / 100;
      const filas = Array.from({ length: nCuotas }, (_, i) => ({
        lead_id: lead.id, nro: i + 1, monto, estado: "pendiente", medio: medio || null, fecha: fechaMas(i + 1),
      }));
      const { error: e2 } = await sb.from("pagos").insert(filas);
      if (e2) { err.textContent = "Pedido guardado, pero falló el plan de cuotas: " + e2.message; }
    }
    await cargarTodo();
    cuotasAbiertas.add(lead.id);
    renderPedidos();
  });
}

// Acciones de cada pedido (estado, escuadra, fecha) — guardan directo en la base
function bindLeadActions() {
  $("app-main").querySelectorAll("[data-accion]").forEach(el => {
    el.addEventListener("change", async () => {
      const id = el.dataset.id;
      const lead = DB.leads.find(l => String(l.id) === String(id));
      let campos = {};
      if (el.dataset.accion === "estado") { campos = { estado: el.value }; if (lead) lead.estado = el.value; el.closest(".lead-item").dataset.estado = el.value; }
      if (el.dataset.accion === "escuadra") { campos = { escuadra_id: el.value || null }; if (lead) lead.escuadra_id = el.value ? +el.value : null; }
      if (el.dataset.accion === "fecha") { campos = { fecha_instalacion: el.value || null }; if (lead) lead.fecha_instalacion = el.value || null; }
      const { error } = await sb.from("leads").update(campos).eq("id", id);
      if (error) alert("No se pudo guardar: " + error.message);
      actualizarBadge();
    });
  });
}

// Acciones sobre las cuotas de un pedido (monto, fecha, estado, medio, alta, baja, plan)
function bindPagoActions() {
  const root = $("app-main");

  root.querySelectorAll("[data-toggle-cuotas]").forEach(b =>
    b.addEventListener("click", () => {
      const id = +b.dataset.toggleCuotas;
      if (cuotasAbiertas.has(id)) cuotasAbiertas.delete(id); else cuotasAbiertas.add(id);
      renderTab();
    }));

  root.querySelectorAll(".cuota-row [data-campo]").forEach(el =>
    el.addEventListener("change", async () => {
      const row = el.closest(".cuota-row");
      const id = +row.dataset.pagoId;
      const campo = el.dataset.campo;
      let val = el.value;
      if (campo === "monto") val = +val || 0;
      if ((campo === "fecha" || campo === "medio") && val === "") val = null;
      const { error } = await sb.from("pagos").update({ [campo]: val }).eq("id", id);
      if (error) { alert("No se pudo guardar: " + error.message); return; }
      const p = DB.pagos.find(x => x.id === id); if (p) p[campo] = val;
      renderTab();
    }));

  root.querySelectorAll("[data-pago-del]").forEach(b =>
    b.addEventListener("click", async () => {
      const id = +b.dataset.pagoDel;
      const { error } = await sb.from("pagos").delete().eq("id", id);
      if (error) { alert("No se pudo eliminar: " + error.message); return; }
      DB.pagos = DB.pagos.filter(x => x.id !== id);
      renderTab();
    }));

  root.querySelectorAll("[data-add-cuota]").forEach(b =>
    b.addEventListener("click", async () => {
      const leadId = +b.dataset.addCuota;
      const nro = pagosDe(leadId).reduce((m, p) => Math.max(m, p.nro || 0), 0) + 1;
      const { data, error } = await sb.from("pagos").insert({ lead_id: leadId, nro, monto: 0, estado: "pendiente" }).select().single();
      if (error) { alert("No se pudo agregar: " + error.message); return; }
      DB.pagos.push(data);
      cuotasAbiertas.add(leadId);
      renderTab();
    }));

  root.querySelectorAll("[data-gen-plan]").forEach(b =>
    b.addEventListener("click", async () => {
      const leadId = +b.dataset.genPlan;
      const n = Math.max(1, Math.floor(+root.querySelector(`[data-gen-n="${leadId}"]`).value || 1));
      const total = +root.querySelector(`[data-gen-total="${leadId}"]`).value || 0;
      if (pagosDe(leadId).length && !confirm("Ya hay cuotas cargadas. ¿Agregar igualmente un plan nuevo encima?")) return;
      const base = pagosDe(leadId).reduce((m, p) => Math.max(m, p.nro || 0), 0);
      const monto = Math.round((total / n) * 100) / 100;
      const filas = Array.from({ length: n }, (_, i) => ({
        lead_id: leadId, nro: base + i + 1, monto, estado: "pendiente", fecha: fechaMas(i + 1),
      }));
      const { data, error } = await sb.from("pagos").insert(filas).select();
      if (error) { alert("No se pudo generar el plan: " + error.message); return; }
      DB.pagos.push(...data);
      cuotasAbiertas.add(leadId);
      renderTab();
    }));
}

// ---------- ESCUADRAS ----------
function renderEscuadras() {
  $("app-main").innerHTML = `
    <form class="inline-form" id="esc-form">
      <div class="f-field"><label>Nombre de la escuadra</label><input id="esc-nombre" required placeholder="Ej: Escuadra B"></div>
      <div class="f-field"><label>Integrantes</label><input id="esc-integrantes" placeholder="Ej: Juan, Pedro y Luis"></div>
      <button type="submit">+ Agregar</button>
    </form>
    ${DB.escuadras.map(e => {
      const asignados = DB.leads.filter(l => l.escuadra_id === e.id && (l.estado || "nuevo") !== "descartado").length;
      return `
      <div class="row-card">
        <div class="rc-main">
          <b>${esc(e.nombre)}</b>
          <span>${esc(e.integrantes || "Sin integrantes cargados")} · ${asignados} obra${asignados !== 1 ? "s" : ""} asignada${asignados !== 1 ? "s" : ""}</span>
        </div>
        <label class="rc-toggle"><input type="checkbox" data-esc-activa="${e.id}" ${e.activa ? "checked" : ""}> Activa</label>
        <button class="rc-del" data-esc-del="${e.id}">Eliminar</button>
      </div>`;
    }).join("") || `<p class="leads-empty">Sin escuadras. Agregá la primera arriba.</p>`}`;

  $("esc-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const { error } = await sb.from("escuadras").insert({
      nombre: $("esc-nombre").value.trim(),
      integrantes: $("esc-integrantes").value.trim() || null,
    });
    if (error) { alert("No se pudo agregar: " + error.message); return; }
    await cargarTodo(); renderEscuadras();
  });
  $("app-main").querySelectorAll("[data-esc-activa]").forEach(cb =>
    cb.addEventListener("change", async () => {
      await sb.from("escuadras").update({ activa: cb.checked }).eq("id", cb.dataset.escActiva);
      const e = DB.escuadras.find(x => String(x.id) === cb.dataset.escActiva);
      if (e) e.activa = cb.checked;
    }));
  $("app-main").querySelectorAll("[data-esc-del]").forEach(b =>
    b.addEventListener("click", async () => {
      if (!confirm("¿Eliminar esta escuadra? Las obras asignadas quedan sin escuadra.")) return;
      await sb.from("leads").update({ escuadra_id: null }).eq("escuadra_id", b.dataset.escDel);
      const { error } = await sb.from("escuadras").delete().eq("id", b.dataset.escDel);
      if (error) { alert("No se pudo eliminar: " + error.message); return; }
      await cargarTodo(); renderEscuadras();
    }));
}

// ---------- STOCK ----------
function renderStock() {
  $("app-main").innerHTML = `
    <form class="inline-form" id="stock-form">
      <div class="f-field"><label>Producto</label><input id="st-nombre" required placeholder="Ej: Bomba 1HP"></div>
      <div class="f-field"><label>Categoría</label><input id="st-cat" placeholder="Ej: Equipos"></div>
      <div class="f-field" style="max-width:110px"><label>Cantidad</label><input id="st-cant" type="number" min="0" value="1"></div>
      <div class="f-field" style="max-width:110px"><label>Mínimo (alerta)</label><input id="st-min" type="number" min="0" value="0"></div>
      <button type="submit">+ Agregar</button>
    </form>
    ${DB.stock.map(s => `
      <div class="row-card ${s.cantidad <= s.minimo ? "bajo" : ""}">
        <div class="rc-main">
          <b>${esc(s.nombre)}</b>
          <span>${esc(s.categoria || "Sin categoría")} · mínimo: ${s.minimo}</span>
        </div>
        ${s.cantidad <= s.minimo ? `<span class="tag-bajo">Reponer</span>` : ""}
        <div class="rc-qty">
          <button data-st-mas="${s.id}" data-delta="-1">−</button>
          <b>${s.cantidad}</b>
          <button data-st-mas="${s.id}" data-delta="1">+</button>
        </div>
        <button class="rc-del" data-st-del="${s.id}">Eliminar</button>
      </div>`).join("") || `<p class="leads-empty">Sin ítems de stock. Agregá el primero arriba.</p>`}`;

  $("stock-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const { error } = await sb.from("stock").insert({
      nombre: $("st-nombre").value.trim(),
      categoria: $("st-cat").value.trim() || null,
      cantidad: +$("st-cant").value || 0,
      minimo: +$("st-min").value || 0,
    });
    if (error) { alert("No se pudo agregar: " + error.message); return; }
    await cargarTodo(); renderStock();
  });
  $("app-main").querySelectorAll("[data-st-mas]").forEach(b =>
    b.addEventListener("click", async () => {
      const item = DB.stock.find(x => String(x.id) === b.dataset.stMas);
      if (!item) return;
      const nueva = Math.max(0, item.cantidad + (+b.dataset.delta));
      const { error } = await sb.from("stock").update({ cantidad: nueva }).eq("id", item.id);
      if (error) { alert("No se pudo guardar: " + error.message); return; }
      item.cantidad = nueva;
      renderStock();
    }));
  $("app-main").querySelectorAll("[data-st-del]").forEach(b =>
    b.addEventListener("click", async () => {
      if (!confirm("¿Eliminar este ítem del stock?")) return;
      const { error } = await sb.from("stock").delete().eq("id", b.dataset.stDel);
      if (error) { alert("No se pudo eliminar: " + error.message); return; }
      await cargarTodo(); renderStock();
    }));
}

// ---------- ARRANQUE ----------
init();
