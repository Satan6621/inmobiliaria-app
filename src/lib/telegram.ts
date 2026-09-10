import { DEFAULT_BOT_TOKEN, DEFAULT_CHAT_ID } from "@/lib/constants";

const botToken = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;

type LeadInfo = {
  tipo: string;
  nombre: string;
  telefono: string;
  estado?: string;
  zona?: string;
  tipoInmueble?: string;
  precio?: number | null;
  descripcion?: string;
  extra?: string;
};

export async function notificarLeadTelegram(info: LeadInfo) {
  if (!botToken || !chatId) return false;
  const lineas = [];
  if (info.tipo === "promovida") {
    lineas.push("Solicitud PROMOVIDA a propiedad publica");
  } else {
    lineas.push(`NUEVO LEAD (${info.tipo === "vender" ? "quiere vender" : "quiere comprar"})`);
  }
  lineas.push(`Nombre: ${info.nombre}`);
  lineas.push(`Telefono: ${info.telefono}`);
  if (info.zona || info.estado) lineas.push(`Ubicacion: ${[info.zona, info.estado].filter(Boolean).join(", ")}`);
  if (info.tipoInmueble) lineas.push(`Tipo: ${info.tipoInmueble}`);
  if (info.precio) lineas.push(`Precio/presupuesto: $${Number(info.precio).toLocaleString("es-VE")}`);
  if (info.descripcion?.trim()) lineas.push(`Detalle: ${info.descripcion.trim().slice(0, 200)}`);
  if (info.extra) lineas.push(info.extra);

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lineas.join("\n") }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}