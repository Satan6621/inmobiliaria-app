"use client";

import { useState } from "react";
import { FileText, Download, User, Home, MapPin, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ContratoData {
  tipo: string;
  vendedor: { nombre: string; cedula: string; telefono: string; direccion: string };
  comprador: { nombre: string; cedula: string; telefono: string; direccion: string };
  inmueble: { tipo: string; direccion: string; urbanizacion: string; ciudad: string; estado: string; metros: number; habs: number; banos: number; descripcion: string };
  precio: number;
  fecha: string;
  formaPago: string;
  condiciones: string;
}

export default function ContratosPage() {
  const [data, setData] = useState<ContratoData>({
    tipo: "COMPRAVENTA",
    vendedor: { nombre: "", cedula: "", telefono: "", direccion: "" },
    comprador: { nombre: "", cedula: "", telefono: "", direccion: "" },
    inmueble: { tipo: "Apartamento", direccion: "", urbanizacion: "", ciudad: "", estado: "", metros: 0, habs: 0, banos: 0, descripcion: "" },
    precio: 0,
    fecha: new Date().toISOString().split("T")[0],
    formaPago: "CONTADO",
    condiciones: "El presente contrato se celebra de conformidad con las disposiciones de la Ley Orgánica de Hacienda Pública Municipal y la legislación vigente.",
  });

  const generarContrato = () => {
    const contrato = `
CONTRATO DE ${data.tipo}
N° ${Date.now().toString().slice(-6)}

Entre las partes:

EL/LA VENDEDOR(A):
Nombre: ${data.vendedor.nombre}
Cédula: ${data.vendedor.cedula}
Teléfono: ${data.vendedor.telefono}
Dirección: ${data.vendedor.direccion}

EL/LA COMPRADOR(A):
Nombre: ${data.comprador.nombre}
Cédula: ${data.comprador.cedula}
Teléfono: ${data.comprador.telefono}
Dirección: ${data.comprador.direccion}

CLÁUSULAS:

PRIMERA - OBJETO DEL CONTRATO
El/La Vendedor(a) transfiere al/La Comprador(a) el siguiente inmueble:
Tipo: ${data.inmueble.tipo}
Dirección: ${data.inmueble.direccion}
Urbanización: ${data.inmueble.urbanizacion}
Ciudad: ${data.inmueble.ciudad}, ${data.inmueble.estado}
Metros cuadrados: ${data.inmueble.metros}m²
Habitaciones: ${data.inmueble.habs} | Baños: ${data.inmueble.banos}
Descripción: ${data.inmueble.descripcion}

SEGUNDA - PRECIO Y FORMA DE PAGO
El precio de venta es de ${formatCurrency(data.precio)} (${data.precio} dólares americanos).
Forma de pago: ${data.formaPago}

TERCERA - ENTREGA DEL INMUEBLE
El/La Vendedor(a) se compromete a entregar el inmueble libre de cargos, deudas y gravámenes.

CUARTA - GASTOS E IMPUESTOS
Los gastos de escrituración, impuestos y honorarios profesionales serán cubiertos por ${data.formaPago === "CONTADO" ? "el/la Comprador(a)" : "ambas partes proporcionalmente"}.

QUINTA - VIGENCIA
El presente contrato tendrá vigencia a partir de la fecha de firma.

${data.condiciones}

Firmado en __________________, a los ____ días del mes de ______________ de ${new Date(data.fecha).getFullYear()}.


_____________________          _____________________
EL/LA VENDEDOR(A)             EL/LA COMPRADOR(A)


_____________________
Testigo 1


_____________________
Testigo 2
    `.trim();

    const blob = new Blob([contrato], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Contrato_${data.tipo}_${data.comprador.nombre || "cliente"}_${data.fecha}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <FileText className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Generador de Contratos
            </h1>
            <p className="text-sm text-text-muted">
              Genera contratos profesionales de compraventa
            </p>
          </div>
        </div>
        <button onClick={generarContrato} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Descargar Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tipo de Contrato */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Tipo de Contrato</h2>
          <select value={data.tipo} onChange={(e) => setData({ ...data, tipo: e.target.value })}
            className="select-field w-full">
            <option value="COMPRAVENTA">Contrato de Compraventa</option>
            <option value="ARRENDAMIENTO">Contrato de Arrendamiento</option>
            <option value="OPCION DE COMPRA">Opción de Compra</option>
            <option value="DEPOSITO EN GARANTÍA">Depósito en Garantía</option>
          </select>
        </div>

        {/* Datos del Vendedor */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-warning" /> Vendedor
          </h2>
          <div className="space-y-3">
            <input type="text" placeholder="Nombre completo" value={data.vendedor.nombre}
              onChange={(e) => setData({ ...data, vendedor: { ...data.vendedor, nombre: e.target.value } })}
              className="input-field w-full" />
            <input type="text" placeholder="Cédula/RIF" value={data.vendedor.cedula}
              onChange={(e) => setData({ ...data, vendedor: { ...data.vendedor, cedula: e.target.value } })}
              className="input-field w-full" />
            <input type="text" placeholder="Teléfono" value={data.vendedor.telefono}
              onChange={(e) => setData({ ...data, vendedor: { ...data.vendedor, telefono: e.target.value } })}
              className="input-field w-full" />
            <input type="text" placeholder="Dirección" value={data.vendedor.direccion}
              onChange={(e) => setData({ ...data, vendedor: { ...data.vendedor, direccion: e.target.value } })}
              className="input-field w-full" />
          </div>
        </div>

        {/* Datos del Comprador */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-success" /> Comprador
          </h2>
          <div className="space-y-3">
            <input type="text" placeholder="Nombre completo" value={data.comprador.nombre}
              onChange={(e) => setData({ ...data, comprador: { ...data.comprador, nombre: e.target.value } })}
              className="input-field w-full" />
            <input type="text" placeholder="Cédula/RIF" value={data.comprador.cedula}
              onChange={(e) => setData({ ...data, comprador: { ...data.comprador, cedula: e.target.value } })}
              className="input-field w-full" />
            <input type="text" placeholder="Teléfono" value={data.comprador.telefono}
              onChange={(e) => setData({ ...data, comprador: { ...data.comprador, telefono: e.target.value } })}
              className="input-field w-full" />
            <input type="text" placeholder="Dirección" value={data.comprador.direccion}
              onChange={(e) => setData({ ...data, comprador: { ...data.comprador, direccion: e.target.value } })}
              className="input-field w-full" />
          </div>
        </div>

        {/* Datos del Inmueble */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" /> Inmueble
          </h2>
          <div className="space-y-3">
            <select value={data.inmueble.tipo}
              onChange={(e) => setData({ ...data, inmueble: { ...data.inmueble, tipo: e.target.value } })}
              className="select-field w-full">
              <option>Apartamento</option><option>Casa</option><option>Townhouse</option>
              <option>Penthouse</option><option>Terreno</option><option>Local Comercial</option>
            </select>
            <input type="text" placeholder="Dirección" value={data.inmueble.direccion}
              onChange={(e) => setData({ ...data, inmueble: { ...data.inmueble, direccion: e.target.value } })}
              className="input-field w-full" />
            <input type="text" placeholder="Urbanización" value={data.inmueble.urbanizacion}
              onChange={(e) => setData({ ...data, inmueble: { ...data.inmueble, urbanizacion: e.target.value } })}
              className="input-field w-full" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Ciudad" value={data.inmueble.ciudad}
                onChange={(e) => setData({ ...data, inmueble: { ...data.inmueble, ciudad: e.target.value } })}
                className="input-field w-full" />
              <input type="text" placeholder="Estado" value={data.inmueble.estado}
                onChange={(e) => setData({ ...data, inmueble: { ...data.inmueble, estado: e.target.value } })}
                className="input-field w-full" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input type="number" placeholder="m²" value={data.inmueble.metros || ""}
                onChange={(e) => setData({ ...data, inmueble: { ...data.inmueble, metros: Number(e.target.value) } })}
                className="input-field w-full" />
              <input type="number" placeholder="Habs" value={data.inmueble.habs || ""}
                onChange={(e) => setData({ ...data, inmueble: { ...data.inmueble, habs: Number(e.target.value) } })}
                className="input-field w-full" />
              <input type="number" placeholder="Baños" value={data.inmueble.banos || ""}
                onChange={(e) => setData({ ...data, inmueble: { ...data.inmueble, banos: Number(e.target.value) } })}
                className="input-field w-full" />
            </div>
            <textarea placeholder="Descripción del inmueble" value={data.inmueble.descripcion}
              onChange={(e) => setData({ ...data, inmueble: { ...data.inmueble, descripcion: e.target.value } })}
              className="input-field w-full h-20" />
          </div>
        </div>

        {/* Precio y Condiciones */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" /> Precio y Condiciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Precio de Venta (USD)</label>
              <input type="number" value={data.precio || ""}
                onChange={(e) => setData({ ...data, precio: Number(e.target.value) })}
                className="input-field w-full" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Fecha del Contrato</label>
              <input type="date" value={data.fecha}
                onChange={(e) => setData({ ...data, fecha: e.target.value })}
                className="input-field w-full" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Forma de Pago</label>
              <select value={data.formaPago}
                onChange={(e) => setData({ ...data, formaPago: e.target.value })}
                className="select-field w-full">
                <option>CONTADO</option><option>CRÉDITO BANCARIO</option>
                <option>CRÉDITO VENDEDOR</option><option>MIXTA</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs text-text-muted mb-1 block">Condiciones Especiales</label>
            <textarea value={data.condiciones}
              onChange={(e) => setData({ ...data, condiciones: e.target.value })}
              className="input-field w-full h-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
