"use client";

import { useState } from "react";
import { Brain, Search, Loader2, ExternalLink, Phone } from "lucide-react";
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
  score_calidad: number;
}

export function AISearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<AIResult[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResultados(data.resultados || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Búsqueda con AI</h3>
            <p className="text-xs text-text-muted">Gemini analiza y estructura propiedades automáticamente</p>
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
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Buscar con AI
          </button>
        </div>
      </div>

      {resultados.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-secondary">
            {resultados.length} resultados encontrados por AI
          </h3>
          {resultados.map((r, i) => (
            <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary">{r.tipo}</span>
                  <span className={`badge ${r.score_calidad >= 80 ? "badge-success" : r.score_calidad >= 50 ? "badge-warning" : "badge-danger"}`}>
                    Score: {r.score_calidad}%
                  </span>
                </div>
                {r.precio > 0 && (
                  <span className="text-lg font-bold text-primary">{formatCurrency(r.precio)}</span>
                )}
              </div>

              <h4 className="font-semibold text-text-primary mb-1">{r.titulo}</h4>
              <p className="text-sm text-text-muted mb-2">{r.ubicacion}</p>
              <p className="text-sm text-text-secondary mb-3">{r.resumen}</p>

              {r.servicios.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {r.servicios.map((s, j) => (
                    <span key={j} className="badge badge-info text-xs">{s}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>Fuente: {r.fuente}</span>
                {r.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {r.telefono}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
