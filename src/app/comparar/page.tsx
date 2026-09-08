"use client";

import { useState, useEffect } from "react";
import { Scale, Check, X, Bed, Bath, Car, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Inmueble {
  id: number;
  titulo: string;
  tipo: string;
  ciudad: string;
  urbanizacion: string;
  precio_venta: number;
  habs: number;
  banos: number;
  puestos: number;
  metros: number;
  precio_m2: number;
  servicios: string;
  estatus: string;
}

export default function CompararPage() {
  const [inventario, setInventario] = useState<Inmueble[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      const res = await fetch("/api/inventario");
      const data = await res.json();
      setInventario(data.inventario || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const inmueblesSeleccionados = inventario.filter((i) => seleccionados.includes(i.id));

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Scale className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Comparador de Propiedades</h1>
            <p className="text-sm text-text-muted">Selecciona hasta 4 inmuebles para comparar lado a lado</p>
          </div>
        </div>
      </div>

      {/* Selector */}
      <div className="glass-card p-4 mb-6">
        <p className="text-xs text-text-muted mb-3">
          Seleccionados: {seleccionados.length}/4
        </p>
        <div className="flex flex-wrap gap-2">
          {inventario.map((inv) => (
            <button
              key={inv.id}
              onClick={() => toggleSeleccion(inv.id)}
              className={`text-xs py-1.5 px-3 rounded-lg transition-all border ${
                seleccionados.includes(inv.id)
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-surface text-text-muted border-border hover:border-border"
              }`}
            >
              {seleccionados.includes(inv.id) && <Check className="w-3 h-3 inline mr-1" />}
              {inv.titulo.substring(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Comparación */}
      {inmueblesSeleccionados.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-text-secondary uppercase bg-surface rounded-tl-xl">Característica</th>
                {inmueblesSeleccionados.map((inv) => (
                  <th key={inv.id} className="text-left p-4 text-xs font-semibold text-text-secondary uppercase bg-surface min-w-[200px]">
                    {inv.titulo.substring(0, 40)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Precio", render: (i: Inmueble) => <span className="text-lg font-bold text-primary">{formatCurrency(i.precio_venta)}</span> },
                { label: "Tipo", render: (i: Inmueble) => i.tipo },
                { label: "Ubicación", render: (i: Inmueble) => <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{i.urbanizacion}, {i.ciudad}</span> },
                { label: "Área", render: (i: Inmueble) => `${i.metros} m²` },
                { label: "$/m²", render: (i: Inmueble) => formatCurrency(i.precio_m2) },
                { label: "Habitaciones", render: (i: Inmueble) => <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{i.habs}</span> },
                { label: "Baños", render: (i: Inmueble) => <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{i.banos}</span> },
                { label: "Estacionamiento", render: (i: Inmueble) => <span className="flex items-center gap-1"><Car className="w-3 h-3" />{i.puestos}</span> },
                { label: "Servicios", render: (i: Inmueble) => <span className="text-xs">{i.servicios}</span> },
                { label: "Estatus", render: (i: Inmueble) => <span className={`badge ${i.estatus === "DISPONIBLE" ? "badge-success" : "badge-warning"}`}>{i.estatus}</span> },
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-surface/50" : ""}>
                  <td className="p-4 text-xs font-medium text-text-secondary border-b border-border-subtle">{row.label}</td>
                  {inmueblesSeleccionados.map((inv) => (
                    <td key={inv.id} className="p-4 text-sm text-text-primary border-b border-border-subtle">
                      {row.render(inv)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Scale className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Selecciona propiedades</h3>
          <p className="text-sm text-text-secondary">Elige hasta 4 inmuebles del selector arriba para compararlos.</p>
        </div>
      )}
    </div>
  );
}
