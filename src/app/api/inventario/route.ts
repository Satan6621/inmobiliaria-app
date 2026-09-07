import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("inventario")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message, inventario: [] }, { status: 500 });
  }
  return NextResponse.json({ inventario: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("inventario")
      .insert({
        titulo: body.titulo || "",
        tipo: body.tipo || "Apartamento",
        estado: body.estado || "Carabobo",
        ciudad: body.ciudad || "",
        urbanizacion: body.urbanizacion || "",
        precio_dueno: body.precio_dueno || 0,
        precio_venta: body.precio_venta || 0,
        habs: body.habs || 0,
        banos: body.banos || 0,
        puestos: body.puestos || 0,
        metros: body.metros || 0,
        precio_m2: body.precio_m2 || 0,
        servicios: body.servicios || "Básicos",
        descripcion: body.descripcion || "",
        fotos_rutas: "",
        contacto_dueno: body.contacto_dueno || "",
        estatus: "DISPONIBLE",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, inmueble: data });
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const { error } = await supabase.from("inventario").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
