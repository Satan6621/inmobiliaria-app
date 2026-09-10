import { NextRequest, NextResponse } from "next/server";
import { createSupabaseWithToken } from "@/lib/supabase";

function sbFor(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return createSupabaseWithToken(token);
}

const ZONAS_POR_ESTADO: Record<string, string[]> = {
  Venezuela: ["Caracas", "Valencia", "Maracaibo", "Barquisimeto", "Maracay"],
  Cojedes: ["San Carlos", "Tinaquillo", "Anzoátegui", "Girardot", "Tinaco"],
  Carabobo: ["Valencia", "Naguanagua", "San Diego", "Los Guayos"],
  Miranda: ["Chacao", "Baruta", "El Hatillo", "San Antonio"],
  Aragua: ["Maracay", "Turmero", "El Limón"],
  Lara: ["Barquisimeto", "Cabudare"],
  Zulia: ["Maracaibo", "San Francisco"],
  Anzoátegui: ["Lechería", "Puerto La Cruz"],
  "Distrito Capital": ["Caracas"],
  Bolívar: ["Ciudad Guayana", "Puerto Ordaz"],
  "Nueva Esparta": ["Porlamar", "La Asunción"],
  Mérida: ["Mérida", "El Vigía"],
  Táchira: ["San Cristóbal"],
  Falcón: ["Coro", "Punto Fijo"],
  Monagas: ["Maturín"],
  Sucre: ["Cumaná"],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const soloDisponibles = searchParams.get("disponibles") === "true";

  const sb = sbFor(request);
  let query = sb
    .from("propiedades")
    .select("*, estados(nombre), municipios(nombre), propiedades_imagenes(url_imagen, es_principal)")
    .order("created_at", { ascending: false });

  if (tipo && tipo !== "Todos") query = query.eq("tipo_inmueble", tipo);
  if (soloDisponibles) query = query.not("estatus", "in", '(PAUSADO,VENDIDO)');

  const { data: rows, error } = await query;

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ propiedades: [], offline: true });
    }
    return NextResponse.json({ error: error.message, propiedades: [], offline: true }, { status: 200 });
  }

  const propiedades = (rows || []).map((p: any) => ({
    ...p,
    estado_nombre: p.estados?.nombre ?? null,
    municipio_nombre: p.municipios?.nombre ?? null,
    direccion_completa: p.direccion_completa || p.descripcion || "",
    imagenes_urls: (p.propiedades_imagenes || []).map((i: any) => i.url_imagen),
  }));
  return NextResponse.json({ propiedades });
}

function generarCodigoEstado(nombreEstado: string, contador: number): string {
  const abrev: Record<string, string> = {
    Venezuela: "VEN",
    Cojedes: "COJ", Carabobo: "CAR", Miranda: "MIR", Aragua: "ARG",
    Lara: "LAR", Zulia: "ZUL", Anzoátegui: "ANZ", "Distrito Capital": "CCS",
    Bolívar: "BOL", "Nueva Esparta": "NVA", Mérida: "MER", Táchira: "TAC",
    Falcón: "FAL", Monagas: "MON", Sucre: "SUC", Trujillo: "TRU",
    Yaracuy: "YAR", Guárico: "GUA", Amazonas: "AMA", "Delta Amacuro": "DEL", Vargas: "VAR",
  };
  const prefijo = abrev[nombreEstado] || "VEN";
  return `${prefijo}-${100 + (contador % 900)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sb = sbFor(request);
    const estado = body.estado || "Venezuela";
    const municipios = ZONAS_POR_ESTADO[estado] || [];

    // Obtener ids geográficos
    const { data: estadoRow } = await sb.from("estados").select("id").eq("nombre", estado).maybeSingle();
    const estadoId = estadoRow?.id ?? null;
    const { data: municipioRow } = estadoId
      ? await sb.from("municipios").select("id").eq("estado_id", estadoId).in("nombre", municipios).limit(1).maybeSingle()
      : { data: null };
    const municipioId = municipioRow?.id ?? null;

    // Contador para código agrupado por estado
    const { count } = estadoId
      ? await sb.from("propiedades").select("id", { count: "exact", head: true }).eq("estado_id", estadoId)
      : { count: 0 };

    const codigo = generarCodigoEstado(estado, count || 0);

    // Asignar propietario (user_id) si la sesión anónima/autenticada lo permite
    let userId = body.user_id || null;
    if (!userId) {
      const { data: userData } = await sb.auth.getUser();
      userId = userData?.user?.id ?? null;
    }

    const { data, error } = await sb
      .from("propiedades")
      .insert({
        user_id: userId,
        titulo: body.titulo || "Sin título",
        descripcion: body.descripcion || "",
        tipo_transaccion: body.tipo_transaccion || "venta",
        tipo_inmueble: body.tipo_inmueble || "Apartamento",
        estado_construccion: body.estado_construccion || "listo_para_habitar",
        precio: body.precio || 0,
        habitaciones: body.habitaciones || 0,
        banos: body.banos || 0,
        metros_cuadrados: body.metros_cuadrados || 0,
        nombre_agente: body.nombre_agente || "",
        telefono_agente: body.telefono_agente || "",
        tiene_tanque_agua: body.tiene_tanque_agua || false,
        tiene_planta_electrica: body.tiene_planta_electrica || false,
        estado_id: estadoId,
        municipio_id: municipioId,
        coordenadas: body.coordenadas || null,
        esta_verificado: false,
        estatus: body.estatus || "DISPONIBLE",
        codigo,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ offline: true, error: "Base de datos aún no configurada. Ejecuta supabase-schema.sql en el SQL Editor." }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Guardar imágenes (con token del usuario para respetar RLS)
    if (data && Array.isArray(body.imagenes) && body.imagenes.length > 0) {
      await sb.from("propiedades_imagenes").insert(
        body.imagenes.map((url: string, i: number) => ({
          propiedad_id: data.id,
          url_imagen: url,
          es_principal: i === 0,
        }))
      );
    }

    return NextResponse.json({ success: true, propiedad: data });
  } catch {
    return NextResponse.json({ error: "Error al guardar propiedad" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const sb = sbFor(request);
    const { data, error } = await sb
      .from("propiedades")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, propiedad: data });
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const sb = sbFor(request);
    const { error } = await sb.from("propiedades").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}