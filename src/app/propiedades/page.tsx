import Link from "next/link";
import type { Metadata } from "next";
import {
  MapPin, Bed, Bath, Ruler, ImageOff, BadgeCheck, ArrowRight, Handshake, Search,
} from "lucide-react";
import {
  listarPropiedadesPublicas, imagenPrincipal, ubicacionDe, serviciosDe, whatsappPropiedad,
  type PropiedadPublica,
} from "@/lib/catalogo";
import { formatCurrency } from "@/lib/utils";
import { TIPOS_INMUEBLE, ESTADOS_VENEZUELA } from "@/lib/constants";
import { CompartirPropiedad } from "@/components/compartir-propiedad";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo de Propiedades | Venezuela Inmobiliaria",
  description:
    "Compra y venta de propiedades en toda Venezuela: casas, apartamentos, terrenos y más. Filtra por estado y contáctanos por WhatsApp.",
};

const ESTADOS_FILTRO = ESTADOS_VENEZUELA;

async function Card({ p }: { p: PropiedadPublica }) {
  const img = imagenPrincipal(p);
  const wa = whatsappPropiedad(p);
  return (
    <div className="glass-card group overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 animate-slide-up flex flex-col">
      <Link href={`/propiedades/${p.id}`}>
        <div className="relative aspect-[4/3] bg-surface-elevated overflow-hidden">
          {img ? (
            <img
              src={img}
              alt={p.titulo || "Propiedad"}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <ImageOff className="w-10 h-10" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span className="badge bg-primary text-white shadow-lg">{p.tipo_inmueble}</span>
            {p.esta_verificado && (
              <span className="badge badge-success shadow-lg flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> Verificada
              </span>
            )}
          </div>
          {p.codigo && (
            <span className="absolute top-3 right-3 badge bg-black/60 text-white backdrop-blur-sm shadow-lg font-mono text-xs">
              #{p.codigo}
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2 gap-2">
            <h3 className="font-semibold text-text-primary text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {p.titulo || "Propiedad disponible"}
            </h3>
            <span className="text-lg font-bold text-primary whitespace-nowrap">
              {formatCurrency(p.precio)}
            </span>
          </div>

          <p className="text-xs text-text-muted flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{ubicacionDe(p)}</span>
          </p>

          <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
            {p.habitaciones > 0 && (
              <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {p.habitaciones} Hab.</span>
            )}
            {p.banos > 0 && (
              <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {p.banos} Baños</span>
            )}
            {p.metros_cuadrados > 0 && (
              <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> {p.metros_cuadrados}m²</span>
            )}
          </div>

          {p.descripcion && (
            <p className="text-xs text-text-muted line-clamp-2 mb-3">{p.descripcion}</p>
          )}

          {serviciosDe(p).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {serviciosDe(p).slice(0, 3).map((s, i) => (
                <span key={i} className="badge badge-info text-[11px]">{s}</span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="px-5 pb-5 mt-auto">
        <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp flex-1 flex items-center justify-center gap-1.5 text-sm py-2"
          >
            WhatsApp
          </a>
          <Link
            href={`/propiedades/${p.id}`}
            className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm py-2"
          >
            Ver ficha <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; q?: string; estado?: string; orden?: string }>;
}) {
  const sp = await searchParams;

  const propiedades = await listarPropiedadesPublicas({
    tipo: sp.tipo,
    q: sp.q,
    estado: sp.estado,
    orden: sp.orden,
  });

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
            <Handshake className="w-7 h-7 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-3">
          Catálogo de <span className="text-primary">Propiedades</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Descubre casas, apartamentos y terrenos en todo el país. Filtra por tipo, estado y
          precio, y escribe directo por WhatsApp.
        </p>
      </div>

      {/* Filtros */}
      <form method="get" className="glass-card p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              name="q"
              defaultValue={sp.q}
              placeholder="Buscar por zona, ciudad, título o código..."
              className="input-field w-full pl-9"
            />
          </div>
          <select name="tipo" defaultValue={sp.tipo || "Todos"} className="select-field w-full">
            <option value="Todos">Todos los tipos</option>
            {TIPOS_INMUEBLE.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="estado" defaultValue={sp.estado || "Todos"} className="select-field w-full">
            <option value="Todos">Todos los estados</option>
            {ESTADOS_FILTRO.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select name="orden" defaultValue={sp.orden || "recientes"} className="select-field w-full">
            <option value="recientes">Más recientes</option>
            <option value="baratas">Menor precio</option>
            <option value="caras">Mayor precio</option>
          </select>
        </div>
        <div className="flex items-center justify-between mt-3">
          <button type="submit" className="btn-primary text-sm px-5 py-2">
            Filtrar
          </button>
          <a href="/propiedades" className="text-xs text-text-muted hover:text-text-primary underline">
            Limpiar filtros
          </a>
        </div>
      </form>

      {/* Resultados */}
      {propiedades.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No encontramos propiedades con esos filtros
          </h3>
          <p className="text-sm text-text-secondary mb-6">
            Prueba con otra zona o, si tienes una propiedad, publícala con nosotros:
            te conseguimos comprador.
          </p>
          <Link href="/captacion" className="btn-primary inline-flex items-center gap-2">
            Quiero vender mi propiedad <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-muted">
              {propiedades.length} propiedad{propiedades.length !== 1 ? "es" : ""} disponible
              {propiedades.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propiedades.map((p) => <Card key={p.id} p={p} />)}
          </div>
        </>
      )}

      {/* CTA */}
      <div className="glass-card p-8 mt-12 text-center bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
          ¿Quieres vender tu propiedad?
        </h2>
        <p className="text-text-secondary mb-6 max-w-xl mx-auto">
          Publica tu inmueble gratis en nuestro catálogo y te ayudamos a conseguir comprador
          con acompañamiento por WhatsApp.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/captacion" className="btn-primary flex items-center gap-2">
            <Handshake className="w-4 h-4" /> Publicar mi propiedad
          </Link>
          <CompartirPropiedad />
        </div>
      </div>
    </div>
  );
}