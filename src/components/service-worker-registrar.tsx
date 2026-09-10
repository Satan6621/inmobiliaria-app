"use client";

import { useEffect } from "react";

/**
 * Registra el Service Worker para que el radar y el catálogo funcionen
 * offline (snapshot en caché) incluso con conexión móvil inestable.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (navigator.serviceWorker.controller) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // registro opcional: no debe romper la app
    });
  }, []);
  return null;
}