-- =========================================================
-- A&M PISCINAS — Esquema de base de datos (Supabase / PostgreSQL)
-- CÓMO USAR: Supabase → SQL Editor → New query → pegar TODO → Run.
-- Es seguro correrlo varias veces (usa "if not exists").
-- =========================================================

-- ---------- CONTENIDO EDITABLE ----------

create table if not exists config_sitio (
  id               int primary key default 1,
  hero_titulo      text,
  hero_sub         text,
  whatsapp         text,
  whatsapp_display text,
  instagram        text,
  flag_precios     boolean default true,
  flag_ejemplo     boolean default true,
  flag_faq         boolean default true,
  updated_at       timestamptz default now(),
  constraint solo_una_fila check (id = 1)
);

create table if not exists modelos (
  id               text primary key,
  nombre           text not null,
  gama             text not null,        -- alta | media | baja
  linea            text,
  marca            text,
  largo            numeric,
  ancho            numeric,
  profundidad      numeric,
  capacidad_litros int,
  solarium         text,
  escalones        int,
  material         text,
  precio_base      numeric,
  es_boceto        boolean default false,
  imagen           text,
  orden            int default 0,
  activo           boolean default true
);

create table if not exists obras (
  id        bigint generated always as identity primary key,
  titulo    text,
  modelo    text,
  localidad text,
  imagen    text,
  orden     int default 0
);

create table if not exists testimonios (
  id        bigint generated always as identity primary key,
  texto     text,
  nombre    text,
  localidad text,
  estrellas int default 5,
  orden     int default 0
);

create table if not exists faq (
  id        bigint generated always as identity primary key,
  pregunta  text,
  respuesta text,
  orden     int default 0
);

-- ---------- LEADS (pedidos de presupuesto) ----------

create table if not exists leads (
  id              bigint generated always as identity primary key,
  nombre          text,
  telefono        text,
  email           text,
  localidad       text,
  dia             text,
  horario         text,
  modelo_id       text,
  config          jsonb,          -- diseño completo (color, luz, borde, accesorios...)
  presupuesto_usd numeric,
  estado          text default 'nuevo',   -- nuevo | contactado | cerrado | descartado
  notas           text,
  created_at      timestamptz default now()
);

-- =========================================================
-- SEGURIDAD (Row Level Security)
--   - Cliente (anónimo): LEE el contenido y puede CREAR un lead.
--   - Empleado (logueado): maneja TODO (edita contenido, ve/gestiona leads).
-- =========================================================

alter table config_sitio enable row level security;
alter table modelos      enable row level security;
alter table obras        enable row level security;
alter table testimonios  enable row level security;
alter table faq          enable row level security;
alter table leads        enable row level security;

-- Lectura pública del contenido
drop policy if exists "leer config"      on config_sitio;
create policy "leer config"      on config_sitio for select using (true);
drop policy if exists "leer modelos"     on modelos;
create policy "leer modelos"     on modelos      for select using (true);
drop policy if exists "leer obras"       on obras;
create policy "leer obras"       on obras        for select using (true);
drop policy if exists "leer testimonios" on testimonios;
create policy "leer testimonios" on testimonios  for select using (true);
drop policy if exists "leer faq"         on faq;
create policy "leer faq"         on faq          for select using (true);

-- El cliente puede CREAR un lead (pero no leer los de otros)
drop policy if exists "crear lead" on leads;
create policy "crear lead" on leads for insert to anon, authenticated with check (true);

-- Empleados logueados manejan todo el contenido y los leads
drop policy if exists "empleado config"      on config_sitio;
create policy "empleado config"      on config_sitio for all to authenticated using (true) with check (true);
drop policy if exists "empleado modelos"     on modelos;
create policy "empleado modelos"     on modelos      for all to authenticated using (true) with check (true);
drop policy if exists "empleado obras"       on obras;
create policy "empleado obras"       on obras        for all to authenticated using (true) with check (true);
drop policy if exists "empleado testimonios" on testimonios;
create policy "empleado testimonios" on testimonios  for all to authenticated using (true) with check (true);
drop policy if exists "empleado faq"         on faq;
create policy "empleado faq"         on faq          for all to authenticated using (true) with check (true);
drop policy if exists "empleado leads"       on leads;
create policy "empleado leads"       on leads        for all to authenticated using (true) with check (true);

-- ---------- Fila inicial de configuración ----------
insert into config_sitio (id, hero_titulo, hero_sub, whatsapp, whatsapp_display, instagram)
values (
  1,
  'Tres gamas. Una sola piscina: la tuya.',
  'Trabajamos con distintos fabricantes para cubrir cada presupuesto. Elegí tu modelo, personalizá los detalles y llevate el presupuesto al instante.',
  '5493513394942',
  '+54 9 351 339 4942',
  'savarella_bruno'
)
on conflict (id) do nothing;
