import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback: return mock results with search suggestions
      return NextResponse.json({
        resultados: [
          {
            titulo: `Búsqueda AI: ${query}`,
            precio: 0,
            ubicacion: "Venezuela",
            tipo: "Búsqueda general",
            telefono: "",
            servicios: [],
            resumen: `Para usar AI, configura GOOGLE_GEMINI_API_KEY en Vercel. Tu búsqueda fue: "${query}"`,
            fuente: "Sistema",
            score_calidad: 0,
          },
        ],
      });
    }

    // Use Google Gemini to analyze and extract property data
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analiza esta búsqueda inmobiliaria y extrae propiedades encontradas en Venezuela.
Búsqueda del usuario: "${query}"

Responde SOLO con un JSON válido con este formato:
[
  {
    "titulo": "Título descriptivo de la propiedad",
    "precio": 35000,
    "ubicacion": "Dirección, Ciudad, Estado",
    "tipo": "Apartamento/Casa/Townhouse/Terreno",
    "telefono": "0414-1234567",
    "servicios": ["Pozo", "Planta", "Fibra"],
    "resumen": "Descripción breve de 1-2 líneas",
    "fuente": "Fuente de donde se obtuvo",
    "score_calidad": 85
  }
]

Si no encuentras propiedades específicas, genera 3 ejemplos realistas basados en la búsqueda.
El score_calidad va de 0-100 y evalúa qué tan completa y confiable es la información.
Solo responde con el JSON, sin texto adicional.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const resultados = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ resultados });
    }

    return NextResponse.json({ resultados: [] });
  } catch (error) {
    console.error("AI Search error:", error);
    return NextResponse.json({ error: "Error en búsqueda AI", resultados: [] }, { status: 500 });
  }
}
