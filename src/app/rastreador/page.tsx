"use client";

import { useState, useEffect } from "react";
import {
  Search, Filter, ExternalLink, Phone, Zap, AlertTriangle,
  Loader2, Bookmark, Bell, BellOff, TrendingDown, MessageSquare,
  Eye, Heart, X,
} from "lucide-react";
import { ZONAS_DISPONIBLES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { AISearch } from "@/components/ai-search";
import { usePropiedadesFeed, matchBusquedaYNotificar, pedirPermisoNotificaciones } from "@/lib/realtime";
import { authFetch } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { useOfflineSnapshot } from "@/lib/offline";
import { Wifi, WifiOff, CloudOff } from "lucide-react";

interface ProspectoRastreo {
  fecha: string;
  zona: string;
  rol: string;
  calificado: string;
  precio_usd: number;
  metros: number;
  precio_m2: number;
  urgencia_score: number;
  es_remate: string;
  servicios: string;
  telefono: string;
  whatsapp_link: string;
  titulo: string;
  detalle: string;
  enlace: string;
}

interface BusquedaGuardada {
  id: string;
  nombre: string;
  zonas: string[];
  precioMin: number;
  precioMax: number;
  roles: string[];
  tipoInmueble: string;
  activa: boolean;
  notificaciones: number;
  fechaCreacion: string;
}

interface FeedItem {
  id: string;
  titulo: string;
  precio: number;
  precioAnterior?: number;
  zona: string;
  tipo: string;
  fecha: string;
  esBajada: boolean;
}

const TIPOS_INMUEBLE = ["Todos", "Apartamento", "Casa", "Townhouse", "Terreno", "Galpón", "Local"];

const FEED_SIMULADO: FeedItem[] = [
  { id: "1", titulo: "Apartamento 3hab en Valencia", precio: 28000, zona: "Carabobo", tipo: "Apartamento", fecha: "Ahora", esBajada: false },
  { id: "2", titulo: "Casa con jardín en Los Teques", precio: 45000, precioAnterior: 52000, zona: "Miranda", tipo: "Casa", fecha: "Hace 2min", esBajada: true },
  { id: "3", titulo: "Terreno 200m² en Mérida", precio: 15000, zona: "Mérida", tipo: "Terreno", fecha: "Hace 5min", esBajada: false },
  { id: "4", titulo: "PH en Chacao, 2hab", precio: 85000, precioAnterior: 92000, zona: "Miranda", tipo: "Penthouse", fecha: "Hace 8min", esBajada: true },
  { id: "5", titulo: "Casa en Barquisimeto", precio: 35000, zona: "Lara", tipo: "Casa", fecha: "Hace 12min", esBajada: false },
  { id: "6", titulo: "Local comercial en Maracaibo", precio: 62000, precioAnterior: 68000, zona: "Zulia", tipo: "Local", fecha: "Hace 15min", esBajada: true },
  { id: "7", titulo: "Townhouse en San Cristóbal", precio: 42000, zona: "Táchira", tipo: "Townhouse", fecha: "Hace 18min", esBajada: false },
  { id: "8", titulo: "Apartamento en Lechería", precio: 55000, precioAnterior: 59000, zona: "Anzoátegui", tipo: "Apartamento", fecha: "Hace 22min", esBajada: true },
];

export default function RastreadorPage() {
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>(["Toda Venezuela"]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>(["vendedor", "comprador"]);
  const [filtrarPrecio, setFiltrarPrecio] = useState(false);
  const [precioMin, setPrecioMin] = useState(8000);
  const [precioMax, setPrecioMax] = useState(75000);
  const [soloUrgentes, setSoloUrgentes] = useState(false);
  const [tipoInmueble, setTipoInmueble] = useState("Todos");
  const [maxResultados, setMaxResultados] = useState(8);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ProspectoRastreo[]>([]);
  const [stats, setStats] = useState({ total: 0, nuevos: 0, remates: 0 });

  // Saved searches
  const [busquedas, setBusquedas] = useState<BusquedaGuardada[]>([]);
  const [showGuardar, setShowGuardar] = useState(false);
  const [nombreBusqueda, setNombreBusqueda] = useState("");

  // Feed
  const [feed, setFeed] = useState<FeedItem[]>(FEED_SIMULADO);

  // Realtime: feed de propiedades compartido entre agentes
  const { items: feedRealtime, status: rtStatus, nuevoFeedItem } = usePropiedadesFeed(true);

  // Modo offline: snapshot local para que el radar siga funcionando sin conexión
  const { snapshot: snapshotOffline, offline } = useOfflineSnapshot();

  useEffect(() => {
    if (feedRealtime.length > 0) {
      setFeed(
        feedRealtime.slice(0, 20).map((item: any) => ({
          id: item.id,
          titulo: item.titulo || "Nueva propiedad",
          precio: Number(item.precio || 0),
          precioAnterior: item.precioAnterior || undefined,
          zona: "Venezuela",
          tipo: item.tipo_inmueble || "Apartamento",
          fecha: new Date(item.created_at || Date.now()).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }),
          esBajada: false,
        }))
      );
    } else if (snapshotOffline && snapshotOffline.propiedades.length > 0) {
      // Sin conexión: usar el snapshot local descargado previamente
      setFeed(
        snapshotOffline.propiedades.slice(0, 20).map((p) => ({
          id: p.id,
          titulo: p.titulo || "Propiedad",
          precio: Number(p.precio || 0),
          zona: p.estado || p.municipio || "Venezuela",
          tipo: p.tipo_inmueble || "Apartamento",
          fecha: "Offline",
          esBajada: false,
        }))
      );
    }
  }, [feedRealtime, snapshotOffline]);

  const [notifBanner, setNotifBanner] = useState(false);

  // Cuando llega una propiedad nueva por Realtime → comprobar alertas
  useEffect(() => {
    if (!nuevoFeedItem) return;
    if (nuevoFeedItem.esBajada) {
      setFeed((prev) => [
        { ...nuevoFeedItem, zona: nuevoFeedItem.zona || "Venezuela", fecha: "Ahora", tipo: nuevoFeedItem.tipo || "Apartamento" },
        ...prev.filter((f) => f.id !== nuevoFeedItem.id),
      ].slice(0, 20));
      return;
    }
    setFeed((prev) => [
      { ...nuevoFeedItem, zona: nuevoFeedItem.zona || "Venezuela", fecha: "Ahora", tipo: nuevoFeedItem.tipo || "Apartamento" },
      ...prev.filter((f) => f.id !== nuevoFeedItem.id),
    ].slice(0, 20));

    // Notificar si coincide con una búsqueda guardada
    const coincide = matchBusquedaYNotificar(nuevoFeedItem, busquedas);
    if (coincide) {
      setNotifBanner(true);
      setTimeout(() => setNotifBanner(false), 6000);
    }
  }, [nuevoFeedItem]);

  // Property stats (micro-CRM)
  const [propStats, setPropStats] = useState({ vistas: 0, guardados: 0, contactos: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("busquedas_guardadas");
    if (saved) setBusquedas(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("busquedas_guardadas", JSON.stringify(busquedas));
  }, [busquedas]);

  const handleRastrear = async () => {
    if (zonasSeleccionadas.length === 0 || rolesSeleccionados.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rastrear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zonas: zonasSeleccionadas,
          roles: rolesSeleccionados,
          filtrarPrecio,
          precioMin,
          precioMax,
          soloUrgentes,
          maxResultados,
        }),
      });
      const data = await res.json();
      setResultados(data.resultados || []);
      setStats({
        total: data.resultados?.length || 0,
        nuevos: data.nuevos || 0,
        remates: data.resultados?.filter((r: ProspectoRastreo) => r.es_remate.includes("REMATE")).length || 0,
      });
    } catch (error) {
      console.error("Error en rastreo:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleZona = (zona: string) => {
    setZonasSeleccionadas((prev) =>
      prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona]
    );
  };

  const toggleRol = (rol: string) => {
    setRolesSeleccionados((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  const guardarBusqueda = async () => {
    if (!nombreBusqueda.trim()) return;
    const nueva: BusquedaGuardada = {
      id: Date.now().toString(),
      nombre: nombreBusqueda,
      zonas: [...zonasSeleccionadas],
      precioMin,
      precioMax,
      roles: [...rolesSeleccionados],
      tipoInmueble,
      activa: true,
      notificaciones: 0,
      fechaCreacion: new Date().toISOString(),
    };
    setBusquedas([...busquedas, nueva]);
    setNombreBusqueda("");
    setShowGuardar(false);

    // Solicitar permiso de notificaciones del navegador
    pedirPermisoNotificaciones();

    // Guardar en Supabase para que otros dispositivos/agentes la vean
    try {
      const body: any = {
        titulo: nueva.nombre,
        nombre_agente: "Agente",
        precio_min: precioMin,
        precio_max: precioMax,
        tipo_inmueble: tipoInmueble === "Todos" ? null : tipoInmueble,
      };
      const userId = await getUserId();
      if (userId) body.user_id = userId;
      await authFetch("/api/alertas", {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch {
      // offline: permanece en localStorage
    }
  };

  const toggleAlertaBusqueda = (id: string) => {
    setBusquedas(busquedas.map((b) =>
      b.id === id ? { ...b, activa: !b.activa } : b
    ));
  };

  const eliminarBusqueda = (id: string) => {
    setBusquedas(busquedas.filter((b) => b.id !== id));
  };

  const cargarBusqueda = (busqueda: BusquedaGuardada) => {
    setZonasSeleccionadas(busqueda.zonas);
    setRolesSeleccionados(busqueda.roles);
    setPrecioMin(busqueda.precioMin);
    setPrecioMax(busqueda.precioMax);
    setTipoInmueble(busqueda.tipoInmueble);
  };

  const sendWhatsApp = (telefono: string, titulo: string) => {
    const msg = encodeURIComponent(`Hola, estoy interesado en "${titulo}". ¿Podría darme más información?`);
    window.open(`https://wa.me/${telefono.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Search className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Rastreador de Mercado
            </h1>
            <p className="text-sm text-text-muted">
              Busca propiedades en todos los estados de Venezuela con IA
            </p>
          </div>
        </div>
      </div>

      {/* AI Search Section */}
      <div className="mb-8">
        <AISearch />
      </div>

      {/* Feed de Precios en Streaming */}
      <div className="glass-card p-4 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-warning" />
          <h2 className="text-sm font-semibold text-text-primary">Últimas Publicaciones en Tiempo Real</h2>
          {rtStatus === "connected" ? (
            <span className="badge badge-success animate-pulse flex items-center gap-1">
              <Wifi className="w-3 h-3" /> LIVE
            </span>
          ) : offline ? (
            <span className="badge badge-danger flex items-center gap-1">
              <CloudOff className="w-3 h-3" /> Sin conexión · Snapshot local
            </span>
          ) : (
            <span className="badge badge-danger flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Demo
            </span>
          )}
        </div>
        {offline && (
          <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-warning/10 border border-warning/30 text-xs text-warning animate-slide-up">
            <CloudOff className="w-4 h-4" />
            Sin conexión. Este radar usa el último snapshot descargado
            {(snapshotOffline?.total ?? 0) > 0 ? ` (${snapshotOffline!.total} propiedades)` : ""} —
            se sincronizará automáticamente al recuperar señal.
          </div>
        )}
        {notifBanner && (
          <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-success/10 border border-success/30 text-sm text-success animate-slide-up">
            <Bell className="w-4 h-4 animate-ring" />
            🔔 Nueva propiedad que coincide con tu búsqueda guardada. ¡Revisa el feed!
          </div>
        )}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {feed.map((item) => (
            <div key={item.id} className={`flex-shrink-0 p-3 rounded-xl border transition-all hover:scale-105 cursor-pointer ${
              item.esBajada
                ? "bg-success/5 border-success/20 hover:border-success/40"
                : "bg-surface-elevated border-border-subtle hover:border-primary/30"
            }`} style={{ minWidth: 200 }}>
              <div className="flex items-center gap-2 mb-1">
                {item.esBajada && <TrendingDown className="w-3 h-3 text-success" />}
                <span className="text-xs text-text-muted">{item.fecha}</span>
              </div>
              <h4 className="text-xs font-medium text-text-primary line-clamp-1 mb-1">{item.titulo}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">{formatCurrency(item.precio)}</span>
                {item.esBajada && item.precioAnterior && (
                  <span className="text-xs text-text-muted line-through">{formatCurrency(item.precioAnterior)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge text-[10px]">{item.zona}</span>
                {item.esBajada && <span className="text-[10px] text-success font-semibold">BAJÓ</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Filtros */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filtros Principales */}
          <div className="glass-card p-6 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Filtros</h2>
              </div>
              <button onClick={() => setShowGuardar(true)} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                <Bookmark className="w-3 h-3" /> Guardar
              </button>
            </div>

            {/* Zonas */}
            <div className="mb-4">
              <label className="text-xs font-medium text-text-secondary mb-2 block">Estados / Zonas</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                {Object.keys(ZONAS_DISPONIBLES).map((zona) => (
                  <label key={zona} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={zonasSeleccionadas.includes(zona)}
                      onChange={() => toggleZona(zona)}
                      className="w-3.5 h-3.5 rounded border-border bg-surface text-primary focus:ring-primary/30" />
                    <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                      {zona.split(" (")[0]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipo Inmueble */}
            <div className="mb-4">
              <label className="text-xs font-medium text-text-secondary mb-2 block">Tipo de Inmueble</label>
              <select value={tipoInmueble} onChange={(e) => setTipoInmueble(e.target.value)} className="select-field w-full">
                {TIPOS_INMUEBLE.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Roles */}
            <div className="mb-4">
              <label className="text-xs font-medium text-text-secondary mb-2 block">Tipo de Prospecto</label>
              <div className="flex gap-2">
                {["vendedor", "comprador"].map((rol) => (
                  <button key={rol} onClick={() => toggleRol(rol)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      rolesSeleccionados.includes(rol)
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-surface text-text-muted border border-border"
                    }`}>
                    {rol === "vendedor" ? "Vendedores" : "Compradores"}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de Precio */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={filtrarPrecio}
                  onChange={(e) => setFiltrarPrecio(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border bg-surface text-primary" />
                <span className="text-xs font-medium text-text-secondary">Filtro de Precio (USD)</span>
              </label>
              {filtrarPrecio && (
                <div className="space-y-2 pl-5">
                  <div>
                    <div className="flex justify-between text-[10px] text-text-muted mb-1">
                      <span>Mín</span><span>{formatCurrency(precioMin)}</span>
                    </div>
                    <input type="range" min={2000} max={300000} step={5000} value={precioMin}
                      onChange={(e) => setPrecioMin(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-text-muted mb-1">
                      <span>Máx</span><span>{formatCurrency(precioMax)}</span>
                    </div>
                    <input type="range" min={2000} max={300000} step={5000} value={precioMax}
                      onChange={(e) => setPrecioMax(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Solo Urgentes */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={soloUrgentes}
                  onChange={(e) => setSoloUrgentes(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border bg-surface text-primary" />
                <span className="text-xs font-medium text-text-secondary">Solo Remates / Urgencia</span>
              </label>
            </div>

            {/* Max Resultados */}
            <div className="mb-4">
              <label className="text-xs font-medium text-text-secondary mb-1 block">
                Resultados: {maxResultados}
              </label>
              <input type="range" min={5} max={25} value={maxResultados}
                onChange={(e) => setMaxResultados(Number(e.target.value))} className="w-full accent-primary" />
            </div>

            {/* Botón Buscar */}
            <button onClick={handleRastrear} disabled={loading || zonasSeleccionadas.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Rastreando...</>
              ) : (
                <><Zap className="w-4 h-4" /> Iniciar Rastreo</>
              )}
            </button>
          </div>

          {/* Alertas de Búsqueda Guardada */}
          {busquedas.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Bell className="w-3 h-3" /> Mis Alertas Activas
              </h3>
              <div className="space-y-2">
                {busquedas.map((b) => (
                  <div key={b.id} className={`p-2 rounded-lg border text-xs transition-all ${
                    b.activa ? "bg-primary/5 border-primary/20" : "bg-surface-elevated border-border-subtle opacity-60"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-text-primary truncate">{b.nombre}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleAlertaBusqueda(b.id)}
                          className={`p-0.5 rounded ${b.activa ? "text-success" : "text-text-muted"}`}>
                          {b.activa ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                        </button>
                        <button onClick={() => eliminarBusqueda(b.id)} className="p-0.5 rounded text-danger">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-text-muted">{b.zonas.map((z) => z.split(" (")[0]).join(", ")}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-semibold">{formatCurrency(b.precioMin)} - {formatCurrency(b.precioMax)}</span>
                      <span className="text-success">{b.notificaciones} alertas</span>
                    </div>
                    <button onClick={() => cargarBusqueda(b)}
                      className="mt-1 text-primary hover:text-primary/80 text-[10px] font-medium">
                      Cargar búsqueda →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="lg:col-span-3">
          {/* Stats */}
          {resultados.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="stat-card text-center">
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                <p className="text-xs text-text-muted">Inmuebles Encontrados</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-bold text-success">{stats.nuevos}</p>
                <p className="text-xs text-text-muted">Nuevos Guardados</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-bold text-danger">{stats.remates}</p>
                <p className="text-xs text-text-muted">Alertas de Remate</p>
              </div>
            </div>
          )}

          {/* Micro-CRM Stats */}
          {resultados.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass-card p-3 flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-lg font-bold text-text-primary">{propStats.vistas}</p>
                  <p className="text-[10px] text-text-muted">Vistas a tus propiedades</p>
                </div>
              </div>
              <div className="glass-card p-3 flex items-center gap-3">
                <Heart className="w-5 h-5 text-danger" />
                <div>
                  <p className="text-lg font-bold text-text-primary">{propStats.guardados}</p>
                  <p className="text-[10px] text-text-muted">Guardados en favoritos</p>
                </div>
              </div>
              <div className="glass-card p-3 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-success" />
                <div>
                  <p className="text-lg font-bold text-text-primary">{propStats.contactos}</p>
                  <p className="text-[10px] text-text-muted">Contactos recibidos</p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Resultados */}
          {resultados.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Sin resultados aún</h3>
              <p className="text-sm text-text-secondary">
                Configura los filtros y haz clic en &quot;Iniciar Rastreo&quot; para buscar propiedades.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resultados.map((r, i) => (
                <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {r.es_remate.includes("REMATE") && (
                        <span className="badge badge-danger">
                          <AlertTriangle className="w-3 h-3 mr-1" /> REMATE
                        </span>
                      )}
                      <span className={`badge ${r.rol.includes("VENDEDOR") ? "badge-warning" : "badge-info"}`}>
                        {r.rol}
                      </span>
                      {r.calificado === "SÍ" && (
                        <span className="badge badge-success">Calificado</span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">{r.zona}</span>
                  </div>

                  <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">{r.titulo}</h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{r.detalle}</p>

                  <div className="flex flex-wrap gap-4 mb-3 text-sm">
                    {r.precio_usd > 0 && (
                      <span className="text-success font-semibold">{formatCurrency(r.precio_usd)}</span>
                    )}
                    {r.precio_m2 > 0 && (
                      <span className="text-text-muted">{formatCurrency(r.precio_m2)}/m²</span>
                    )}
                    <span className="text-text-muted">{r.servicios}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* WhatsApp Button Flotante */}
                    {r.telefono && (
                      <button onClick={() => sendWhatsApp(r.telefono, r.titulo)}
                        className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> WhatsApp
                      </button>
                    )}
                    {r.whatsapp_link && (
                      <a href={r.whatsapp_link} target="_blank" rel="noopener noreferrer"
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Contactar
                      </a>
                    )}
                    {r.enlace && (
                      <a href={r.enlace} target="_blank" rel="noopener noreferrer"
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Ver Publicación
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Guardar Búsqueda */}
      {showGuardar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Guardar Búsqueda con Alertas</h3>
              <button onClick={() => setShowGuardar(false)}><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-text-muted mb-4">
              Guarda esta búsqueda y recibe alertas instantáneas cuando aparezcan propiedades que coincidan.
            </p>
            <input type="text" placeholder="Nombre (ej: Casa en San Carlos menos $30k)"
              value={nombreBusqueda} onChange={(e) => setNombreBusqueda(e.target.value)}
              className="input-field w-full mb-4" />
            <div className="p-3 rounded-lg bg-surface-elevated text-xs text-text-secondary mb-4">
              <p><strong>Zonas:</strong> {zonasSeleccionadas.map((z) => z.split(" (")[0]).join(", ")}</p>
              <p><strong>Precio:</strong> {formatCurrency(precioMin)} - {formatCurrency(precioMax)}</p>
              <p><strong>Tipo:</strong> {tipoInmueble}</p>
            </div>
            <button onClick={guardarBusqueda} className="btn-primary w-full flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" /> Activar Alertas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
