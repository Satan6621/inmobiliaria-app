import { NextRequest, NextResponse } from "next/server";
import {
  ZONAS_DISPONIBLES,
  TERMINOS_INMOBILIARIOS,
  PALABRAS_PROHIBIDAS,
  PALABRAS_URGENCIA,
  PALABRAS_DUENO,
  PALABRAS_COMPRADOR,
} from "@/lib/constants";

function esPublicacionValida(texto: string): boolean {
  const t = texto.toLowerCase();
  for (const ruido of PALABRAS_PROHIBIDAS) {
    if (new RegExp(`\\b${ruido}\\b`).test(t)) {
      if (["vehiculo", "vehículo", "carro"].includes(ruido) && t.includes("recibo")) continue;
      return false;
    }
  }
  return TERMINOS_INMOBILIARIOS.some((inmo) => new RegExp(`\\b${inmo}\\b`).test(t));
}

function calcularScore(texto: string): { score: number; esRemate: boolean } {
  const t = texto.toLowerCase();
  const coincidencias = PALABRAS_URGENCIA.filter((p) => t.includes(p)).length;
  const score = Math.min(coincidencias * 30, 100);
  return { score, esRemate: score >= 30 };
}

function extraerPrecio(texto: string): number | null {
  const patron = /(?:\$|usd|ref|ref\.|precio[:\s]*\$?)\s*([0-9]{1,3}(?:[.,][0-9]{3})*|[0-9]{2,6})\b|\b([0-9]{1,3}(?:[.,][0-9]{3})*|[0-9]{2,6})\s*(?:\$|usd|ref)\b/gi;
  let match;
  while ((match = patron.exec(texto)) !== null) {
    const valStr = (match[1] || match[2] || "").replace(/\./g, "").replace(",", "");
    const val = parseFloat(valStr);
    if (!isNaN(val) && val >= 3000 && val <= 3000000) return val;
  }
  return null;
}

function extraerMetros(texto: string): number | null {
  const m = texto.match(/(?:([0-9]{2,4})\s*(?:m2|mts|metros|mt2))\b/i);
  return m ? parseFloat(m[1]) : null;
}

function detectarServicios(texto: string): string {
  const t = texto.toLowerCase();
  const items: string[] = [];
  if (["pozo", "pozo profundo", "agua de pozo"].some((k) => t.includes(k))) items.push("Pozo");
  if (["planta electrica", "planta eléctrica", "generador"].some((k) => t.includes(k))) items.push("Planta");
  if (["fibra", "fibex", "airtek", "netuno"].some((k) => t.includes(k))) items.push("Fibra");
  if (["gas directo", "gas por tuberia"].some((k) => t.includes(k))) items.push("Gas Directo");
  return items.length > 0 ? items.join(" | ") : "Estándar";
}

function extraerTelefono(texto: string): { telefono: string | null; whatsappLink: string | null } {
  const regex = /(?:(?:\+?58)|0)?\s*(?:[-.\s]?)(414|424|412|416|426|212|241|243|251|261|281)[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/;
  const match = texto.match(regex);
  if (!match) return { telefono: null, whatsappLink: null };
  const [, codigo, p1, p2] = match;
  const num = `58${codigo}${p1}${p2}`;
  return { telefono: `+${num}`, whatsappLink: `https://wa.me/${num}` };
}

function clasificarLead(texto: string, rol: string): { calificado: boolean; etiqueta: string } {
  const t = texto.toLowerCase();
  if (rol === "vendedor") {
    const calificado = PALABRAS_DUENO.some((p) => t.includes(p));
    return { calificado, etiqueta: calificado ? "VENDEDOR (DUEÑO)" : "VENDEDOR" };
  }
  const calificado = PALABRAS_COMPRADOR.some((p) => t.includes(p));
  return { calificado, etiqueta: calificado ? "COMPRADOR POTENCIAL" : "INTERESADO" };
}

function generarConsultas(termino: string, rol: string): string[] {
  if (rol === "vendedor") {
    return [
      `site:facebook.com "vendo apartamento" ${termino} "sin intermediarios"`,
      `site:facebook.com "vendo casa" ${termino} "trato directo"`,
      `site:facebook.com "vendo inmueble" ${termino} "motivo de viaje"`,
      `"vendo apartamento" ${termino} "remate" OR "oportunidad" 0414 OR 0424 OR 0412`,
    ];
  }
  return [
    `site:facebook.com "busco comprar apartamento" ${termino}`,
    `site:facebook.com "busco comprar casa" ${termino}`,
    `site:facebook.com "compro apartamento" ${termino}`,
    `"busco comprar casa" ${termino} 0414 OR 0424 OR 0412`,
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zonas, roles, filtrarPrecio, precioMin, precioMax, soloUrgentes, maxResultados = 8 } = body;

    const resultados: Record<string, unknown>[] = [];
    const urlsVistas = new Set<string>();

    for (const zona of zonas) {
      const termino = ZONAS_DISPONIBLES[zona] || zona;
      for (const rol of roles) {
        const consultas = generarConsultas(termino, rol);
        for (const query of consultas) {
          try {
            // Use DuckDuckGo Lite HTML endpoint
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
              `https://html.duckduckgo.com/html/?q=${encodedQuery}`,
              {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
              }
            );

            const html = await response.text();

            // Parse results from DuckDuckGo HTML
            const resultRegex = /<a rel="nofollow" class="result__a" href="([^"]*)"[^>]*>(.*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>(.*?)<\/a>/gi;
            let match;
            let count = 0;

            while ((match = resultRegex.exec(html)) !== null && count < maxResultados) {
              const [, rawUrl, rawTitle, rawBody] = match;
              const url = decodeURIComponent(rawUrl.replace(/.*uddg=/, "").replace(/&.*/, ""));
              const titulo = rawTitle.replace(/<[^>]*>/g, "").trim();
              const cuerpo = rawBody.replace(/<[^>]*>/g, "").trim();
              const contenido = `${titulo} ${cuerpo}`;

              if (!url || urlsVistas.has(url)) continue;
              urlsVistas.add(url);

              if (!esPublicacionValida(contenido)) continue;

              const { score, esRemate } = calcularScore(contenido);
              if (soloUrgentes && !esRemate) continue;

              const precio = extraerPrecio(contenido);
              if (filtrarPrecio && precio) {
                if (precio < precioMin || precio > precioMax) continue;
              }

              const metros = extraerMetros(contenido);
              const precioM2 = precio && metros ? Math.round((precio / metros) * 10) / 10 : 0;
              const servicios = detectarServicios(contenido);
              const { calificado, etiqueta } = clasificarLead(contenido, rol);
              const { telefono, whatsappLink } = extraerTelefono(contenido);

              resultados.push({
                fecha: new Date().toISOString().split("T")[0],
                zona,
                rol: etiqueta,
                calificado: calificado ? "SÍ" : "NO",
                precio_usd: precio || 0,
                metros: metros || 0,
                precio_m2: precioM2,
                urgencia_score: score,
                es_remate: esRemate ? "🔥 REMATE" : "Normal",
                servicios,
                telefono: telefono || "Ver enlace",
                whatsapp_link: whatsappLink || "",
                titulo: titulo,
                detalle: cuerpo,
                enlace: url,
              });

              count++;
            }
          } catch (e) {
            console.error("Error en consulta:", e);
          }
          // Small delay between requests
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    return NextResponse.json({ resultados, nuevos: resultados.length });
  } catch (error) {
    return NextResponse.json({ error: "Error interno", resultados: [] }, { status: 500 });
  }
}
