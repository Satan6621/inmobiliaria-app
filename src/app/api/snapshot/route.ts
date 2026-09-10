import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Datos SIEMPRE frescos: el Service Worker y localStorage absorben las
// descargas repetidas en el cliente, así que la caché ISR aquí solo
// serviría datos obsoletos (precios/estatus cambiados sin reflejar).
export const dynamic = "force-dynamic";

/**
 * Snapshot compacto para modo offline: datos planos esenciales de TODAS
 * las propiedades públicas (sin imágenes pesadas). Los clientes lo guardan
 * en caché (Service Worker) y el rastreador/mapa funciona sin conexión.
 * Los cambios se detectan comparando `updated_at` del último snapshot.
 */
export async function GET() {
  try {
    const { data: propiedades } = await supabase
      .from("propiedades")
      .select(
        "id, codigo, titulo, tipo_inmueble, precio, habitaciones, banos, metros_cuadrados, " +
        "direccion_completa, esta_verificado, estatus, esta_paused, updated_at, created_at, " +
        "estado:estados(nombre), municipio:municipios(nombre), " +
        "imagenes:propiedades_imagenes(url_imagen, es_principal)"
      )
      .not("estatus", "in", "(VENDIDO)")
      .limit(1000);

    const filas = (propiedades || []).map((p: any) => ({
      id: p.id,
      codigo: p.codigo,
      titulo: p.titulo,
      tipo_inmueble: p.tipo_inmueble,
      precio: Number(p.precio || 0),
      habitaciones: p.habitaciones,
      banos: p.banos,
      metros_cuadrados: p.metros_cuadrados,
      direccion_completa: p.direccion_completa,
      esta_verificado: p.esta_verificado,
      estado: p.estado?.nombre || "",
      municipio: p.municipio?.nombre || "",
      imagen: p.imagenes?.find((i: any) => i.es_principal)?.url_imagen || p.imagenes?.[0]?.url_imagen || null,
      updated_at: p.updated_at || null,
      created_at: p.created_at || null,
    }));

    const ultimaModificacion = filas.reduce(
      (max: string | null, f: any) => (f.updated_at && (!max || f.updated_at > max) ? f.updated_at : max),
      null
    );

    return NextResponse.json({
      generado_at: new Date().toISOString(),
      updated_at_max: ultimaModificacion,
      total: filas.length,
      propiedades: filas,
    });
  } catch {
    // Si la red falla, el Service Worker servirá la copia en caché
    return NextResponse.json(
      { generado_at: null, updated_at_max: null, total: -1, propiedades: [] },
      { status: 503 }
    );
  }
}