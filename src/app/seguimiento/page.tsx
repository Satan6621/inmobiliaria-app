"use client";

import { useState, useEffect } from "react";
import {
  Bell, Clock, Phone, CheckCircle2, AlertCircle, Plus, X,
  Calendar, MessageSquare, Filter,
} from "lucide-react";

interface Seguimiento {
  id: string;
  cliente: string;
  telefono: string;
  tipo: string;
  ultimoContacto: string;
  proximoContacto: string;
  estado: string;
  notas: string;
  prioridad: string;
}

const emptySeguimiento: Partial<Seguimiento> = {
  cliente: "", telefono: "", tipo: "Vendedor",
  ultimoContacto: new Date().toISOString().split("T")[0],
  proximoContacto: "", estado: "Pendiente",
  notas: "", prioridad: "Normal",
};

const TIPOS = ["Vendedor", "Comprador", "Inversionista", "Referido"];
const ESTADOS = ["Pendiente", "En Progreso", "Completado", "Sin Respuesta", "Cancelado"];
const PRIORIDADES = ["Urgente", "Alta", "Normal", "Baja"];

export default function SeguimientoPage() {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Seguimiento>>(emptySeguimiento);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    const saved = localStorage.getItem("seguimientos_inmobiliaria");
    if (saved) setSeguimientos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("seguimientos_inmobiliaria", JSON.stringify(seguimientos));
  }, [seguimientos]);

  const save = () => {
    if (!form.cliente || !form.telefono) return;
    if (editingId) {
      setSeguimientos(seguimientos.map((s) => s.id === editingId ? { ...s, ...form } as Seguimiento : s));
    } else {
      setSeguimientos([...seguimientos, { ...form, id: Date.now().toString() } as Seguimiento]);
    }
    setShowForm(false);
    setForm(emptySeguimiento);
    setEditingId(null);
  };

  const deleteSeg = (id: string) => {
    if (confirm("¿Eliminar?")) setSeguimientos(seguimientos.filter((s) => s.id !== id));
  };

  const marcarContactado = (id: string) => {
    setSeguimientos(seguimientos.map((s) =>
      s.id === id ? { ...s, ultimoContacto: new Date().toISOString().split("T")[0], estado: "En Progreso" } : s
    ));
  };

  const getDiasSinContacto = (fecha: string) => {
    const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filtered = seguimientos.filter((s) => {
    if (filtro === "urgentes") return s.prioridad === "Urgente" || s.prioridad === "Alta";
    if (filtro === "pendientes") return s.estado === "Pendiente";
    if (filtro === "vencidos") return getDiasSinContacto(s.ultimoContacto) > 7;
    return true;
  });

  const stats = {
    total: seguimientos.length,
    pendientes: seguimientos.filter((s) => s.estado === "Pendiente").length,
    vencidos: seguimientos.filter((s) => getDiasSinContacto(s.ultimoContacto) > 7).length,
    urgentes: seguimientos.filter((s) => s.prioridad === "Urgente").length,
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Seguimiento de Leads</h1>
            <p className="text-sm text-text-muted">Nunca pierdas un contacto importante</p>
          </div>
        </div>
        <button onClick={() => { setForm(emptySeguimiento); setEditingId(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo Seguimiento</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-text-primary" },
          { label: "Pendientes", value: stats.pendientes, color: "text-warning" },
          { label: "Sin Contacto 7d+", value: stats.vencidos, color: "text-danger" },
          { label: "Urgentes", value: stats.urgentes, color: "text-danger" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "todos", label: "Todos" },
          { value: "urgentes", label: "Urgentes" },
          { value: "pendientes", label: "Pendientes" },
          { value: "vencidos", label: "Sin Contacto 7d+" },
        ].map((f) => (
          <button key={f.value} onClick={() => setFiltro(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtro === f.value ? "bg-primary text-white" : "bg-surface-elevated text-text-muted hover:bg-surface-hover"
            }`}>{f.label}</button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">Sin seguimientos para mostrar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const dias = getDiasSinContacto(s.ultimoContacto);
            const necesitaAtencion = dias > 7 || s.prioridad === "Urgente";
            return (
              <div key={s.id} className={`glass-card p-4 ${necesitaAtencion ? "border-l-4 border-danger" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      s.prioridad === "Urgente" ? "bg-danger/20 text-danger" :
                      s.prioridad === "Alta" ? "bg-warning/20 text-warning" :
                      "bg-surface-elevated text-text-muted"
                    }`}>{dias}d</div>
                    <div>
                      <h4 className="font-medium text-text-primary">{s.cliente}</h4>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>{s.telefono}</span>
                        <span>•</span>
                        <span>{s.tipo}</span>
                        <span>•</span>
                        <span>Último: {s.ultimoContacto}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${
                      s.estado === "Completado" ? "badge-success" :
                      s.estado === "Pendiente" ? "badge-warning" :
                      s.estado === "Sin Respuesta" ? "badge-danger" :
                      "badge-info"
                    }`}>{s.estado}</span>
                    <a href={`https://wa.me/${s.telefono?.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20">
                      <Phone className="w-4 h-4" />
                    </a>
                    <button onClick={() => marcarContactado(s.id)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setForm(s); setEditingId(s.id); setShowForm(true); }}
                      className="p-2 rounded-lg hover:bg-surface-hover text-text-muted">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteSeg(s.id)} className="p-2 rounded-lg hover:bg-danger/10 text-danger">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {s.notas && <p className="text-xs text-text-muted mt-2 ml-13 italic">{s.notas}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingId ? "Editar" : "Nuevo"} Seguimiento</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre del cliente" value={form.cliente || ""}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })} className="input-field w-full" />
              <input type="text" placeholder="Teléfono" value={form.telefono || ""}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input-field w-full" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="select-field">
                  {TIPOS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })} className="select-field">
                  {PRIORIDADES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Último Contacto</label>
                  <input type="date" value={form.ultimoContacto || ""}
                    onChange={(e) => setForm({ ...form, ultimoContacto: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Próximo Contacto</label>
                  <input type="date" value={form.proximoContacto || ""}
                    onChange={(e) => setForm({ ...form, proximoContacto: e.target.value })} className="input-field w-full" />
                </div>
              </div>
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="select-field w-full">
                {ESTADOS.map((e) => <option key={e}>{e}</option>)}
              </select>
              <textarea placeholder="Notas" value={form.notas || ""}
                onChange={(e) => setForm({ ...form, notas: e.target.value })} className="input-field w-full h-20" />
              <button onClick={save} className="btn-primary w-full">{editingId ? "Actualizar" : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
