-- ============================================================
-- INMOBILIARIA COJEDES - Esquema PostGIS para Supabase
-- ============================================================

-- 1. Activar PostGIS para búsquedas geográficas por radar
create extension if not exists postgis schema extensions;

-- 2. Jerarquía Geográfica (Indexación de Cojedes y todo Venezuela)
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

-- 3. Tabla Principal de Propiedades (Con soporte PostGIS y micro-CRM)
create table if not exists propiedades (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    titulo text not null,
    descripcion text,
    tipo_transaccion text check (tipo_transaccion in ('compra', 'venta')),
    tipo_inmueble text not null,
    estado_construccion text check (estado_construccion in ('obra_gris', 'obra_limpia', 'listo_para_habitar')),
    precio numeric(12, 2) not null,
    habitaciones int default 0,
    banos int default 0,
    metros_cuadrados numeric(8,2),
    
    -- Servicios críticos (Filtros específicos para el mercado local)
    tiene_tanque_agua boolean default false,
    tiene_planta_electrica boolean default false,
    aire_acondicionado boolean default false,
    internet boolean default false,
    piscina boolean default false,
    garaje boolean default false,
    
    -- Ubicación exacta usando PostGIS
    estado_id bigint references estados(id),
    municipio_id bigint references municipios(id),
    zona_id bigint references zonas_urbanizaciones(id),
    direccion_completa text,
    coordenadas extensions.geography(Point, 4326) not null,
    
    -- Módulo de Verificación
    esta_verificado boolean default false,
    verificado_at timestamp with zone,
    
    -- Micro-CRM (Métricas)
    vistas integer default 0,
    guardados integer default 0,
    contactos integer default 0,
    esta_paused boolean default false,
    
    created_at timestamp with zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with zone default timezone('utc'::text, now()) not null
);

-- Índice espacial GIST para radar instantáneo
create index if not exists propiedades_coordenadas_geo_idx on propiedades using gist(coordenadas);

-- 4. Tabla Multimedia Optimizada
create table if not exists propiedades_imagenes (
    id bigint generated always as identity primary key,
    propiedad_id uuid references propiedades(id) on delete cascade,
    url_imagen text not null,
    es_principal boolean default false,
    created_at timestamp with zone default timezone('utc'::text, now()) not null
);

-- 5. Alertas de Búsqueda (Filtros Guardados)
create table if not exists alertas_busqueda (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    titulo text,
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
    created_at timestamp with zone default timezone('utc'::text, now()) not null
);

-- 6. Historial de Precios (Para detectar bajadas)
create table if not exists historial_precios (
    id bigint generated always as identity primary key,
    propiedad_id uuid references propiedades(id) on delete cascade,
    precio_anterior numeric(12, 2) not null,
    precio_nuevo numeric(12, 2) not null,
    cambio_porcentaje numeric(5, 2),
    created_at timestamp with zone default timezone('utc'::text, now()) not null
);

-- 7. Tabla de Agentes/Corredores (Micro-CRM)
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
    created_at timestamp with zone default timezone('utc'::text, now()) not null
);

-- 8. Favoritos de Usuarios
create table if not exists favoritos (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users(id) on delete cascade,
    propiedad_id uuid references propiedades(id) on delete cascade,
    created_at timestamp with zone default timezone('utc'::text, now()) not null,
    unique(user_id, propiedad_id)
);

-- ============================================================
-- INSERCIÓN DE DATOS INICIALES - COJEDES
-- ============================================================

-- Estado Cojedes
insert into estados (nombre) values ('Cojedes') on conflict do nothing;

-- Municipios de Cojedes (id = 1)
insert into municipios (estado_id, nombre) values 
(1, 'San Carlos'),
(1, 'Tinaquillo'),
(1, 'Anzoátegui'),
(1, 'Girardot'),
(1, 'Lima Blanco'),
(1, 'Mocochí'),
(1, 'Monagas'),
(1, 'Ricaurte'),
(1, 'San Andrés'),
(1, 'Sucre'),
(1, 'Tinaco'),
(1, 'Turén')
on conflict do nothing;

-- Zonas de San Carlos (municipio_id = 1)
insert into zonas_urbanizaciones (municipio_id, nombre) values 
(1, 'Centro de San Carlos'),
(1, 'Urbanización Limoncito'),
(1, 'Cantaclaro'),
(1, 'Urbanización El Carmen'),
(1, 'La Aurora'),
(1, 'San Rafael')
on conflict do nothing;

-- Zonas de Tinaquillo (municipio_id = 2)
insert into zonas_urbanizaciones (municipio_id, nombre) values 
(2, 'Centro de Tinaquillo'),
(2, 'La Campiña'),
(2, 'El(coeffs),
(2, 'Villa Italia'),
(2, 'Los Samanes'),
(2, 'Urbanización Miranda')
on conflict do nothing;

-- Otros estados de Venezuela
insert into estados (nombre) values 
('Aragua'),
('Carabobo'),
('Lara'),
('Zulia'),
('Miranda'),
('Distrito Capital'),
('Bolívar'),
('Falcón'),
('Mérida'),
('Táchira'),
('Trujillo'),
('Yaracuy'),
('Nueva Esparta'),
('Guárico'),
('Anzoátegui'),
('Monagas'),
('Sucre'),
('Delta Amacuro'),
('Amazonas'),
('Vargas')
on conflict do nothing;

-- ============================================================
-- FUNCIONES RPC PARA EL RADAR
-- ============================================================

-- Función de Radar de Cercanía
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
    where extensions.ST_DWithin(
        coordenadas,
        extensions.ST_SetSRID(extensions.ST_MakePoint(lon_usuario, lat_usuario), 4326)::extensions.geography,
        radio_metros
    )
    and esta_paused = false
    order by extensions.ST_Distance(
        coordenadas,
        extensions.ST_SetSRID(extensions.ST_MakePoint(lon_usuario, lat_usuario), 4326)::extensions.geography
    );
end;
$$ language plpgsql security definer;

-- Función para incrementar vistas
create or replace function incrementar_vistas(prop_id uuid)
returns void as $$
begin
    update propiedades set vistas = vistas + 1 where id = prop_id;
end;
$$ language plpgsql security definer;

-- Función para incrementar guardados
create or replace function incrementar_guardados(prop_id uuid)
returns void as $$
begin
    update propiedades set guardados = guardados + 1 where id = prop_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- TRIGGER: Actualizar contador de propiedades del agente
-- ============================================================

create or replace function actualizar_contador_agentes()
returns trigger as $$
begin
    update agentes 
    set propiedades_count = (select count(*) from propiedades where user_id = new.user_id)
    where user_id = new.user_id;
    return new;
end;
$$ language plpgsql;

create trigger trigger_actualizar_agente
after insert or delete on propiedades
for each row execute function actualizar_contador_agentes();

-- ============================================================
-- TRIGGER: Registrar historial de precios
-- ============================================================

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

create trigger trigger_historial_precios
before update on propiedades
for each row execute function registrar_cambio_precio();
