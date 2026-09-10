import { NextRequest, NextResponse } from "next/server";
import { createSupabaseWithToken } from "@/lib/supabase";
import { buildWhatsAppLink, WHATSAPP_COJEDES } from "@/lib/constants";

function sbFor(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return createSupabaseWithToken(token);
}

function limpiarTelefono(texto: string): string {
  return texto.replace(/[^0-9+]/g, "").trim();
}

/** Busca compradores activos que encajen con una propiedad a la venta */
async function coincidenciasParaVendedor(
  sb: ReturnType<typeof createSupabaseWithToken>,
  solicitudId: number,
  tipoInmueble: string,
  precio: number | null,
  estado: string,
  zona: string
) {
  if (!precio) return 0;
  const zText = `${estado} ${zona}`.toLowerCase();

  const { data: compradores } = await sb
    .from("compradores")
    .select("*")
    .eq("estado_comprador", "Activo")
    .limit(50);

  const matches = (compradores || []).filter((c) => {
    if (c.presupuesto_max && precio > Number(c.presupuesto_max)) return false;
    if (c.presupuesto_min && precio < Number(c.presupuesto_min)) return false;
    if (c.tipo_propiedad && c.tipo_propiedad !== "Todos" && c.tipo_propiedad !== tipoInmueble) return false;
    if (zText && (c.ciudad || c.estado) && !`${c.ciudad} ${c.estado}`.toLowerCase().includes(zText.split(" ")[0])) {
      // Zona desconocida: no bloquear, pero priorizar coincidencias locales
    }
    return true;
  });

  let creadas = 0;
  for (const comprador of matches.slice(0, 8)) {
    const { error } = await sb.from("coincidencias").insert({
      solicitud_id: solicitudId,
      tipo_match: "comprador",
      titulo_match: comprador.nombre,
      precio_match: comprador.presupuesto_max,
      zona_match: `${comprador.ciudad}, ${comprador.estado || ""}`.trim(),
      contacto_match: comprador.telefono,
    });
    if (!error) creadas++;
  }
  return creadas;
}

/** Busca propiedades/prospectos que encajen con un comprador */
async function coincidenciasParaComprador(
  sb: ReturnType<typeof createSupabaseWithToken>,
  solicitudId: number,
  tipoInmueble: string,
  presupuestoMin: number | null,
  presupuestoMax: number | null,
  zona: string
) {
  const zText = (zona || "").toLowerCase();
  let creadas = 0;

  let qp = sb
    .from("propiedades")
    .select("*")
    .not("estatus", "in", "(PAUSADO,VENDIDO)")
    .limit(50);
  const { data: props } = await qp;
  const propiedades = (props || []).filter((p) => {
    if (presupuestoMin && p.precio < presupuestoMin) return false;
    if (presupuestoMax && p.precio > presupuestoMax) return false;
    if (tipoInmueble && tipoInmueble !== "Todos" && p.tipo_inmueble !== tipoInmueble) return false;
    if (zText) {
      const busqueda = `${p.titulo || ""} ${p.descripcion || ""} ${p.direccion_completa || ""}`.toLowerCase();
      const terms = zText.split(/\s+/).filter(Boolean);
      if (!terms.some((t) => busqueda.includes(t))) return false;
    }
    return true;
  });

  for (const p of propiedades.slice(0, 8)) {
    const { error } = await sb.from("coincidencias").insert({
      solicitud_id: solicitudId,
      tipo_match: "propiedad",
      titulo_match: p.titulo || p.codigo || "Propiedad",
      precio_match: p.precio,
      zona_match: p.direccion_completa || p.descripcion || "",
      contacto_match: p.telefono_agente || WHATSAPP_COJEDES,
    });
    if (!error) creadas++;
  }

  let qs = sb
    .from("prospectos")
    .select("*")
    .ilike("rol", "%VENDEDOR%")
    .order("urgencia_score", { ascending: false })
    .limit(50);
  const { data: pros } = await qs;
  const prospectos = (pros || []).filter((pr) => {
    if (presupuestoMin && pr.precio_usd < presupuestoMin) return false;
    if (presupuestoMax && pr.precio_usd > presupuestoMax) return false;
    if (zText) {
      const busqueda = `${pr.titulo || ""} ${pr.detalle || ""} ${pr.zona || ""}`.toLowerCase();
      const terms = zText.split(/\s+/).filter(Boolean);
      if (!terms.some((t) => busqueda.includes(t))) return false;
    }
    return true;
  });

  for (const pr of prospectos.slice(0, 8)) {
    const { error } = await sb.from("coincidencias").insert({
      solicitud_id: solicitudId,
      tipo_match: "prospecto",
      titulo_match: pr.titulo || "Publicación directa",
      precio_match: pr.precio_usd,
      zona_match: pr.zona || "",
      contacto_match: pr.telefono || "Ver enlace",
      enlace_match: pr.whatsapp_link || pr.enlace || "",
    });
    if (!error) creadas++;
  }

  return creadas;
}

