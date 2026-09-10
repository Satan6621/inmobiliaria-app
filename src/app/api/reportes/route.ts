import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function sbFor(request: NextRequest): SupabaseClient {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });
}

const MOTIVOS_VALIDOS = ["ya_vendido", "informacion_falsa", "estafa", "duplicado"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propiedad_id, motivo, comentarios, website } = body;

    // Honeypot: si el bot llena este campo, descartamos en silencio
    if (website && String(website).trim().length > 0) {
      return NextResponse.json({ ok: true, id: null }, { status: 200 });
    }
    if (!propiedad_id || typeof propiedad_id !== "string" || !propiedad_id.includes("-")) {
      return NextResponse.json({ error: "Falta propiedad_id" }, { status: 400 });
    }
    if (!MOTIVOS_VALIDOS.includes(motivo)) {
      return NextResponse.json({ error: "Motivo no válido" }, { status: 400 });
    }

    const sb = sbFor(request);
    const { error } = await sb.from("reportes_propiedades").insert({
      propiedad_id,
      motivo,
      comentarios: String(comentarios || "").slice(0, 2000),
    });

    if (error) {
      // fallback: si la tabla aún no existe en Supabase, avisar (42P01/PGRST205)
      const sinTabla = error.code === "42P01" || (error as any)?.code === "PGRST205" || /could not find the table|does not exist/i.test(error.message);
      return NextResponse.json({ error: error.message }, { status: sinTabla ? 501 : 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error al registrar reporte" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sb = sbFor(request);
    const propiedadId = request.nextUrl.searchParams.get("propiedad_id");

    let query = sb
      .from("reportes_propiedades")
      .select("id, propiedad_id, motivo, comentarios, created_at");

    if (propiedadId) query = query.eq("propiedad_id", propiedadId);
    const { data, error } = await query.order("created_at", { ascending: false }).limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reportes: data || [] });
  } catch {
    return NextResponse.json({ error: "Error al consultar reportes" }, { status: 500 });
  }
}