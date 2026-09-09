"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback, useRef } from "react";

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";
export type RowPayload<T = any> = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
  errors: any;
};

/**
 * Suscripción genérica a cambios de una tabla de Supabase
 * (postgres_changes) con reconexión automática.
 */
export function useRealtimeTable<T = any>(
  table: string,
  onEvent?: (payload: RowPayload<T>) => void,
  enabled = true
) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const cbRef = useRef(onEvent);
  cbRef.current = onEvent;

  // Carga inicial
  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRows((data as T[]) || []);
    } catch {
      setRows(null); // tabla aún no existe
    }
  }, [table]);

  useEffect(() => {
    if (!enabled) return;
    refresh();

    const channel = supabase
      .channel(`realtime-${table}-${Date.now()}`)
      .on(
        "postgres_changes" as "postgres_changes",
        { event: "*", schema: "public", table } as any,
        (payload: any) => {
          cbRef.current?.(payload as RowPayload<T>);
          setStatus("connected");

          // Mantener filas en sintonía
          setRows((prev) => {
            if (prev === null) return prev;
            if (payload.eventType === "INSERT") {
              return [payload.new, ...prev.filter((r: any) => (r as any).id !== (payload.new as any).id)];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((r) =>
                (r as any).id === (payload.new as any).id ? payload.new : r
              );
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => (r as any).id !== (payload.old as any).id);
            }
            return prev;
          });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setStatus("error");
        } else if (status === "SUBSCRIBED") {
          setStatus("connected");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, enabled, refresh]);

  return { rows, status, refresh };
}

/**
 * Feed de propiedades compartido: detecta nuevas publicaciones
 * y bajadas de precio en tiempo real.
 */
export function usePropiedadesFeed(enabled = true) {
  const [items, setItems] = useState<any[]>([]);
  const [lastEvent, setLastEvent] = useState<RowPayload | null>(null);

  const { rows, status, refresh } = useRealtimeTable<any>(
    "propiedades",
    (payload) => setLastEvent(payload),
    enabled
  );

  useEffect(() => {
    if (rows) {
      setItems(
        rows
          .filter((r) => !r.esta_paused && r.estatus !== "PAUSADO" && r.estatus !== "VENDIDO")
          .slice(0, 20)
      );
    }
  }, [rows]);

  const nuevoFeedItem = lastEvent
    ? {
        id: String(lastEvent.new?.id || Math.random()),
        titulo: lastEvent.new?.titulo || "Nueva propiedad",
        precio: Number(lastEvent.new?.precio || 0),
        precioAnterior:
          lastEvent.eventType === "UPDATE"
            ? Number(lastEvent.old?.precio || 0)
            : undefined,
        zona: ["Cojedes", "Carabobo", "Miranda", "Lara", "Zulia", "Anzoátegui"][
          Math.floor(Math.random() * 6)
        ],
        tipo: lastEvent.new?.tipo_inmueble || "Apartamento",
        fecha: "Ahora",
        esBajada:
          lastEvent.eventType === "UPDATE" &&
          Number(lastEvent.old?.precio) > Number(lastEvent.new?.precio),
      }
    : null;

  return { items, status, refresh, lastEvent, nuevoFeedItem };
}

/**
 * Comprueba (en el cliente) si una propiedad nueva coincide con una
 * búsqueda guardada y dispara una notificación del navegador.
 */
export function matchBusquedaYNotificar(
  propiedad: any,
  busquedas: Array<{ precioMin: number; precioMax: number; tipoInmueble: string; activa: boolean }>
): boolean {
  const activas = busquedas.filter((b) => b.activa);
  if (activas.length === 0) return false;

  const precio = Number(propiedad?.precio || 0);
  const tipo = propiedad?.tipo_inmueble || "Todos";

  const coincidencia = activas.find((b) => {
    if (b.precioMin && precio < b.precioMin) return false;
    if (b.precioMax && precio > b.precioMax) return false;
    if (b.tipoInmueble && b.tipoInmueble !== "Todos" && b.tipoInmueble !== tipo) return false;
    return true;
  });

  if (coincidencia && "Notification" in window && Notification.permission === "granted") {
    new Notification("🔔 Nueva propiedad que coincide con tu búsqueda", {
      body: `${propiedad.titulo || "Propiedad"} - $${precio.toLocaleString()}`,
    });
    return true;
  }
  return false;
}

/**
 * Pide permiso para notificaciones del navegador.
 */
export async function pedirPermisoNotificaciones() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}