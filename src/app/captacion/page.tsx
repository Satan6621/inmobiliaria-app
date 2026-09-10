"use client";

import { useState } from "react";
import {
  Handshake, Home, Search, Loader2, CheckCircle2, Phone, MapPin,
  ArrowRight, ShieldCheck, Clock3,
} from "lucide-react";
import { TIPOS_INMUEBLE, ESTADOS_VENEZUELA } from "@/lib/constants";
import { authFetch } from "@/lib/api";

type Modo = "vender" | "comprar";

const camposIniciales = {
  nombre: "",
  telefono: "",
  tipo_inmueble: "Casa",
  precio: "",
  presupuesto_min: "",
  presupuesto_max: "",
  estado: "Cojedes",
  zona: "",
  habitaciones: "3",
  banos: "2",
  metros: "",
  descripcion: "",
  _trap: "",
};

export default function CaptacionPage() {
  const [modo, setModo] = useState<Modo>("vender");
  const [form, setForm] = useState(camposIniciales);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState<null | { whatsapp_link: string }>(null);
  const [error, setError] = useState("");

  const change = (campo: keyof typeof camposIniciales, valor: string) =>
    setForm({ ...form, [campo]: valor });

  const enviar = async () => {
    setEnviando(true);
    setError("");
    try {
      const res = await authFetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tipo: modo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ocurrió un error");
      setExito({ whatsapp_link: data.whatsapp_link || "" });
    } catch (e: any) {
      setError(e?.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in pt-12">
        <div className="glass-card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
            ¡Recibimos tu {modo === "vender" ? "propiedad" : "solicitud"}!
          </h1>
          <p className="text-text-secondary mb-6">
            Gracias, <strong>{form.nombre}</strong>. Un asesor te contactará muy pronto
            para darte respuesta. ¿Prefieres hablar ya con nosotros?
          </p>
          <a
            href={exito.whatsapp_link || "https://wa.me/584141234567"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp inline-flex items-center gap-2 text-base px-8 py-3"
          >
            <Phone className="w-5 h-5" /> Escribir por WhatsApp
          </a>
          <div className="mt-6">
            <button
              onClick={() => { setExito(null); setForm(camposIniciales); }}
              className="text-sm text-text-muted hover:text-text-primary underline"
            >
              Enviar otra {modo === "vender" ? "propiedad" : "solicitud"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
            <Handshake className="w-7 h-7 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-3">
          Compra y Vende con <span className="text-primary">Asesoría Inmobiliaria</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          ¿Quieres vender tu propiedad o estás buscando una? Déjanos tus datos y
          un asesor te contacta por WhatsApp, sin compromiso.
        </p>
      </div>

      {/* Confianza */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: ShieldCheck, titulo: "Asesoría directa", texto: "Te atendemos de forma personalizada, sin intermediarios." },
          { icon: Clock3, titulo: "Respuesta rápida", texto: "Contactamos contigo por WhatsApp en el día." },
          { icon: MapPin, titulo: "Cobertura nacional", texto: "Nos especializamos en Cojedes y toda Venezuela." },
        ].map((c) => (
          <div key={c.titulo} className="glass-card p-4 flex items-start gap-3">
            <c.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-text-primary">{c.titulo}</p>
              <p className="text-xs text-text-muted">{c.texto}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-surface-elevated p-1.5 mb-6 max-w-md mx-auto">
        {[
          { key: "vender", label: "Quiero Vender", icon: Home },
          { key: "comprar", label: "Quiero Comprar", icon: Search },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setModo(t.key as Modo); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              modo === t.key
                ? "bg-primary text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Formulario */}
      <div className="glass-card p-6 md:p-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-campo">Nombre*</label>
              <input type="text" value={form.nombre}
                onChange={(e) => change("nombre", e.target.value)}
                placeholder="Tu nombre y apellido"
                className="input-field w-full" />
            </div>
            <div>
              <label className="label-campo">Teléfono (WhatsApp)*</label>
              <input type="tel" value={form.telefono}
                onChange={(e) => change("telefono", e.target.value)}
                placeholder="0414-1234567"
                className="input-field w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-campo">Tipo de inmueble</label>
              <select value={form.tipo_inmueble}
                onChange={(e) => change("tipo_inmueble", e.target.value)}
                className="select-field w-full">
                {TIPOS_INMUEBLE.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-campo">Estado</label>
              <select value={form.estado}
                onChange={(e) => change("estado", e.target.value)}
                className="select-field w-full">
                {ESTADOS_VENEZUELA.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="label-campo">
                {modo === "vender" ? "Zona / Ciudad" : "Zona donde buscas"}
              </label>
              <input type="text" value={form.zona}
                onChange={(e) => change("zona", e.target.value)}
                placeholder="Ej. Tinaquillo, San Carlos, Valencia..."
                className="input-field w-full" />
            </div>
          </div>

          {modo === "vender" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="label-campo">Precio (USD)</label>
                  <input type="number" value={form.precio}
                    onChange={(e) => change("precio", e.target.value)}
                    placeholder="25000" className="input-field w-full" />
                </div>
                <div>
                  <label className="label-campo">Habitaciones</label>
                  <input type="number" value={form.habitaciones}
                    onChange={(e) => change("habitaciones", e.target.value)}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="label-campo">Baños</label>
                  <input type="number" value={form.banos}
                    onChange={(e) => change("banos", e.target.value)}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="label-campo">Metros²</label>
                  <input type="number" value={form.metros}
                    onChange={(e) => change("metros", e.target.value)}
                    className="input-field w-full" />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-campo">Presupuesto mínimo (USD)</label>
                <input type="number" value={form.presupuesto_min}
                  onChange={(e) => change("presupuesto_min", e.target.value)}
                  placeholder="8000" className="input-field w-full" />
              </div>
              <div>
                <label className="label-campo">Presupuesto máximo (USD)</label>
                <input type="number" value={form.presupuesto_max}
                  onChange={(e) => change("presupuesto_max", e.target.value)}
                  placeholder="30000" className="input-field w-full" />
              </div>
            </div>
          )}

          <div>
            <label className="label-campo">
              {modo === "vender"
                ? "Cuéntanos de tu propiedad"
                : "¿Qué buscas?"}
            </label>
            <textarea value={form.descripcion}
              onChange={(e) => change("descripcion", e.target.value)}
              placeholder={
                modo === "vender"
                  ? "Ej. Casa en La Campiña con piscina, 3 habitaciones, pozo propio..."
                  : "Ej. Busco una casa de 3 habitaciones en Tinaquillo hasta $15.000..."
              }
              className="input-field w-full min-h-[90px] resize-none" />
          </div>

          {/* Honeypot anti-spam */}
          <input type="text" value={form._trap}
            onChange={(e) => change("_trap", e.target.value)}
            className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
              {error}
            </p>
          )}

          <button onClick={enviar} disabled={enviando}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
            {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            {enviando
              ? "Enviando..."
              : modo === "vender"
                ? "Quiero vender mi propiedad"
                : "Quiero que me contacten"}
          </button>

          <p className="text-center text-xs text-text-muted">
            Al enviar aceptas que un asesor te contacte por WhatsApp. Sin compromiso.
          </p>
        </div>
      </div>
    </div>
  );
}