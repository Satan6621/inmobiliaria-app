"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Users,
  Home,
  Calculator,
  FileText,
  MessageSquare,
  Building2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Map,
  Scale,
  Upload,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/rastreador", label: "Rastreador", icon: Search, color: "text-blue-600" },
  { href: "/crm", label: "CRM & Leads", icon: Users, color: "text-emerald-600" },
  { href: "/inventario", label: "Inventario", icon: Home, color: "text-amber-600" },
  { href: "/compradores", label: "Compradores", icon: Users, color: "text-success" },
  { href: "/social", label: "Redes Sociales", icon: Share2, color: "text-pink-600" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "text-purple-600" },
  { href: "/comparar", label: "Comparar", icon: Scale, color: "text-cyan-600" },
  { href: "/finanzas", label: "Finanzas", icon: Calculator, color: "text-indigo-600" },
  { href: "/contratos", label: "Contratos", icon: FileText, color: "text-rose-600" },
  { href: "/guiones", label: "Guiones", icon: MessageSquare, color: "text-pink-600" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-border bg-surface-elevated transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold font-[family-name:var(--font-display)] tracking-wide text-primary">
              VENEZUELA
            </h1>
            <p className="text-[10px] text-text-muted tracking-widest uppercase">
              Inmobiliaria
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? item.color : "text-text-muted group-hover:text-text-primary"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary pulse-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors text-xs"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  );
}
