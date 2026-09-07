"use client";

import { useState } from "react";
import { MessageSquare, Copy, ChevronDown, ChevronUp, Phone, Users } from "lucide-react";

interface Guion {
  id: string;
  categoria: "propietarios" | "compradores";
  titulo: string;
  tipo: "objecion" | "presentacion" | "cierre";
  contenido: string;
}

const guiones: Guion[] = [
  {
    id: "1",
    categoria: "propietarios",
    titulo: "No quiero intermediarios ni inmobiliarias",
    tipo: "objecion",
    contenido: `«Comprendo totalmente su punto Sr(a). Propietario(a). Nosotros NO trabajamos como inmobiliaria tradicional ni cobramos comisiones abusivas. 

Representamos compradores directos con fondos en mano que buscan en su zona. A usted se le entrega su precio neto libre acordado, y nuestros honorarios los asume el comprador. 

Si está abierto a recibir una oferta formal sin exclusividad ni contratos amarrados, permítame los datos básicos y le agendamos la visita.»`,
  },
  {
    id: "2",
    categoria: "propietarios",
    titulo: "¿Tienes al cliente listo ya?",
    tipo: "objecion",
    contenido: `«Sí, manejamos inversionistas y familias calificadas buscando en esa zona con presupuesto en divisas. 

Para poder presentarle su opción hoy mismo, solo necesito confirmar si los documentos de registro (SAREN) y catastro están al día para firmar rápido.»`,
  },
  {
    id: "3",
    categoria: "compradores",
    titulo: "Presentación de Oportunidad",
    tipo: "presentacion",
    contenido: `«Hola [Nombre], vi que buscas propiedad en [Zona]. 

Acaba de entrar a nuestra cartera directa una opción de oportunidad por debajo de precio de mercado, con pozo de agua y planta eléctrica, lista para habitar.

Te adjunto la ficha técnica resumida. ¿Cuándo tendrías 15 minutos para coordinar una visita?»`,
  },
  {
    id: "4",
    categoria: "compradores",
    titulo: "Cierre por Urgencia",
    tipo: "cierre",
    contenido: `«[Nombre], esta propiedad tiene alta demanda y el propietario está motivado para cerrar rápido. 

Ya tenemos 2 visitas programadas para esta semana. Si realmente te interesa, te recomiendo agendar tu visita hoy mismo para no perder la oportunidad.

¿Te parece mañana a las 10am o prefieres la tarde?»`,
  },
  {
    id: "5",
    categoria: "propietarios",
    titulo: "Manejo de Precio Alto",
    tipo: "objecion",
    contenido: `«Entiendo que ese es su precio Sr(a). Propietario. Lo que podemos hacer es presentarle una oferta seria de un comprador calificado que está buscando exactamente en esa zona. 

Si la oferta no le convence, no hay compromiso alguno. Pero al menos tiene una referencia real del mercado. ¿Me permite presentarle la oferta?»`,
  },
  {
    id: "6",
    categoria: "compradores",
    titulo: "Objeción: Está muy caro",
    tipo: "objecion",
    contenido: `«Entiendo tu preocupación. Déjame explicarte: este inmueble tiene un valor real por encima del precio que te estoy ofreciendo. 

El pozo de agua te ahorra $50/mes en agua, la planta te protege de apagones, y la fibra óptica te da conectividad garantizada. 

Si lo ves como inversión, con un alquiler de $[X]/mes recuperas tu inversión en [X] años. ¿Te gustaría que te muestre los números?»`,
  },
];

export default function GuionesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<"todos" | "propietarios" | "compradores">("todos");

  const guionesFiltrados = filtroCategoria === "todos"
    ? guiones
    : guiones.filter((g) => g.categoria === filtroCategoria);

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto);
  };

  const tipoBadge = (tipo: string) => {
    switch (tipo) {
      case "objecion": return <span className="badge badge-danger">Objeción</span>;
      case "presentacion": return <span className="badge badge-success">Presentación</span>;
      case "cierre": return <span className="badge badge-primary">Cierre</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <MessageSquare className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Guiones de Persuasión y Cierre
            </h1>
            <p className="text-sm text-text-muted">
              Scripts de venta y manejo de objeciones para propietarios y compradores
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "todos", label: "Todos", icon: MessageSquare },
          { value: "propietarios", label: "Propietarios", icon: Phone },
          { value: "compradores", label: "Compradores", icon: Users },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltroCategoria(f.value as typeof filtroCategoria)}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              filtroCategoria === f.value
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-surface text-text-muted border border-border hover:border-border"
            }`}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Guiones */}
      <div className="space-y-3">
        {guionesFiltrados.map((guion, i) => (
          <div
            key={guion.id}
            className="glass-card overflow-hidden animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <button
              onClick={() => setExpandedId(expandedId === guion.id ? null : guion.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <span className={`badge ${guion.categoria === "propietarios" ? "badge-warning" : "badge-info"}`}>
                  {guion.categoria === "propietarios" ? "Propietarios" : "Compradores"}
                </span>
                {tipoBadge(guion.tipo)}
                <h3 className="text-sm font-semibold text-text-primary">{guion.titulo}</h3>
              </div>
              {expandedId === guion.id ? (
                <ChevronUp className="w-5 h-5 text-text-muted" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-muted" />
              )}
            </button>

            {expandedId === guion.id && (
              <div className="px-5 pb-5 border-t border-border-subtle">
                <pre className="mt-4 bg-surface rounded-lg p-4 text-sm text-text-secondary whitespace-pre-wrap font-[family-name:var(--font-mono)] leading-relaxed">
                  {guion.contenido}
                </pre>
                <button
                  onClick={() => copiarAlPortapapeles(guion.contenido)}
                  className="mt-3 btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Guion
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="glass-card p-6 mt-8">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Tips para Usar los Guiones</h3>
        <ul className="space-y-2 text-xs text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Personaliza los guiones con datos reales del inmueble y del cliente.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Usa un tono conversacional, no leas literalmente el guion.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Escucha activamente y adapta tu respuesta según la objeción real.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Siempre termina con una pregunta que requiera respuesta.
          </li>
        </ul>
      </div>
    </div>
  );
}
