"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldAlert,
  TrendingUp,
  FileText,
  Calendar,
  Bot,
  type LucideIcon,
} from "lucide-react";

export interface AgentAlert {
  id: string;
  agent: string;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
}

const AGENT_ICONS: Record<string, LucideIcon> = {
  "Registration Guardian": ShieldAlert,
  "Revenue Sentinel": TrendingUp,
  "Content Engine": FileText,
  "Fixture Intelligence": Calendar,
};

const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-info/10 text-info border-info/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const SEVERITY_BADGE_STYLES: Record<string, string> = {
  info: "border-info/30 text-info",
  warning: "border-warning/30 text-warning",
  critical: "border-destructive/30 text-destructive",
};

function AlertItem({ alert }: { alert: AgentAlert }) {
  const Icon = AGENT_ICONS[alert.agent] ?? Bot;

  return (
    <div className="flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
          SEVERITY_STYLES[alert.severity]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{alert.agent}</span>
          <Badge
            variant="outline"
            className={cn(
              "h-4 px-1 text-[10px] font-medium",
              SEVERITY_BADGE_STYLES[alert.severity]
            )}
          >
            {alert.severity}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {alert.message}
        </p>
        <span className="mt-1 block text-[10px] text-muted-foreground/60">
          {alert.timestamp}
        </span>
      </div>
    </div>
  );
}

interface AgentAlertsProps {
  alerts: AgentAlert[];
  className?: string;
}

export function AgentAlerts({ alerts, className }: AgentAlertsProps) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Agent Activity</h3>
        <span className="text-[10px] text-muted-foreground">
          {alerts.length} alerts
        </span>
      </div>
      <ScrollArea className="-mx-2 flex-1">
        <div className="space-y-0.5 px-2">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
