"use client";

import { useState, useEffect } from "react";
import { Users, Phone, ExternalLink, Edit3, Save, Trash2, BarChart3, Image, X, Plus } from "lucide-react";
import { ESTADOS_GESTION } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface Prospecto {
  id: number;
  fecha: string;
  zona: string;
  rol: string;
  calificado: string;
  precio_usd: number;
  metros: number;
  precio_m2: number;
  urgencia_score: number;
  servicios: string;
  telefono: string;
  whatsapp_link: string;
  titulo: string;
  detalle: string;
  enlace: string;
  estado_gestion: string;
  notas: string;
  imagenes_urls: string[];
  notas_imagenes: string;
}

export default function CRMPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [compradores, setCompradores] = useState<any[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [notaRapida, setNotaRapida] = useState("");
  const [activeTab, setActiveTab] = useState<"prospectos" | "compradores">("prospectos");
  const [editandoImagenes, setEditandoImagenes] = useState<number | null>(null);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState("");
  const [notasImagen, setNotasImagen] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prospectosRes, compradoresRes] = await Promise.all([
        fetch("/api/prospectos"),
        fetch("/api/compradores"),
      ]);
      const prospectosData = await prospectosRes.json();
      const compradoresData = await compradoresRes.json();
      setProspectos(prospectosData.prospectos || []);
      setCompradores(compradoresData.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (id: number) => {
    try {
      await fetch("/api/prospectos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado_gestion: nuevoEstado, notas: notaRapida }),
      });
      setProspectos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, estado_gestion: nuevoEstado, notas: notaRapida } : p
        )
      );
      setEditando(null);
      setNotaRapida("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const prospectosFiltrados =
    filtroEstado === "TODOS"
      ? prospectos
      : prospectos.filter((p) => p.estado_gestion === filtroEstado);

  const guardarImagenes = async (id: number, imagenes: string[], notas: string) => {
    try {
      await fetch("/api/prospectos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, imagenes_urls: imagenes, notas_imagenes: notas }),
      });
      setProspectos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, imagenes_urls: imagenes, notas_imagenes: notas } : p))
      );
      setEditandoImagenes(null);
      setNuevaImagenUrl("");
      setNotasImagen("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const agregarImagen = (id: number) => {
    if (!nuevaImagenUrl.trim()) return;
    const prospecto = prospectos.find((p) => p.id === id);
    if (!prospecto) return;
    const imagenes = [...(prospecto.imagenes_urls || []), nuevaImagenUrl.trim()];
    guardarImagenes(id, imagenes, notasImagen);
    setNuevaImagenUrl("");
  };

  const eliminarImagen = (id: number, index: number) => {
    const prospecto = prospectos.find((p) => p.id === id);
    if (!prospecto) return;
    const imagenes = (prospecto.imagenes_urls || []).filter((_, i) => i !== index);
    guardarImagenes(id, imagenes, notasImagen);
  };

  const stats = {
    total: prospectos.length,
    nuevos: prospectos.filter((p) => p.estado_gestion === "NUEVO").length,
    contactados: prospectos.filter((p) => p.estado_gestion === "CONTACTADO").length,
    negociacion: prospectos.filter((p) => p.estado_gestion === "EN NEGOCIACION").length,
    totalCompradores: compradores.length,
    compradoresActivos: compradores.filter((c) => c.estado_comprador === "Activo").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Cargando CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              CRM & Leads
            </h1>
            <p className="text-sm text-text-muted">
              Base de datos acumulada y gestión de negociaciones
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          <p className="text-xs text-text-muted">Vendedores</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.nuevos}</p>
          <p className="text-xs text-text-muted">Nuevos</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.contactados}</p>
          <p className="text-xs text-text-muted">Contactados</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.negociacion}</p>
          <p className="text-xs text-text-muted">En Negociación</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalCompradores}</p>
          <p className="text-xs text-text-muted">Compradores</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-success">{stats.compradoresActivos}</p>
          <p className="text-xs text-text-muted">Compr. Activos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("prospectos")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "prospectos"
              ? "bg-primary text-white"
              : "bg-surface-elevated text-text-muted hover:bg-surface-hover"
          }`}
        >
          Vendedores ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab("compradores")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "compradores"
              ? "bg-primary text-white"
              : "bg-surface-elevated text-text-muted hover:bg-surface-hover"
          }`}
        >
          Compradores ({stats.totalCompradores})
        </button>
      </div>

      {/* Filtros */}
      {activeTab === "prospectos" && (
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-4">
            <BarChart3 className="w-4 h-4 text-text-muted" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="select-field w-auto"
            >
              <option value="TODOS">Todos los estados</option>
              {ESTADOS_GESTION.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
            <span className="text-xs text-text-muted">
              {prospectosFiltrados.length} resultados
            </span>
          </div>
        </div>
      )}

      {/* Tabla de Prospectos */}
      {activeTab === "prospectos" && prospectosFiltrados.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Sin prospectos</h3>
          <p className="text-sm text-text-secondary">Ejecuta un rastreo en &quot;Rastreador&quot; para capturar leads.</p>
        </div>
      )}

      {activeTab === "prospectos" && prospectosFiltrados.length > 0 && (
        <div className="table-container overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Estado</th>
                <th>Rol</th>
                <th>Zona</th>
                <th>Precio</th>
                <th>Servicios</th>
                <th>Contacto</th>
                <th>Título</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prospectosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td className="text-text-muted font-mono text-xs">#{p.id}</td>
                  <td>
                    <span className={`badge ${
                      p.estado_gestion === "NUEVO" ? "badge-info" :
                      p.estado_gestion === "CONTACTADO" ? "badge-warning" :
                      p.estado_gestion === "EN NEGOCIACION" ? "badge-success" :
                      "badge-danger"
                    }`}>
                      {p.estado_gestion}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.rol.includes("VENDEDOR") ? "badge-warning" : "badge-info"}`}>
                      {p.rol}
                    </span>
                  </td>
                  <td className="text-xs text-text-secondary max-w-[120px] truncate">{p.zona}</td>
                  <td className="text-success font-semibold text-sm">
                    {p.precio_usd > 0 ? formatCurrency(p.precio_usd) : "-"}
                  </td>
                  <td className="text-xs text-text-muted">{p.servicios}</td>
                  <td className="text-xs">{p.telefono}</td>
                  <td className="text-xs text-text-secondary max-w-[150px] truncate">{p.titulo}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditandoImagenes(p.id); setNotasImagen(p.notas_imagenes || ""); }}
                        className={`p-1.5 rounded-lg hover:bg-surface-hover ${p.imagenes_urls?.length ? "text-primary" : "text-text-muted"}`}>
                        <Image className="w-3.5 h-3.5" />
                        {p.imagenes_urls?.length > 0 && (
                          <span className="text-[10px] ml-0.5">{p.imagenes_urls.length}</span>
                        )}
                      </button>
                      {p.whatsapp_link && (
                        <a href={p.whatsapp_link} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-surface-hover text-success">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {p.enlace && (
                        <a href={p.enlace} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-surface-hover text-blue-400">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => { setEditando(p.id); setNuevoEstado(p.estado_gestion); setNotaRapida(p.notas); }}
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla de Compradores */}
      {activeTab === "compradores" && (
        compradores.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Sin compradores</h3>
            <p className="text-sm text-text-secondary">Agrega compradores en la sección &quot;Compradores&quot;.</p>
          </div>
        ) : (
          <div className="table-container overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Ciudad</th>
                  <th>Tipo</th>
                  <th>Presupuesto</th>
                  <th>Habs</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {compradores.map((c) => (
                  <tr key={c.id}>
                    <td className="text-sm font-medium">{c.nombre}</td>
                    <td className="text-xs">{c.telefono}</td>
                    <td className="text-sm">{c.ciudad}</td>
                    <td><span className="badge badge-info">{c.tipo_propiedad}</span></td>
                    <td className="text-sm">${c.presupuesto_min?.toLocaleString()} - ${c.presupuesto_max?.toLocaleString()}</td>
                    <td className="text-sm">{c.habitaciones_min}-{c.habitaciones_max}</td>
                    <td>
                      <span className={`badge ${
                        c.estado_comprador === "Activo" ? "badge-success" :
                        c.estado_comprador === "En Negociación" ? "badge-warning" :
                        "bg-surface-elevated text-text-muted"
                      }`}>
                        {c.estado_comprador}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        c.prioridad === "Urgente" ? "badge-danger" :
                        c.prioridad === "Alta" ? "badge-warning" :
                        "bg-surface-elevated text-text-muted"
                      }`}>
                        {c.prioridad}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal de Edición */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Actualizar Prospecto #{editando}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-2 block">
                  Nuevo Estado
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="select-field"
                >
                  {ESTADOS_GESTION.map((est) => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-2 block">
                  Nota / Bitácora
                </label>
                <textarea
                  value={notaRapida}
                  onChange={(e) => setNotaRapida(e.target.value)}
                  placeholder="Ej. Ofreció 30k de contado..."
                  className="input-field min-h-[80px] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditando(null)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button onClick={() => actualizarEstado(editando)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Imágenes */}
      {editandoImagenes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Image className="w-5 h-5" />
                Imágenes de Referencia
              </h3>
              <button onClick={() => setEditandoImagenes(null)} className="p-2 rounded-lg hover:bg-surface-hover">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imágenes existentes */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(prospectos.find((p) => p.id === editandoImagenes)?.imagenes_urls || []).map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt={`Referencia ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border" />
                  <button onClick={() => eliminarImagen(editandoImagenes, idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-danger text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Agregar imagen */}
            <div className="flex gap-2 mb-4">
              <input type="url" value={nuevaImagenUrl} onChange={(e) => setNuevaImagenUrl(e.target.value)}
                placeholder="Pega URL de la imagen (www.ejemplo.com/foto.jpg)"
                className="input-field flex-1"
                onKeyDown={(e) => e.key === "Enter" && agregarImagen(editandoImagenes)} />
              <button onClick={() => agregarImagen(editandoImagenes)} disabled={!nuevaImagenUrl.trim()}
                className="btn-primary px-4">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Notas */}
            <div className="mb-4">
              <label className="text-xs text-text-muted mb-1 block">Notas sobre las imágenes</label>
              <textarea value={notasImagen} onChange={(e) => setNotasImagen(e.target.value)}
                placeholder="Ej. Fachada principal, piscina, vista del lote..."
                className="input-field w-full h-16 text-sm"
                onBlur={() => {
                  const p = prospectos.find((pp) => pp.id === editandoImagenes);
                  if (p) guardarImagenes(editandoImagenes, p.imagenes_urls || [], notasImagen);
                }} />
            </div>

            {/* Ayuda */}
            <div className="bg-surface-elevated rounded-lg p-3 text-xs text-text-muted">
              <p className="font-medium mb-1">Cómo agregar imágenes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Busca la propiedad en Google Images</li>
                <li>Copia la URL de la imagen (clic derecho → Copiar dirección de imagen)</li>
                <li>Pega la URL aquí y presiona +</li>
                <li>O busca en: Metrocuadrado, Oportunia, Facebook Marketplace</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
