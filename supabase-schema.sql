-- ============================================================
-- INMOBILIARIA COJEDES - ESQUEMA COMPLETO PARA SUPABASE
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query > Run
-- Este script es IDEMPOTENTE: se puede ejecutar varias veces.
-- ============================================================

-- 1. Activar PostGIS para búsquedas geográficas por radar
create extension if not exists postgis schema extensions;

-- ============================================================
-- JERARQUÍA GEOGRÁFICA (Todos los estados de Venezuela)
-- ============================================================
create table if not exists estados (
    id bigint generated always as identity primary key,
    nombre text not null unique
);

create table if not exists municipios (
    id bigint generated always as identity primary key,
    estado_id bigint references estados(id) on delete cascade,
    nombre text not null,
    unique(estado_id, nombre)
);

create table if not exists zonas_urbanizaciones (
    id bigint generated always as identity primary key,
    municipio_id bigint references municipios(id) on delete cascade,
    nombre text not null,
    unique(municipio_id, nombre)
);

-- ============================================================
-- TABLA PRINCIPAL DE PROPIEDADES (PostGIS + Micro-CRM)
-- ============================================================
create table if not exists propiedades (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    codigo text unique, -- ej: COJ-102
    titulo text not null,
    descripcion text,
    tipo_transaccion text check (tipo_transaccion in ('compra', 'venta')),
    tipo_inmueble text not null, -- 'Apartamento','Casa','Townhouse','Terreno','Galpón','Local'
    estado_construccion text check (estado_construccion in ('obra_gris', 'obra_limpia', 'listo_para_habitar')),
    precio numeric(12, 2) not null,
    habitaciones int default 0,
    banos int default 0,
    metros_cuadrados numeric(8,2),
    nombre_agente text,
    telefono_agente text,

    -- Servicios críticos del mercado local
    tiene_tanque_agua boolean default false,
    tiene_planta_electrica boolean default false,
    aire_acondicionado boolean default false,
    internet boolean default false,
    piscina boolean default false,
    garaje boolean default false,

    -- Ubicación
    estado_id bigint references estados(id),
    municipio_id bigint references municipios(id),
    zona_id bigint references zonas_urbanizaciones(id),
    direccion_completa text,
    coordenadas extensions.geography(Point, 4326),

    -- Verificación
    esta_verificado boolean default false,
    verificado_at timestamp with time zone,

    -- Micro-CRM (métricas)
    vistas integer default 0,
    guardados integer default 0,
    contactos integer default 0,
    esta_paused boolean default false,
    estatus text default 'DISPONIBLE',

    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

do $$ begin
    create index if not exists propiedades_coordenadas_geo_idx on propiedades using gist(coordenadas);
exception when others then null; end $$;

-- ============================================================
-- TABLA DE COMPRADORES (si no existe)
-- ============================================================
create table if not exists compradores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  nombre text not null,
  telefono text not null,
  email text,
  tipo_propiedad text not null default 'Apartamento',
  presupuesto_min numeric(12,2) default 0,
  presupuesto_max numeric(12,2) default 100000,
  ciudad text not null,
  estado text,
  habitaciones_min integer default 1,
  habitaciones_max integer default 5,
  banos_min integer default 1,
  servicios_requeridos text[] default '{}',
  metraje_min integer default 0,
  metraje_max integer default 500,
  notas text,
  fuente text default 'Directo',
  estado_comprador text default 'Activo',
  prioridad text default 'Normal',
  fecha_contacto timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLA DE PROSPECTOS (scraping + CRM)
-- ============================================================
create table if not exists prospectos (
    id bigint generated always as identity primary key,
    fecha text,
    zona text,
    rol text,
    calificado text default 'NO',
    precio_usd numeric(12,2) default 0,
    metros numeric(8,2) default 0,
    precio_m2 numeric(12,2) default 0,
    urgencia_score int default 0,
    servicios text default 'Estándar',
    telefono text default 'Ver enlace',
    whatsapp_link text,
    titulo text,
    detalle text,
    enlace text,
    estado_gestion text default 'NUEVO',
    notas text default '',
    imagenes_urls jsonb default '[]'::jsonb,
    notas_imagenes text default '',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index if not exists prospectos_estado_gestion_idx on prospectos (estado_gestion);

-- ============================================================
-- TABLA DE INVENTARIO PROPIETARIOS (si no existe)
-- ============================================================
create table if not exists inventario (
    id uuid default gen_random_uuid() primary key,
    titulo text,
    tipo text default 'Apartamento',
    estado text default 'Carabobo',
    ciudad text,
    urbanizacion text,
    precio_dueno numeric(12,2) default 0,
    precio_venta numeric(12,2) default 0,
    habs int default 0,
    banos int default 0,
    puestos int default 0,
    metros int default 0,
    precio_m2 numeric(12,2) default 0,
    servicios text,
    descripcion text,
    fotos_rutas text,
    contacto_dueno text,
    estatus text default 'DISPONIBLE',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Columnas de ubicación detallada y código de cartera (idempotente)
alter table inventario add column if not exists codigo text;
alter table inventario add column if not exists municipio text;
alter table inventario add column if not exists zona text;
create index if not exists inventario_codigo_idx on inventario (codigo);
create index if not exists inventario_estado_idx on inventario (estado);

-- ============================================================
-- MULTIMEDIA OPTIMIZADA
-- ============================================================
create table if not exists propiedades_imagenes (
    id bigint generated always as identity primary key,
    propiedad_id uuid references propiedades(id) on delete cascade,
    url_imagen text not null,
    es_principal boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- ALERTAS DE BÚSQUEDA (Filtros Guardados por el Usuario)
-- ============================================================
create table if not exists alertas_busqueda (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    titulo text,
    nombre_agente text,
    precio_min numeric(12, 2),
    precio_max numeric(12, 2),
    estado_id bigint references estados(id),
    municipio_id bigint references municipios(id),
    tipo_inmueble text,
    habitaciones_min int,
    tiene_tanque_agua boolean,
    tiene_planta_electrica boolean,
    esta_verificado boolean,
    activa boolean default true,
    notificaciones_enviadas int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- HISTORIAL DE PRECIOS (para detectar bajadas)
-- ============================================================
create table if not exists historial_precios (
    id bigint generated always as identity primary key,
    propiedad_id uuid references propiedades(id) on delete cascade,
    precio_anterior numeric(12, 2) not null,
    precio_nuevo numeric(12, 2) not null,
    cambio_porcentaje numeric(5, 2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- AGENTES / CORREDORES (Micro-CRM)
-- ============================================================
create table if not exists agentes (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    nombre text not null,
    telefono text,
    email text,
    foto_perfil text,
    especialidad text,
    activo boolean default true,
    propiedades_count int default 0,
    ventas_totales numeric(12, 2) default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- FAVORITOS
-- ============================================================
create table if not exists favoritos (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users(id) on delete cascade,
    propiedad_id uuid references propiedades(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, propiedad_id)
);

-- ============================================================
-- RLS: Seguridad por fila
-- - Propiedades: CUALQUIERA lee, solo el CREADOR edita/elimina
-- - Alertas/Favoritos: CUALQUIERA lee, solo el CREADOR gestiona
-- - Resto de tablas: política abierta (compatibilidad)
-- ============================================================

-- 1. PROPEDADES: lectura pública + dueño gestiona
alter table propiedades enable row level security;

drop policy if exists "allow_all_propiedades" on propiedades;
drop policy if exists "propiedades_select_public" on propiedades;
drop policy if exists "propiedades_insert_own" on propiedades;
drop policy if exists "propiedades_update_own" on propiedades;
drop policy if exists "propiedades_delete_own" on propiedades;

create policy "propiedades_select_public" on propiedades
    for select using (true);

create policy "propiedades_insert_own" on propiedades
    for insert to anon, authenticated
    with check (auth.uid() = user_id or user_id is null);

create policy "propiedades_update_own" on propiedades
    for update to anon, authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "propiedades_delete_own" on propiedades
    for delete to anon, authenticated
    using (auth.uid() = user_id);

-- 2. ALERTAS DE BÚSQUEDA: lectura pública + dueño gestiona
alter table alertas_busqueda enable row level security;

drop policy if exists "allow_all_alertas_busqueda" on alertas_busqueda;
drop policy if exists "alertas_select_public" on alertas_busqueda;
drop policy if exists "alertas_insert_own" on alertas_busqueda;
drop policy if exists "alertas_update_own" on alertas_busqueda;
drop policy if exists "alertas_delete_own" on alertas_busqueda;

create policy "alertas_select_public" on alertas_busqueda
    for select using (true);

create policy "alertas_insert_own" on alertas_busqueda
    for insert to anon, authenticated
    with check (auth.uid() = user_id or user_id is null);

create policy "alertas_update_own" on alertas_busqueda
    for update to anon, authenticated
    using (auth.uid() = user_id);

create policy "alertas_delete_own" on alertas_busqueda
    for delete to anon, authenticated
    using (auth.uid() = user_id);

-- 3. FAVORITOS: dueño gestiona
alter table favoritos enable row level security;

drop policy if exists "allow_all_favoritos" on favoritos;
drop policy if exists "favoritos_select_public" on favoritos;
drop policy if exists "favoritos_insert_own" on favoritos;
drop policy if exists "favoritos_delete_own" on favoritos;

create policy "favoritos_select_public" on favoritos
    for select using (true);

create policy "favoritos_insert_own" on favoritos
    for insert to anon, authenticated
    with check (auth.uid() = user_id or user_id is null);

create policy "favoritos_delete_own" on favoritos
    for delete to anon, authenticated
    using (auth.uid() = user_id);

-- 4. Tablas auxiliares / existentes: política abierta (compatibilidad)
do $$ declare tbl text; begin
    foreach tbl in array array['prospectos','compradores','inventario','propiedades_imagenes','historial_precios','agentes','estados','municipios','zonas_urbanizaciones'] loop
        execute format('alter table %I enable row level security;', tbl);
        execute format('drop policy if exists "allow_all_%I" on %I;', tbl, tbl);
        execute format('create policy "allow_all_%I" on %I for all using (true) with check (true);', tbl, tbl);
    end loop;
end $$;

-- Trigger updated_at para tablas que lo requieren
create or replace function update_timestamp()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

do $$ begin
    drop trigger if exists trg_propiedades_updated on propiedades;
    drop trigger if exists trg_compradores_updated on compradores;
drop trigger if exists trg_prospectos_updated on prospectos;
drop trigger if exists trg_inventario_updated on inventario;
drop trigger if exists trg_alertas_updated on alertas_busqueda;
exception when others then null; end $$;

create trigger trg_propiedades_updated before update on propiedades
    for each row execute function update_timestamp();
create trigger trg_compradores_updated before update on compradores
    for each row execute function update_timestamp();
create trigger trg_prospectos_updated before update on prospectos
    for each row execute function update_timestamp();
create trigger trg_inventario_updated before update on inventario
    for each row execute function update_timestamp();
create trigger trg_alertas_updated before update on alertas_busqueda
    for each row execute function update_timestamp();

-- ============================================================
-- DATA INICIAL: Venezuela (21 estados) + Cojedes completo
-- ============================================================
insert into estados (nombre) values
('Cojedes'),('Carabobo'),('Distrito Capital'),('Miranda'),('Aragua'),('Lara'),
('Zulia'),('Anzoátegui'),('Bolívar'),('Falcón'),('Mérida'),('Táchira'),
('Trujillo'),('Yaracuy'),('Guárico'),('Monagas'),('Sucre'),('Nueva Esparta'),
('Amazonas'),('Delta Amacuro'),('Vargas')
on conflict (nombre) do nothing;

-- Municipios de Cojedes (estado 1)
insert into municipios (estado_id, nombre) values
((select id from estados where nombre='Cojedes'), 'San Carlos'),
((select id from estados where nombre='Cojedes'), 'Tinaquillo'),
((select id from estados where nombre='Cojedes'), 'Anzoátegui'),
((select id from estados where nombre='Cojedes'), 'Girardot'),
((select id from estados where nombre='Cojedes'), 'Lima Blanco'),
((select id from estados where nombre='Cojedes'), 'Mocochí'),
((select id from estados where nombre='Cojedes'), 'Monagas'),
((select id from estados where nombre='Cojedes'), 'Ricaurte'),
((select id from estados where nombre='Cojedes'), 'San Andrés'),
((select id from estados where nombre='Cojedes'), 'Sucre'),
((select id from estados where nombre='Cojedes'), 'Tinaco'),
((select id from estados where nombre='Cojedes'), 'Turén')
on conflict (estado_id, nombre) do nothing;

-- Zonas de San Carlos
insert into zonas_urbanizaciones (municipio_id, nombre) values
((select id from municipios where nombre='San Carlos'), 'Centro de San Carlos'),
((select id from municipios where nombre='San Carlos'), 'Urbanización Limoncito'),
((select id from municipios where nombre='San Carlos'), 'Cantaclaro'),
((select id from municipios where nombre='San Carlos'), 'Urbanización El Carmen'),
((select id from municipios where nombre='San Carlos'), 'La Aurora'),
((select id from municipios where nombre='San Carlos'), 'San Rafael'),
((select id from municipios where nombre='San Carlos'), 'El Maracay')
on conflict (municipio_id, nombre) do nothing;

-- Zonas de Tinaquillo
insert into zonas_urbanizaciones (municipio_id, nombre) values
((select id from municipios where nombre='Tinaquillo'), 'Centro de Tinaquillo'),
((select id from municipios where nombre='Tinaquillo'), 'La Campiña'),
((select id from municipios where nombre='Tinaquillo'), 'Villa Italia'),
((select id from municipios where nombre='Tinaquillo'), 'Los Samanes'),
((select id from municipios where nombre='Tinaquillo'), 'Urbanización Miranda'),
((select id from municipios where nombre='Tinaquillo'), 'La Macandona')
on conflict (municipio_id, nombre) do nothing;

-- ============================================================
-- FUNCIONES RPC
-- ============================================================

-- Radar de cercanía (búsqueda por radio en metros)
create or replace function buscar_propiedades_radar(
    lat_usuario double precision,
    lon_usuario double precision,
    radio_metros double precision
)
returns setof propiedades as $$
begin
    return query
    select *
    from propiedades
    where coordenadas is not null
      and extensions.ST_DWithin(
        coordenadas,
        extensions.ST_SetSRID(extensions.ST_MakePoint(lon_usuario, lat_usuario), 4326)::extensions.geography,
        radio_metros
      )
      and not esta_paused
    order by extensions.ST_Distance(
        coordenadas,
        extensions.ST_SetSRID(extensions.ST_MakePoint(lon_usuario, lat_usuario), 4326)::extensions.geography
    );
end;
$$ language plpgsql security definer;

create or replace function incrementar_vistas(prop_id uuid)
returns void as $$
begin
    update propiedades set vistas = vistas + 1 where id = prop_id;
end;
$$ language plpgsql security definer;

create or replace function incrementar_guardados(prop_id uuid)
returns void as $$
begin
    update propiedades set guardados = guardados + 1 where id = prop_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Contador de propiedades por agente
create or replace function actualizar_contador_agentes()
returns trigger as $$
begin
    update agentes
    set propiedades_count = (select count(*) from propiedades where user_id = new.user_id)
    where user_id = new.user_id;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_actualizar_agente on propiedades;
create trigger trigger_actualizar_agente
after insert or delete on propiedades
for each row execute function actualizar_contador_agentes();

-- Registrar cambios de precio
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

-- ============================================================
-- REALTIME: publicar cambios de estas tablas a los clientes
-- ============================================================
do $$ begin
    alter publication supabase_realtime add table propiedades;
exception when duplicate_object then null; end $$;
do $$ begin
    alter publication supabase_realtime add table alertas_busqueda;
exception when duplicate_object then null; end $$;
do $$ begin
    alter publication supabase_realtime add table inventario;
exception when duplicate_object then null; end $$;
do $$ begin
    alter publication supabase_realtime add table compradores;
exception when duplicate_object then null; end $$;
do $$ begin
    alter publication supabase_realtime add table prospectos;
exception when duplicate_object then null; end $$;
do $$ begin
    alter publication supabase_realtime add table historial_precios;
exception when duplicate_object then null; end $$;

-- ============================================================
-- STORAGE: bucket de fotos con lectura pública
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'inmuebles-fotos',
    'inmuebles-fotos',
    true,
    5242880, -- 5 MB máx
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = true;

-- Lectura pública de las fotos
drop policy if exists "inmuebles-fotos read public" on storage.objects;
create policy "inmuebles-fotos read public" on storage.objects
    for select using (bucket_id = 'inmuebles-fotos');

-- Subida permitida (la app procesa a WebP en Node antes de subir)
drop policy if exists "inmuebles-fotos insert" on storage.objects;
create policy "inmuebles-fotos insert" on storage.objects
    for insert to anon, authenticated
    with check (bucket_id = 'inmuebles-fotos');

drop policy if exists "inmuebles-fotos update" on storage.objects;
create policy "inmuebles-fotos update" on storage.objects
    for update to anon, authenticated
    using (bucket_id = 'inmuebles-fotos');

drop policy if exists "inmuebles-fotos delete" on storage.objects;
create policy "inmuebles-fotos delete" on storage.objects
    for delete to anon, authenticated
    using (bucket_id = 'inmuebles-fotos');