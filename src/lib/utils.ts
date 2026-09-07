import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  TERMINOS_INMOBILIARIOS,
  PALABRAS_PROHIBIDAS,
  PALABRAS_URGENCIA,
  PALABRAS_DUENO,
  PALABRAS_COMPRADOR,
} from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

const REGEX_TELEFONO_VE =
  /(?:(?:\+?58)|0)?\s*(?:[-.\s]?)(414|424|412|416|426|212|241|243|251|261|281)[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/;

export function esPublicacionInmobiliariaValida(texto: string): boolean {
  const t = texto.toLowerCase();
  for (const ruido of PALABRAS_PROHIBIDAS) {
    if (new RegExp(`\\b${ruido}\\b`).test(t)) {
      if (["vehiculo", "vehículo", "carro"].includes(ruido) && t.includes("recibo")) {
        continue;
      }
      return false;
    }
  }
  return TERMINOS_INMOBILIARIOS.some((inmo) =>
    new RegExp(`\\b${inmo}\\b`).test(t)
  );
}

export function calcularScoreUrgencia(texto: string): { score: number; esRemate: boolean } {
  const t = texto.toLowerCase();
  const coincidencias = PALABRAS_URGENCIA.filter((p) => t.includes(p)).length;
  const score = Math.min(coincidencias * 30, 100);
  return { score, esRemate: score >= 30 };
}

export function extraerPrecio(texto: string): number | null {
  const patron =
    /(?:\$|usd|ref|ref\.|precio[:\s]*\$?)\s*([0-9]{1,3}(?:[.,][0-9]{3})*|[0-9]{2,6})\b|\b([0-9]{1,3}(?:[.,][0-9]{3})*|[0-9]{2,6})\s*(?:\$|usd|ref)\b/gi;
  let match;
  while ((match = patron.exec(texto)) !== null) {
    const valStr = (match[1] || match[2] || "").replace(/\./g, "").replace(",", "");
    const val = parseFloat(valStr);
    if (!isNaN(val) && val >= 3000 && val <= 3000000) {
      return val;
    }
  }
  return null;
}

export function extraerMetros(texto: string): number | null {
  const m = texto.match(/(?:([0-9]{2,4})\s*(?:m2|mts|metros|mt2))\b/i);
  if (m) {
    const val = parseFloat(m[1]);
    if (!isNaN(val)) return val;
  }
  return null;
}

export function detectarServicios(texto: string): string {
  const t = texto.toLowerCase();
  const items: string[] = [];
  if (["pozo", "pozo profundo", "agua de pozo", "sin falta de agua"].some((k) => t.includes(k))) {
    items.push("Pozo");
  }
  if (["planta electrica", "planta eléctrica", "generador", "planta 100%"].some((k) => t.includes(k))) {
    items.push("Planta");
  }
  if (["fibra", "fibex", "airtek", "netuno", "aba ultra", "inter fibra"].some((k) => t.includes(k))) {
    items.push("Fibra");
  }
  if (["gas directo", "gas por tuberia"].some((k) => t.includes(k))) {
    items.push("Gas Directo");
  }
  return items.length > 0 ? items.join(" | ") : "Estándar";
}

export function normalizarTelefono(texto: string): { telefono: string | null; whatsappLink: string | null } {
  const match = texto.match(REGEX_TELEFONO_VE);
  if (!match) return { telefono: null, whatsappLink: null };
  const [, codigo, p1, p2] = match;
  const numLimpio = `58${codigo}${p1}${p2}`;
  const e164 = `+${numLimpio}`;
  return { telefono: e164, whatsappLink: `https://wa.me/${numLimpio}` };
}

export function clasificarLead(texto: string, rol: string): { calificado: boolean; etiqueta: string } {
  const t = texto.toLowerCase();
  if (rol === "vendedor") {
    const calificado = PALABRAS_DUENO.some((p) => t.includes(p));
    return { calificado, etiqueta: calificado ? "VENDEDOR (DUEÑO)" : "VENDEDOR" };
  }
  const calificado = PALABRAS_COMPRADOR.some((p) => t.includes(p));
  return { calificado, etiqueta: calificado ? "COMPRADOR POTENCIAL" : "INTERESADO" };
}

export function generarConsultas(termino: string, rol: string): string[] {
  if (rol === "vendedor") {
    return [
      `site:facebook.com "vendo apartamento" ${termino} "sin intermediarios"`,
      `site:facebook.com "vendo casa" ${termino} "trato directo"`,
      `site:facebook.com "vendo inmueble" ${termino} "motivo de viaje"`,
      `site:t.me vendo apartamento ${termino}`,
      `"vendo apartamento" ${termino} "remate" OR "oportunidad" 0414 OR 0424 OR 0412`,
      `site:instagram.com "vendo apartamento" ${termino} "dueño"`,
    ];
  }
  return [
    `site:facebook.com "busco comprar apartamento" ${termino}`,
    `site:facebook.com "busco comprar casa" ${termino}`,
    `site:facebook.com "compro apartamento" ${termino}`,
    `site:facebook.com "tengo cliente buscando apartamento" ${termino}`,
    `site:t.me "busco apartamento" ${termino}`,
    `"busco comprar casa" ${termino} 0414 OR 0424 OR 0412`,
  ];
}

export function generarCopyWhatsApp(props: {
  tipo: string;
  urbanizacion: string;
  ciudad: string;
  estado: string;
  metros: number;
  precioM2: number;
  habs: number;
  banos: number;
  puestos: number;
  servicios: string;
  descripcion: string;
  precioVenta: number;
}): string {
  return `✨ OPORTUNIDAD INMOBILIARIA EN VENTA ✨
📍 Ubicación: ${props.urbanizacion}, ${props.ciudad} (${props.estado})
🏡 Tipo: ${props.tipo} (${props.metros} m² | $${props.precioM2.toLocaleString()}/m²)

🛋 Distribución:
• ${props.habs} Habitaciones | ${props.banos} Baños | ${props.puestos} Puestos

⚡ Servicios:
• ${props.servicios}

📝 Detalles:
${props.descripcion}

💵 Inversión: $${props.precioVenta.toLocaleString()} USD (Negociable)
📲 Para visitas o información directa: Escríbeme por WhatsApp.`;
}

export function generarCopyInstagram(props: {
  tipo: string;
  urbanizacion: string;
  ciudad: string;
  metros: number;
  habs: number;
  banos: number;
  puestos: number;
  servicios: string;
  precioVenta: number;
}): string {
  const ciudadTag = props.ciudad.replace(/\s/g, "");
  return `🚀 ¡NUEVA CAPTACIÓN EXCLUSIVA!
📍 ${props.urbanizacion}, ${props.ciudad}

Si estás buscando una propiedad lista para habitar con servicios garantizados, esta opción es para ti:
📐 ${props.metros} m² de construcción
🛏 ${props.habs} Habitaciones
🚿 ${props.banos} Baños
🚗 ${props.puestos} Puestos de estacionamiento
💧 ${props.servicios}

💰 Inversión: $${props.precioVenta.toLocaleString()} USD
📥 Escríbenos al DM o al enlace de nuestro perfil para agendar tu visita.

#InmueblesVenezuela #BienesRaicesVenezuela #Inmuebles${ciudadTag} #VentaApartamento #OportunidadInmobiliaria #${ciudadTag}`;
}

export function generarCopyMarketplace(props: {
  tipo: string;
  urbanizacion: string;
  ciudad: string;
  habs: number;
  banos: number;
  servicios: string;
}): string {
  return `${props.tipo} en ${props.urbanizacion}, ${props.ciudad}
Excelente propiedad disponible en conjunto cerrado con vigilancia.
Cuenta con ${props.habs} habitaciones, ${props.banos} baños y ${props.servicios}.
Precio de oportunidad negociable.
Para mayor información, precio exacto y fotos adicionales, por favor enviar mensaje privado.`;
}
