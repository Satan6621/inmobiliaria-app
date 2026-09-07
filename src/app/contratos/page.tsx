"use client";

import { useState } from "react";
import { FileText, Download, Copy, User, Building2, MapPin, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ContratosPage() {
  const [tipoDoc, setTipoDoc] = useState("autorizacion");
  const [form, setForm] = useState({
    nomAsesor: "Red de Inversión Inmobiliaria",
    ciAsesor: "V-00.000.000",
    nomCliente: "",
    ciCliente: "",
    inmDireccion: "",
    precioPactado: 35000,
    honorarios: "5% sobre el precio de cierre o sobreprecio acordado",
  });

  const fechaFormateada = new Date().toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const documentoAutorizacion = `DOCUMENTO PRIVADO DE AUTORIZACIÓN DE PROMOCIÓN INMOBILIARIA

Entre el ciudadano(a) ${form.nomCliente || "[Nombre del Propietario]"}, titular de la Cédula de Identidad N° ${form.ciCliente || "[C.I.]"}, actuando en su carácter de legítimo propietario del inmueble ubicado en:
${form.inmDireccion || "[Dirección del Inmueble]"}.
Y por la otra parte, el ciudadano(a) ${form.nomAsesor}, titular de la Cédula de Identidad N° ${form.ciAsesor}, en su condición de Intermediario Inmobiliario independiente.

Se ha convenido lo siguiente:
PRIMERA: EL PROPIETARIO autoriza a EL INTERMEDIARIO, de forma NO EXCLUSIVA, a promover y comercializar el inmueble antes descrito, fijando como precio neto de venta la cantidad de: ${formatCurrency(form.precioPactado)} DÓLARES AMERICANOS (USD).
SEGUNDA: Se conviene como honorarios profesionales de intermediación: ${form.honorarios}, los cuales serán cancelados al momento del otorgamiento del documento definitivo o firma de opción a compra ante Notaría o Registro Público Inmobiliario (SAREN).
TERCERA: EL PROPIETARIO se compromete a facilitar copias simples del Título de Propiedad y documentación legal para la debida verificación preventiva.

En constancia de conformidad, firman en fecha ${fechaFormateada}:

_____________________________              _____________________________
EL PROPIETARIO                             EL INTERMEDIARIO
C.I. ${form.ciCliente || "[C.I.]"}                          C.I. ${form.ciAsesor}`;

  const documentoLOI = `RECIBO DE RESERVA Y CARTA DE INTENCIÓN DE COMPRA

Fecha: ${fechaFormateada}
Inmueble: ${form.inmDireccion || "[Dirección del Inmueble]"}

Por medio del presente documento, el ciudadano(a) ${form.nomCliente || "[Nombre del Comprador]"}, titular de la C.I. N° ${form.ciCliente || "[C.I.]"}, manifiesta formalmente su intención de adquirir el inmueble antes identificado, bajo las siguientes condiciones:

1. PRECIO DE OFERTA: La cantidad de ${formatCurrency(form.precioPactado)} DÓLARES AMERICANOS (USD).
2. FORMA DE PAGO: Fondos disponibles en efectivo / transferencia bancaria al momento de la firma.
3. CONDICIÓN: Oferta sujeta a la revisión satisfactoria de la tradición legal del inmueble ante el Registro Inmobiliario competente (SAREN).
4. El presente acuerdo otorga un plazo de cinco (5) días hábiles para la redacción y formalización del contrato de Opción de Compra Venta bilateral.

Firmado en señal de aceptación:

_____________________________              _____________________________
EL OFERTANTE / COMPRADOR                   POR LA INTERMEDIACIÓN
C.I. ${form.ciCliente || "[C.I.]"}                          C.I. ${form.ciAsesor}`;

  const documento = tipoDoc === "autorizacion" ? documentoAutorizacion : documentoLOI;

  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(documento);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Generador de Contratos
            </h1>
            <p className="text-sm text-text-muted">
              Documentos legales y protección de comisión para Venezuela
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Datos del Documento</h2>

          <div className="mb-4">
            <label className="text-xs font-medium text-text-secondary mb-2 block">Tipo de Documento</label>
            <div className="flex gap-2">
              {[
                { value: "autorizacion", label: "Autorización de Venta" },
                { value: "loi", label: "Carta de Intención (LOI)" },
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => setTipoDoc(op.value)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    tipoDoc === op.value
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-surface text-text-muted border border-border"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">
                  <User className="w-3 h-3 inline mr-1" />
                  Tu Nombre / Agencia
                </label>
                <input
                  type="text"
                  value={form.nomAsesor}
                  onChange={(e) => setForm({ ...form, nomAsesor: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Tu C.I. / RIF</label>
                <input
                  type="text"
                  value={form.ciAsesor}
                  onChange={(e) => setForm({ ...form, ciAsesor: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={form.nomCliente}
                  onChange={(e) => setForm({ ...form, nomCliente: e.target.value })}
                  placeholder="Ej. Carlos Mendoza"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">C.I. del Cliente</label>
                <input
                  type="text"
                  value={form.ciCliente}
                  onChange={(e) => setForm({ ...form, ciCliente: e.target.value })}
                  placeholder="Ej. V-12.345.678"
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">
                <MapPin className="w-3 h-3 inline mr-1" />
                Dirección del Inmueble
              </label>
              <input
                type="text"
                value={form.inmDireccion}
                onChange={(e) => setForm({ ...form, inmDireccion: e.target.value })}
                placeholder="Res. Las Chimeneas, Apto 4-B, Valencia"
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  Monto Pactado (USD)
                </label>
                <input
                  type="number"
                  value={form.precioPactado}
                  onChange={(e) => setForm({ ...form, precioPactado: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Honorarios</label>
                <input
                  type="text"
                  value={form.honorarios}
                  onChange={(e) => setForm({ ...form, honorarios: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={copiarAlPortapapeles} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" />
              Copiar Texto
            </button>
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(documento)}`}
              download={`documento_${new Date().toISOString().split("T")[0]}.txt`}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar .TXT
            </a>
          </div>
        </div>

        {/* Vista Previa */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Vista Previa del Documento</h2>
          <div className="bg-surface rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <pre className="text-xs text-text-secondary whitespace-pre-wrap font-[family-name:var(--font-mono)] leading-relaxed">
              {documento}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
