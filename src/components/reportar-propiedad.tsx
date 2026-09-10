"use client";

import { useState } from "react";
import { Flag, ShieldAlert, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { WHATSAPP_VENEZUELA } from "@/lib/constants";

const MOTIVOS = [
  { value: "ya_vendido", label: "Ya está vendida / no disponible" },
  { value: "informacion_falsa", label: "Información falsa (precio, fotos, descripción)" },
  { value: "estafa", label: "Posible estafa o requerimiento de pago previo" },
  { value: "duplicado", label: "Publicación duplicada" },
];

export function ReportarPropiedad({ propiedadId }: { propiedadId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [trampa, setTrampa] = useState(""); // honeypot
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState<"idle" | "ok" | "error">("idle");
  const [noDisponible, setNoDisponible] = useState(false);

  const enviar = async () => {
    if (trampa || !motivo) return; // bots caen en el honeypot
    setEnviando(true);
    setEstado("idle");
    setNoDisponible(false);
    try {
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propiedad_id: propiedadId,
          motivo,
          comentarios,
          website: trampa,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setEstado("ok");
      } else {
        setNoDisponible(res.status === 501);
        setEstado("error");
      }
    } catch {
      setEstado("error");
    } finally {
      setEnviando(false);
    }
  };

  if (estado === "ok") {
    return (
      <div className="glass-card p-5 text-center">
        <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
        <p className="text-sm font-semibold text-text-primary mb-1">Gracias por tu reporte</p>
        <p className="text-xs text-text-muted">
          Nuestro equipo lo revisará. Si la propiedad contiene contenido
          sospechoso, será ocultada automáticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-danger/10 text-danger flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            ¿Viste algo sospechoso?
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Reporta publicaciones falsas, ya vendidas o posibles estafas. La comunidad
            ayuda a mantener el radar confiable.
          </p>
          {!abierto && (
            <button
              onClick={() => setAbierto(true)}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" /> Reportar propiedad
            </button>
          )}
        </div>
      </div>

      {abierto && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="label-campo">Motivo</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="select-field w-full"
            >
              <option value="">Selecciona un motivo...</option>
              {MOTIVOS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-campo">Comentarios (opcional)</label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={3}
              placeholder="Detalles que ayuden a la verificación..."
              className="input-field w-full"
            />
          </div>
          {/* Honeypot invisible para bots */}
          <input
            type="text"
            value={trampa}
            onChange={(e) => setTrampa(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />
          {estado === "error" && (
            <p className="text-xs text-danger">
              {noDisponible
                ? "Este módulo se está activando en estos momentos. "
                : "No pudimos registrar el reporte. "}
              <a
                href={`https://wa.me/${WHATSAPP_VENEZUELA}?text=${encodeURIComponent("Quiero reportar una propiedad sospechosa en el radar")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" /> avísanos por WhatsApp
              </a>
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={enviar}
              disabled={enviando || !motivo}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
            >
              {enviando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Enviar reporte
            </button>
            <button
              onClick={() => setAbierto(false)}
              className="text-xs text-text-muted hover:text-text-primary px-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}