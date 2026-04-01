"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Trophy } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FixtureStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "postponed"
  | "cancelled";

type FilterTab = "all" | "scheduled" | "live" | "completed";

interface Fixture {
  id: string;
  scheduled_at: string;
  status: string | null;
  home_score_goals: number | null;
  home_score_points: number | null;
  away_score_goals: number | null;
  away_score_points: number | null;
  competition: { name: string; code: string } | null;
  home_team: { name: string; club_id: string | null } | null;
  away_team: { name: string; club_id: string | null } | null;
  venue: { name: string } | null;
}

interface FixturesListProps {
  fixtures: Fixture[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatGaaScore(goals: number | null, points: number | null): string {
  const g = goals ?? 0;
  const p = points ?? 0;
  const total = g * 3 + p;
  return `${g}-${String(p).padStart(2, "0")} (${total})`;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: FixtureStatus) {
  switch (status) {
    case "scheduled":
      return {
        label: "Scheduled",
        className: "bg-blue-500/15 text-blue-400 border-blue-500/25",
      };
    case "live":
      return {
        label: "Live",
        className: "bg-red-500/15 text-red-400 border-red-500/25 animate-pulse",
      };
    case "completed":
      return {
        label: "Completed",
        className:
          "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/25",
      };
    case "postponed":
      return {
        label: "Postponed",
        className: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-red-500/15 text-red-400 border-red-500/25",
      };
  }
}

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FixturesList({ fixtures }: FixturesListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered =
    activeTab === "all"
      ? fixtures
      : fixtures.filter((f) => f.status === activeTab);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fixtures</h1>
        <p className="text-sm text-muted-foreground">
          View and track all matches across your county.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg border border-border/50 bg-card p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fixtures List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-16">
          <Trophy className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            No fixtures found
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {activeTab === "all"
              ? "There are no fixtures to display yet."
              : `No ${activeTab} fixtures at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((fixture) => {
            const status = (fixture.status ?? "scheduled") as FixtureStatus;
            const badge = getStatusBadge(status);
            const isScored = status === "completed" || status === "live";

            return (
              <div
                key={fixture.id}
                className="rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:border-border/80"
              >
                {/* Top row: competition + status */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {fixture.competition?.name ?? "Unknown Competition"}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", badge.className)}
                  >
                    {badge.label}
                  </Badge>
                </div>

                {/* Match: Home vs Away */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 text-right">
                    <p className="truncate text-sm font-semibold">
                      {fixture.home_team?.name ?? "TBC"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-center">
                    {isScored ? (
                      <>
                        <div className="flex items-center gap-2 text-xs font-bold tabular-nums">
                          <span>
                            {formatGaaScore(
                              fixture.home_score_goals,
                              fixture.home_score_points
                            )}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span>
                            {formatGaaScore(
                              fixture.away_score_goals,
                              fixture.away_score_points
                            )}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        vs
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {fixture.away_team?.name ?? "TBC"}
                    </p>
                  </div>
                </div>

                {/* Bottom row: date + venue */}
                <div className="mt-3 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    <span>{formatDateTime(fixture.scheduled_at)}</span>
                  </div>
                  {fixture.venue ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{fixture.venue.name}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
