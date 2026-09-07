import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "danger" | "info" | "accent";
  trend?: { value: number; label: string };
}

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  success: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
  danger: { bg: "bg-danger/10", text: "text-danger", border: "border-danger/20" },
  info: { bg: "bg-info/10", text: "text-info", border: "border-info/20" },
  accent: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
};

export function MetricCard({ title, value, subtitle, icon: Icon, color = "primary", trend }: MetricCardProps) {
  const c = colorMap[color];

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium",
              trend.value >= 0 ? "text-success" : "text-danger"
            )}>
              <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className="text-text-muted">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl border", c.bg, c.border)}>
          <Icon className={cn("w-5 h-5", c.text)} />
        </div>
      </div>
    </div>
  );
}
