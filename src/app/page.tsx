"use client";

import { MetricCard } from "@/components/metric-card";
import { Search, Users, Home, Calculator, FileText, MessageSquare, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Rastreador de Mercado",
    description: "Automatiza la busqueda de propiedades en Facebook, Telegram e Instagram con inteligencia de filtrado.",
    href: "/rastreador",
    icon: Search,
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    title: "CRM & Leads",
    description: "Gestiona tus prospectos, actualiza estados de negociacion y mantén un seguimiento organizado.",
    href: "/crm",
    icon: Users,
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
  {
    title: "Inventario & Marketing",
    description: "Administra tu cartera de inmuebles y genera copies profesionales para todas las plataformas.",
    href: "/inventario",
    icon: Home,
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
  },
  {
    title: "Finanzas & ROI",
    description: "Calcula gastos de registro SAREN, retorno de inversion y genera frases para inversionistas.",
    href: "/finanzas",
    icon: Calculator,
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-400",
  },
  {
    title: "Generador de Contratos",
    description: "Genera autorizaciones de venta y cartas de intencion con datos automaticos.",
    href: "/contratos",
    icon: FileText,
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
  },
  {
    title: "Guiones de Cierre",
    description: "Scripts de persuasion y manejo de objeciones para propietarios y compradores.",
    href: "/guiones",
    icon: MessageSquare,
    color: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-400",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
          <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase">
            Plataforma Integral
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] mb-4">
          <span className="gold-gradient">Venezuela</span>{" "}
          <span className="text-text-primary">Inmobiliaria</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Wholesaling, inversión y comercialización de bienes raíces. 
          Todo lo que necesitas para dominar el mercado inmobiliario venezolano.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <MetricCard
          title="Zonas Activas"
          value="8"
          subtitle="Estados de Venezuela"
          icon={TrendingUp}
          color="primary"
        />
        <MetricCard
          title="Plataformas"
          value="6+"
          subtitle="Canales de difusión"
          icon={Search}
          color="info"
        />
        <MetricCard
          title="Tipo de Documentos"
          value="2"
          subtitle="Contratos automáticos"
          icon={FileText}
          color="accent"
        />
        <MetricCard
          title="Guiones"
          value="3+"
          subtitle="Scripts de cierre"
          icon={MessageSquare}
          color="success"
        />
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-6 font-[family-name:var(--font-display)]">
          Herramientas Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="glass-card p-6 group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                {feature.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Abrir</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-border-subtle">
        <p className="text-xs text-text-muted">
          Plataforma Integral de Wholesaling & Bienes Raíces Venezuela &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
