"use client";

import { useState } from "react";
import { Share2, Camera, Briefcase, Send, Copy, Check, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Property {
  titulo: string;
  tipo: string;
  ciudad: string;
  urbanizacion: string;
  estado: string;
  precio_venta: number;
  habs: number;
  banos: number;
  puestos: number;
  metros: number;
  servicios: string;
  descripcion: string;
}

interface AudienceSegment {
  id: string;
  label: string;
  icon: string;
  tone: string;
  hashtags: string[];
}

const AUDIENCE_SEGMENTS: AudienceSegment[] = [
  {
    id: "primera-vivienda",
    label: "Primera Vivienda",
    icon: "🏠",
    tone: "Cercano, emotivo, enfocado en lograr el sueño de tener casa propia",
    hashtags: ["#PrimeraVivienda", "#CasaPropia", "#InmueblesVenezuela", "#SueñoCumplido"],
  },
  {
    id: "inversionistas",
    label: "Inversionistas",
    icon: "💰",
    tone: "Profesional, datos concretos, ROI y rentabilidad",
    hashtags: ["#InversiónInmobiliaria", "#ROI", "#InversiónVenezuela", "#Rentabilidad"],
  },
  {
    id: "familias",
    label: "Familias",
    icon: "👨‍👩‍👧‍👦",
    tone: "Cálido, seguridad, espacios para vivir en familia",
    hashtags: ["#HogarFamiliar", "#CasaEnVenta", "#Familia", "#Seguridad"],
  },
  {
    id: "lujo",
    label: "Propiedades de Lujo",
    icon: "✨",
    tone: "Exclusivo, elegante, lifestyle premium",
    hashtags: ["#LujoInmobiliario", "#Exclusivo", "#Premium", "#AltoValor"],
  },
];

function generateInstagramContent(prop: Property, audience: AudienceSegment): string {
  const precioM2 = prop.metros > 0 ? Math.round(prop.precio_venta / prop.metros) : 0;
  const ciudadTag = prop.ciudad.replace(/\s/g, "");

  const templates: Record<string, string> = {
    "primera-vivienda": `🏠✨ ¡TU PRIMERA VIVIENDA TE ESPERA!

📍 ${prop.urbanizacion}, ${prop.ciudad}

¿Sueñas con tener tu propio hogar? Esta propiedad es perfecta para dar ese gran paso:

📐 ${prop.metros} m² de construcción
🛏 ${prop.habs} Habitaciones para toda la familia
🚿 ${prop.banos} Baños
🚗 ${prop.puestos} Puestos de estacionamiento
⚡ ${prop.servicios}

💰 Inversión: $${prop.precio_venta.toLocaleString()} USD
(¡A ${precioM2}/m²!)

📥 Escríbenos al DM para agendar tu visita
📲 Link en bio para más opciones

${audience.hashtags.join(" ")} #Inmuebles${ciudadTag}`,

    "inversionistas": `💎 OPORTUNIDAD DE INVERSIÓN INMOBILIARIA

📍 ${prop.urbanizacion}, ${prop.ciudad}

📊 Datos de la inversión:
• Precio: $${prop.precio_venta.toLocaleString()} USD
• Área: ${prop.metros} m² (${precioM2}/m²)
• Tipo: ${prop.tipo}
• Servicios: ${prop.servicios}

💡 Potencial de renta estimada: $${Math.round(prop.precio_venta * 0.006).toLocaleString()}/mes
📈 Retorno estimado: ${(100 / (prop.precio_venta * 0.006 * 12) * 100).toFixed(1)}% anual

¿Interesado? DM o link en bio.

${audience.hashtags.join(" ")}`,

    "familias": `👨‍👩‍👧‍👦 tu hogar ideal te está esperando

📍 ${prop.urbanizacion}, ${prop.ciudad}

Un espacio diseñado para vivir moments especiales en familia:

🏠 ${prop.habs} habitaciones (¡espacio para todos!)
🚿 ${prop.banos} baños
🚗 ${prop.puestos} puestos de estacionamiento
📐 ${prop.metros} m²
⚡ ${prop.servicios}

💵 $${prop.precio_venta.toLocaleString()} USD

¿Quieres conocerla? Escríbenos al DM
📲 Visitas coordinadas

${audience.hashtags.join(" ")} #HogarFamilia #Inmuebles${ciudadTag}`,

    "lujo": `✨ EXCLUSIVIDAD INMOBILIARIA

📍 ${prop.urbanizacion}, ${prop.ciudad}

Una propiedad que refleja tu nivel de vida:

🏡 ${prop.tipo} de ${prop.metros} m²
🛏 ${prop.habs} suites con baño privado
🚿 ${prop.banos} baños de diseño
🚗 ${prop.puestos} garaje techado
⚡ ${prop.servicios}

💎 $${prop.precio_venta.toLocaleString()} USD

Visitas exclusivas con cita previa.
📲 DM para información privilegiada

${audience.hashtags.join(" ")} #LujoVenezuela #Exclusividad`,
  };

  return templates[audience.id] || templates["primera-vivienda"];
}

function generateTikTokContent(prop: Property, audience: AudienceSegment): string {
  return `🎬 GUION PARA TIKTOK - ${prop.tipo} en ${prop.ciudad}

[HOOK - 3 seg]
"¿Buscas ${prop.tipo.toLowerCase()} en ${prop.ciudad}? Mira esta opción..."

[DESCRIBIR - 10 seg]
"Ubicada en ${prop.urbanizacion}, tiene ${prop.metros}m², ${prop.habs} habitaciones, ${prop.banos} baños y ${prop.servicios}"

[PRECIO - 5 seg]
"¿El precio? Solo $${prop.precio_venta.toLocaleString()} USD"

[CTA - 3 seg]
"¿Te interesa? Comenta 'INFO' y te enviamos los detalles"

HASHTAGS: #Inmuebles${prop.ciudad.replace(/\s/g, "")} #PropiedadesEnVenta #RealEstate #InversiónInmobiliaria ${audience.hashtags.join(" ")}`;
}

function generateLinkedInContent(prop: Property, audience: AudienceSegment): string {
  const precioM2 = prop.metros > 0 ? Math.round(prop.precio_venta / prop.metros) : 0;

  return `📊 Análisis de Oportunidad Inmobiliaria | ${prop.ciudad}

El mercado inmobiliario en ${prop.ciudad} sigue ofreciendo oportunidades interesantes para inversores y compradores estratégicos.

📍 Ubicación: ${prop.urbanizacion}, ${prop.ciudad}
📐 Área: ${prop.metros} m² (${precioM2}/m²)
🏷 Tipo: ${prop.tipo}
⚡ Servicios: ${prop.servicios}

💡 Datos clave del mercado:
• Zona con alta demanda residencial
• Acceso a servicios básicos garantizados
• Potencial de plusvalía a mediano plazo

El precio de $${prop.precio_venta.toLocaleString()} USD representa una oportunidad competitiva para el segmento.

¿Interesado en análisis similares? Conectemos.

#InversiónInmobiliaria #MercadoInmobiliario #Venezuela #RealEstate #OportunidadDeInversión`;
}

function generateTelegramContent(prop: Property): string {
  return `🏢 *NUEVA PROPIEDAD DISPONIBLE*

📍 *${prop.urbanizacion}, ${prop.ciudad}* (${prop.estado})

📐 ${prop.metros} m² | ${prop.tipo}
🛏 ${prop.habs} Habitaciones | ${prop.banos} Baños | ${prop.puestos} Estac.
⚡ ${prop.servicios}

📝 ${prop.descripcion || "Excelente propiedad disponible para venta directa."}

💵 *$${prop.precio_venta.toLocaleString()} USD*

📲 Para más información, escribir al privado.`;
}

interface SocialMediaGeneratorProps {
  property: Property;
}

export function SocialMediaGenerator({ property }: SocialMediaGeneratorProps) {
  const [selectedAudience, setSelectedAudience] = useState(AUDIENCE_SEGMENTS[0]);
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [copied, setCopied] = useState(false);

  const getContent = () => {
    switch (activePlatform) {
      case "instagram": return generateInstagramContent(property, selectedAudience);
      case "tiktok": return generateTikTokContent(property, selectedAudience);
      case "linkedin": return generateLinkedInContent(property, selectedAudience);
      case "telegram": return generateTelegramContent(property);
      default: return "";
    }
  };

  const content = getContent();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToPlatform = () => {
    const text = encodeURIComponent(content.substring(0, 2000));
    const urls: Record<string, string> = {
      instagram: `https://www.instagram.com/`,
      tiktok: `https://www.tiktok.com/`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://tu-sitio.com&summary=${text}`,
      telegram: `https://t.me/share/url?text=${text}`,
    };
    window.open(urls[activePlatform], "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Platform Selector */}
      <div className="flex gap-2">
        {[
          { id: "instagram", label: "Instagram", icon: "📸", color: "from-pink-500 to-purple-500" },
          { id: "tiktok", label: "TikTok", icon: "🎵", color: "from-black to-gray-800" },
          { id: "linkedin", label: "LinkedIn", icon: "💼", color: "from-blue-600 to-blue-800" },
          { id: "telegram", label: "Telegram", icon: "✈️", color: "from-blue-400 to-blue-600" },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePlatform(p.id)}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-medium transition-all ${
              activePlatform === p.id
                ? `bg-gradient-to-r ${p.color} text-white shadow-lg`
                : "bg-surface text-text-muted border border-border hover:border-border"
            }`}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Audience Selector */}
      <div>
        <label className="text-xs font-medium text-text-secondary mb-2 block flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Audiencia Objetivo
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {AUDIENCE_SEGMENTS.map((seg) => (
            <button
              key={seg.id}
              onClick={() => setSelectedAudience(seg)}
              className={`text-xs py-2 px-3 rounded-lg transition-all border ${
                selectedAudience.id === seg.id
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-surface text-text-muted border-border"
              }`}
            >
              <span className="mr-1">{seg.icon}</span>
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Content */}
      <div className="relative">
        <pre className="bg-surface rounded-xl p-4 text-sm text-text-secondary overflow-x-auto max-h-[300px] whitespace-pre-wrap font-[family-name:var(--font-mono)] border border-border">
          {content}
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-text-muted transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button onClick={shareToPlatform} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          Publicar en {activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}
        </button>
        <button onClick={copyToClipboard} className="btn-secondary flex items-center gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          Copiar
        </button>
      </div>
    </div>
  );
}
