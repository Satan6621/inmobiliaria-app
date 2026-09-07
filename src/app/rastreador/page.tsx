"use client";

import { useState } from "react";
import { Search, Filter, Send, ExternalLink, Phone, Zap, AlertTriangle, Loader2 } from "lucide-react";
import { ZONAS_DISPONIBLES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface ProspectoRastreo {
  fecha: string;
  zona: string;
  rol: string;
  calificado: string;
  precio_usd: number;
  metros: number;
  precio_m2: number;
  urgencia_score: number;
  es_remate: string;
  servicios: string;
  telefono: string;
  whatsapp_link: string;
  titulo: string;
  detalle: string;
  enlace: string;
}

export default function RastreadorPage() {
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>(["Carabobo (Valencia, San Diego, Naguanagua, Los Guayos)"]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>(["vendedor", "comprador"]);
  const [filtrarPrecio, setFiltrarPrecio] = useState(false);
  const [precioMin, setPrecioMin] = useState(8000);
  const [precioMax, setPrecioMax] = useState(75000);
  const [soloUrgentes, setSoloUrgentes] = useState(false);
  const [maxResultados, setMaxResultados] = useState(8);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ProspectoRastreo[]>([]);
  const [stats, setStats] = useState({ total: 0, nuevos: 0, remates: 0 });

  const handleRastrear = async () => {
    if (zonasSeleccionadas.length === 0 || rolesSeleccionados.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rastrear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zonas: zonasSeleccionadas,
          roles: rolesSeleccionados,
          filtrarPrecio,
          precioMin,
          precioMax,
          soloUrgentes,
          maxResultados,
        }),
      });
      const data = await res.json();
      setResultados(data.resultados || []);
      setStats({
        total: data.resultados?.length || 0,
        nuevos: data.nuevos || 0,
        remates: data.resultados?.filter((r: ProspectoRastreo) => r.es_remate.includes("REMATE")).length || 0,
      });
    } catch (error) {
      console.error("Error en rastreo:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleZona = (zona: string) => {
    setZonasSeleccionadas((prev) =>
      prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona]
    );
  };

  const toggleRol = (rol: string) => {
    setRolesSeleccionados((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Search className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Rastreador de Mercado
            </h1>
            <p className="text-sm text-text-muted">
              Busca propiedades en Facebook, Telegram e Instagram con inteligencia artificial
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Filtros */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Filtros de Búsqueda
              </h2>
            </div>

            {/* Zonas */}
            <div className="mb-6">
              <label className="text-xs font-medium text-text-secondary mb-3 block">
                Zonas / Estados
              </label>
              <div className="space-y-2">
                {Object.keys(ZONAS_DISPONIBLES).map((zona) => (
                  <label key={zona} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={zonasSeleccionadas.includes(zona)}
                      onChange={() => toggleZona(zona)}
                      className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary/30"
                    />
                    <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                      {zona.split(" (")[0]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div className="mb-6">
              <label className="text-xs font-medium text-text-secondary mb-3 block">
                Tipo de Prospecto
              </label>
              <div className="flex gap-2">
                {["vendedor", "comprador"].map((rol) => (
                  <button
                    key={rol}
                    onClick={() => toggleRol(rol)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      rolesSeleccionados.includes(rol)
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-surface text-text-muted border border-border hover:border-border"
                    }`}
                  >
                    {rol === "vendedor" ? "Vendedores" : "Compradores"}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de Precio */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={filtrarPrecio}
                  onChange={(e) => setFiltrarPrecio(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary/30"
                />
                <span className="text-xs font-medium text-text-secondary">
                  Filtro de Precio (USD)
                </span>
              </label>
              {filtrarPrecio && (
                <div className="space-y-3 pl-6">
                  <div>
                    <div className="flex justify-between text-xs text-text-muted mb-1">
                      <span>Mínimo</span>
                      <span>{formatCurrency(precioMin)}</span>
                    </div>
                    <input
                      type="range"
                      min={2000}
                      max={300000}
                      step={5000}
                      value={precioMin}
                      onChange={(e) => setPrecioMin(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-text-muted mb-1">
                      <span>Máximo</span>
                      <span>{formatCurrency(precioMax)}</span>
                    </div>
                    <input
                      type="range"
                      min={2000}
                      max={300000}
                      step={5000}
                      value={precioMax}
                      onChange={(e) => setPrecioMax(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Urgencia */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloUrgentes}
                  onChange={(e) => setSoloUrgentes(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary/30"
                />
                <span className="text-xs font-medium text-text-secondary">
                  Solo Remates / Urgencia
                </span>
              </label>
            </div>

            {/* Max Resultados */}
            <div className="mb-6">
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Resultados por consulta: {maxResultados}
              </label>
              <input
                type="range"
                min={5}
                max={25}
                value={maxResultados}
                onChange={(e) => setMaxResultados(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Botón Buscar */}
            <button
              onClick={handleRastrear}
              disabled={loading || zonasSeleccionadas.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rastreando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Iniciar Rastreo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-3">
          {/* Stats */}
          {resultados.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="stat-card text-center">
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                <p className="text-xs text-text-muted">Inmuebles Encontrados</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-bold text-success">{stats.nuevos}</p>
                <p className="text-xs text-text-muted">Nuevos Guardados</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-bold text-danger">{stats.remates}</p>
                <p className="text-xs text-text-muted">Alertas de Remate</p>
              </div>
            </div>
          )}

          {/* Lista de Resultados */}
          {resultados.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Sin resultados aún
              </h3>
              <p className="text-sm text-text-secondary">
                Configura los filtros y haz clic en &quot;Iniciar Rastreo&quot; para buscar propiedades.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resultados.map((r, i) => (
                <div
                  key={i}
                  className="glass-card p-5 animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {r.es_remate.includes("REMATE") && (
                        <span className="badge badge-danger">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          REMATE
                        </span>
                      )}
                      <span className={`badge ${r.rol.includes("VENDEDOR") ? "badge-warning" : "badge-info"}`}>
                        {r.rol}
                      </span>
                      {r.calificado === "SÍ" && (
                        <span className="badge badge-success">Calificado</span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">{r.zona}</span>
                  </div>

                  <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">
                    {r.titulo}
                  </h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {r.detalle}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-3 text-sm">
                    {r.precio_usd > 0 && (
                      <span className="text-success font-semibold">{formatCurrency(r.precio_usd)}</span>
                    )}
                    {r.precio_m2 > 0 && (
                      <span className="text-text-muted">{formatCurrency(r.precio_m2)}/m²</span>
                    )}
                    <span className="text-text-muted">{r.servicios}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.whatsapp_link && (
                      <a
                        href={r.whatsapp_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        WhatsApp
                      </a>
                    )}
                    {r.enlace && (
                      <a
                        href={r.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver Publicación
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
