import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  MapPin, Bed, Bath, Ruler, ImageOff, BadgeCheck, ArrowLeft, Phone, Handshake, Building2, CalendarDays, TrendingDown,
} from "lucide-react";
import {
  obtenerPropiedadPublica, imagenPrincipal, serviciosDe, ubicacionDe, whatsappPropiedad,
} from "@/lib/catalogo";
import { formatCurrency } from "@/lib/utils";
import { CompartirPropiedad } from "@/components/compartir-propiedad";
import { PropertyMap } from "@/components/property-map";
import { PriceHistory } from "@/components/price-history";
import { ReportarPropiedad } from "@/components/reportar-propiedad";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await obtenerPropiedadPublica(id);
  if (!p) return { title: "Propiedad no encontrada" };
  const img = imagenPrincipal(p);
  return {
    title: `${p.titulo || `Propiedad ${p.codigo || ""}`} | Inmobiliaria Chuo-Zu`,
    description:
      `${p.tipo_inmueble}${p.habitaciones ? `, ${p.habitaciones} hab.` : ""} en ${ubicacionDe(p)} a ${formatCurrency(p.precio)}.`,
    openGraph: {
      title: p.titulo || `Propiedad ${p.codigo || ""}`,
      description: p.descripcion?.slice(0, 200) || undefined,
      images: img ? [{ url: img }] : undefined,
    },
  };
}

export default async function DetallePropiedadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await obtenerPropiedadPublica(id);
  if (!p) notFound();

  const imgPrincipal = imagenPrincipal(p);
  const resto = (p.imagenes || []).filter((i) => i.url_imagen !== imgPrincipal);
  const wa = whatsappPropiedad(p);
  const servicios = serviciosDe(p);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Link
        href="/propiedades"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Galería */}
          <div className="glass-card overflow-hidden">
            <div className="relative aspect-[16/9] bg-surface-elevated">
              {imgPrincipal ? (
                <img
                  src={imgPrincipal}
                  alt={p.titulo || "Propiedad"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <ImageOff className="w-14 h-14" />
                  <p className="ml-2 text-sm">Sin fotos todavía</p>
                </div>
              )}
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                <span className="badge bg-black/60 text-white backdrop-blur-sm">{p.tipo_inmueble}</span>
                {p.codigo && (
                  <span className="badge bg-black/60 text-white backdrop-blur-sm font-mono">#{p.codigo}</span>
                )}
                {p.esta_verificado && (
                  <span className="badge badge-success shadow-lg flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Verificada
                  </span>
                )}
              </div>
            </div>

            {resto.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-1.5 flex-wrap">
                {resto.map((img, i) => (
                  <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-elevated">
                    <img src={img.url_imagen} alt={`Foto ${i + 2}`} loading="lazy"
                      className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mapa */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 pt-5 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="font-semibold font-[family-name:var(--font-display)]">Ubicación</h2>
            </div>
            <p className="px-6 pb-3 text-sm text-text-muted">{ubicacionDe(p)}</p>
            <PropertyMap
              height="320px"
              properties={[
                {
                  id: p.id,
                  titulo: p.titulo || `Propiedad ${p.codigo || ""}`,
                  direccion: p.direccion_completa || p.descripcion || ubicacionDe(p),
                  ciudad: p.estado?.nombre || "",
                  precio: p.precio || 0,
                  tipo: p.tipo_inmueble,
                },
              ]}
            />
          </div>

          {/* Descripción */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="badge badge-primary">{p.tipo_inmueble}</span>
              <span className="text-3xl font-bold text-primary">{formatCurrency(p.precio)}</span>
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-3">
              {p.titulo || `Propiedad ${p.codigo || p.id.slice(0, 8)}`}
            </h1>
            <p className="text-sm text-text-muted flex items-center gap-1.5 mb-4">
              <MapPin className="w-4 h-4" /> {ubicacionDe(p)}
            </p>
            <div className="flex flex-wrap gap-4 py-4 border-y border-border-subtle mb-4 text-sm">
              {p.habitaciones > 0 && (
                <span className="flex items-center gap-2 text-text-secondary">
                  <Bed className="w-4 h-4 text-primary" /> {p.habitaciones} Habitaciones
                </span>
              )}
              {p.banos > 0 && (
                <span className="flex items-center gap-2 text-text-secondary">
                  <Bath className="w-4 h-4 text-primary" /> {p.banos} Baños
                </span>
              )}
              {p.metros_cuadrados > 0 && (
                <span className="flex items-center gap-2 text-text-secondary">
                  <Ruler className="w-4 h-4 text-primary" /> {p.metros_cuadrados} m²
                </span>
              )}
            </div>
            {p.descripcion ? (
              <p className="text-text-secondary whitespace-pre-line leading-relaxed">{p.descripcion}</p>
            ) : (
              <p className="text-text-muted text-sm">
                Escríbenos por WhatsApp para conocer todos los detalles de esta propiedad.
              </p>
            )}
          </div>

          {/* Historial de precios */}
          <div className="glass-card p-6">
            <h2 className="font-semibold font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-primary" /> Evolución del precio
            </h2>
            <PriceHistory
              propiedadId={p.id}
              precioActual={Number(p.precio || 0)}
              titulo={p.titulo}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contrato */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4">
              ¿Te interesa?
            </h3>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              <Phone className="w-5 h-5" /> Contactar por WhatsApp
            </a>
            <p className="text-[11px] text-text-muted text-center mt-3">
              Respuesta inmediata en horario laboral · Asesor a nivel nacional
            </p>
          </div>

          {/* Servicios */}
          {servicios.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4">
                Servicios y comodidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {servicios.map((s, i) => (
                  <span key={i} className="badge badge-info">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Datos */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4">
              Datos de la propiedad
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Transacción
                </span>
                <span className="font-medium">Venta</span>
              </div>
              {p.nombre_agente && (
                <div className="flex items-center justify-between">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Handshake className="w-4 h-4" /> Asesor
                  </span>
                  <span className="font-medium">{p.nombre_agente}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" /> Publicada
                </span>
                <span className="font-medium">
                  {new Date(p.created_at).toLocaleDateString("es-VE", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Compartir */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Comparte esta propiedad</h3>
            <CompartirPropiedad titulo={p.titulo} />
          </div>

          {/* Reporte antifraude */}
          <ReportarPropiedad propiedadId={p.id} />
        </div>
      </div>
    </div>
  );
}