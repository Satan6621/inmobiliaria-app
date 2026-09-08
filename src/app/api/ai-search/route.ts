import { NextRequest, NextResponse } from "next/server";

const FREE_MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3.5-lightning:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
];

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        resultados: [{
          titulo: "API Key no configurada",
          precio: 0,
          ubicacion: "Configura OPENROUTER_API_KEY en Vercel",
          tipo: "Info",
          telefono: "",
          servicios: [],
          resumen: "Necesitas agregar tu API key de OpenRouter. Obtén una gratis en https://openrouter.ai/keys",
          fuente: "Sistema",
          score_calidad: 0,
        }],
      });
    }

    const prompt = `Eres un experto en bienes raíces venezolanos. Analiza esta búsqueda y genera propiedades realistas en Venezuela.

Búsqueda: "${query}"

Genera exactamente 5 propiedades realistas con este formato JSON (solo el JSON, nada más):

[
  {
    "titulo": "Título descriptivo de la propiedad",
    "precio": 35000,
    "ubicacion": "Dirección, Ciudad, Estado, Venezuela",
    "tipo": "Apartamento/Casa/Townhouse/Terreno",
    "telefono": "0414-1234567",
    "servicios": ["Pozo", "Planta", "Fibra"],
    "resumen": "Descripción breve de 1-2 líneas",
    "fuente": "Facebook Marketplace",
    "score_calidad": 85
  }
]

Reglas:
- Precios realistas en USD para Venezuela (5000-300000)
- Teléfonos venezolanos (0414, 0424, 0412, 0212)
- Ciudades reales: Valencia, Caracas, Maracaibo, Barquisimeto, Maracay
- Servicios: Pozo, Planta, Fibra, Gas Directo
- Score 0-100
- Solo JSON, sin texto adicional`;

    // Try each model until one works
    for (const model of FREE_MODELS) {
      try {
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
            messages: [
              { role: "system", content: "Eres un experto en bienes raíces venezolanos. Solo respondes con JSON válido." },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          console.error(`Model ${model} failed:`, response.status);
          continue;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "";

        const jsonMatch = text.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          const resultados = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ resultados, model_used: model });
        }
      } catch (e) {
        console.error(`Model ${model} error:`, e);
        continue;
      }
    }

    return NextResponse.json({
      resultados: [{
        titulo: "Sin resultados",
        precio: 0,
        ubicacion: "",
        tipo: "Info",
        telefono: "",
        servicios: [],
        resumen: "No se pudieron generar resultados. Intenta de nuevo.",
        fuente: "Sistema",
        score_calidad: 0,
      }],
    });
  } catch (error) {
    console.error("AI Search error:", error);
    return NextResponse.json({
      resultados: [{
        titulo: "Error interno",
        precio: 0,
        ubicacion: "",
        tipo: "Error",
        telefono: "",
        servicios: [],
        resumen: String(error),
        fuente: "Sistema",
        score_calidad: 0,
      }],
    }, { status: 500 });
  }
}
