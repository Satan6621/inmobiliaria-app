-- ============================================
-- Tabla de COMPRADORES
-- ============================================
CREATE TABLE IF NOT EXISTS compradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  tipo_propiedad TEXT NOT NULL DEFAULT 'Apartamento',
  presupuesto_min DECIMAL(12,2) DEFAULT 0,
  presupuesto_max DECIMAL(12,2) DEFAULT 100000,
  ciudad TEXT NOT NULL,
  estado TEXT,
  habitaciones_min INTEGER DEFAULT 1,
  habitaciones_max INTEGER DEFAULT 5,
  banos_min INTEGER DEFAULT 1,
  servicios_requeridos TEXT[] DEFAULT '{}',
  metraje_min INTEGER DEFAULT 0,
  metraje_max INTEGER DEFAULT 500,
  notas TEXT,
  fuente TEXT DEFAULT 'Directo',
  estado_comprador TEXT DEFAULT 'Activo',
  prioridad TEXT DEFAULT 'Normal',
  fecha_contacto TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_compradores_ciudad ON compradores(ciudad);
CREATE INDEX IF NOT EXISTS idx_compradores_tipo ON compradores(tipo_propiedad);
CREATE INDEX IF NOT EXISTS idx_compradores_presupuesto ON compradores(presupuesto_max);
CREATE INDEX IF NOT EXISTS idx_compradores_estado ON compradores(estado_comprador);

-- RLS
ALTER TABLE compradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON compradores
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_compradores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_compradores_updated_at
  BEFORE UPDATE ON compradores
  FOR EACH ROW
  EXECUTE FUNCTION update_compradores_updated_at();
