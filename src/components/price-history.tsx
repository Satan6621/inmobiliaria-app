"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import { TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PuntoPrecio {
  fecha: string;
  precio: number;
}

interface HistorialData {
  propiedades: null;
  precio_actual: number;
  variacion_porcentaje: number;
  sintetico: boolean;
  puntos: PuntoPrecio[];
}

export function PriceHistory({
  propiedadId,
  precioActual,
  titulo,
}: {
  propiedadId: string;
  precioActual: number;
  titulo?: string;
}) {
  const [data, setData] = useState<HistorialData | null>(null);
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");

  useEffect(() => {
    let mounted = true;
    setEstado("cargando");
    fetch(`/api/historial-precios?propiedad_id=${encodeURIComponent(propiedadId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json.error) {
          setEstado("error");
          return;
        }
        setData(json);
        setEstado("ok");
      })
      .catch(() => mounted && setEstado("error"));
    return () => {
      mounted = false;
    };
  }, [propiedadId]);

  if (estado === "cargando") {
    return (
      <div className="flex items-center justify-center py-8 text-text-muted text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando historial de precio...
      </div>
    );
  }

  if (estado === "error" || !data) {
    return (
      <p className="text-sm text-text-muted py-4">
        Historial disponible una vez que el precio de esta propiedad cambie en el inventario.
      </p>
    );
  }

  const variacion = data.variacion_porcentaje;
  const Icono = variacion < -0.01 ? TrendingDown : variacion > 0.01 ? TrendingUp : Minus;
  const colorVar =
    variacion < -0.01 ? "text-success" : variacion > 0.01 ? "text-danger" : "text-text-muted";

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          {data.sintetico ? (
            <span className="badge badge-info text-[11px]">Estimación inicial</span>
          ) : (
            <span className="badge badge-primary text-[11px]">Cambios reales</span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${colorVar}`}>
          <Icono className="w-4 h-4" />
          {variacion > 0 ? "+" : ""}{variacion.toFixed(1)}% desde la publicación
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.puntos} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle, #292524)" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 10, fill: "var(--text-muted, #a8a29e)" }}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--text-muted, #a8a29e)" }}
              width={64}
              tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
              domain={["dataMin - 1000", "dataMax + 1000"]}
            />
            <Tooltip
              formatter={(v) => formatCurrency(Number(v ?? 0))}
              labelFormatter={(l) =>
                new Date(String(l)).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" })
              }
              contentStyle={{ fontSize: 12, borderRadius: 12 }}
            />
            <ReferenceLine y={precioActual || data.precio_actual} stroke="var(--primary, #f59e0b)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="precio"
              stroke="var(--primary, #f59e0b)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-text-muted mt-2">
        {data.puntos.length} punto{data.puntos.length !== 1 ? "s" : ""} registrado
        {data.puntos.length !== 1 ? "s" : ""} de evolución del precio
        {titulo ? ` · ${titulo}` : ""}.
      </p>
    </div>
  );
}