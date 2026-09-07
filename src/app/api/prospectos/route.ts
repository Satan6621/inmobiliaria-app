import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (replace with Supabase in production)
let prospectosStore: Record<string, unknown>[] = [];
let nextId = 1;

export async function GET() {
  return NextResponse.json({ prospectos: prospectosStore });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nuevoProspecto = {
      id: nextId++,
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
    };

    prospectosStore.unshift(nuevoProspecto);

    return NextResponse.json({ success: true, prospecto: nuevoProspecto });
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, estado_gestion, notas } = await request.json();
    prospectosStore = prospectosStore.map((p) =>
      p.id === id ? { ...p, estado_gestion, notas } : p
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    prospectosStore = prospectosStore.filter((p) => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
