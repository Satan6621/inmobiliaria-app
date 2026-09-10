import { NextRequest, NextResponse } from "next/server";
import { createSupabaseWithToken } from "@/lib/supabase";

function sbFor(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return createSupabaseWithToken(token);
}

export async function GET(request: NextRequest) {
  const sb = sbFor(request);
  const { data, error } = await sb
    .from("coincidencias")
    .select("*, solicitud:solicitudes(id, nombre, telefono, tipo, tipo_inmueble, zona, estado_solicitud)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message, coincidencias: [] }, { status: 200 });
  }
  return NextResponse.json({ coincidencias: data || [] });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const sb = sbFor(request);
    const { error } = await sb.from("coincidencias").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}