export async function GET(request: NextRequest) {
  const sb = sbFor(request);
  const { data, error } = await sb
    .from("solicitudes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message, solicitudes: [] }, { status: 200 });
  }
  return NextResponse.json({ solicitudes: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot anti-spam
    if ((body as any)._trap) {
      return NextResponse.json({ success: true, ok: true });
    }

    const tipo = body.tipo === "comprar" ? "comprar" : "vender";
    const nombre = String(body.nombre || "").trim();
    const telefono = limpiarTelefono(body.telefono || "");

    if (!nombre || telefono.length < 7) {
      return NextResponse.json(
        { error: "Por favor escribe tu nombre y un teléfono válido." },
        { status: 400 }
      );
    }

    const sb = sbFor(request);
    const mensaje =
      tipo === "vender"
        ? "Hola, quiero vender esta propiedad. ¿Pueden ayudarme?"
        : "Hola, estoy buscando comprar una propiedad. ¿Tienen disponibles?";

    const { data, error } = await sb
      .from("solicitudes")
      .insert({
        tipo,
        nombre,
        telefono,
        whatsapp_link: buildWhatsAppLink(telefono, mensaje),
        tipo_inmueble: body.tipo_inmueble || "Apartamento",
        precio: body.precio || null,
        presupuesto_min: body.presupuesto_min || null,
        presupuesto_max: body.presupuesto_max || null,
        estado: body.estado || "Cojedes",
        zona: body.zona || "",
        habitaciones: body.habitaciones || 0,
        banos: body.banos || 0,
        metros: body.metros || null,
        descripcion: body.descripcion || "",
        fuente: body.fuente || "Sitio público",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Matcher automático
    let coincidencias = 0;
    if (data) {
      coincidencias =
        tipo === "vender"
          ? await coincidenciasParaVendedor(sb, data.id, data.tipo_inmueble, data.precio, data.estado, data.zona)
          : await coincidenciasParaComprador(sb, data.id, data.tipo_inmueble, data.presupuesto_min, data.presupuesto_max, data.zona);
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      coincidencias,
      whatsapp_link: data?.whatsapp_link || buildWhatsAppLink(telefono),
    });
  } catch {
    return NextResponse.json({ error: "Error al guardar la solicitud" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const sb = sbFor(request);

    if (body.action === "promover") {
      const { data: solicitud } = await sb
        .from("solicitudes")
        .select("*")
        .eq("id", body.id)
        .single();
      if (!solicitud) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

      const descripcion = [
        `Solicitud pública de ${solicitud.nombre} (${solicitud.telefono})`,
        solicitud.zona && `Ubicación: ${solicitud.zona}, ${solicitud.estado}`,
        solicitud.descripcion,
      ]
        .filter(Boolean)
        .join(" · ");

      const { data: estadoRow } = await sb
        .from("estados")
        .select("id")
        .eq("nombre", solicitud.estado || "Cojedes")
        .maybeSingle();
      const { data: municipioRow } = estadoRow
        ? await sb
            .from("municipios")
            .select("id")
            .eq("estado_id", estadoRow.id)
            .ilike("nombre", `%${(solicitud.zona || "San Carlos").split(",")[0].trim()}%`)
            .limit(1)
            .maybeSingle()
        : { data: null };

      const { count } = await sb
        .from("propiedades")
        .select("id", { count: "exact", head: true })
        .eq("estado_id", estadoRow?.id || 0);

      const abrev: Record<string, string> = { Cojedes: "COJ" };
      const codigo = `${abrev[solicitud.estado] || "VEN"}-${100 + ((count || 0) % 900)}`;

      const { data: propiedad, error } = await sb
        .from("propiedades")
        .insert({
          titulo: `${solicitud.tipo_inmueble || "Propiedad"} en ${solicitud.zona || solicitud.estado} (captación ${solicitud.nombre})`,
          descripcion,
          tipo_transaccion: "venta",
          tipo_inmueble: solicitud.tipo_inmueble || "Apartamento",
          precio: solicitud.precio || 0,
          habitaciones: solicitud.habitaciones || 0,
          banos: solicitud.banos || 0,
          metros_cuadrados: solicitud.metros || null,
          nombre_agente: "Asesor",
          telefono_agente: WHATSAPP_COJEDES,
          estado_id: estadoRow?.id || null,
          municipio_id: municipioRow?.id || null,
          direccion_completa: `${solicitud.zona || ""}, ${solicitud.estado}`,
          estatus: "DISPONIBLE",
          codigo,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await sb
        .from("solicitudes")
        .update({ estado_solicitud: "PROMOVIDA", notas: `Promovida a propiedad ${codigo}` })
        .eq("id", solicitud.id);

      return NextResponse.json({ success: true, propiedad });
    }

    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const { error } = await sb.from("solicitudes").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const sb = sbFor(request);
    const { error } = await sb.from("solicitudes").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}