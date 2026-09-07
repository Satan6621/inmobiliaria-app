import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("prospectos")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message, prospectos: [] }, { status: 500 });
  }
  return NextResponse.json({ prospectos: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("prospectos")
      .insert({
        fecha: body.fecha || new Date().toISOString().split("T")[0],
        zona: body.zona || "",
        rol: body.rol || "",
        calificado: body.calificado || "NO",
        precio_usd: body.precio_usd || 0,
        metros: body.metros || 0,
        precio_m2: body.precio_m2 || 0,
        urgencia_score: body.urgencia_score || 0,
        servicios: body.servicios || "Estándar",
        telefono: body.telefono || "Ver enlace",
        whatsapp_link: body.whatsapp_link || "",
        titulo: body.titulo || "",
        detalle: body.detalle || "",
        enlace: body.enlace || "",
        estado_gestion: "NUEVO",
        notas: "",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, message: "Duplicate - skipped" });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, prospecto: data });
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, estado_gestion, notas } = await request.json();

    const { error } = await supabase
      .from("prospectos")
      .update({ estado_gestion, notas })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const { error } = await supabase.from("prospectos").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
