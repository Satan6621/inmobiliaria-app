"use client";

import { MetricCard } from "@/components/metric-card";
import { Search, Users, Home, Calculator, FileText, MessageSquare, TrendingUp, ArrowRight, BarChart3, Scale, Brain, Map } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Rastreador de Mercado",
    description: "Automatiza la busqueda de propiedades con inteligencia artificial y scraping web.",
    href: "/rastreador",
    icon: Search,
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-600",
  },
  {
    title: "Búsqueda AI",
    description: "Gemini analiza y estructura propiedades automáticamente del web.",
    href: "/rastreador",
    icon: Brain,
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-600",
  },
  {
    title: "CRM & Leads",
    description: "Gestiona tus prospectos, actualiza estados de negociacion y seguimiento.",
    href: "/crm",
    icon: Users,
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-600",
  },
  {
    title: "Inventario & Marketing",
    description: "Administra tu cartera de inmuebles, fotos y copies para todas las plataformas.",
    href: "/inventario",
    icon: Home,
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-600",
  },
  {
    title: "Analytics Dashboard",
    description: "Gráficos de tendencias, distribución de propiedades y métricas CRM.",
    href: "/analytics",
    icon: BarChart3,
    color: "from-indigo-500/20 to-indigo-600/5",
    iconColor: "text-indigo-600",
  },
  {
    title: "Comparador",
    description: "Compara hasta 4 propiedades lado a lado con especificaciones detalladas.",
    href: "/comparar",
    icon: Scale,
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-600",
  },
  {
    title: "Finanzas & ROI",
    description: "Calcula gastos SAREN, retorno de inversion y frases para inversionistas.",
    href: "/finanzas",
    icon: Calculator,
    color: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-600",
  },
  {
    title: "Generador de Contratos",
    description: "Genera autorizaciones de venta y cartas de intencion automaticamente.",
    href: "/contratos",
    icon: FileText,
    color: "from-pink-500/20 to-pink-600/5",
    iconColor: "text-pink-600",
  },
  {
    title: "Guiones de Cierre",
    description: "Scripts de persuasion y manejo de objeciones para cerrar ventas.",
    href: "/guiones",
    icon: MessageSquare,
    color: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-600",
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
            Plataforma Integral v2.0
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] mb-4">
          <span className="text-primary">Venezuela</span>{" "}
          <span className="text-text-primary">Inmobiliaria</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Wholesaling, inversión y comercialización de bienes raíces con inteligencia artificial.
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
          title="AI Integrada"
          value="Gemini"
          subtitle="Búsqueda inteligente"
          icon={Brain}
          color="accent"
        />
        <MetricCard
          title="Herramientas"
          value="9"
          subtitle="Funcionalidades"
          icon={Search}
          color="success"
        />
        <MetricCard
          title="Marketing"
          value="Multi"
          subtitle="Plataformas"
          icon={MessageSquare}
          color="info"
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
              key={i}
              href={feature.href}
              className="glass-card p-6 group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
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
      <div className="text-center py-8 border-t border-border">
        <p className="text-xs text-text-muted">
          Venezuela Inmobiliaria v2.0 &copy; {new Date().getFullYear()} — Con AI, Maps y más
        </p>
      </div>
    </div>
  );
}
