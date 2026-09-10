"use client";

import { useState } from "react";
import { Brain, Search, Loader2, Phone, MapPin, Bed, Bath, Car, ExternalLink, AlertCircle, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AIResult {
  titulo: string;
  precio: number;
  ubicacion: string;
  tipo: string;
  telefono: string;
  servicios: string[];
  resumen: string;
  fuente: string;
  fuente_url?: string;
  metros?: number | null;
  habitaciones?: number | null;
  banos?: number | null;
  score_calidad: number;
  fecha_publicacion?: string;
}

export function AISearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<AIResult[]>([]);
  const [error, setError] = useState("");
  const [searchInfo, setSearchInfo] = useState("");

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setLoading(true);
    setError("");
    setResultados([]);
    setSearchInfo("");

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) throw new Error("Error en la búsqueda");

      const data = await res.json();

      if (data.resultados && data.resultados.length > 0) {
        setResultados(data.resultados);
        setSearchInfo(data.message || `${data.resultados.length} resultados encontrados`);
      } else {
        setError(data.error || "No se encontraron resultados. Intenta con otra búsqueda.");
      }
    } catch (err) {
      setError("Error al conectar. Intenta de nuevo.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Búsqueda Inteligente</h3>
            <p className="text-xs text-text-muted">Busca propiedades en toda Venezuela</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ej. apartamento 3 habitaciones en Valencia con pozo..."
            className="input-field flex-1"
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim() || query.trim().length < 2}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {searchInfo && (
          <div className="mt-3 p-2 rounded-lg bg-success/10 border border-success/20 text-xs text-success">
            {searchInfo}
          </div>
        )}

        {error && (
          <div className="mt-3 p-2 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-danger" />
            <span className="text-xs text-danger">{error}</span>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {["Apartamento en Valencia", "Casa en Tinaquillo menos de $10.000", "Casas baratas desde $5.000", "Terreno Mérida", "Townhouse 4 habitaciones"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => { setQuery(suggestion); }}
              className="text-xs px-3 py-1.5 rounded-full bg-surface-elevated hover:bg-surface-hover text-text-muted transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {resultados.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-secondary">
              {resultados.length} propiedades encontradas
            </h3>
          </div>

          <div className="grid gap-4">
            {resultados.map((r, i) => (
              <div key={i} className="glass-card p-5 hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-primary">{r.tipo}</span>
                    <span className={`badge ${r.score_calidad >= 80 ? "badge-success" : r.score_calidad >= 50 ? "badge-warning" : "badge-danger"}`}>
                      {r.score_calidad}% calidad
                    </span>
                    {r.fecha_publicacion && (
                      <span className="badge bg-surface-elevated text-text-muted text-xs">
                        {r.fecha_publicacion}
                      </span>
                    )}
                  </div>
                  <span className="text-xl font-bold text-primary">{formatCurrency(r.precio)}</span>
                </div>

                {/* Title & Location */}
                <h4 className="text-lg font-semibold text-text-primary mb-1">{r.titulo}</h4>
                <p className="text-sm text-text-muted flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {r.ubicacion}
                </p>

                {/* Features */}
                <div className="flex items-center gap-4 mb-3 text-sm text-text-secondary">
                  {r.habitaciones != null && r.habitaciones > 0 && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" /> {r.habitaciones} Hab.
                    </span>
                  )}
                  {r.banos != null && r.banos > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" /> {r.banos} Baños
                    </span>
                  )}
                  {r.metros != null && (
                    <span className="flex items-center gap-1">
                      <Car className="w-4 h-4" /> {r.metros}m²
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{r.resumen}</p>

                {/* Services */}
                {r.servicios && r.servicios.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {r.servicios.map((s, j) => (
                      <span key={j} className="badge badge-info text-xs">{s}</span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {r.telefono}
                    </span>
                    <span>Fuente: {r.fuente}</span>
                  </div>
                  {r.fuente_url && (
                    <a
                      href={r.fuente_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ver más <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
