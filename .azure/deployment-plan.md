# Plan de Mejoras - Venezuela Inmobiliaria v2.0

## Resumen
Agregar 8 funcionalidades nuevas para potenciar la app a nivel premium.

---

## 1. AI con Google Gemini para Búsqueda Inteligente
**Archivos:** `src/app/api/ai-search/route.ts`, `src/components/ai-search.tsx`
**Dependencia:** `@google/generative-ai`

- API route que recibe un query y usa Gemini para analizar resultados web
- Componente de búsqueda AI con input y resultados estructurados
- Gemini extrae: precio, ubicación, tipo, teléfono, servicios, score de calidad
- Integración con el rastreador actual (mejorar scoring con AI)

## 2. Upload de Imágenes con Supabase Storage
**Archivos:** `src/app/api/upload/route.ts`, `src/components/image-upload.tsx`
**Dependencia:** `@supabase/ssr`

- Crear bucket `inmuebles` en Supabase Storage
- Componente drag & drop para subir imágenes
- Preview de imágenes antes de subir
- Almacenar URLs en la tabla `inventario.fotos_rutas`
- Galería de imágenes en cada inmueble

## 3. Google Maps Integrado
**Archivos:** `src/components/property-map.tsx`, `src/app/api/geocode/route.ts`
**Dependencia:** `@react-google-maps/api`

- Mapa interactivo mostrando pins de propiedades
- Geocoding automático de direcciones al guardar inmueble
- Filtro de propiedades por zona en el mapa
- Vista de satélite y street view
- Popup con info del inmueble al hacer click en pin

## 4. Dashboard de Analytics con Gráficos
**Archivos:** `src/app/analytics/page.tsx`
**Dependencia:** `recharts` (ya instalado)

- Gráfico de tendencias de precios por zona
- Distribución de propiedades por tipo y estado
- Métricas del CRM: tasa de conversión, leads por fuente
- Mapa de calor de actividad de búsqueda
- KPIs principales con comparativas mes a mes

## 5. Generador de PDF/Folletos Profesionales
**Archivos:** `src/components/pdf-generator.tsx`
**Dependencia:** `@react-pdf/renderer`

- Ficha técnica profesional en PDF
- Folleto con fotos, descripción y precio
- Plantilla personalizable con logo
- Descarga directa desde la app

## 6. Integración WhatsApp Directa
**Archivos:** `src/components/whatsapp-button.tsx`

- Botón flotante de WhatsApp en toda la app
- Mensajes prellenados según contexto (venta, alquiler, info)
- Enlace directo con número del propietario
- Template de mensajes personalizados

## 7. Comparador de Propiedades
**Archivos:** `src/app/comparar/page.tsx`

- Selección de hasta 4 propiedades para comparar
- Vista lado a lado con especificaciones
- Tabla comparativa de precios, área, servicios
- Resaltado de mejor opción según criterios

## 8. Dark/Light Mode Toggle
**Archivos:** `src/components/theme-toggle.tsx`, actualización de `globals.css`

- Toggle en el sidebar o header
- Persistencia en localStorage
- Respetar preferencia del sistema
- Variables CSS para ambos temas

---

## Orden de Implementación
1. Dark/Light Mode (base para todo lo demás)
2. Upload de Imágenes (mejora el inventario existente)
3. WhatsApp Integration (mejora conversión)
4. Google Maps (visualización de propiedades)
5. AI con Gemini (potencia el rastreador)
6. Analytics Dashboard (visualización de datos)
7. Generador de PDF (herramienta de venta)
8. Comparador de Propiedades (último,依赖 de las anteriores)

## Variables de Entorno Necesarias
```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=tu-google-maps-key
GOOGLE_GEMINI_API_KEY=tu-gemini-key
```

## Supabase Storage Setup
- Bucket: `inmuebles`
- Policy: authenticated upload, public read
