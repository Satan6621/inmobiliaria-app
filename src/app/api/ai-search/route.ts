import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildWhatsAppLink, WHATSAPP_COJEDES } from "@/lib/constants";

const VENEZUELA_DB = {
  Valencia: { state: "Carabobo", zones: ["Norte", "Sur", "Ciudad Bonita", "El Pedregal", "La Viña", "Naguanagua", "San Blas", "Tocuyito"], avgPrice: 35000 },
  Caracas: { state: "Distrito Capital", zones: ["Las Mercedes", "Santa Fe", "Chacao", "Altamira", "Los Palos Grandes", "El Hatillo", "Petare", "La California"], avgPrice: 55000 },
  Maracaibo: { state: "Zulia", zones: ["La Conradía", "El Rosario", "Santa Cecilia", "Country Club", "Sebastopol", "Ambrosio"], avgPrice: 30000 },
  Barquisimeto: { state: "Lara", zones: ["Novo Centro", "Quadrimilenario", "Valle Hondo", "Buena Vista", "Santa Rosa"], avgPrice: 28000 },
  Maracay: { state: "Aragua", zones: ["Las Delicias", "San Jacinto", "El Dorado", "La Villa", "Choroni"], avgPrice: 32000 },
  "Puerto Ordaz": { state: "Bolívar", zones: ["Alta Vista", "Vista al Sol", "Unare", "5 de Julio", "Ciudad Guayana"], avgPrice: 40000 },
  Mérida: { state: "Mérida", zones: ["Los Caciques", "La Cooperativa", "Pueblo Nuevo", "Sambil", "La Parroquia"], avgPrice: 25000 },
  Barcelona: { state: "Anzoátegui", zones: ["Nueva Barcelona", "San Cristóbal", "El Libertador", "Peñalver"], avgPrice: 27000 },
  "Santa Teresa": { state: "Aragua", zones: ["Alto Paraíso", "La Florida", "San Antonio"], avgPrice: 45000 },
  "La Victoria": { state: "Aragua", zones: ["Centro", "Ocumare", "Santa Cruz"], avgPrice: 22000 },
  Tinaquillo: { state: "Cojedes", zones: ["Centro de Tinaquillo", "La Campiña", "Villa Italia", "Los Samanes", "Urbanización Miranda", "La Macandona", "Brisas del Sur", "Las Flores", "San Luis"], avgPrice: 14000 },
  "San Carlos": { state: "Cojedes", zones: ["Centro de San Carlos", "Cantaclaro", "La Campiña", "Urbanización El Carmen", "Urbanización Limoncito", "La Aurora", "San Rafael", "El Maracay", "La Guacamaya"], avgPrice: 16000 },
  Tinaco: { state: "Cojedes", zones: ["Tinaco centro", "El Amparo", "La Palma", "Lechozas"], avgPrice: 11000 },
};

const TIPOS = {
  Apartamento: { beds: [2, 3, 4], baths: [1, 2, 2, 3], area: [80, 120], priceMult: 1 },
  Casa: { beds: [3, 4, 5], baths: [2, 3, 3, 4], area: [150, 350], priceMult: 1.3 },
  Townhouse: { beds: [3, 4], baths: [2, 3], area: [120, 200], priceMult: 1.1 },
  Penthouse: { beds: [2, 3], baths: [2, 3], area: [100, 250], priceMult: 1.8 },
  Duplex: { beds: [3, 4], baths: [2, 3], area: [130, 220], priceMult: 1.2 },
  Terreno: { beds: [0], baths: [0], area: [200, 1000], priceMult: 0.8 },
};

type Franja = { hasta: number; key: "barata" | "media" | "alta"; beds: number[]; baths: number[]; area: [number, number] };

const FRANJAS_PRECIO: Franja[] = [
  { hasta: 12000, key: "barata", beds: [2, 3], baths: [1, 2], area: [70, 150] },
  { hasta: 30000, key: "media", beds: [3, 4], baths: [2, 3], area: [120, 260] },
  { hasta: Number.POSITIVE_INFINITY, key: "alta", beds: [4, 6], baths: [3, 5], area: [250, 500] },
];

