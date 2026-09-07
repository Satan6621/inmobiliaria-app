-- =============================================
-- SCHEMA DE BASE DE DATOS PARA VENEZUELA INMOBILIARIA
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla de Prospectos (Leads)
CREATE TABLE IF NOT EXISTS prospectos (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  zona TEXT NOT NULL DEFAULT '',
  rol TEXT NOT NULL DEFAULT '',
  calificado TEXT NOT NULL DEFAULT 'NO',
  precio_usd NUMERIC(12,2) DEFAULT 0,
  metros NUMERIC(8,2) DEFAULT 0,
  precio_m2 NUMERIC(10,2) DEFAULT 0,
  urgencia_score INTEGER DEFAULT 0,
  servicios TEXT DEFAULT 'Estándar',
  telefono TEXT DEFAULT 'Ver enlace',
  whatsapp_link TEXT DEFAULT '',
  titulo TEXT NOT NULL DEFAULT '',
  detalle TEXT DEFAULT '',
  enlace TEXT UNIQUE NOT NULL,
  estado_gestion TEXT DEFAULT 'NUEVO' CHECK (estado_gestion IN ('NUEVO', 'CONTACTADO', 'EN NEGOCIACION', 'DESCARTADO')),
  notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Inventario (Cartera de Inmuebles)
CREATE TABLE IF NOT EXISTS inventario (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  titulo TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'Apartamento',
  estado TEXT NOT NULL DEFAULT 'Carabobo',
  ciudad TEXT DEFAULT '',
  urbanizacion TEXT DEFAULT '',
  precio_dueno NUMERIC(12,2) DEFAULT 0,
  precio_venta NUMERIC(12,2) DEFAULT 0,
  habs INTEGER DEFAULT 0,
  banos INTEGER DEFAULT 0,
  puestos INTEGER DEFAULT 0,
  metros NUMERIC(8,2) DEFAULT 0,
  precio_m2 NUMERIC(10,2) DEFAULT 0,
  servicios TEXT DEFAULT 'Básicos',
  descripcion TEXT DEFAULT '',
  fotos_rutas TEXT DEFAULT '',
  contacto_dueno TEXT DEFAULT '',
  estatus TEXT DEFAULT 'DISPONIBLE' CHECK (estatus IN ('DISPONIBLE', 'RESERVADO', 'VENDIDO')),
  check_titulo INTEGER DEFAULT 0,
  check_catastro INTEGER DEFAULT 0,
  check_solvencia INTEGER DEFAULT 0,
  check_hipoteca INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_prospectos_estado ON prospectos(estado_gestion);
CREATE INDEX IF NOT EXISTS idx_prospectos_rol ON prospectos(rol);
CREATE INDEX IF NOT EXISTS idx_prospectos_zona ON prospectos(zona);
CREATE INDEX IF NOT EXISTS idx_inventario_estado ON inventario(estado);
CREATE INDEX IF NOT EXISTS idx_inventario_ciudad ON inventario(ciudad);
CREATE INDEX IF NOT EXISTS idx_inventario_estatus ON inventario(estatus);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_prospectos_updated_at
  BEFORE UPDATE ON prospectos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventario_updated_at
  BEFORE UPDATE ON inventario
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE prospectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (ajustar según necesidades de autenticación)
-- Para desarrollo: acceso completo sin autenticación
CREATE POLICY "Allow all for authenticated users" ON prospectos
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON inventario
  FOR ALL USING (true);
