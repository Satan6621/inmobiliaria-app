-- ============================================
-- Agregar campo de imágenes a prospectos
-- ============================================
ALTER TABLE prospectos ADD COLUMN IF NOT EXISTS imagenes_urls TEXT[] DEFAULT '{}';
ALTER TABLE prospectos ADD COLUMN IF NOT EXISTS notas_imagenes TEXT DEFAULT '';
