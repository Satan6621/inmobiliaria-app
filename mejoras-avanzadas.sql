-- ============================================================
-- INMOBILIARIA CHUO-ZU - MEJORAS AVANZADAS (IDEMPOTENTE)
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

-- 1) HISTORIAL DE PRECIOS --------------------------------------------------
-- Tabla ya existe en el esquema base; este bloque asegura que exista y
-- que el trigger registre CADA cambio de precio automáticamente.
create table if not exists historial_precios (
    id bigint generated always as identity primary key,
    propiedad_id uuid references propiedades(id) on delete cascade,
    precio_anterior numeric(12, 2) not null,
    precio_nuevo numeric(12, 2) not null,
    cambio_porcentaje numeric(5, 2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace function registrar_cambio_precio()
returns trigger as $$
begin
    if old.precio <> new.precio then
        insert into historial_precios (propiedad_id, precio_anterior, precio_nuevo, cambio_porcentaje)
        values (new.id, old.precio, new.precio,
                round(((new.precio - old.precio) / old.precio * 100)::numeric, 2));
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_historial_precios on propiedades;
create trigger trigger_historial_precios
    before update on propiedades
    for each row execute function registrar_cambio_precio();

-- 2) REPORTES ANTIFRAUDE ---------------------------------------------------
-- Cualquiera reporta una propiedad; con >=3 reportes distintos en 48h
-- el sistema la oculta automáticamente (estatus='REVISION').
create table if not exists reportes_propiedades (
    id bigint generated always as identity primary key,
    propiedad_id uuid not null references propiedades(id) on delete cascade,
    user_id uuid references auth.users(id),
    motivo text check (motivo in ('ya_vendido', 'informacion_falsa', 'estafa', 'duplicado')),
    comentarios text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists reportes_propiedad_idx
    on reportes_propiedades (propiedad_id, created_at);

-- RLS: el público reporta (insert), solo sesiones autenticadas de asesor leen
alter table reportes_propiedades enable row level security;
drop policy if exists "reportes_insert_pub" on reportes_propiedades;
create policy "reportes_insert_pub" on reportes_propiedades
    for insert to anon, authenticated with check (true);
drop policy if exists "reportes_select_auth" on reportes_propiedades;
create policy "reportes_select_auth" on reportes_propiedades
    for select to authenticated using (true);
drop policy if exists "reportes_delete_auth" on reportes_propiedades;
create policy "reportes_delete_auth" on reportes_propiedades
    for delete to authenticated using (true);

-- Trigger: ocultar propiedad tras 3 reportes en 48 horas
create or replace function ocultar_propiedad_por_reportes()
returns trigger as $$
declare
    conteo int;
begin
    select count(*) into conteo
    from reportes_propiedades
    where propiedad_id = new.propiedad_id
      and created_at > now() - interval '48 hours';
    if conteo >= 3 then
        update propiedades
        set estatus = 'REVISION', esta_paused = true, updated_at = now()
        where id = new.propiedad_id;
    end if;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_ocultar_por_reportes on reportes_propiedades;
create trigger trigger_ocultar_por_reportes
    after insert on reportes_propiedades
    for each row execute function ocultar_propiedad_por_reportes();

-- Realtime: el CRM se entera de los reportes al instante
do $$ begin
    alter publication supabase_realtime add table reportes_propiedades;
exception when duplicate_object then null; end $$;

-- 3) PROPIEDADES GEMELAS (de-duplicación) ----------------------------------
-- Vista que agrupa anuncios iguales o casi idénticos por:
-- estado + municipio + metraje (bucket 10 m²) + habitaciones + baños + banda de precio.
create or replace view v_propiedades_gemelas as
with base as (
    select p.id::text as id, p.precio,
           coalesce(e.nombre, '') as estado,
           coalesce(m.nombre, '') as municipio,
           coalesce(round((p.metros_cuadrados / 10)::numeric) * 10, -1) as m2_bucket,
           coalesce(p.habitaciones, -1) as habitaciones,
           coalesce(p.banos, -1) as banos,
           (round((p.precio / 2500)::numeric) * 2500) as banda_precio
    from propiedades p
    left join municipios m on m.id = p.municipio_id
    left join estados e on e.id = p.estado_id
    where p.estatus in ('DISPONIBLE', 'REVISION')
      and not coalesce(p.esta_paused, false)
      and p.precio > 0
)
select min(id) as representante,
       array_agg(id order by id) as ids,
       count(*) as gemelas
from base
group by estado, municipio, m2_bucket, habitaciones, banos, banda_precio
having count(*) > 1;

-- 4) ALERTA DE SEGURIDAD EN STORAGE ----------------------------------------
-- (La marca de agua se aplica en el servidor via /api/upload con sharp,
--  reemplazando la necesidad de un bucket privado + edge function.)
-- Si más adelante quieres bloquear subidas directas, ejecuta:
--   drop policy if exists "inmuebles-fotos insert" on storage.objects;
--   drop policy if exists "inmuebles-fotos update" on storage.objects;
--   drop policy if exists "inmuebles-fotos delete" on storage.objects;