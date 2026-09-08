"use client";

import { useState, useEffect } from "react";
import {
  Users, Plus, Search, Phone, Mail, MapPin, DollarSign,
  Bed, Trash2, Edit3, CheckCircle2, Clock, AlertCircle,
  Target, Filter, X, Save, Building2, Star,
} from "lucide-react";

interface Comprador {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  tipo_propiedad: string;
  presupuesto_min: number;
  presupuesto_max: number;
  ciudad: string;
  estado: string;
  habitaciones_min: number;
  habitaciones_max: number;
  banos_min: number;
  servicios_requeridos: string[];
  metraje_min: number;
  metraje_max: number;
  notas: string;
  fuente: string;
  estado_comprador: string;
  prioridad: string;
  fecha_contacto: string;
  created_at: string;
}

const emptyComprador: Partial<Comprador> = {
  nombre: "",
  telefono: "",
  email: "",
  tipo_propiedad: "Apartamento",
  presupuesto_min: 10000,
  presupuesto_max: 50000,
  ciudad: "Valencia",
  estado: "Carabobo",
  habitaciones_min: 2,
  habitaciones_max: 4,
  banos_min: 1,
  servicios_requeridos: [],
  metraje_min: 60,
  metraje_max: 200,
  notas: "",
  fuente: "Directo",
  estado_comprador: "Activo",
  prioridad: "Normal",
};

const CIUDADES = [
  { name: "Valencia", state: "Carabobo" },
  { name: "Caracas", state: "Distrito Capital" },
  { name: "Maracaibo", state: "Zulia" },
  { name: "Barquisimeto", state: "Lara" },
  { name: "Maracay", state: "Aragua" },
  { name: "Puerto Ordaz", state: "Bolívar" },
  { name: "Mérida", state: "Mérida" },
  { name: "Barcelona", state: "Anzoátegui" },
];

const TIPOS = ["Apartamento", "Casa", "Townhouse", "Penthouse", "Duplex", "Terreno"];
const ESTADOS = ["Activo", "Contactado", "En Negociación", "Cerrado", "Inactivo"];
const PRIORIDADES = ["Urgente", "Alta", "Normal", "Baja"];
const SERVICIOS = ["Pozo", "Planta", "Fibra", "Gas", "Piscina", "Gimnasio", "Seguridad"];

