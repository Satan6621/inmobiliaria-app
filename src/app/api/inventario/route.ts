import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (replace with Supabase in production)
let inventarioStore: Record<string, unknown>[] = [];
let nextId = 1;

export async function GET() {
  return NextResponse.json({ inventario: inventarioStore });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nuevoInmueble = {
      id: nextId++,
      fecha: new Date().toISOString().split("T")[0],
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
      check_titulo: 0,
      check_catastro: 0,
      check_solvencia: 0,
      check_hipoteca: 0,
    };

    inventarioStore.unshift(nuevoInmueble);

    return NextResponse.json({ success: true, inmueble: nuevoInmueble });
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    inventarioStore = inventarioStore.filter((i) => i.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
