-- =========================================================
-- A&M PISCINAS — Esquema parte 3: pagos y cuotas de los pedidos
-- CÓMO USAR: Supabase → SQL Editor → New query → pegar TODO → Run.
-- Correr DESPUÉS de schema.sql y schema2.sql. Seguro de correr varias veces.
-- =========================================================

-- Origen del pedido: 'web' (lo hizo el cliente en el sitio) u 'oficina'
-- (lo cargó un empleado desde el panel, cliente presencial).
alter table leads add column if not exists origen text default 'web';

-- Pagos / cuotas de cada pedido. Modelo detallado: UNA fila por cuota,
-- con su monto, fecha, estado y medio de pago propios.
--   estado: 'pendiente' (debe) | 'proceso' (en proceso) | 'pagado'
create table if not exists pagos (
  id         bigint generated always as identity primary key,
  lead_id    bigint not null references leads(id) on delete cascade,
  nro        int,                         -- número de cuota (1, 2, 3…)
  monto      numeric default 0,           -- monto de la cuota (USD)
  fecha      date,                        -- fecha de pago o vencimiento
  estado     text default 'pendiente',    -- pendiente | proceso | pagado
  medio      text,                        -- efectivo | transferencia | debito | credito | cheque | otro
  nota       text,
  created_at timestamptz default now()
);

create index if not exists pagos_lead_idx on pagos(lead_id);

-- Seguridad: los pagos son SOLO para empleados logueados.
alter table pagos enable row level security;
drop policy if exists "empleado pagos" on pagos;
create policy "empleado pagos" on pagos for all to authenticated using (true) with check (true);
