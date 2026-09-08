"use client";

import { Download, FileText } from "lucide-react";

interface PDFGeneratorProps {
  inmueble: {
    titulo: string;
    tipo: string;
    ciudad: string;
    urbanizacion: string;
    estado: string;
    precio_venta: number;
    precio_dueno: number;
    metros: number;
    habs: number;
    banos: number;
    puestos: number;
    servicios: string;
    descripcion: string;
  };
}

export function PDFGenerator({ inmueble }: PDFGeneratorProps) {
  const precioM2 = inmueble.metros > 0 ? Math.round(inmueble.precio_venta / inmueble.metros) : 0;

  const generatePDF = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Ficha ${inmueble.titulo}</title>
<style>
  @page { margin: 20mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #212121; padding: 30px; }
  .header { text-align: center; border-bottom: 3px solid #C8102E; padding-bottom: 20px; margin-bottom: 25px; }
  .header h1 { color: #C8102E; font-size: 24px; margin-bottom: 5px; }
  .header p { color: #666; font-size: 12px; }
  .price-box { background: linear-gradient(135deg, #C8102E, #D32F2F); color: white; text-align: center; padding: 20px; border-radius: 10px; margin-bottom: 25px; }
  .price-box .amount { font-size: 32px; font-weight: 700; }
  .price-box .label { font-size: 12px; opacity: 0.9; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; }
  .item { background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid #0066CC; }
  .item .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
  .item .value { font-size: 14px; font-weight: 600; color: #212121; margin-top: 2px; }
  .section { margin-bottom: 20px; }
  .section h3 { font-size: 14px; color: #C8102E; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
  .section p { font-size: 13px; color: #555; line-height: 1.6; }
  .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 11px; color: #888; }
  .badge { display: inline-block; background: #E8F5E9; color: #2E7D32; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin: 2px; }
</style>
</head>
<body>
  <div class="header">
    <h1>🏢 ${inmueble.titulo}</h1>
    <p>Venezuela Inmobiliaria - Ficha Técnica Profesional</p>
  </div>
  
  <div class="price-box">
    <div class="label">INVERSIÓN</div>
    <div class="amount">$${inmueble.precio_venta.toLocaleString()} USD</div>
  </div>

  <div class="grid">
    <div class="item"><div class="label">Tipo</div><div class="value">${inmueble.tipo}</div></div>
    <div class="item"><div class="label">Ubicación</div><div class="value">${inmueble.urbanizacion}, ${inmueble.ciudad}</div></div>
    <div class="item"><div class="label">Estado</div><div class="value">${inmueble.estado}</div></div>
    <div class="item"><div class="label">Área</div><div class="value">${inmueble.metros} m² (${precioM2}/m²)</div></div>
    <div class="item"><div class="label">Habitaciones</div><div class="value">${inmueble.habs}</div></div>
    <div class="item"><div class="label">Baños</div><div class="value">${inmueble.banos}</div></div>
    <div class="item"><div class="label">Estacionamiento</div><div class="value">${inmueble.puestos} puestos</div></div>
    <div class="item"><div class="label">Servicios</div><div class="value">${inmueble.servicios}</div></div>
  </div>

  <div class="section">
    <h3>Descripción</h3>
    <p>${inmueble.descripcion || "Sin descripción detallada."}</p>
  </div>

  <div class="section">
    <h3>Servicios Destacados</h3>
    <div>${inmueble.servicios.split(" | ").map((s: string) => `<span class="badge">${s}</span>`).join("")}</div>
  </div>

  <div class="footer">
    <p>Ficha generada por Venezuela Inmobiliaria | ${new Date().toLocaleDateString("es-VE")}</p>
    <p>Para más información contactar al intermediario autorizado</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha_${inmueble.urbanizacion.replace(/\s/g, "_").toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={generatePDF} className="btn-accent text-xs py-1.5 px-3 flex items-center gap-1.5">
      <FileText className="w-3.5 h-3.5" />
      Descargar Ficha
    </button>
  );
}
