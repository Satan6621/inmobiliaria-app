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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/rastreador", label: "Rastreador", icon: Search, color: "text-blue-400" },
  { href: "/crm", label: "CRM & Leads", icon: Users, color: "text-emerald-400" },
  { href: "/inventario", label: "Inventario", icon: Home, color: "text-amber-400" },
  { href: "/finanzas", label: "Finanzas", icon: Calculator, color: "text-cyan-400" },
  { href: "/contratos", label: "Contratos", icon: FileText, color: "text-purple-400" },
  { href: "/guiones", label: "Guiones", icon: MessageSquare, color: "text-rose-400" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-border-subtle bg-surface transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border-subtle">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
          <Building2 className="w-5 h-5 text-primary" />
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
      <nav className="flex-1 py-4 px-3 space-y-1">
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
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary pulse-gold" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 pb-4">
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
