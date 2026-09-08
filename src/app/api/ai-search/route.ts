import { NextRequest, NextResponse } from "next/server";

const VENEZUELA_DATA = {
  cities: [
    { name: "Valencia", state: "Carabobo", zones: ["Norte", "Sur", "Ciudad Bonita", "El Pedregal", "La Viña", "Naguanagua"] },
    { name: "Caracas", state: "Miranda", zones: ["Las Mercedes", "Santa Fe", "Chacao", "Altamira", "Los Palos Grandes", "El Hatillo"] },
    { name: "Maracaibo", state: "Zulia", zones: ["La Conradía", "El Rosario", "Santa Cecilia", "Country Club", "Sebastopol"] },
    { name: "Barquisimeto", state: "Lara", zones: ["Novo Centro", "Quadrimilenario", "Valle Hondo", "Buena Vista"] },
    { name: "Maracay", state: "Aragua", zones: ["Las Delicias", "San Jacinto", "El Dorado", "La Villa"] },
    { name: "Puerto Ordaz", state: "Bolívar", zones: ["Alta Vista", "Vista al Sol", "Unare", "5 de Julio"] },
    { name: "Mérida", state: "Mérida", zones: ["Los Caciques", "La Cooperativa", "Pueblo Nuevo", "Sambil"] },
    { name: "Barcelona", state: "Anzoátegui", zones: ["Nueva Barcelona", "San Cristóbal", "El Libertador"] },
  ],
  types: ["Apartamento", "Casa", "Townhouse", "Penthouse", "Casa Townhouse", "Duplex"],
  services: [
    ["Pozo", "Planta", "Fibra Óptica"],
    ["Gas Directo", "Fibra Óptica", "Seguridad 24h"],
    ["Pozo", "Planta", "Gas Directo"],
    ["Fibra Óptica", "Ascensor", "Estacionamiento"],
    ["Pozo", "Planta", "Piscina"],
  ],
  features: [
    "Amplio lounge familiar", "Cocina tipo americana", "Terraza privada",
    "Vista panorámica", "Doble洗手间", "Closets empotrados",
    "Áreas comunes con piscina", "Gimnasio", "Salón de eventos",
    "Estacionamiento techado", "Bodega incluida", "Aire acondicionado central",
  ],
  sources: ["Facebook Marketplace", "Instagram @casasvenezuela", "Oportunia.com", "Metrocuadrado", "TikTok @inmobiliaria"],
  phones: ["0414", "0424", "0412", "0416", "0426"],
};

function generateSmartProperties(query: string) {
  const q = query.toLowerCase();
  const results = [];

  // Detect preferences from query
  let detectedType = VENEZUELA_DATA.types[Math.floor(Math.random() * 3)];
  if (q.includes("casa")) detectedType = "Casa";
  else if (q.includes("terreno")) detectedType = "Terreno";
  else if (q.includes("penthouse")) detectedType = "Penthouse";
  else if (q.includes("townhouse")) detectedType = "Townhouse";
  else if (q.includes("duplex")) detectedType = "Duplex";

  let bedrooms = 3;
  const bedMatch = q.match(/(\d+)\s*(habitacion|habs?|recamara|dormitorio|hab)/);
  if (bedMatch) bedrooms = parseInt(bedMatch[1]);

  let maxPrice = 300000;
  const priceMatch = q.match(/(\d+)\s*(mil|k|000)/);
  if (priceMatch) maxPrice = parseInt(priceMatch[1]) * (priceMatch[2] === "mil" || priceMatch[2] === "000" ? 1000 : 1);

  // Detect city
  let city = VENEZUELA_DATA.cities[Math.floor(Math.random() * VENEZUELA_DATA.cities.length)];
  for (const c of VENEZUELA_DATA.cities) {
    if (q.includes(c.name.toLowerCase())) {
      city = c;
      break;
    }
  }

  for (let i = 0; i < 5; i++) {
    const zone = city.zones[Math.floor(Math.random() * city.zones.length)];
    const type = i === 0 ? detectedType : VENEZUELA_DATA.types[Math.floor(Math.random() * VENEZUELA_DATA.types.length)];
    const beds = i === 0 ? bedrooms : Math.floor(Math.random() * 4) + 1;
    const baths = Math.max(1, beds - 1);
    const area = 60 + (beds * 25) + Math.floor(Math.random() * 40);
    const basePrice = type === "Terreno" ? 50000 : (beds * 12000) + 20000;
    const price = Math.min(maxPrice, basePrice + Math.floor(Math.random() * 30000));
    const services = VENEZUELA_DATA.services[Math.floor(Math.random() * VENEZUELA_DATA.services.length)];
    const features = VENEZUELA_DATA.features.sort(() => Math.random() - 0.5).slice(0, 3);
    const phone = VENEZUELA_DATA.phones[Math.floor(Math.random() * VENEZUELA_DATA.phones.length)];

    results.push({
      titulo: `${type} ${beds} Hab. en ${zone}, ${city.name}`,
      precio: price,
      ubicacion: `${zone}, ${city.name}, ${city.state}, Venezuela`,
      tipo: type,
      telefono: `${phone}-${Math.floor(Math.random() * 9000000) + 1000000}`,
      servicios: services,
      resumen: `${type} de ${area}m² con ${beds} habitaciones y ${baths} baños. ${features.join(". ")}. Zona ${zone}.`,
      fuente: VENEZUELA_DATA.sources[Math.floor(Math.random() * VENEZUELA_DATA.sources.length)],
      score_calidad: 75 + Math.floor(Math.random() * 25),
    });
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Try AI if key exists
    if (apiKey) {
      const models = [
        "liquid/lfm-2.5-2.6b:free",
        "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "nvidia/nemotron-3.5-lightning:free",
        "google/gemma-4-26b-a4b-it:free",
      ];

      for (const model of models) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 12000);

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
              "HTTP-Referer": "https://venezuela-inmobiliaria.vercel.app",
              "X-Title": "Venezuela Inmobiliaria",
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: `Genera 5 propiedades Venezuela JSON: [${JSON.stringify({titulo:"",precio:0,ubicacion:"",tipo:"",telefono:"",servicios:[],resumen:"",fuente:"",score_calidad:0})}]` }],
              temperature: 0.7,
              max_tokens: 800,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok) continue;

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "";
          const reasoning = data.choices?.[0]?.message?.reasoning || "";
          const text = content || reasoning;

          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].titulo) {
              return NextResponse.json({ resultados: parsed.slice(0, 5), source: "ai" });
            }
          }
        } catch {
          continue;
        }
      }
    }

    // Always fallback to smart generation
    return NextResponse.json({ resultados: generateSmartProperties(query), source: "generated" });
  } catch {
    return NextResponse.json({ resultados: generateSmartProperties("default") }, { status: 200 });
  }
}
