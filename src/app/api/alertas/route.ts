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
    .from("alertas_busqueda")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ alertas: [], offline: true });
    }
    return NextResponse.json({ error: error.message, alertas: [] });
  }
  return NextResponse.json({ alertas: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sb = sbFor(request);
    const { data, error } = await sb
      .from("alertas_busqueda")
      .insert({
        user_id: body.user_id || null,
        titulo: body.titulo || "Mi búsqueda",
        nombre_agente: body.nombre_agente || "Agente",
        precio_min: body.precio_min || null,
        precio_max: body.precio_max || null,
        estado_id: body.estado_id || null,
        municipio_id: body.municipio_id || null,
        tipo_inmueble: body.tipo_inmueble || null,
        habitaciones_min: body.habitaciones_min || null,
        tiene_tanque_agua: body.tiene_tanque_agua ?? null,
        tiene_planta_electrica: body.tiene_planta_electrica ?? null,
        esta_verificado: body.esta_verificado ?? null,
        activa: body.activa !== false,
        notificaciones_enviadas: 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ offline: true, error: "Ejecuta supabase-schema.sql primero" });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, alerta: data });
  } catch {
    return NextResponse.json({ error: "Error al guardar alerta" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const sb = sbFor(request);
    const { data, error } = await sb
      .from("alertas_busqueda")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, alerta: data });
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const sb = sbFor(request);
    const { error } = await sb.from("alertas_busqueda").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}