const SERVICIOS_POR_FRANJA: Record<Franja["key"], string[][]> = {
  barata: [["Pozo de agua"], ["Gas directo"], ["Cisterna"], ["Estacionamiento"], ["Pozo", "Rejas perimetrales"]],
  media: [["Pozo de agua", "Planta eléctrica"], ["Gas directo", "Fibra óptica"], ["Internet fibra", "Estacionamiento techado"], ["Pozo", "Planta", "Estacionamiento"]],
  alta: [["Piscina", "Seguridad 24h", "Jacuzzi"], ["Piscina", "Gimnasio", "BBQ"], ["Condominio cerrado", "Piscina", "Club house"], ["Piscina", "Pozo", "Planta eléctrica"]],
};

const DESCRIPCIONES: Record<Franja["key"], Record<string, string[]>> = {
  barata: {
    Apartamento: [
      "Apartamento con cocina tipo americana, espacio para lavadora y estacionamiento asignado.",
      "Apartamento sencillo, ideal para empezar, con buena iluminación y balcón pequeño.",
      "Apartamento con sala-comedor y un área de servicio, servicios básicos pagados.",
    ],
    Casa: [
      "Casa con sala, comedor, cocina independiente y estacionamiento en la entrada.",
      "Casa familiar con patio trasero, zona de lavado y rejas perimetrales.",
      "Casa con acabados básicos, cisterna propia y un amplio patio.",
      "Casa de barrio con buena ubicación, ideal para remodelar a tu gusto.",
    ],
    Townhouse: [
      "Townhouse de dos niveles con cocina integral sencilla y garaje para un vehículo.",
      "Townhouse familiar con balcón, bien cuidado y en condominio sencillo.",
    ],
    Penthouse: [
      "Penthouse en piso superior con terraza sencilla y vista a la ciudad.",
    ],
    Duplex: [
      "Dúplex con acceso directo desde la calle, ideal para familia pequeña.",
    ],
    Terreno: [
      "Terreno en zona en desarrollo, servicios disponibles y acceso pavimentado.",
      "Lote urbano con servicios básicos, listo para construir.",
    ],
  },
  media: {
    Apartamento: [
      "Amplio apartamento con cocina integral, closet empotrados y área de lavandería.",
      "Moderno apartamento con balcón, buenos acabados y vista a la ciudad.",
      "Apartamento familiar con sala-comedor amplia, cocina integral y dos áreas de ropa.",
    ],
    Casa: [
      "Casa con jardín frontal y trasero, estacionamiento y zona de servicio independiente.",
      "Casa familiar con amplio lounge, cocina integral y terraza.",
      "Casa con porcelanato, aire acondicionado en los principales ambientes y patio amplio.",
      "Casa con garaje para 2 vehículos, área verde y barbacoa sencilla.",
    ],
    Townhouse: [
      "Townhouse de 3 niveles con terraza, garaje y área de servicio.",
      "Townhouse familiar con cocina integral, jardín privado y buenos acabados.",
    ],
    Penthouse: [
      "Penthouse con terraza panorámica, buenos acabados y parrillera.",
      "Penthouse con vista a la ciudad, amoblado y acceso privado al piso.",
    ],
    Duplex: [
      "Dúplex con terraza, cocina integral y estacionamiento techado.",
    ],
    Terreno: [
      "Amplio lote con vista a la montaña, ideal para proyecto residencial familiar.",
      "Lote en urbanización con condominio cerrado y servicios completos.",
    ],
  },
  alta: {
    Apartamento: [
      "Apartamento premium con vista panorámica, domótica y roof garden.",
      "Apartamento exclusivo con acabados de lujo, terraza de usos múltiples y seguridad 24h.",
      "Apartamento con pisos de porcelanato, aire central y área social con piscina en el condominio.",
    ],
    Casa: [
      "Hermosa casa con piscina, barbecue, jardín maduro y zona de servicio independiente.",
      "Quinta con piscina y jacuzzi, terrazas, pérgola y amplios espacios de recreación.",
      "Casa de lujo con doble altura, ventanales panorámicos, smart home y piscina.",
      "Casa premium con sala de cine, gimnasio privado y rooftop con BBQ.",
    ],
    Townhouse: [
      "Townhouse de lujo con rooftop privado, BBQ, jacuzzi y vista panorámica.",
      "Townhouse exclusivo con acabados europeos, piscina en condominio y terraza en-suite.",
    ],
    Penthouse: [
      "Exclusivo penthouse con terraza panorámica de 180°, jacuzzi privado y vista impresionante.",
      "Penthouse de lujo con acabados premium, domótica, amoblado y terraza con parrillera.",
      "Penthouse con rooftop privado, gimnasio y piscina en el edificio.",
    ],
    Duplex: [
      "Dúplex premium con terraza en-suite, rooftop y acabados de lujo.",
    ],
    Terreno: [
      "Terreno premium en urbanización exclusiva, ideal para club privado o proyecto de lujo.",
      "Amplio lote frente a avenida principal, listo para proyecto comercial.",
    ],
  },
};

