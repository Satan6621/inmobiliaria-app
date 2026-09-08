"use client";

import { useState, useEffect } from "react";
import {
  Home, Plus, Send, Copy, ExternalLink, Phone, CheckCircle2,
  Building2, MapPin, Bed, Bath, Car, Droplets, Zap, Wifi, Flame,
} from "lucide-react";
import { TIPOS_INMUEBLE, ESTADOS_VENEZUELA } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { generarCopyWhatsApp, generarCopyInstagram, generarCopyMarketplace } from "@/lib/utils";
import { DEFAULT_BOT_TOKEN, DEFAULT_CHAT_ID } from "@/lib/constants";
import { ImageUpload } from "@/components/image-upload";
import { PDFGenerator } from "@/components/pdf-generator";
import { WhatsAppButton } from "@/components/whatsapp-button";

interface Inmueble {
  id: number;
  fecha: string;
  titulo: string;
  tipo: string;
  estado: string;
  ciudad: string;
  urbanizacion: string;
  precio_dueno: number;
  precio_venta: number;
  habs: number;
  banos: number;
  puestos: number;
  metros: number;
  precio_m2: number;
  servicios: string;
  descripcion: string;
  fotos_rutas: string;
  contacto_dueno: string;
  estatus: string;
}

export default function InventarioPage() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copySeleccionado, setCopySeleccionado] = useState<Record<number, string>>({});

  // Form state
  const [form, setForm] = useState({
    titulo: "", tipo: "Apartamento", estado: "Carabobo", ciudad: "", urbanizacion: "",
    precio_dueno: 35000, margen_pct: 8, habs: 3, banos: 2, puestos: 2, metros: 95,
    servicios: { pozo: true, planta: false, fibra: true, gas: true },
    descripcion: "", contacto_dueno: "", fotos: [] as string[],
  });

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      const res = await fetch("/api/inventario");
      const data = await res.json();
      setInmuebles(data.inventario || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    const precio_venta = form.precio_dueno * (1 + form.margen_pct / 100);
    const precio_m2 = form.metros > 0 ? precio_venta / form.metros : 0;
    const serviciosList: string[] = [];
    if (form.servicios.pozo) serviciosList.push("Pozo");
    if (form.servicios.planta) serviciosList.push("Planta");
    if (form.servicios.fibra) serviciosList.push("Fibra");
    if (form.servicios.gas) serviciosList.push("Gas Directo");

    try {
      await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          tipo: form.tipo,
          estado: form.estado,
          ciudad: form.ciudad,
          urbanizacion: form.urbanizacion,
          precio_dueno: form.precio_dueno,
          precio_venta,
          habs: form.habs,
          banos: form.banos,
          puestos: form.puestos,
          metros: form.metros,
          precio_m2,
          servicios: serviciosList.join(" | ") || "Básicos",
          descripcion: form.descripcion,
          contacto_dueno: form.contacto_dueno,
          fotos_rutas: form.fotos.join(","),
        }),
      });
      setShowForm(false);
      setForm({
        titulo: "", tipo: "Apartamento", estado: "Carabobo", ciudad: "", urbanizacion: "",
        precio_dueno: 35000, margen_pct: 8, habs: 3, banos: 2, puestos: 2, metros: 95,
        servicios: { pozo: true, planta: false, fibra: true, gas: true },
        descripcion: "", contacto_dueno: "", fotos: [],
      });
      fetchInventario();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto);
  };

  const publicarTelegram = async (inm: Inmueble) => {
    const copy = generarCopyWhatsApp({
      tipo: inm.tipo, urbanizacion: inm.urbanizacion, ciudad: inm.ciudad,
      estado: inm.estado, metros: inm.metros, precioM2: inm.precio_m2,
      habs: inm.habs, banos: inm.banos, puestos: inm.puestos,
      servicios: inm.servicios, descripcion: inm.descripcion, precioVenta: inm.precio_venta,
    });
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: copy, botToken: DEFAULT_BOT_TOKEN, chatId: DEFAULT_CHAT_ID }),
      });
      const data = await res.json();
      alert(data.success ? "Publicado en Telegram" : "Error: " + data.error);
    } catch {
      alert("Error al publicar");
    }
  };

  const precioVentaCalculado = form.precio_dueno * (1 + form.margen_pct / 100);
  const ganancia = precioVentaCalculado - form.precio_dueno;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Home className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Mi Cartera de Inmuebles
            </h1>
            <p className="text-sm text-text-muted">
              Inventario, marketing multiplataforma y difusión
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Inmueble
        </button>
      </div>

      {/* Formulario de Nuevo Inmueble */}
      {showForm && (
        <div className="glass-card p-6 mb-8 animate-slide-up">
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Cargar Nuevo Inmueble
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej. Impecable Apartamento en Las Chimeneas"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="select-field">
                    {TIPOS_INMUEBLE.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Estado</label>
                  <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="select-field">
                    {ESTADOS_VENEZUELA.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Ciudad</label>
                <input type="text" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} placeholder="Valencia, San Diego..." className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Urbanización</label>
                <input type="text" value={form.urbanizacion} onChange={(e) => setForm({ ...form, urbanizacion: e.target.value })} placeholder="Las Chimeneas, Prebo..." className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Contacto Dueño</label>
                <input type="text" value={form.contacto_dueno} onChange={(e) => setForm({ ...form, contacto_dueno: e.target.value })} placeholder="Sr. Juan Pérez 0414-1234567" className="input-field" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Precio Dueño (USD)</label>
                <input type="number" value={form.precio_dueno} onChange={(e) => setForm({ ...form, precio_dueno: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Margen: {form.margen_pct}%</label>
                <input type="range" min={3} max={25} step={0.5} value={form.margen_pct} onChange={(e) => setForm({ ...form, margen_pct: Number(e.target.value) })} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>Precio Público: <span className="text-success font-semibold">{formatCurrency(precioVentaCalculado)}</span></span>
                  <span>Ganancia: <span className="text-primary font-semibold">{formatCurrency(ganancia)}</span></span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Habs</label>
                  <input type="number" min={0} max={10} value={form.habs} onChange={(e) => setForm({ ...form, habs: Number(e.target.value) })} className="input-field text-center" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Baños</label>
                  <input type="number" min={0} max={10} value={form.banos} onChange={(e) => setForm({ ...form, banos: Number(e.target.value) })} className="input-field text-center" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Estac.</label>
                  <input type="number" min={0} max={10} value={form.puestos} onChange={(e) => setForm({ ...form, puestos: Number(e.target.value) })} className="input-field text-center" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">m²</label>
                  <input type="number" min={1} value={form.metros} onChange={(e) => setForm({ ...form, metros: Number(e.target.value) })} className="input-field text-center" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-2 block">Servicios</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "pozo", icon: Droplets, label: "Pozo de agua" },
                    { key: "planta", icon: Zap, label: "Planta eléctrica" },
                    { key: "fibra", icon: Wifi, label: "Fibra óptica" },
                    { key: "gas", icon: Flame, label: "Gas directo" },
                  ] as const).map(({ key, icon: Icon, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={form.servicios[key]}
                        onChange={(e) => setForm({ ...form, servicios: { ...form.servicios, [key]: e.target.checked } })}
                        className="w-4 h-4 rounded border-border bg-surface text-primary"
                      />
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Detalles del inmueble..."
                  className="input-field min-h-[80px] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Fotos del Inmueble</label>
                <ImageUpload
                  onUpload={(urls) => setForm({ ...form, fotos: [...form.fotos, ...urls] })}
                  existingImages={form.fotos}
                  maxFiles={10}
                />
              </div>
              <button onClick={handleGuardar} className="btn-primary w-full">
                Guardar en Cartera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catálogo */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inmuebles.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Home className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Sin inmuebles</h3>
          <p className="text-sm text-text-secondary">Agrega tu primer inmueble a la cartera.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inmuebles.map((inm) => {
            const precioM2 = inm.metros > 0 ? inm.precio_venta / inm.metros : 0;
            const badgeColor = inm.estatus === "DISPONIBLE" ? "badge-success" : inm.estatus === "RESERVADO" ? "badge-warning" : "badge-info";
            const copyWA = generarCopyWhatsApp({
              tipo: inm.tipo, urbanizacion: inm.urbanizacion, ciudad: inm.ciudad,
              estado: inm.estado, metros: inm.metros, precioM2, habs: inm.habs,
              banos: inm.banos, puestos: inm.puestos, servicios: inm.servicios,
              descripcion: inm.descripcion, precioVenta: inm.precio_venta,
            });
            const copyIG = generarCopyInstagram({
              tipo: inm.tipo, urbanizacion: inm.urbanizacion, ciudad: inm.ciudad,
              metros: inm.metros, habs: inm.habs, banos: inm.banos, puestos: inm.puestos,
              servicios: inm.servicios, precioVenta: inm.precio_venta,
            });
            const copyMP = generarCopyMarketplace({
              tipo: inm.tipo, urbanizacion: inm.urbanizacion, ciudad: inm.ciudad,
              habs: inm.habs, banos: inm.banos, servicios: inm.servicios,
            });

            return (
              <div key={inm.id} className="glass-card p-6 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${badgeColor}`}>{inm.estatus}</span>
                    <span className="badge badge-primary">{inm.tipo}</span>
                  </div>
                  <span className="text-lg font-bold text-success">{formatCurrency(inm.precio_venta)}</span>
                </div>

                <h3 className="text-lg font-semibold text-text-primary mb-1">{inm.titulo}</h3>
                <p className="text-sm text-text-muted flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {inm.urbanizacion}, {inm.ciudad} ({inm.estado})
                </p>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Bed className="w-4 h-4 text-text-muted" />
                    {inm.habs} Habs
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Bath className="w-4 h-4 text-text-muted" />
                    {inm.banos} Baños
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Car className="w-4 h-4 text-text-muted" />
                    {inm.puestos} Estac.
                  </div>
                  <div className="text-sm text-text-secondary">
                    {inm.metros} m² ({formatCurrency(precioM2)}/m²)
                  </div>
                </div>

                <p className="text-xs text-text-muted mb-4 line-clamp-2">{inm.descripcion}</p>

                {/* Precio Info */}
                <div className="bg-surface-elevated rounded-lg p-3 mb-4 flex items-center gap-4 text-sm">
                  <span className="text-text-muted">Dueño: <span className="text-text-primary">{formatCurrency(inm.precio_dueno)}</span></span>
                  <span className="text-text-muted">Venta: <span className="text-success font-semibold">{formatCurrency(inm.precio_venta)}</span></span>
                  <span className="text-primary font-semibold">Margen: +{formatCurrency(inm.precio_venta - inm.precio_dueno)}</span>
                </div>

                {/* Copy Selection */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-text-secondary mb-2 block">Formato de Copy</label>
                  <div className="flex gap-2 mb-3">
                    {["WhatsApp", "Instagram", "Marketplace"].map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setCopySeleccionado({ ...copySeleccionado, [inm.id]: tipo })}
                        className={`text-xs py-1.5 px-3 rounded-lg transition-all ${
                          (copySeleccionado[inm.id] || "WhatsApp") === tipo
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-surface text-text-muted border border-border"
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <pre className="bg-surface rounded-lg p-3 text-xs text-text-secondary overflow-x-auto max-h-[150px] whitespace-pre-wrap font-[family-name:var(--font-mono)]">
                      {(copySeleccionado[inm.id] || "WhatsApp") === "WhatsApp" ? copyWA :
                       (copySeleccionado[inm.id]) === "Instagram" ? copyIG : copyMP}
                    </pre>
                    <button
                      onClick={() => copiarAlPortapapeles(
                        (copySeleccionado[inm.id] || "WhatsApp") === "WhatsApp" ? copyWA :
                        (copySeleccionado[inm.id]) === "Instagram" ? copyIG : copyMP
                      )}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover text-text-muted"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => publicarTelegram(inm)} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Telegram
                  </button>
                  <PDFGenerator inmueble={inm} />
                  <WhatsAppButton
                    phone={inm.contacto_dueno}
                    property={{ tipo: inm.tipo, urbanizacion: inm.urbanizacion, ciudad: inm.ciudad, precio: inm.precio_venta }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
