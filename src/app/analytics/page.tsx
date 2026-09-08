"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { BarChart3, TrendingUp, Users, Home, MapPin } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#C8102E", "#0066CC", "#25D366", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function AnalyticsPage() {
  const [prospectos, setProspectos] = useState<Record<string, unknown>[]>([]);
  const [inventario, setInventario] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, iRes] = await Promise.all([
        fetch("/api/prospectos"),
        fetch("/api/inventario"),
      ]);
      const pData = await pRes.json();
      const iData = await iRes.json();
      setProspectos(pData.prospectos || []);
      setInventario(iData.inventario || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Process data for charts
  const prospectosPorEstado = [
    { name: "Nuevo", value: prospectos.filter((p: Record<string, unknown>) => p.estado_gestion === "NUEVO").length },
    { name: "Contactado", value: prospectos.filter((p: Record<string, unknown>) => p.estado_gestion === "CONTACTADO").length },
    { name: "Negociación", value: prospectos.filter((p: Record<string, unknown>) => p.estado_gestion === "EN NEGOCIACION").length },
    { name: "Descartado", value: prospectos.filter((p: Record<string, unknown>) => p.estado_gestion === "DESCARTADO").length },
  ];

  const inventarioPorTipo = [
    { name: "Apartamento", value: inventario.filter((i: Record<string, unknown>) => i.tipo === "Apartamento").length },
    { name: "Casa", value: inventario.filter((i: Record<string, unknown>) => i.tipo === "Casa").length },
    { name: "Townhouse", value: inventario.filter((i: Record<string, unknown>) => i.tipo === "Townhouse").length },
    { name: "Terreno", value: inventario.filter((i: Record<string, unknown>) => i.tipo === "Terreno").length },
    { name: "Otro", value: inventario.filter((i: Record<string, unknown>) => !["Apartamento", "Casa", "Townhouse", "Terreno"].includes(i.tipo as string)).length },
  ].filter((d) => d.value > 0);

  const preciosPorCiudad = inventario.reduce((acc: Record<string, { total: number; count: number }>, inv: Record<string, unknown>) => {
    const ciudad = (inv.ciudad as string) || "Sin ciudad";
    if (!acc[ciudad]) acc[ciudad] = { total: 0, count: 0 };
    acc[ciudad].total += (inv.precio_venta as number) || 0;
    acc[ciudad].count++;
    return acc;
  }, {});

  const chartDataPrecios = Object.entries(preciosPorCiudad).map(([city, data]) => ({
    name: city,
    precio: Math.round(data.total / data.count),
    cantidad: data.count,
  }));

  const precioPromedioInventario = inventario.length > 0
    ? inventario.reduce((sum: number, i: Record<string, unknown>) => sum + ((i.precio_venta as number) || 0), 0) / inventario.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Analytics Dashboard</h1>
            <p className="text-sm text-text-muted">Métricas y tendencias de tu negocio inmobiliario</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Prospectos" value={prospectos.length} icon={Users} color="primary" />
        <MetricCard title="Inmuebles" value={inventario.length} icon={Home} color="accent" />
        <MetricCard title="Precio Promedio" value={formatCurrency(precioPromedioInventario)} icon={TrendingUp} color="success" />
        <MetricCard title="Zonas Activas" value={new Set(inventario.map((i: Record<string, unknown>) => i.ciudad)).size} icon={MapPin} color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospectos por Estado */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Prospectos por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={prospectosPorEstado} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {prospectosPorEstado.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Inventario por Tipo */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Inventario por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={inventarioPorTipo}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#C8102E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Precio Promedio por Ciudad */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Precio Promedio por Ciudad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataPrecios}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="precio" fill="#0066CC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
