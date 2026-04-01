"use client";

import { useState, useTransition, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, X, Send, FileText, Newspaper, Share2, Megaphone } from "lucide-react";
import { approveContent, rejectContent, publishContent } from "./actions";

interface ContentItem {
  id: string;
  type: string;
  content: string | null;
  status: string | null;
  metadata: unknown;
  approved_at: string | null;
  published_at: string | null;
  created_at: string | null;
}

type StatusFilter = "all" | "draft" | "pending_approval" | "approved" | "published" | "rejected";

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending_approval" },
  { label: "Approved", value: "approved" },
  { label: "Published", value: "published" },
  { label: "Rejected", value: "rejected" },
];

function typeIcon(type: string) {
  switch (type) {
    case "match_report": return <Newspaper className="h-4 w-4" />;
    case "social_post": return <Share2 className="h-4 w-4" />;
    case "weekly_roundup": return <Megaphone className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
}

function statusColor(status: string | null): string {
  switch (status) {
    case "approved": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "published": return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    case "pending_approval": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "rejected": return "bg-red-500/15 text-red-400 border-red-500/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

export function ContentList({ items }: { items: ContentItem[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const i of items) {
      const s = i.status ?? "draft";
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [items]);

  function handleAction(action: (id: string) => Promise<{ error?: string }>, id: string) {
    setError(null);
    startTransition(async () => {
      const result = await action(id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Queue</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve AI-generated content before publishing.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      {/* Filters */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
            <span className="ml-1 tabular-nums text-[10px] opacity-60">{counts[f.value] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Content items */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No content items</p>
          <p className="text-xs text-muted-foreground">AI-generated content will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {typeIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium capitalize">
                          {item.type.replace(/_/g, " ")}
                        </span>
                        <Badge className={cn("text-[10px]", statusColor(item.status))}>
                          {(item.status ?? "draft").replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                        {item.content ?? "No content"}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/60">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 gap-1.5">
                    {(item.status === "pending_approval" || item.status === "draft") && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(approveContent, item.id)}
                          disabled={isPending}
                        >
                          <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(rejectContent, item.id)}
                          disabled={isPending}
                        >
                          <X className="mr-1 h-3.5 w-3.5 text-red-400" />
                          Reject
                        </Button>
                      </>
                    )}
                    {item.status === "approved" && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(publishContent, item.id)}
                        disabled={isPending}
                      >
                        <Send className="mr-1 h-3.5 w-3.5" />
                        Publish
                      </Button>
                    )}
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
