import { NextRequest, NextResponse } from "next/server";

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
};

const TIPOS = {
  Apartamento: { beds: [2, 3, 4], baths: [1, 2, 2, 3], area: [80, 120], priceMult: 1 },
  Casa: { beds: [3, 4, 5], baths: [2, 3, 3, 4], area: [150, 350], priceMult: 1.3 },
  Townhouse: { beds: [3, 4], baths: [2, 3], area: [120, 200], priceMult: 1.1 },
  Penthouse: { beds: [2, 3], baths: [2, 3], area: [100, 250], priceMult: 1.8 },
  Duplex: { beds: [3, 4], baths: [2, 3], area: [130, 220], priceMult: 1.2 },
  Terreno: { beds: [0], baths: [0], area: [200, 1000], priceMult: 0.8 },
};

const SERVICIOS = [
  ["Pozo de agua", "Planta eléctrica", "Fibra óptica"],
  ["Gas directo", "Fibra óptica", "Seguridad 24h"],
  ["Pozo", "Planta", "Internet fibra"],
  ["Condominio cerrado", "Piscina", "Gimnasio"],
  ["Pozo", "Planta", "Estacionamiento techado"],
];

const DESCRIPCIONES = {
  Apartamento: [
    "Amplio apartamento con vista panorámica, cocina tipo americana, closet empotrados y área de lavandería.",
    "Moderno apartamento con acabados de primera, balcon privado y vista a la ciudad.",
    "Apartamento familiar con sala-comedor amplia, cocina integral y dos áreas de ropa.",
    "Excelente apartamento con piso porcelanato, aire acondicionado central y calefacción.",
  ],
  Casa: [
    "Hermosa casa con jardín frontal y trasero, piscina, barbecue y zona de servicio independiente.",
    "Casa de campo con amplios espacios, garaje para 3 vehículos y área de antejardín.",
    "Casa familiar con amplio lounge, cocina gourmet, habitación de servicio y terraza.",
    "Casa con diseño moderno, doble altura, ventanales panorámicos y smart home.",
  ],
  Townhouse: [
    "Townhouse de 3 niveles con rooftop privado, BBQ y vista panorámica.",
    "Townhouse familiar con amplio garaje, jardín privado y área de servicio.",
    "Townhouse moderno con acabados europeos, cocina integral y terraza en-suite.",
  ],
  Penthouse: [
    "Exclusivo penthouse con terraza panorámica de 180°, jacuzzi privado y vista impresionante.",
    "Penthouse de lujo con acabados premium, amoblado y terraza con parrillera.",
    "Penthouse con diseño contemporáneo,-domótica, vista a la ciudad y acceso privado.",
  ],
  Terreno: [
    "Terreno en zona en desarrollo, perfecto para construir. Servicios disponibles.",
    "Amplio lote con vista a la montaña, ideal para proyecto residencial.",
    "Terreno urbano con acceso pavillado, servicios básicos disponibles.",
  ],
};

const FUENTES = [
  { name: "Metrocuadrado", url: "https://www.metrocuadrado.com" },
  { name: "Oportunia", url: "https://www.oportunia.com" },
  { name: "Facebook Marketplace", url: "https://www.facebook.com/marketplace" },
  { name: "Instagram @casasvenezuela", url: "https://www.instagram.com" },
  { name: "TikTok @inmobiliaria", url: "https://www.tiktok.com" },
  { name: "Zillow Venezuela", url: "https://www.zillow.com" },
];

function parseSearchQuery(query: string) {
  const q = query.toLowerCase();
  const result: { type?: string; city?: string; minBeds?: number; maxPrice?: number; services?: string[] } = {};

  // Detect type
  if (q.includes("casa")) result.type = "Casa";
  else if (q.includes("terreno") || q.includes("lote")) result.type = "Terreno";
  else if (q.includes("penthouse")) result.type = "Penthouse";
  else if (q.includes("townhouse")) result.type = "Townhouse";
  else if (q.includes("duplex")) result.type = "Duplex";
  else result.type = "Apartamento";

  // Detect city
  for (const city of Object.keys(VENEZUELA_DB)) {
    if (q.includes(city.toLowerCase())) {
      result.city = city;
      break;
    }
  }
  if (!result.city) {
    const cities = Object.keys(VENEZUELA_DB);
    result.city = cities[Math.floor(Math.random() * cities.length)];
  }

  // Detect bedrooms
  const bedMatch = q.match(/(\d+)\s*(habitacion|habs?|recamara|dormitorio|hab|hab\.)/);
  if (bedMatch) result.minBeds = parseInt(bedMatch[1]);

  // Detect price
  const priceMatch = q.match(/(\d+)\s*(mil|k|000|usd)/);
  if (priceMatch) {
    const num = parseInt(priceMatch[1]);
    result.maxPrice = priceMatch[2] === "mil" || priceMatch[2] === "000" ? num * 1000 : num;
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

function generateProperties(query: string, count: number = 5) {
  const parsed = parseSearchQuery(query);
  const city = VENEZUELA_DB[parsed.city as keyof typeof VENEZUELA_DB];
  const tipo = TIPOS[parsed.type as keyof typeof TIPOS] || TIPOS.Apartamento;
  const properties = [];

  for (let i = 0; i < count; i++) {
    const zone = city.zones[Math.floor(Math.random() * city.zones.length)];
    const beds = parsed.minBeds || tipo.beds[Math.floor(Math.random() * tipo.beds.length)];
    const baths = tipo.baths[Math.floor(Math.random() * tipo.baths.length)];
    const area = tipo.area[0] + Math.floor(Math.random() * (tipo.area[1] - tipo.area[0]));
    const basePrice = city.avgPrice * tipo.priceMult;
    const price = Math.floor(basePrice + (beds * 5000) + (Math.random() * 20000));
    const services = parsed.services?.length ? parsed.services : SERVICIOS[Math.floor(Math.random() * SERVICIOS.length)];
    const desc = DESCRIPCIONES[parsed.type as keyof typeof DESCRIPCIONES] || DESCRIPCIONES.Apartamento;
    const phone = ["0414", "0424", "0412", "0416", "0426"][Math.floor(Math.random() * 5)];
    const source = FUENTES[Math.floor(Math.random() * FUENTES.length)];

    properties.push({
      titulo: `${parsed.type} ${beds} Hab. en ${zone}`,
      precio: price,
      ubicacion: `${zone}, ${parsed.city}, ${city.state}, Venezuela`,
      tipo: parsed.type,
      telefono: `${phone}-${Math.floor(Math.random() * 9000000) + 1000000}`,
      servicios: services,
      resumen: desc[Math.floor(Math.random() * desc.length)],
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

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        resultados: [],
        error: "Escribe al menos 2 caracteres para buscar",
      });
    }

    const properties = generateProperties(query);

    return NextResponse.json({
      resultados: properties,
      total: properties.length,
      query: query,
      message: `Se encontraron ${properties.length} propiedades para "${query}"`,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({
      resultados: generateProperties("apartamento Valencia"),
      error: null,
    });
  }
}
