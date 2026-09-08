import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        resultados: [{
          titulo: "API Key no configurada",
          precio: 0,
          ubicacion: "Configura GOOGLE_GEMINI_API_KEY en Vercel",
          tipo: "Info",
          telefono: "",
          servicios: [],
          resumen: "Necesitas agregar tu API key de Google Gemini en las variables de entorno de Vercel.",
          fuente: "Sistema",
          score_calidad: 0,
        }],
      });
    }

    const prompt = `Eres un experto en bienes raíces venezolanos. Analiza esta búsqueda y genera propiedades realistas en Venezuela.

Búsqueda: "${query}"

Genera exactamente 5 propiedades realistas con este formato JSON (sin texto adicional, solo el JSON):

[
  {
    "titulo": "Descriptive title of the property",
    "precio": 35000,
    "ubicacion": "Address, City, State, Venezuela",
    "tipo": "Apartamento/Casa/Townhouse/Terreno",
    "telefono": "0414-1234567",
    "servicios": ["Pozo", "Planta", "Fibra"],
    "resumen": "Brief 1-2 line description",
    "fuente": "Facebook Marketplace",
    "score_calidad": 85
  }
]

Reglas:
- Precios realistas en USD para Venezuela (5000-300000)
- Teléfonos venezolanos (0414, 0424, 0412, 0212)
- Ciudades reales: Valencia, Caracas, Maracaibo, Barquisimeto, Maracay, etc.
- Servicios comunes: Pozo, Planta, Fibra, Gas Directo
- Score de 0-100 basado en completitud de datos
- Solo responde con el JSON, nada más`;

    // Try Gemini API with fetch (more compatible)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json({
        resultados: [{
          titulo: "Error en API de Gemini",
          precio: 0,
          ubicacion: `Status: ${response.status}`,
          tipo: "Error",
          telefono: "",
          servicios: [],
          resumen: `Error: ${errorText.substring(0, 200)}`,
          fuente: "Sistema",
          score_calidad: 0,
        }],
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const resultados = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ resultados });
    }

    return NextResponse.json({
      resultados: [{
        titulo: "Sin resultados parseables",
        precio: 0,
        ubicacion: "",
        tipo: "Info",
        telefono: "",
        servicios: [],
        resumen: text.substring(0, 200),
        fuente: "Gemini",
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
