"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bot,
  ShieldAlert,
  DollarSign,
  Calendar,
  Users,
  Newspaper,
  Brain,
} from "lucide-react";

interface AgentRun {
  id: string;
  agent_type: string;
  status: string | null;
  findings: unknown;
  actions_taken: unknown[] | null;
  ran_at: string | null;
  next_run_at: string | null;
  created_at: string | null;
}

function agentIcon(type: string) {
  switch (type) {
    case "registration_guardian": return <ShieldAlert className="h-4 w-4" />;
    case "revenue_sentinel": return <DollarSign className="h-4 w-4" />;
    case "fixture_intelligence": return <Calendar className="h-4 w-4" />;
    case "member_retention": return <Users className="h-4 w-4" />;
    case "content_engine": return <Newspaper className="h-4 w-4" />;
    case "smart_scheduler": return <Brain className="h-4 w-4" />;
    default: return <Bot className="h-4 w-4" />;
  }
}

function agentLabel(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function statusColor(status: string | null): string {
  switch (status) {
    case "completed": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "running": return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    case "failed": return "bg-red-500/15 text-red-400 border-red-500/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

function summarizeFindings(findings: unknown): string {
  if (!findings || typeof findings !== "object") return "No findings";
  const obj = findings as Record<string, unknown>;
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key === "action" || key === "fixture_ids") continue;
    const label = key.replace(/_/g, " ");
    parts.push(`${label}: ${value}`);
  }
  return parts.join(" · ") || "No findings";
}

export function AgentHistory({ runs }: { runs: AgentRun[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
        <p className="text-sm text-muted-foreground">
          Activity log of automated AI agents running for your organisation.
        </p>
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bot className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No agent activity yet</p>
          <p className="text-xs text-muted-foreground">
            Agents will automatically run on schedule and their activity will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <Card key={run.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {agentIcon(run.agent_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{agentLabel(run.agent_type)}</span>
                      <Badge className={cn("text-[10px]", statusColor(run.status))}>
                        {run.status ?? "unknown"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {summarizeFindings(run.findings)}
                    </p>
                    {run.actions_taken && run.actions_taken.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {run.actions_taken.map((action, i) => {
                          const a = action as Record<string, unknown> | null;
                          return (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {(a?.action as string) ?? "action"}: {String(a?.count ?? 0)}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground/60">
                      {run.ran_at
                        ? new Date(run.ran_at).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
