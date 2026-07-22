-- =========================================================
-- A&M PISCINAS — Esquema parte 2: operaciones (panel del vendedor)
-- CÓMO USAR: Supabase → SQL Editor → New query → pegar TODO → Run.
-- Seguro de correr varias veces.
-- =========================================================

-- Escuadras de instaladores
create table if not exists escuadras (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  integrantes text,
  activa      boolean default true
);

-- Stock de la empresa (piscinas, bombas, accesorios, insumos)
create table if not exists stock (
  id        bigint generated always as identity primary key,
  nombre    text not null,
  categoria text,
  cantidad  int default 0,
  minimo    int default 0,      -- alerta cuando cantidad <= minimo
  notas     text
);

-- Campos de gestión en los pedidos (asignación de escuadra y fecha de obra)
alter table leads add column if not exists escuadra_id bigint references escuadras(id);
alter table leads add column if not exists fecha_instalacion date;

-- Seguridad: escuadras y stock son SOLO para empleados logueados
alter table escuadras enable row level security;
alter table stock     enable row level security;

drop policy if exists "empleado escuadras" on escuadras;
create policy "empleado escuadras" on escuadras for all to authenticated using (true) with check (true);
drop policy if exists "empleado stock" on stock;
create policy "empleado stock" on stock for all to authenticated using (true) with check (true);

-- Datos de ejemplo (solo si las tablas están vacías)
insert into escuadras (nombre, integrantes)
select 'Escuadra A', 'A definir'
where not exists (select 1 from escuadras);

insert into stock (nombre, categoria, cantidad, minimo)
select * from (values
  ('Piscina S800 (fibra)', 'Piscinas', 2, 1),
  ('Bomba de filtrado 1HP', 'Equipos', 5, 2),
  ('Kit LED RGB', 'Accesorios', 8, 3),
  ('Cloro granulado 10kg', 'Insumos', 12, 4)
) as v(nombre, categoria, cantidad, minimo)
where not exists (select 1 from stock);