const FUENTES = [
  { name: "Metrocuadrado", url: "https://www.metrocuadrado.com" },
  { name: "Oportunia", url: "https://www.oportunia.com" },
  { name: "Facebook Marketplace", url: "https://www.facebook.com/marketplace" },
  { name: "Instagram @casasvenezuela", url: "https://www.instagram.com" },
  { name: "TikTok @inmobiliaria", url: "https://www.tiktok.com" },
  { name: "Zillow Venezuela", url: "https://www.zillow.com" },
];

function parsePrecio(raw: string, unit?: string): number {
  let num = parseFloat(String(raw).replace(/\./g, ""));
  if (!Number.isFinite(num)) return 0;
  if (unit === "mil" || unit === "k") num *= 1000;
  return num;
}

function parseSearchQuery(query: string) {
  const q = query.toLowerCase();
  const result: { type?: string; tipoExplicito?: boolean; city?: string; minBeds?: number; minPrice?: number; maxPrice?: number; services?: string[] } = {};

  // Detect type
  let tipoExplicito = true;
  if (q.includes("casa") || q.includes("quinta") || q.includes("quintas")) result.type = "Casa";
  else if (q.includes("terreno") || q.includes("lote")) result.type = "Terreno";
  else if (q.includes("penthouse")) result.type = "Penthouse";
  else if (q.includes("townhouse")) result.type = "Townhouse";
  else if (q.includes("duplex")) result.type = "Duplex";
  else { result.type = "Apartamento"; tipoExplicito = false; }
  result.tipoExplicito = tipoExplicito;

  // Detect city
  for (const city of Object.keys(VENEZUELA_DB)) {
    if (q.includes(city.toLowerCase())) {
      result.city = city;
      break;
    }
  }
  if (!result.city) {
    result.city = (q.includes("cojedes") || q.includes("san carlos")) ? "San Carlos" : "Tinaquillo";
  }

  // Detect bedrooms
  const bedMatch = q.match(/(\d+)\s*(habitacion|habs?|recamara|dormitorio|hab|hab\.)/);
  if (bedMatch) result.minBeds = parseInt(bedMatch[1]);

  // Detect maximum price (menos de, hasta, menor a, máximo, etc.)
  const maxMatch = q.match(/(?:menos de|o menos|hasta|maximo|máximo|inferior a|debajo de|por debajo de|menor a|menor de)\s*\$?\s*([\d.]+)\s*(mil|k|usd|dolares|dólares)?/);
  if (maxMatch) result.maxPrice = parsePrecio(maxMatch[1], maxMatch[2]);

  // Detect minimum price (desde, mínimo, mas de, mayor a, etc.)
  const minMatch = q.match(/(?:desde|minimo|mínimo|mas de|más de|mayor a|mayor de|superior a|mas de)\s*\$?\s*([\d.]+)\s*(mil|k|usd|dolares|dólares)?/);
  if (minMatch) result.minPrice = parsePrecio(minMatch[1], minMatch[2]);

  // Detect price range "entre X y Y"
  const rangeMatch = q.match(/entre\s+\$?\s*([\d.]+)\s*(mil|k)?\s*y\s*\$?\s*([\d.]+)\s*(mil|k|usd|dolares|dólares)?/);
  if (rangeMatch) {
    result.minPrice = parsePrecio(rangeMatch[1], rangeMatch[2]);
    result.maxPrice = parsePrecio(rangeMatch[3], rangeMatch[4]);
  }

  // Detect services
  result.services = [];
  if (q.includes("pozo")) result.services.push("Pozo de agua");
  if (q.includes("planta")) result.services.push("Planta eléctrica");
  if (q.includes("fibra") || q.includes("internet")) result.services.push("Fibra óptica");
  if (q.includes("piscina")) result.services.push("Piscina");
  if (q.includes("gym") || q.includes("gimnasio")) result.services.push("Gimnasio");

  return result;
}

function franjaDelPrecio(price: number) {
  return FRANJAS_PRECIO.find((f) => price <= f.hasta) || FRANJAS_PRECIO[FRANJAS_PRECIO.length - 1];
}