export default function CompradoresPage() {
  const [compradores, setCompradores] = useState<Comprador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Comprador>>(emptyComprador);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompradores();
  }, []);

  const fetchCompradores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterEstado) params.set("estado", filterEstado);

      const res = await fetch(`/api/compradores?${params}`);
      const data = await res.json();
      setCompradores(data.data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchCompradores(), 300);
    return () => clearTimeout(timer);
  }, [search, filterEstado]);

  const handleSubmit = async () => {
    if (!form.nombre || !form.telefono || !form.ciudad) {
      setError("Nombre, teléfono y ciudad son requeridos");
      return;
    }

    try {
      if (editingId) {
        await fetch("/api/compradores", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...form }),
        });
      } else {
        await fetch("/api/compradores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyComprador);
      fetchCompradores();
    } catch (err) {
      setError("Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este comprador?")) return;
    try {
      await fetch(`/api/compradores?id=${id}`, { method: "DELETE" });
      fetchCompradores();
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleEdit = (c: Comprador) => {
    setForm(c);
    setEditingId(c.id);
    setShowForm(true);
  };

  const toggleServicio = (servicio: string) => {
    const current = form.servicios_requeridos || [];
    if (current.includes(servicio)) {
      setForm({ ...form, servicios_requeridos: current.filter((s) => s !== servicio) });
    } else {
      setForm({ ...form, servicios_requeridos: [...current, servicio] });
    }
  };

  const stats = {
    total: compradores.length,
    activos: compradores.filter((c) => c.estado_comprador === "Activo").length,
    urgentes: compradores.filter((c) => c.prioridad === "Urgente").length,
    enNegociacion: compradores.filter((c) => c.estado_comprador === "En Negociación").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success/10 border border-success/20">
            <Users className="w-6 h-6 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Compradores</h1>
            <p className="text-sm text-text-muted">Gestiona tu cartera de clientes compradores</p>
          </div>
        </div>
        <button
          onClick={() => { setForm(emptyComprador); setEditingId(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Comprador
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-primary" },
          { label: "Activos", value: stats.activos, icon: CheckCircle2, color: "text-success" },
          { label: "Urgentes", value: stats.urgentes, icon: Star, color: "text-danger" },
          { label: "En Negociación", value: stats.enNegociacion, icon: Clock, color: "text-warning" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <div className="text-xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email..."
            className="input-field w-full"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="input-field"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingId ? "Editar Comprador" : "Nuevo Comprador"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-surface-hover">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-danger" />
                <span className="text-sm text-danger">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre || ""}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="input-field w-full"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Teléfono *</label>
                <input
                  type="text"
                  value={form.telefono || ""}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="input-field w-full"
                  placeholder="0414-1234567"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field w-full"
                  placeholder="juan@email.com"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Ciudad *</label>
                <select
                  value={form.ciudad || ""}
                  onChange={(e) => {
                    const city = CIUDADES.find((c) => c.name === e.target.value);
                    setForm({ ...form, ciudad: e.target.value, estado: city?.state || "" });
                  }}
                  className="input-field w-full"
                >
                  {CIUDADES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Tipo de Propiedad</label>
                <select
                  value={form.tipo_propiedad || ""}
                  onChange={(e) => setForm({ ...form, tipo_propiedad: e.target.value })}
                  className="input-field w-full"
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Presupuesto Mín (USD)</label>
                <input
                  type="number"
                  value={form.presupuesto_min || 0}
                  onChange={(e) => setForm({ ...form, presupuesto_min: Number(e.target.value) })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Presupuesto Máx (USD)</label>
                <input
                  type="number"
                  value={form.presupuesto_max || 0}
                  onChange={(e) => setForm({ ...form, presupuesto_max: Number(e.target.value) })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Habitaciones (min-max)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.habitaciones_min || 1}
                    onChange={(e) => setForm({ ...form, habitaciones_min: Number(e.target.value) })}
                    className="input-field w-full"
                    min={0}
                  />
                  <input
                    type="number"
                    value={form.habitaciones_max || 5}
                    onChange={(e) => setForm({ ...form, habitaciones_max: Number(e.target.value) })}
                    className="input-field w-full"
                    min={1}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Baños mínimos</label>
                <input
                  type="number"
                  value={form.banos_min || 1}
                  onChange={(e) => setForm({ ...form, banos_min: Number(e.target.value) })}
                  className="input-field w-full"
                  min={1}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Prioridad</label>
                <select
                  value={form.prioridad || "Normal"}
                  onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                  className="input-field w-full"
                >
                  {PRIORIDADES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Estado</label>
                <select
                  value={form.estado_comprador || "Activo"}
                  onChange={(e) => setForm({ ...form, estado_comprador: e.target.value })}
                  className="input-field w-full"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Fuente</label>
                <input
                  type="text"
                  value={form.fuente || ""}
                  onChange={(e) => setForm({ ...form, fuente: e.target.value })}
                  className="input-field w-full"
                  placeholder="Facebook, Referido, etc."
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-text-muted mb-2 block">Servicios Requeridos</label>
              <div className="flex flex-wrap gap-2">
                {SERVICIOS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleServicio(s)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      form.servicios_requeridos?.includes(s)
                        ? "bg-primary text-white"
                        : "bg-surface-elevated text-text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-text-muted mb-1 block">Notas</label>
              <textarea
                value={form.notas || ""}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="input-field w-full h-20"
                placeholder="Notas adicionales sobre el comprador..."
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {editingId ? "Actualizar" : "Guardar"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Compradores */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Cargando...</div>
      ) : compradores.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">No hay compradores registrados</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {compradores.map((c) => (
            <div key={c.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${
                    c.estado_comprador === "Activo" ? "badge-success" :
                    c.estado_comprador === "En Negociación" ? "badge-warning" :
                    c.estado_comprador === "Cerrado" ? "badge-primary" :
                    "bg-surface-elevated text-text-muted"
                  }`}>
                    {c.estado_comprador}
                  </span>
                  {c.prioridad === "Urgente" && (
                    <span className="badge badge-danger">Urgente</span>
                  )}
                  {c.prioridad === "Alta" && (
                    <span className="badge badge-warning">Alta</span>
                  )}
                  <span className="badge badge-info">{c.tipo_propiedad}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="p-2 rounded-lg hover:bg-surface-hover">
                    <Edit3 className="w-4 h-4 text-text-muted" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-danger/10">
                    <Trash2 className="w-4 h-4 text-danger" />
                  </button>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-text-primary mb-1">{c.nombre}</h4>

              <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {c.telefono}
                </span>
                {c.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {c.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {c.ciudad}, {c.estado}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-2">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${c.presupuesto_min?.toLocaleString()} - ${c.presupuesto_max?.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" />
                  {c.habitaciones_min} - {c.habitaciones_max} Hab.
                </span>
              </div>

              {c.servicios_requeridos && c.servicios_requeridos.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {c.servicios_requeridos.map((s, j) => (
                    <span key={j} className="badge badge-info text-xs">{s}</span>
                  ))}
                </div>
              )}

              {c.notas && (
                <p className="text-xs text-text-muted mt-2 italic">{c.notas}</p>
              )}

              <div className="text-xs text-text-muted mt-2">
                Fuente: {c.fuente} | Registrado: {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
