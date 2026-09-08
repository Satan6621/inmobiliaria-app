"use client";

import { useState, useEffect } from "react";
import {
  Calendar, Clock, Share2, Plus, Trash2, Camera, Briefcase,
  Send, Check, Edit3, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ScheduledPost {
  id: string;
  propertyTitle: string;
  platform: string;
  audience: string;
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "pending" | "published" | "failed";
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", color: "bg-pink-500" },
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "bg-black" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "bg-blue-600" },
  { id: "telegram", label: "Telegram", icon: "✈️", color: "bg-blue-400" },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

const BEST_TIMES: Record<string, string[]> = {
  instagram: ["11:00", "14:00", "19:00"],
  tiktok: ["10:00", "15:00", "20:00"],
  linkedin: ["08:00", "12:00", "17:00"],
  telegram: ["09:00", "13:00", "18:00"],
};

export default function SocialPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [inventario, setInventario] = useState<Record<string, unknown>[]>([]);

  const [form, setForm] = useState({
    propertyId: "",
    platform: "instagram",
    audience: "primera-vivienda",
    date: "",
    time: "11:00",
    content: "",
  });

  useEffect(() => {
    fetchInventario();
    const saved = localStorage.getItem("scheduledPosts");
    if (saved) setPosts(JSON.parse(saved));
  }, []);

  const fetchInventario = async () => {
    try {
      const res = await fetch("/api/inventario");
      const data = await res.json();
      setInventario(data.inventario || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const savePosts = (newPosts: ScheduledPost[]) => {
    setPosts(newPosts);
    localStorage.setItem("scheduledPosts", JSON.stringify(newPosts));
  };

  const addPost = () => {
    if (!form.propertyId || !form.date || !form.content) return;

    const prop = inventario.find((i: Record<string, unknown>) => i.id === Number(form.propertyId));
    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      propertyTitle: (prop?.titulo as string) || "Propiedad",
      platform: form.platform,
      audience: form.audience,
      content: form.content,
      scheduledDate: form.date,
      scheduledTime: form.time,
      status: "pending",
    };

    savePosts([...posts, newPost]);
    setShowForm(false);
    setForm({ propertyId: "", platform: "instagram", audience: "primera-vivienda", date: "", time: "11:00", content: "" });
  };

  const deletePost = (id: string) => {
    savePosts(posts.filter((p) => p.id !== id));
  };

  const markAsPublished = (id: string) => {
    savePosts(posts.map((p) => p.id === id ? { ...p, status: "published" } : p));
  };

  // Get week days
  const getWeekDays = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const getPostsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return posts.filter((p) => p.scheduledDate === dateStr);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-VE", { weekday: "short", day: "numeric" });
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Calendario de Publicaciones</h1>
            <p className="text-sm text-text-muted">Programa y gestiona tu contenido en redes sociales</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Programar Post
        </button>
      </div>

      {/* New Post Form */}
      {showForm && (
        <div className="glass-card p-6 mb-8 animate-slide-up">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Nueva Publicación Programada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Propiedad</label>
                <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} className="select-field">
                  <option value="">Seleccionar propiedad...</option>
                  {inventario.map((inv: Record<string, unknown>) => (
                    <option key={inv.id as number} value={inv.id as number}>
                      {inv.titulo as string} - {formatCurrency(inv.precio_venta as number)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Plataforma</label>
                <div className="flex gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setForm({ ...form, platform: p.id })}
                      className={`flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs transition-all ${
                        form.platform === p.id
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-surface text-text-muted border border-border"
                      }`}
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Audiencia</label>
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="select-field">
                  <option value="primera-vivienda">🏠 Primera Vivienda</option>
                  <option value="inversionistas">💰 Inversionistas</option>
                  <option value="familias">👨‍👩‍👧‍👦 Familias</option>
                  <option value="lujo">✨ Lujo</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Fecha</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">
                    Hora
                    {BEST_TIMES[form.platform]?.includes(form.time) && (
                      <span className="text-success ml-1">⭐ Mejor hora</span>
                    )}
                  </label>
                  <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="select-field">
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t} {BEST_TIMES[form.platform]?.includes(t) ? "⭐" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Contenido</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Escribe o pega el contenido de la publicación..."
                  className="input-field min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={addPost} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Programar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))} className="btn-secondary p-2">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-semibold text-text-primary">
          {weekDays[0].toLocaleDateString("es-VE", { month: "long", day: "numeric" })} - {weekDays[6].toLocaleDateString("es-VE", { month: "long", day: "numeric", year: "numeric" })}
        </h3>
        <button onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))} className="btn-secondary p-2">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weekDays.map((day, i) => {
          const dayPosts = getPostsForDay(day);
          const isToday = day.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];

          return (
            <div key={i} className={`glass-card p-3 min-h-[150px] ${isToday ? "border-primary" : ""}`}>
              <div className={`text-xs font-semibold mb-2 ${isToday ? "text-primary" : "text-text-secondary"}`}>
                {formatDate(day)}
              </div>
              <div className="space-y-1">
                {dayPosts.map((post) => {
                  const platform = PLATFORMS.find((p) => p.id === post.platform);
                  return (
                    <div
                      key={post.id}
                      className={`text-[10px] p-1.5 rounded-md border ${
                        post.status === "published"
                          ? "bg-success/10 border-success/20 text-success"
                          : "bg-surface border-border text-text-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{platform?.icon}</span>
                        <span className="truncate">{post.propertyTitle.substring(0, 20)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-text-muted">{post.scheduledTime}</span>
                        <div className="flex gap-0.5">
                          {post.status !== "published" && (
                            <button onClick={() => markAsPublished(post.id)} className="text-success hover:text-success/80">
                              <Check className="w-2.5 h-2.5" />
                            </button>
                          )}
                          <button onClick={() => deletePost(post.id)} className="text-danger hover:text-danger/80">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Posts */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Próximas Publicaciones</h3>
        {posts.filter((p) => p.status === "pending").length === 0 ? (
          <p className="text-xs text-text-muted">No hay publicaciones programadas.</p>
        ) : (
          <div className="space-y-2">
            {posts
              .filter((p) => p.status === "pending")
              .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`))
              .slice(0, 5)
              .map((post) => {
                const platform = PLATFORMS.find((p) => p.id === post.platform);
                return (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{platform?.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-text-primary">{post.propertyTitle}</p>
                        <p className="text-[10px] text-text-muted">
                          {post.scheduledDate} a las {post.scheduledTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-warning text-[10px]">Pendiente</span>
                      <button onClick={() => markAsPublished(post.id)} className="text-success hover:text-success/80">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deletePost(post.id)} className="text-danger hover:text-danger/80">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
