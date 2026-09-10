import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Historial de cambios de precio de una propiedad.
 * Se alimenta de la tabla `historial_precios` (trigger automático en Supabase).
 * Si aún no hay cambios registrados, genera una proyección sintética verosímil
 * partiendo del precio actual para que el gráfico siempre muestre valor.
 */
export async function GET(request: NextRequest) {
  try {
    const propiedadId = request.nextUrl.searchParams.get("propiedad_id");
    const nombre = request.nextUrl.searchParams.get("nombre") || "";

    if (!propiedadId) {
      return NextResponse.json({ error: "Falta propiedad_id" }, { status: 400 });
    }

    // Precio actual + fecha de publicación
    const { data: propiedad, error: errP } = await supabase
      .from("propiedades")
      .select("id, precio, created_at, updated_at")
      .eq("id", propiedadId)
      .maybeSingle();
    if (errP || !propiedad) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    // Cambios reales registrados por el trigger
    const { data: historial, error: errH } = await supabase
      .from("historial_precios")
      .select("precio_anterior, precio_nuevo, created_at")
      .eq("propiedad_id", propiedadId)
      .order("created_at", { ascending: true })
      .limit(60);
    if (errH) {
      return NextResponse.json({ error: errH.message }, { status: 500 });
    }

    const precioActual = Number(propiedad.precio || 0);
    const fechaPub = new Date(propiedad.created_at || Date.now());
    const puntos: { fecha: string; precio: number }[] = [];
    const hayReal = (historial || []).length > 0;

    if (hayReal) {
      // Primer punto: antes del primer cambio
      const primero = (historial as any[])[0];
      puntos.push({
        fecha: fechaPub.toISOString().split("T")[0],
        precio: Number(primero.precio_anterior),
      });
      for (const h of historial as any[]) {
        puntos.push({
          fecha: (h.created_at || "").split("T")[0],
          precio: Number(h.precio_nuevo),
        });
      }
    } else {
      // Sintético: 3-5 puntos hasta hoy, variando alrededor del precio actual
      const antiguedadDias = Math.max(1, Math.round((Date.now() - fechaPub.getTime()) / 86400000));
      const pasos = Math.min(5, Math.max(3, Math.ceil(antiguedadDias / 30) + 1));
      const base = Math.max(500, precioActual);
      let precio = base;
      const fechas: number[] = [];
      for (let i = pasos - 1; i >= 0; i--) {
        fechas.push(Date.now() - i * Math.floor(antiguedadDias / Math.max(1, pasos - 1)) * 86400000);
      }
      for (let i = 0; i < pasos; i++) {
        puntos.push({
          fecha: new Date(fechas[i]).toISOString().split("T")[0],
          precio: Math.round(precio),
        });
        const drift = (Math.random() * 0.04 + 0.02) * (i % 2 === 0 ? -1 : 1);
        precio = precio * (1 + drift);
      }
      // Fuerza el ÚLTIMO punto al precio actual real (válido siempre)
      puntos[puntos.length - 1] = {
        fecha: new Date(propiedad.updated_at || Date.now()).toISOString().split("T")[0],
        precio: precioActual,
      };
    }

    // Asegurar que el último refleje el precio vigente
    if (puntos.length > 1 && puntos[puntos.length - 1].precio !== precioActual) {
      puntos.push({
        fecha: new Date().toISOString().split("T")[0],
        precio: precioActual,
      });
    }

    const primerPrecio = puntos[0]?.precio || precioActual;
    const variacion = primerPrecio > 0
      ? ((precioActual - primerPrecio) / primerPrecio) * 100
      : 0;

    return NextResponse.json({
      propiedad_id: propiedadId,
      nombre,
      precio_actual: precioActual,
      variacion_porcentaje: Number(variacion.toFixed(2)),
      sintetico: !hayReal,
      puntos,
    });
  } catch {
    return NextResponse.json({ error: "Error al consultar historial" }, { status: 500 });
  }
}