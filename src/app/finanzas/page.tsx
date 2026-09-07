"use client";

import { useState } from "react";
import { Calculator, TrendingUp, Building2, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function FinanzasPage() {
  const [precioVenta, setPrecioVenta] = useState(35000);
  const [canonMensual, setCanonMensual] = useState(250);
  const [mesesOcupacion, setMesesOcupacion] = useState(11);
  const [gastoMantenimiento, setGastoMantenimiento] = useState(300);

  // Cálculos SAREN
  const arancelSaren = precioVenta * 0.018;
  const timbresGobernacion = precioVenta * 0.005;
  const solvenciaAlcaldia = precioVenta * 0.005;
  const honorariosAbogado = 150;
  const totalGastosCierre = arancelSaren + timbresGobernacion + solvenciaAlcaldia + honorariosAbogado;
  const porcentajeGastos = (totalGastosCierre / precioVenta) * 100;

  // Cálculos ROI
  const ingresoAnualBruto = canonMensual * mesesOcupacion;
  const ingresoAnualNeto = Math.max(ingresoAnualBruto - gastoMantenimiento, 0);
  const capRate = precioVenta > 0 ? (ingresoAnualNeto / precioVenta) * 100 : 0;
  const anosRetorno = ingresoAnualNeto > 0 ? precioVenta / ingresoAnualNeto : 0;

  const fraseInversionista = `💎 Oportunidad para Inversionistas: Genera un retorno proyectado del ${capRate.toFixed(1)}% anual en dólares con alquiler estimado de $${canonMensual}/mes.`;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Calculator className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Finanzas, SAREN & ROI
            </h1>
            <p className="text-sm text-text-muted">
              Calculadora financiera inmobiliaria para Venezuela
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SAREN */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-text-primary">
              Estimador de Gastos SAREN
            </h2>
          </div>
          <p className="text-xs text-text-muted mb-6">
            Calcula los costos de ley habituales para compraventas inmobiliarias en Venezuela.
          </p>

          <div className="mb-6">
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              Precio de Venta (USD)
            </label>
            <input
              type="number"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(Number(e.target.value))}
              className="input-field text-lg font-semibold"
            />
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-sm text-text-secondary">Aranceles de Registro (SAREN)</span>
              <span className="text-sm font-semibold text-text-primary">{formatCurrency(arancelSaren)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-sm text-text-secondary">Timbres Fiscales (Gobernación)</span>
              <span className="text-sm font-semibold text-text-primary">{formatCurrency(timbresGobernacion)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-sm text-text-secondary">Solvencia Municipal / Alcaldía</span>
              <span className="text-sm font-semibold text-text-primary">{formatCurrency(solvenciaAlcaldia)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border-subtle">
              <span className="text-sm text-text-secondary">Redacción y Visado de Abogado</span>
              <span className="text-sm font-semibold text-text-primary">{formatCurrency(honorariosAbogado)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-3">
              <span className="text-sm font-semibold text-text-primary">TOTAL GASTOS</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(totalGastosCierre)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-surface-elevated rounded-lg p-3">
            <Info className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-muted leading-relaxed">
              <strong className="text-text-secondary">Tip de Negociación:</strong> En Venezuela, por costumbre el comprador asume los aranceles de registro (SAREN) y el vendedor entrega la solvencia municipal y catastral al día.
            </p>
          </div>
        </div>

        {/* ROI */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-text-primary">
              Calculadora de Rentabilidad (ROI)
            </h2>
          </div>
          <p className="text-xs text-text-muted mb-6">
            Muestra a los compradores cuánto dinero generará la propiedad si deciden alquilarla.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Canon de Alquiler Estimado (USD/mes)
              </label>
              <input
                type="number"
                value={canonMensual}
                onChange={(e) => setCanonMensual(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <label>Meses Ocupados al Año</label>
                <span className="font-semibold text-text-primary">{mesesOcupacion}</span>
              </div>
              <input
                type="range"
                min={6}
                max={12}
                value={mesesOcupacion}
                onChange={(e) => setMesesOcupacion(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Mantenimiento y Condominio Anual (USD)
              </label>
              <input
                type="number"
                value={gastoMantenimiento}
                onChange={(e) => setGastoMantenimiento(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="stat-card text-center">
              <p className="text-2xl font-bold text-emerald-400">{capRate.toFixed(1)}%</p>
              <p className="text-xs text-text-muted">Cap Rate Anual</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-bold text-cyan-400">{anosRetorno.toFixed(1)} años</p>
              <p className="text-xs text-text-muted">Recuperación</p>
            </div>
          </div>

          <div className="bg-surface-elevated rounded-lg p-4">
            <p className="text-xs font-medium text-text-secondary mb-2">
              Frase para anuncio comercial:
            </p>
            <pre className="text-sm text-primary font-[family-name:var(--font-mono)] whitespace-pre-wrap">
              {fraseInversionista}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