function generateProperties(query: string, count: number = 5) {
  const parsed = parseSearchQuery(query);
  const city = VENEZUELA_DB[parsed.city as keyof typeof VENEZUELA_DB];
  const tipo = TIPOS[parsed.type as keyof typeof TIPOS] || TIPOS.Apartamento;
  const esTerreno = parsed.type === "Terreno";
  const properties = [];

  for (let i = 0; i < count; i++) {
    const zone = city.zones[Math.floor(Math.random() * city.zones.length)];
    const basePrice = city.avgPrice * tipo.priceMult;
    let price: number;
    if (parsed.maxPrice) {
      price = Math.floor(parsed.maxPrice * 0.55 + Math.random() * parsed.maxPrice * 0.45);
    } else {
      price = Math.floor(basePrice * (0.55 + Math.random() * 0.35));
    }
    price = Math.max(1500, Math.round(price / 500) * 500);
    if (parsed.minPrice && price < parsed.minPrice) price = parsed.minPrice;
    if (parsed.maxPrice && price > parsed.maxPrice) price = parsed.maxPrice;

    const franja = franjaDelPrecio(price);
    const beds = esTerreno
      ? 0
      : Math.min(6, Math.max(parsed.minBeds || 0, franja.beds[Math.floor(Math.random() * franja.beds.length)]));
    const baths = esTerreno ? 0 : franja.baths[Math.floor(Math.random() * franja.baths.length)];
    const area = esTerreno
      ? 200 + Math.floor(Math.random() * 800)
      : franja.area[0] + Math.floor(Math.random() * (franja.area[1] - franja.area[0]));
    const services = parsed.services?.length
      ? parsed.services
      : SERVICIOS_POR_FRANJA[franja.key][Math.floor(Math.random() * SERVICIOS_POR_FRANJA[franja.key].length)];
    const descripcionesTipo = DESCRIPCIONES[franja.key][parsed.type || "Apartamento"] || DESCRIPCIONES[franja.key].Apartamento;
    const phone = ["0414", "0424", "0412", "0416", "0426"][Math.floor(Math.random() * 5)];
    const source = FUENTES[Math.floor(Math.random() * FUENTES.length)];

    properties.push({
      titulo: esTerreno ? `Terreno en ${zone}` : `${parsed.type} ${beds} Hab. en ${zone}`,
      precio: price,
      ubicacion: `${zone}, ${parsed.city}, ${city.state}, Venezuela`,
      tipo: parsed.type,
      telefono: `${phone}-${Math.floor(Math.random() * 9000000) + 1000000}`,
      servicios: services,
      resumen: descripcionesTipo[Math.floor(Math.random() * descripcionesTipo.length)],
      fuente: source.name,
      fuente_url: source.url,
      metros: area,
      habitaciones: beds,
      banos: baths,
      score_calidad: 75 + Math.floor(Math.random() * 25),
      fecha_publicacion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
  }

  return properties.sort((a, b) => b.score_calidad - a.score_calidad);
}

/**
 * Búsqueda REAL sobre la base de datos (propiedades del catálogo +
 * ofertas directas de propietarios captadas por el rastreador).
 * Devuelve [] si no hay datos reales todavía.
 */
async function buscarEnBase(query: string): Promise<any[]> {
  try {
    const parsed = parseSearchQuery(query);
    const ciudad = (parsed.city || "").toLowerCase();
    const resultados: any[] = [];

    // 1) Catálogo propio (propiedades)
    let q = supabase
      .from("propiedades")
      .select("*, estado:estados(nombre), municipio:municipios(nombre), zona:zonas_urbanizaciones(nombre)")
      .not("estatus", "in", "(PAUSADO,VENDIDO)")
      .limit(60);
    if (parsed.maxPrice) q = q.lte("precio", parsed.maxPrice);
    if (parsed.minPrice) q = q.gte("precio", parsed.minPrice);
    if (parsed.tipoExplicito && parsed.type && parsed.type !== "Apartamento") q = q.eq("tipo_inmueble", parsed.type);
    if (parsed.minBeds) q = q.gte("habitaciones", parsed.minBeds);

    const { data: props } = await q;
    const propiedades = (props || []).filter((p: any) => {
      const texto = [
        p.titulo, p.descripcion, p.direccion_completa,
        p.estado?.nombre, p.municipio?.nombre, p.zona?.nombre,
      ].filter(Boolean).join(" ").toLowerCase();
      return !ciudad || texto.includes(ciudad);
    });

    for (const p of propiedades) {
      const servicios: string[] = [];
      if (p.tiene_tanque_agua) servicios.push("Tanque de agua");
      if (p.tiene_planta_electrica) servicios.push("Planta eléctrica");
      if (p.aire_acondicionado) servicios.push("A/A");
      if (p.internet) servicios.push("Internet");
      if (p.piscina) servicios.push("Piscina");
      if (p.garaje) servicios.push("Garaje");
      const telefono = p.telefono_agente || WHATSAPP_COJEDES;
      const mensaje = `Hola, me interesa ${p.titulo || `la propiedad ${p.codigo || ""}`}${p.codigo ? ` (#${p.codigo})` : ""}. ¿Sigue disponible?`;
      resultados.push({
        titulo: p.titulo || (p.codigo ? `Propiedad ${p.codigo}` : "Propiedad disponible"),
        precio: Number(p.precio || 0),
        ubicacion: [p.zona?.nombre, p.municipio?.nombre, p.estado?.nombre, "Venezuela"].filter(Boolean).join(", "),
        tipo: p.tipo_inmueble || "Apartamento",
        telefono: telefono || "Ver enlace",
        servicios,
        resumen: p.descripcion || "Disponible. Escríbenos para más información.",
        fuente: "Catálogo inmobiliario",
        fuente_url: undefined,
        metros: p.metros_cuadrados,
        habitaciones: p.habitaciones,
        banos: p.banos,
        score_calidad: p.esta_verificado ? 90 : 70,
        fecha_publicacion: (p.created_at || "").slice(0, 10),
        es_real: true,
        origen: "base de datos",
        codigo: p.codigo,
        whatsapp: buildWhatsAppLink(telefono, mensaje),
      });
    }

    // 2) Ofertas directas de propietarios (prospectos del rastreador)
    const { data: pros } = await supabase
      .from("prospectos")
      .select("*")
      .ilike("rol", "%VENDEDOR%")
      .order("urgencia_score", { ascending: false })
      .limit(40);

    const prospectos = (pros || []).filter((p: any) => {
      if (parsed.maxPrice && p.precio_usd > parsed.maxPrice) return false;
      if (parsed.minPrice && p.precio_usd < parsed.minPrice) return false;
      const texto = `${p.titulo || ""} ${p.detalle || ""} ${p.zona || ""}`.toLowerCase();
      return !ciudad || texto.includes(ciudad);
    });

    for (const pr of prospectos.slice(0, 8)) {
      const t = (pr.titulo || "").toLowerCase();
      const tipo = t.includes("casa") || t.includes("quinta")
        ? "Casa"
        : t.includes("terreno") || t.includes("lote")
          ? "Terreno"
          : t.includes("townhouse")
            ? "Townhouse"
            : t.includes("penthouse")
              ? "Penthouse"
              : "Apartamento";
      resultados.push({
        titulo: pr.titulo || `Oportunidad en ${pr.zona || "la zona"}`,
        precio: Number(pr.precio_usd || 0),
        ubicacion: `${[pr.zona, "Venezuela"].filter(Boolean).join(", ")}`,
        tipo,
        telefono: pr.telefono || "Ver enlace",
        servicios: (pr.servicios || "Estándar").split(" | ").filter(Boolean),
        resumen: pr.detalle || "Publicación directa del propietario.",
        fuente: "Propietario directo",
        fuente_url: pr.enlace || undefined,
        metros: pr.metros,
        habitaciones: 0,
        banos: 0,
        score_calidad: Math.max(60, Number(pr.urgencia_score || 0)),
        fecha_publicacion: pr.fecha || "",
        es_real: true,
        origen: "propietario directo",
        whatsapp: pr.whatsapp_link || (pr.telefono && pr.telefono !== "Ver enlace" ? buildWhatsAppLink(pr.telefono) : ""),
      });
    }

    return resultados.sort((a, b) => b.score_calidad - a.score_calidad);
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        resultados: [],
        error: "Escribe al menos 2 caracteres para buscar",
      });
    }

    const reales = await buscarEnBase(query);
    if (reales.length > 0) {
      return NextResponse.json({
        resultados: reales,
        total: reales.length,
        query: query,
        message: `${reales.length} resultados reales para "${query}"`,
        es_en_vivo: true,
      });
    }

    const properties = generateProperties(query);
    return NextResponse.json({
      resultados: properties,
      total: properties.length,
      query: query,
      message: `No hay resultados reales todavía para "${query}". Mostrando datos de ejemplo: capta vendedores con tu link de Captación o sube propiedades en "Mi CRM".`,
      demo: true,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({
      resultados: generateProperties("apartamento Valencia"),
      error: null,
      demo: true,
    });
  }
}
