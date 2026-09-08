import { NextRequest, NextResponse } from "next/server";

function generateMockProperties(query: string) {
  const normalizedQuery = query.toLowerCase();
  const cities = ["Valencia", "Caracas", "Maracaibo", "Barquisimeto", "Maracay", "Puerto Ordaz", "Mérida", "Barcelona"];
  const types = ["Apartamento", "Casa", "Townhouse", "Penthouse", "Terreno"];
  const services = [["Pozo", "Planta", "Fibra"], ["Gas Directo", "Fibra"], ["Pozo", "Planta"], ["Fibra"]];
  const zones = ["Norte", "Sur", "Este", "Oeste", "Centro", "Las Mercedes", "Santa Fe", "El Paraiso"];
  const sources = ["Facebook Marketplace", "Instagram", "Metrocuadrado", "Oportunia", "TikTok"];

  // Detect type from query
  let detectedType = types[0];
  if (normalizedQuery.includes("casa")) detectedType = "Casa";
  else if (normalizedQuery.includes("terreno")) detectedType = "Terreno";
  else if (normalizedQuery.includes("penthouse")) detectedType = "Penthouse";
  else if (normalizedQuery.includes("townhouse")) detectedType = "Townhouse";

  // Detect bedrooms from query
  let bedrooms = 3;
  const bedMatch = normalizedQuery.match(/(\d+)\s*(habitacion|habs?|recamara|dormitorio)/);
  if (bedMatch) bedrooms = parseInt(bedMatch[1]);

  const results = [];
  for (let i = 0; i < 5; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const type = i === 0 ? detectedType : types[Math.floor(Math.random() * types.length)];
    const price = Math.floor(Math.random() * 200000) + 15000;
    const beds = i === 0 ? bedrooms : Math.floor(Math.random() * 4) + 1;
    const baths = Math.max(1, beds - 1);
    const area = Math.floor(Math.random() * 150) + 60;

    results.push({
      titulo: `${type} ${beds} Hab. en ${zone}`,
      precio: price,
      ubicacion: `${zone}, ${city}, Venezuela`,
      tipo: type,
      telefono: `0414-${Math.floor(Math.random() * 9000000) + 1000000}`,
      servicios: services[Math.floor(Math.random() * services.length)],
      resumen: `${type} de ${area}m² con ${beds} habitaciones y ${baths} baños. Zona ${zone} en ${city}.`,
      fuente: sources[Math.floor(Math.random() * sources.length)],
      score_calidad: Math.floor(Math.random() * 30) + 70,
    });
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ resultados: generateMockProperties(query) });
    }

    const prompt = `Genera 5 propiedades inmobiliarias realistas en Venezuela para: "${query}"
Responde SOLO con JSON array, nada mas:
[{"titulo":"Title","precio":35000,"ubicacion":"City, Estado","tipo":"Apartamento","telefono":"0414-1234567","servicios":["Pozo"],"resumen":"Desc","fuente":"Facebook","score_calidad":85}]
Precios 5000-300000 USD. Telefonos 0414/0424/0412. Solo JSON.`;

    // Try multiple models
    const models = [
      "liquid/lfm-2.5-2.6b:free",
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
      "nvidia/nemotron-3.5-lightning:free",
    ];

    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

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
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 800,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) continue;

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        const reasoning = data.choices?.[0]?.message?.reasoning;
        const text = content || reasoning || "";

        const jsonMatch = text.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.length > 0 && parsed[0].titulo) {
            return NextResponse.json({ resultados: parsed, source: "ai" });
          }
        }
      } catch {
        continue;
      }
    }

    // Fallback to mock data
    return NextResponse.json({ resultados: generateMockProperties(query), source: "mock" });
  } catch {
    return NextResponse.json({ resultados: [] }, { status: 500 });
  }
}
