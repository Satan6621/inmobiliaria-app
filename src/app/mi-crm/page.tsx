"use client";

import { useState, useEffect } from "react";
import {
  User, Plus, Pause, Play, Eye, Heart, MessageSquare, TrendingUp,
  Home, DollarSign, Trash2, CameraOff, Star, CheckCircle2,
} from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { formatCurrency } from "@/lib/utils";
import { ESTADOS_VENEZUELA } from "@/lib/constants";

interface PropiedadAgent {
  id: string;
  titulo: string;
  precio: number;
  tipo: string;
  estado: string;
  municipio: string;
  zona: string;
  habitaciones: number;
  banos: number;
  renderizador: { vistas: number; guardados: number; contactos: number };
  pagada: boolean;
  fechaPublicacion: string;
  imagenes: string[];
}

interface PerfilAgent {
  nombre: string;
  telefono: string;
  email: string;
  especialidad: string;
  avatar: string;
}

const TIPOS = ["Apartamento", "Casa", "Townhouse", "Terreno", "Galpón", "Local"];
const ESTADOS = ["Disponible", "Pausado", "Vendido", "Arrendado"];

const defaultPerfil: PerfilAgent = {
  nombre: "",
  telefono: "",
  email: "",
  especialidad: "Generalista",
  avatar: "",
};

const emptyPropiedad: PropiedadAgent = {
  id: "",
  titulo: "",
  precio: 0,
  tipo: "Apartamento",
  estado: "Cojedes",
  municipio: "San Carlos",
  zona: "",
  habitaciones: 0,
  banos: 0,
  renderizador: { vistas: 0, guardados: 0, contactos: 0 },
  pagada: false,
  fechaPublicacion: new Date().toISOString().split("T")[0],
  imagenes: [],
};

