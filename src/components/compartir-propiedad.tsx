"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export function CompartirPropiedad({ url, titulo }: { url?: string; titulo?: string }) {
  const [copiado, setCopiado] = useState(false);

  const current = () => (typeof window !== "undefined" ? window.location.href : url || "");
  const link = () => url || current();

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* noop */ }
  };

  const compartirNativo = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: titulo || "Propiedad en Venezuela", url: link() });
      } else {
        await copiar();
      }
    } catch { /* user canceló o no soportado */ }
  };

  const textoT = titulo ? `Mira esta propiedad: ${titulo}` : "Mira esta propiedad en Inmobiliaria Chuo-Zu";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copiar}
        className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
        title="Copiar enlace"
      >
        {copiado ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        {copiado ? "¡Copiado!" : "Copiar link"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${textoT} ${link()}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp flex items-center gap-2 text-sm py-2 px-4"
      >
        Compartir por WhatsApp
      </a>
      <button
        onClick={compartirNativo}
        className="p-2 rounded-lg bg-surface-elevated text-text-secondary hover:bg-surface-hover transition-colors"
        title="Compartir"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}