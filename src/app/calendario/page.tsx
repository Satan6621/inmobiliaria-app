"use client";

import { useState, useEffect } from "react";
import {
  Calendar, Clock, Plus, Trash2, Check, Edit3, MapPin,
  Phone, X, ChevronLeft, ChevronRight,
} from "lucide-react";

interface Cita {
  id: string;
  titulo: string;
  cliente: string;
  telefono: string;
  direccion: string;
  fecha: string;
  hora: string;
  duracion: number;
  tipo: string;
  notas: string;
  estado: string;
}

const emptyCita: Partial<Cita> = {
  titulo: "", cliente: "", telefono: "", direccion: "",
  fecha: new Date().toISOString().split("T")[0],
  hora: "10:00", duracion: 60, tipo: "Visita",
  notas: "", estado: "Programada",
};

const TIPOS = ["Visita", "Reunión", "Llamada", "Seguimiento", "Firma", "Entrega"];
const ESTADOS = ["Programada", "Completada", "Cancelada", "Reprogramada"];

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function CalendarioPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Cita>>(emptyCita);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const saved = localStorage.getItem("citas_inmobiliaria");
    if (saved) setCitas(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("citas_inmobiliaria", JSON.stringify(citas));
  }, [citas]);

  const saveCita = () => {
    if (!form.titulo || !form.cliente || !form.fecha || !form.hora) return;
    if (editingId) {
      setCitas(citas.map((c) => c.id === editingId ? { ...c, ...form } as Cita : c));
    } else {
      setCitas([...citas, { ...form, id: Date.now().toString() } as Cita]);
    }
    setShowForm(false);
    setForm(emptyCita);
    setEditingId(null);
  };

  const deleteCita = (id: string) => {
    if (confirm("¿Eliminar esta cita?")) {
      setCitas(citas.filter((c) => c.id !== id));
    }
  };

  const toggleEstado = (id: string) => {
    setCitas(citas.map((c) => {
      if (c.id !== id) return c;
      const next = c.estado === "Programada" ? "Completada" : c.estado === "Completada" ? "Programada" : c.estado;
      return { ...c, estado: next };
    }));
  };

  const getDiasDelMes = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dias: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) dias.push(null);
    for (let i = 1; i <= daysInMonth; i++) dias.push(i);
    return dias;
  };

  const getCitasForDate = (dateStr: string) => {
    return citas.filter((c) => c.fecha === dateStr);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return `${d.getDate()} de ${MESES[d.getMonth()]}`;
  };

  const dias = getDiasDelMes(currentDate);
  const citasHoy = getCitasForDate(selectedDate);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Calendario de Citas</h1>
            <p className="text-sm text-text-muted">Organiza tus visitas y reuniones</p>
          </div>
        </div>
        <button onClick={() => { setForm(emptyCita); setEditingId(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 rounded-lg hover:bg-surface-hover"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-semibold text-text-primary">
              {MESES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 rounded-lg hover:bg-surface-hover"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-text-muted py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {dias.map((dia, i) => {
              if (dia === null) return <div key={`empty-${i}`} />;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
              const citasDelDia = getCitasForDate(dateStr);
              const isToday = dateStr === new Date().toISOString().split("T")[0];
              const isSelected = dateStr === selectedDate;

              return (
                <button key={i} onClick={() => setSelectedDate(dateStr)}
                  className={`relative p-2 rounded-lg text-sm transition-all ${
                    isSelected ? "bg-primary text-white" :
                    isToday ? "bg-primary/10 text-primary border border-primary/30" :
                    "hover:bg-surface-hover text-text-secondary"
                  }`}>
                  {dia}
                  {citasDelDia.length > 0 && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-primary"
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Citas del Día */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {formatDate(selectedDate)}
          </h3>

          {citasHoy.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">Sin citas este día</p>
          ) : (
            <div className="space-y-3">
              {citasHoy.sort((a, b) => a.hora.localeCompare(b.hora)).map((cita) => (
                <div key={cita.id} className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        cita.estado === "Completada" ? "badge-success" :
                        cita.estado === "Cancelada" ? "badge-danger" :
                        "badge-info"
                      }`}>{cita.estado}</span>
                      <span className="badge bg-surface-hover text-text-muted">{cita.tipo}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleEstado(cita.id)} className="p-1 rounded hover:bg-surface-hover text-success">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setForm(cita); setEditingId(cita.id); setShowForm(true); }}
                        className="p-1 rounded hover:bg-surface-hover text-text-muted"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteCita(cita.id)} className="p-1 rounded hover:bg-danger/10 text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-text-primary text-sm">{cita.titulo}</h4>
                  <p className="text-xs text-text-muted mt-1">{cita.cliente}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {cita.hora}</span>
                    {cita.direccion && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {cita.direccion}</span>}
                  </div>
                  {cita.notas && <p className="text-xs text-text-muted mt-2 italic">{cita.notas}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Próximas Citas */}
      <div className="glass-card p-6 mt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Próximas Citas</h3>
        {citas.filter((c) => c.fecha >= new Date().toISOString().split("T")[0] && c.estado === "Programada").length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">No hay citas programadas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {citas
              .filter((c) => c.fecha >= new Date().toISOString().split("T")[0] && c.estado === "Programada")
              .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
              .slice(0, 6)
              .map((cita) => (
                <div key={cita.id} className="p-4 rounded-lg bg-surface-elevated border border-border-subtle hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-text-primary">{formatDate(cita.fecha)}</span>
                  </div>
                  <h4 className="font-medium text-text-primary text-sm mb-1">{cita.titulo}</h4>
                  <p className="text-xs text-text-muted">{cita.cliente}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                    <Clock className="w-3 h-3" /> {cita.hora}
                    <span>•</span>
                    <span>{cita.duracion} min</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">{editingId ? "Editar Cita" : "Nueva Cita"}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-surface-hover"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Título (Ej. Visita Apartamento)" value={form.titulo || ""}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="input-field w-full" />
              <input type="text" placeholder="Nombre del cliente" value={form.cliente || ""}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })} className="input-field w-full" />
              <input type="text" placeholder="Teléfono" value={form.telefono || ""}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input-field w-full" />
              <input type="text" placeholder="Dirección" value={form.direccion || ""}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="input-field w-full" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Fecha</label>
                  <input type="date" value={form.fecha || ""}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Hora</label>
                  <input type="time" value={form.hora || ""}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })} className="input-field w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="select-field">
                  {TIPOS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="select-field">
                  {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <textarea placeholder="Notas" value={form.notas || ""}
                onChange={(e) => setForm({ ...form, notas: e.target.value })} className="input-field w-full h-16" />
              <button onClick={saveCita} className="btn-primary w-full">{editingId ? "Actualizar" : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