export default function MicroCrmPage() {
  const [perfil, setPerfil] = useState<PerfilAgent>(defaultPerfil);
  const [propiedades, setPropiedades] = useState<PropiedadAgent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [form, setForm] = useState<PropiedadAgent>(emptyPropiedad);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const perfilSaved = localStorage.getItem("perfil_agente");
    const propsSaved = localStorage.getItem("propiedades_agente");
    if (perfilSaved) setPerfil(JSON.parse(perfilSaved));
    if (propsSaved) setPropiedades(JSON.parse(propsSaved));
  }, []);

  useEffect(() => {
    localStorage.setItem("perfil_agente", JSON.stringify(perfil));
  }, [perfil]);

  useEffect(() => {
    localStorage.setItem("propiedades_agente", JSON.stringify(propiedades));
  }, [propiedades]);

  const savePropiedad = () => {
    if (!form.titulo || form.precio <= 0) return;
    if (editingId) {
      setPropiedades(propiedades.map((p) => p.id === editingId ? { ...p, ...form } : p));
    } else {
      setPropiedades([...propiedades, { ...form, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setForm(emptyPropiedad);
    setEditingId(null);
  };

  const togglePausa = (id: string) => {
    setPropiedades(propiedades.map((p) =>
      p.id === id
        ? { ...p, estado: p.estado === "Pausado" ? "Disponible" : "Pausado" }
        : p
    ));
  };

  const cambiarEstado = (id: string, estado: string) => {
    setPropiedades(propiedades.map((p) => (p.id === id ? { ...p, estado } : p)));
  };

  const eliminarPropiedad = (id: string) => {
    if (confirm("¿Eliminar esta propiedad?")) {
      setPropiedades(propiedades.filter((p) => p.id !== id));
    }
  };

  const activas = propiedades.filter((p) => p.estado === "Disponible").length;
  const pausadas = propiedades.filter((p) => p.estado === "Pausado").length;
  const vendidas = propiedades.filter((p) => p.estado === "Vendido").length;
  const totalVistas = propiedades.reduce((acc, p) => acc + p.renderizador.vistas, 0);
  const totalGuardados = propiedades.reduce((acc, p) => acc + p.renderizador.guardados, 0);
  const totalContactos = propiedades.reduce((acc, p) => acc + p.renderizador.contactos, 0);

  const handleImagesUpload = (urls: string[]) => {
    setForm((prev) => ({ ...prev, imagenes: [...urls] }));
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header con Perfil */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Micro-CRM de Agentes</h1>
            <p className="text-sm text-text-muted">{perfil.nombre ? `Hola, ${perfil.nombre}` : "Gestiona tus captaciones y métricas"}</p>
          </div>
        </div>
        {perfil.nombre ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-text-primary">{perfil.nombre}</p>
              <p className="text-xs text-text-muted">{perfil.especialidad}</p>
            </div>
            {perfil.avatar ? (
              <img src={perfil.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {perfil.nombre?.charAt(0) || "A"}
              </div>
            )}
            <button onClick={() => setShowPerfil(true)} className="btn-secondary text-xs">Editar Perfil</button>
          </div>
        ) : (
          <button onClick={() => setShowPerfil(true)} className="btn-primary text-xs">
            Crear mi Perfil de Agente
          </button>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Propiedades Activas", value: activas, icon: Home, color: "text-primary" },
          { label: "Pausadas", value: pausadas, icon: Pause, color: "text-warning" },
          { label: "Vendidas/Arrendadas", value: vendidas, icon: CheckCircle2, color: "text-success" },
          { label: "Valor Total Cartera", value: formatCurrency(propiedades.reduce((a, p) => a + p.precio, 0)), icon: DollarSign, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
            <p className="text-xl font-bold text-text-primary">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Métricas de Interacción */}
      <div className="glass-card p-4 mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Métricas de Interacción
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xl font-bold text-text-primary">{totalVistas}</span>
            </div>
            <p className="text-xs text-text-muted">Vistas totales</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-danger" />
              <span className="text-xl font-bold text-text-primary">{totalGuardados}</span>
            </div>
            <p className="text-xs text-text-muted">Guardados en favoritos</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4 text-success" />
              <span className="text-xl font-bold text-text-primary">{totalContactos}</span>
            </div>
            <p className="text-xs text-text-muted">Contactos recibidos</p>
          </div>
        </div>
      </div>

      {/* Lista de Propiedades */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Mis Captaciones</h2>
        <button onClick={() => { setForm(emptyPropiedad); setEditingId(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nueva Propiedad
        </button>
      </div>

      {propiedades.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Home className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-muted mb-2">Sin captaciones aún</h3>
          <p className="text-sm text-text-muted">Agrega tu primera propiedad para empezar a captar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {propiedades.map((p) => (
            <div key={p.id} className={`glass-card overflow-hidden transition-all ${p.estado === "Pausado" ? "opacity-70" : ""}`}>
              {/* Imagen */}
              <div className="relative h-40 bg-surface-elevated">
                {p.imagenes.length > 0 ? (
                  <img src={p.imagenes[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CameraOff className="w-8 h-8 text-text-muted" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`badge ${
                    p.estado === "Disponible" ? "badge-success" :
                    p.estado === "Pausado" ? "badge-warning" :
                    p.estado === "Vendido" ? "badge-danger" : "badge-info"
                  }`}>{p.estado}</span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="badge bg-black/60 text-white">{p.tipo}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">{p.titulo}</h3>
                <p className="text-success font-bold mb-2">{formatCurrency(p.precio)}</p>
                <p className="text-xs text-text-muted mb-2">
                  {p.zona || p.municipio}, {p.estado}
                </p>
                <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                  <span>{p.habitaciones} hab</span>
                  <span>{p.banos} baños</span>
                  <span>{p.imagenes.length} fotos</span>
                </div>

                {/* Métricas de la propiedad */}
                <div className="flex items-center gap-4 p-2 rounded-lg bg-surface-elevated mb-3">
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Eye className="w-3 h-3 text-blue-400" /> {p.renderizador.vistas}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Heart className="w-3 h-3 text-danger" /> {p.renderizador.guardados}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <MessageSquare className="w-3 h-3 text-success" /> {p.renderizador.contactos}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button onClick={() => togglePausa(p.id)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover flex items-center justify-center gap-1 text-text-muted">
                    {p.estado === "Pausado" ? <><Play className="w-3 h-3" /> Activar</> : <><Pause className="w-3 h-3" /> Pausar</>}
                  </button>
                  <select value={p.estado} onChange={(e) => cambiarEstado(p.id, e.target.value)}
                    className="select-field text-xs flex-1">
                    {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                  </select>
                  <button onClick={() => { setForm(p); setEditingId(p.id); setShowForm(true); }}
                    className="p-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-text-muted">
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => eliminarPropiedad(p.id)}
                    className="p-2 rounded-lg bg-surface-elevated hover:bg-danger/10 text-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Propiedad */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 w-full max-w-lg my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingId ? "Editar" : "Nueva"} Propiedad</h3>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Título (ej: Casa en Urbanización Cantaclaro)"
                value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="input-field w-full" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Precio (USD)</label>
                  <input type="number" value={form.precio || ""}
                    onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                    className="input-field w-full" placeholder="25000" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="select-field w-full">
                    {TIPOS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Estado</label>
                  <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="select-field w-full">
                    {ESTADOS_VENEZUELA.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Municipio / Zona</label>
                  <input type="text" value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })}
                    className="input-field w-full" placeholder="San Carlos, Cantaclaro" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Habitaciones</label>
                  <input type="number" value={form.habitaciones || ""}
                    onChange={(e) => setForm({ ...form, habitaciones: Number(e.target.value) })}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Baños</label>
                  <input type="number" value={form.banos || ""}
                    onChange={(e) => setForm({ ...form, banos: Number(e.target.value) })}
                    className="input-field w-full" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-2">Fotos (compresión automática WebP)</label>
                <ImageUpload
                  existingImages={form.imagenes}
                  maxFiles={10}
                  onUpload={(urls) => setForm({ ...form, imagenes: urls })}
                />
              </div>
              <button onClick={savePropiedad} className="btn-primary w-full">
                {editingId ? "Actualizar" : "Publicar Propiedad"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Perfil */}
      {showPerfil && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Mi Perfil de Agente</h3>
              <button onClick={() => setShowPerfil(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre completo"
                value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
                className="input-field w-full" />
              <input type="tel" placeholder="Teléfono (WhatsApp)"
                value={perfil.telefono} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                className="input-field w-full" />
              <input type="email" placeholder="Email"
                value={perfil.email} onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                className="input-field w-full" />
              <select value={perfil.especialidad} onChange={(e) => setPerfil({ ...perfil, especialidad: e.target.value })}
                className="select-field w-full">
                {["Generalista", "Apartamentos", "Casas", "Terrenos", "Locales Comerciales", "Propiedades Rurales"].map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
              <input type="text" placeholder="URL de tu foto de perfil"
                value={perfil.avatar} onChange={(e) => setPerfil({ ...perfil, avatar: e.target.value })}
                className="input-field w-full" />
              <button onClick={() => setShowPerfil(false)} className="btn-primary w-full">Guardar Perfil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}