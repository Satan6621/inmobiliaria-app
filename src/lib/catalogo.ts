import { supabase } from "./supabase";
import { buildWhatsAppLink, WHATSAPP_COJEDES } from "./constants";

export interface ImagenPropiedad {
  url_imagen: string;
  es_principal: boolean;
}

export interface PropiedadPublica {
  id: string;
  codigo: string | null;
  titulo: string;
  descripcion: string;
  tipo_inmueble: string;
  precio: number;
  habitaciones: number;
  banos: number;
  metros_cuadrados: number;
  direccion_completa: string;
  telefono_agente: string;
  nombre_agente: string;
  tiene_tanque_agua: boolean;
  tiene_planta_electrica: boolean;
  aire_acondicionado: boolean;
  internet: boolean;
  piscina: boolean;
  garaje: boolean;
  esta_verificado: boolean;
  created_at: string;
  estado?: { nombre: string } | null;
  municipio?: { nombre: string } | null;
  imagenes?: ImagenPropiedad[];
}

export const SELECT_PUBLICO =
  "id, codigo, titulo, descripcion, tipo_inmueble, precio, habitaciones, banos, " +
  "metros_cuadrados, direccion_completa, telefono_agente, nombre_agente, " +
  "tiene_tanque_agua, tiene_planta_electrica, aire_acondicionado, internet, piscina, garaje, " +
  "esta_verificado, created_at, estado:estados(nombre), municipio:municipios(nombre), " +
  "imagenes:propiedades_imagenes(url_imagen, es_principal)";

const NO_DISPONIBLES = "(PAUSADO,VENDIDO)";

export interface FiltrosCatalogo {
  tipo?: string;
  q?: string;
  estado?: string;
  min?: number;
  max?: number;
  orden?: string;
}

export async function listarPropiedadesPublicas(filtros: FiltrosCatalogo = {}): Promise<PropiedadPublica[]> {
  let query = supabase
    .from("propiedades")
    .select(SELECT_PUBLICO)
    .not("estatus", "in", NO_DISPONIBLES)
    .limit(500);

  const { data } = await query;
  const todas = (data as unknown as PropiedadPublica[]) || [];

  const termino = (filtros.q || "").trim().toLowerCase();
  let resultado = todas.filter((p) => {
    if (filtros.tipo && p.tipo_inmueble !== filtros.tipo) return false;
    if (filtros.estado && p.estado?.nombre !== filtros.estado) return false;
    if (filtros.min && p.precio < filtros.min) return false;
    if (filtros.max && p.precio > filtros.max) return false;
    if (termino) {
      const texto = [
        p.titulo, p.descripcion, p.direccion_completa, p.codigo,
        p.estado?.nombre, p.municipio?.nombre,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!texto.includes(termino)) return false;
    }
    return true;
  });

  if (filtros.orden === "baratas") resultado.sort((a, b) => a.precio - b.precio);
  else if (filtros.orden === "caras") resultado.sort((a, b) => b.precio - a.precio);
  else resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return resultado;
}

export async function obtenerPropiedadPublica(id: string): Promise<PropiedadPublica | null> {
  const { data } = await supabase
    .from("propiedades")
    .select(SELECT_PUBLICO)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as PropiedadPublica) || null;
}

export function imagenPrincipal(p: PropiedadPublica): string | undefined {
  return (
    p.imagenes?.find((i) => i.es_principal)?.url_imagen ||
    p.imagenes?.[0]?.url_imagen
  );
}

export function serviciosDe(p: PropiedadPublica): string[] {
  const s: string[] = [];
  if (p.tiene_tanque_agua) s.push("Tanque de agua");
  if (p.tiene_planta_electrica) s.push("Planta eléctrica");
  if (p.piscina) s.push("Piscina");
  if (p.aire_acondicionado) s.push("Aire acondicionado");
  if (p.internet) s.push("Internet/Fibra");
  if (p.garaje) s.push("Garaje");
  return s;
}

export function ubicacionDe(p: PropiedadPublica): string {
  return [p.municipio?.nombre, p.estado?.nombre, "Venezuela"].filter(Boolean).join(", ");
}

export function whatsappPropiedad(p: PropiedadPublica): string {
  const mensaje = `Hola, me interesa ${p.titulo || `la propiedad ${p.codigo || ""}`}` +
    `${p.codigo ? ` (#${p.codigo})` : ""}` +
    `${p.precio ? ` a $${p.precio.toLocaleString("es-VE")}` : ""}. ¿Sigue disponible?`;
  return buildWhatsAppLink(p.telefono_agente || WHATSAPP_COJEDES, mensaje);
}