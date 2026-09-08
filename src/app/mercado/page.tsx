"use client";

import { useState } from "react";
import { TrendingUp, MapPin, Home, DollarSign, BarChart3, ArrowUp, ArrowDown } from "lucide-react";

const MERCADO_DATA: Record<string, { precioM2: number; tendencia: number; demande: string; zone: string[] }> = {
  Valencia: { precioM2: 450, tendencia: 5.2, demande: "Alta", zone: ["Norte", "Sur", "Naguanagua", "San Diego", "Ciudad Bonita"] },
  Caracas: { precioM2: 850, tendencia: 2.1, demande: "Muy Alta", zone: ["Las Mercedes", "Chacao", "Santa Fe", "Altamira", "Los Palos Grandes"] },
  Maracaibo: { precioM2: 350, tendencia: -1.5, demande: "Media", zone: ["La Conradía", "Country Club", "Sebastopol", "El Rosario"] },
  Barquisimeto: { precioM2: 320, tendencia: 3.8, demande: "Alta", zone: ["Novo Centro", "Valle Hondo", "Quadrimilenario", "Buena Vista"] },
  Maracay: { precioM2: 380, tendencia: 4.1, demande: "Alta", zone: ["Las Delicias", "San Jacinto", "El Dorado", "La Villa"] },
  "Puerto Ordaz": { precioM2: 520, tendencia: 6.3, demande: "Muy Alta", zone: ["Alta Vista", "Vista al Sol", "Unare", "5 de Julio"] },
  Mérida: { precioM2: 280, tendencia: 1.2, demande: "Media", zone: ["Los Caciques", "La Cooperativa", "Pueblo Nuevo"] },
  Barcelona: { precioM2: 310, tendencia: 2.7, demande: "Media", zone: ["Nueva Barcelona", "San Cristóbal", "El Libertador"] },
};

const TIPOS = ["Apartamento", "Casa", "Townhouse", "Penthouse", "Terreno"];
const MULTIPLICADORES: Record<string, number> = {
  Apartamento: 1, Casa: 1.3, Townhouse: 1.1, Penthouse: 1.8, Terreno: 0.7,
};

export default function MercadoPage() {
  const [ciudad, setCiudad] = useState("Valencia");
  const [tipo, setTipo] = useState("Apartamento");
  const [metros, setMetros] = useState(100);

  const data = MERCADO_DATA[ciudad];
  const mult = MULTIPLICADORES[tipo];
  const precioEstimado = data.precioM2 * metros * mult;

  const ciudadesOrdenadas = Object.entries(MERCADO_DATA)
    .sort(([, a], [, b]) => b.precioM2 - a.precioM2);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Análisis de Mercado</h1>
          <p className="text-sm text-text-muted">Precios promedio y tendencias por ciudad</p>
        </div>
      </div>

      {/* Calculadora de Precio */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" /> Estimador de Precio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Ciudad</label>
            <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="select-field w-full">
              {Object.keys(MERCADO_DATA).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="select-field w-full">
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Metros²</label>
            <input type="number" value={metros} onChange={(e) => setMetros(Number(e.target.value))}
              className="input-field w-full" min={20} />
          </div>
          <div className="flex items-end">
            <div className="w-full p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-xs text-text-muted">Precio Estimado</p>
              <p className="text-xl font-bold text-primary">${precioEstimado.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-6 text-sm text-text-secondary">
          <span>Precio/m²: <span className="font-semibold">${data.precioM2}</span></span>
          <span>Demanda: <span className="font-semibold">{data.demande}</span></span>
          <span className={`flex items-center gap-1 ${data.tendencia >= 0 ? "text-success" : "text-danger"}`}>
            {data.tendencia >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            Tendencia: {data.tendencia > 0 ? "+" : ""}{data.tendencia}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de Ciudades */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Ranking por Precio/m²
          </h2>
          <div className="space-y-3">
            {ciudadesOrdenadas.map(([city, info], idx) => (
              <div key={city} className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated hover:bg-surface-hover transition-colors">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  idx === 0 ? "bg-warning/20 text-warning" :
                  idx === 1 ? "bg-text-muted/20 text-text-muted" :
                  idx === 2 ? "bg-amber-600/20 text-amber-600" :
                  "bg-surface-hover text-text-muted"
                }`}>{idx + 1}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary text-sm">{city}</h4>
                  <p className="text-xs text-text-muted">{info.demande}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">${info.precioM2}/m²</p>
                  <p className={`text-xs ${info.tendencia >= 0 ? "text-success" : "text-danger"}`}>
                    {info.tendencia > 0 ? "+" : ""}{info.tendencia}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zonas por Ciudad */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Zonas Populares - {ciudad}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {data.zone.map((zona) => (
              <div key={zona} className="p-4 rounded-xl bg-surface-elevated border border-border-subtle hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-text-primary text-sm mb-1">{zona}</h4>
                <p className="text-xs text-text-muted">Zona residencial premium</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-success font-semibold text-sm">${(data.precioM2 * 1.2).toFixed(0)}/m²</span>
                  <span className="text-xs text-success">↑ {Math.floor(Math.random() * 5 + 2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparativa */}
      <div className="glass-card p-6 mt-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Comparativa por Tipo de Propiedad</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {TIPOS.map((t) => {
            const m = MULTIPLICADORES[t];
            const precio = data.precioM2 * m;
            return (
              <div key={t} className={`p-4 rounded-xl text-center transition-all ${
                t === tipo ? "bg-primary/10 border border-primary/30" : "bg-surface-elevated border border-border-subtle"
              }`}>
                <Home className={`w-6 h-6 mx-auto mb-2 ${t === tipo ? "text-primary" : "text-text-muted"}`} />
                <h4 className="text-sm font-medium text-text-primary">{t}</h4>
                <p className="text-lg font-bold text-primary mt-1">${precio}/m²</p>
                <p className="text-xs text-text-muted">×{m}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
