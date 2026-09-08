import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST - Encontrar compradores compatibles con una propiedad
export async function POST(request: NextRequest) {
  try {
    const property = await request.json();

    // Buscar compradores activos
    const { data: compradores, error } = await supabase
      .from("compradores")
      .select("*")
      .eq("estado_comprador", "Activo");

    if (error) {
      return NextResponse.json({ error: error.message, matches: [] }, { status: 500 });
    }

    if (!compradores || compradores.length === 0) {
      return NextResponse.json({ matches: [], total: 0 });
    }

    // Calcular compatibilidad para cada comprador
    const matches = compradores.map((c) => {
      let score = 0;
      let detalles = [];

      // Tipo de propiedad (30 puntos)
      if (c.tipo_propiedad?.toLowerCase() === property.tipo?.toLowerCase()) {
        score += 30;
        detalles.push("✓ Tipo coincide");
      } else {
        score += 10;
        detalles.push("✗ Tipo diferente");
      }

      // Presupuesto (30 puntos)
      if (property.precio >= (c.presupuesto_min || 0) && property.precio <= (c.presupuesto_max || Infinity)) {
        score += 30;
        detalles.push("✓ Dentro del presupuesto");
      } else if (property.precio <= (c.presupuesto_max || 0) * 1.1) {
        score += 15;
        detalles.push("~ Cerca del presupuesto");
      } else {
        score += 0;
        detalles.push("✗ Fuera del presupuesto");
      }

      // Ciudad (20 puntos)
      const propertyCity = property.ciudad?.toLowerCase() || property.ubicacion?.toLowerCase() || "";
      const buyerCity = c.ciudad?.toLowerCase() || "";
      if (propertyCity.includes(buyerCity) || buyerCity.includes(propertyCity)) {
        score += 20;
        detalles.push("✓ Ciudad coincide");
      } else {
        score += 0;
        detalles.push("✗ Ciudad diferente");
      }

      // Habitaciones (10 puntos)
      const propertyBeds = property.habs || property.habitaciones || 0;
      if (propertyBeds >= (c.habitaciones_min || 0) && propertyBeds <= (c.habitaciones_max || 10)) {
        score += 10;
        detalles.push("✓ Habitaciones adecuadas");
      } else {
        score += 3;
        detalles.push("~ Habitaciones diferentes");
      }

      // Servicios (10 puntos)
      if (c.servicios_requeridos && c.servicios_requeridos.length > 0 && property.servicios) {
        const matchServices = c.servicios_requeridos.filter((s: string) =>
          property.servicios.some((ps: string) => ps.toLowerCase().includes(s.toLowerCase()))
        );
        const serviceScore = (matchServices.length / c.servicios_requeridos.length) * 10;
        score += Math.round(serviceScore);
        if (serviceScore >= 7) {
          detalles.push("✓ Servicios compatibles");
        } else {
          detalles.push("~ Servicios parciales");
        }
      } else {
        score += 5;
      }

      return {
        comprador: c,
        score: Math.min(100, score),
        detalles,
      };
    });

    // Ordenar por score
    matches.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      matches: matches.filter((m) => m.score >= 30),
      total: matches.length,
    });
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json({ error: String(error), matches: [] }, { status: 500 });
  }
}
