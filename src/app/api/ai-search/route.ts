import { NextRequest, NextResponse } from "next/server";

const FREE_MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3.5-lightning:free",
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
          resumen: "Agrega tu API key de OpenRouter en Vercel. Gratis en openrouter.ai/keys",
          fuente: "Sistema",
          score_calidad: 0,
        }],
      });
    }

    const prompt = `Genera 5 propiedades inmobiliarias realistas en Venezuela para: "${query}"

JSON (solo JSON):
[{"titulo":"Title","precio":35000,"ubicacion":"City, State","tipo":"Apartamento","telefono":"0414-1234567","servicios":["Pozo","Fibra"],"resumen":"Description","fuente":"Facebook","score_calidad":85}]

Precios 5000-300000 USD. Teléfonos 0414/0424/0412. Ciudades reales. Solo JSON.`;

    for (const model of FREE_MODELS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);

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
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) continue;

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "";

        const jsonMatch = text.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          return NextResponse.json({ resultados: JSON.parse(jsonMatch[0]) });
        }
      } catch (e) {
        continue;
      }
    }

    return NextResponse.json({ resultados: [] });
  } catch (error) {
    return NextResponse.json({ resultados: [] }, { status: 500 });
  }
}
