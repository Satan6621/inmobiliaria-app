"use client";

import { useState } from "react";
import { Calculator, DollarSign, Percent, Calendar, TrendingUp, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function HipotecasPage() {
  const [precio, setPrecio] = useState(50000);
  const [enganche, setEnganche] = useState(20);
  const [tasaAnual, setTasaAnual] = useState(12);
  const [años, setAños] = useState(10);

  const montoPrestamo = precio * (1 - enganche / 100);
  const tasaMensual = tasaAnual / 100 / 12;
  const numPagos = años * 12;

  const cuotaMensual = tasaMensual > 0
    ? montoPrestamo * (tasaMensual * Math.pow(1 + tasaMensual, numPagos)) / (Math.pow(1 + tasaMensual, numPagos) - 1)
    : montoPrestamo / numPagos;

  const totalPagar = cuotaMensual * numPagos;
  const totalIntereses = totalPagar - montoPrestamo;

  const generarTabla = () => {
    const tabla = [];
    let saldo = montoPrestamo;
    for (let i = 1; i <= Math.min(numPagos, 120); i++) {
      const interes = saldo * tasaMensual;
      const capital = cuotaMensual - interes;
      saldo = Math.max(0, saldo - capital);
      tabla.push({ mes: i, cuota: cuotaMensual, capital, interes, saldo });
    }
    return tabla;
  };

  const tabla = generarTabla();

  const formatNumber = (n: number) => n.toFixed(2);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <Calculator className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
            Calculadora de Hipotecas
          </h1>
          <p className="text-sm text-text-muted">
            Calcula cuotas mensuales y amortización para tus clientes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Datos del Préstamo</h2>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Precio de la Propiedad (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value))}
                  className="input-field w-full pl-10" min={1000} step={1000} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Enganche: {enganche}% ({formatCurrency(precio * enganche / 100)})
              </label>
              <input type="range" min={5} max={50} step={5} value={enganche}
                onChange={(e) => setEnganche(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>5%</span><span>50%</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Tasa de Interés Anual: {tasaAnual}%
              </label>
              <input type="range" min={1} max={30} step={0.5} value={tasaAnual}
                onChange={(e) => setTasaAnual(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>1%</span><span>30%</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Plazo: {años} años ({numPagos} meses)
              </label>
              <input type="range" min={1} max={30} step={1} value={años}
                onChange={(e) => setAños(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>1 año</span><span>30 años</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Resumen</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-elevated rounded-xl p-4 text-center">
                <p className="text-xs text-text-muted mb-1">Cuota Mensual</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(cuotaMensual)}</p>
              </div>
              <div className="bg-surface-elevated rounded-xl p-4 text-center">
                <p className="text-xs text-text-muted mb-1">Monto Préstamo</p>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(montoPrestamo)}</p>
              </div>
              <div className="bg-surface-elevated rounded-xl p-4 text-center">
                <p className="text-xs text-text-muted mb-1">Total a Pagar</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(totalPagar)}</p>
              </div>
              <div className="bg-surface-elevated rounded-xl p-4 text-center">
                <p className="text-xs text-text-muted mb-1">Total Intereses</p>
                <p className="text-xl font-bold text-danger">{formatCurrency(totalIntereses)}</p>
              </div>
            </div>
          </div>

          {/* Grafico visual */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Distribución de Pago</h3>
            <div className="flex h-8 rounded-lg overflow-hidden mb-3">
              <div className="bg-primary transition-all duration-300"
                style={{ width: `${(montoPrestamo / totalPagar) * 100}%` }} />
              <div className="bg-danger transition-all duration-300"
                style={{ width: `${(totalIntereses / totalPagar) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-primary" /> Capital ({((montoPrestamo / totalPagar) * 100).toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-danger" /> Intereses ({((totalIntereses / totalPagar) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Amortización */}
      <div className="glass-card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Tabla de Amortización (Primeros 12 meses)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-text-muted">Mes</th>
                <th className="text-right py-2 text-text-muted">Cuota</th>
                <th className="text-right py-2 text-text-muted">Capital</th>
                <th className="text-right py-2 text-text-muted">Interés</th>
                <th className="text-right py-2 text-text-muted">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {tabla.slice(0, 12).map((fila) => (
                <tr key={fila.mes} className="border-b border-border-subtle hover:bg-surface-hover">
                  <td className="py-2 text-text-secondary">{fila.mes}</td>
                  <td className="py-2 text-right text-primary font-medium">{formatCurrency(fila.cuota)}</td>
                  <td className="py-2 text-right text-success">{formatCurrency(fila.capital)}</td>
                  <td className="py-2 text-right text-danger">{formatCurrency(fila.interes)}</td>
                  <td className="py-2 text-right text-text-secondary">{formatCurrency(fila.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
