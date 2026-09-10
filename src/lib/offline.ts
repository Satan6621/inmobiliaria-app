"use client";

import { useEffect, useState } from "react";

/**
 * Snapshot offline de propiedades para el radar.
 * Al abrir la app se descarga un JSON compacto (ID, precio, ubicación,
 * miniatura) y se guarda en localStorage. Cuando la conexión es inestable
 * (interior del país), el Service Worker sirve la copia en caché y el radar
 * sigue funcionando en milisegundos sin consumir datos móviles.
 */

const LLAVE_LOCAL = "chuo-zu-snapshot-v1";

export interface SnapshotPropiedad {
  id: string;
  codigo?: string | null;
  titulo?: string | null;
  tipo_inmueble?: string | null;
  precio: number;
  habitaciones?: number;
  banos?: number;
  metros_cuadrados?: number;
  direccion_completa?: string | null;
  esta_verificado?: boolean;
  estado?: string;
  municipio?: string;
  imagen?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface SnapshotData {
  generado_at: string;
  updated_at_max: string | null;
  total: number;
  propiedades: SnapshotPropiedad[];
}

export function leerSnapshotLocal(): SnapshotData | null {
  try {
    const raw = localStorage.getItem(LLAVE_LOCAL);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.propiedades)) return null;
    return parsed as SnapshotData;
  } catch {
    return null;
  }
}

export function guardarSnapshotLocal(snap: SnapshotData): void {
  try {
    localStorage.setItem(LLAVE_LOCAL, JSON.stringify(snap));
  } catch {
    // almacenamiento lleno o deshabilitado: ignorar
  }
}

/** Descarga el snapshot desde la red (el SW lo sirve de caché si está offline). */
export async function descargarSnapshot(): Promise<SnapshotData | null> {
  try {
    const res = await fetch("/api/snapshot", { cache: "no-store" });
    if (!res.ok) return null;
    const json: SnapshotData = await res.json();
    if (Array.isArray(json.propiedades)) {
      guardarSnapshotLocal(json);
      return json;
    }
    return null;
  } catch {
    return null;
  }
}

/** Hook: expone el snapshot (local primero, luego refresca con red/caché). */
export function useOfflineSnapshot() {
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null);
  const [offline, setOffline] = useState<boolean>(typeof navigator !== "undefined" && !navigator.onLine);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let mounted = true;

    const inicial = leerSnapshotLocal();
    if (inicial) setSnapshot(inicial);

    // Refrescar: si el SW sirve caché del snapshot, no es "fallo de red"
    descargarSnapshot().then((snap) => {
      if (!mounted) return;
      if (snap) {
        setSnapshot(snap);
        setOffline(false);
      } else {
        // Sin red ni caché del snapshot
        setOffline(!navigator.onLine);
      }
      setCargando(false);
    });

    const onLineCambio = () => {
      setOffline(!navigator.onLine);
      if (navigator.onLine) descargarSnapshot().then((s) => s && setSnapshot(s));
    };
    window.addEventListener("online", onLineCambio);
    window.addEventListener("offline", onLineCambio);

    return () => {
      mounted = false;
      window.removeEventListener("online", onLineCambio);
      window.removeEventListener("offline", onLineCambio);
    };
  }, []);

  return { snapshot, offline, cargando };
}