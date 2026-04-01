"use client";

import { cn } from "@/lib/utils";

export interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  status: "live" | "ht" | "ft" | "upcoming";
  time: string;
  competition: string;
}

function parseGaaScore(score: string): number {
  const parts = score.split("-");
  const goals = parseInt(parts[0], 10) || 0;
  const points = parseInt(parts[1], 10) || 0;
  return goals * 3 + points;
}

const STATUS_LABELS: Record<string, string> = {
  ht: "Half Time",
  ft: "Full Time",
};

const STATUS_COLORS: Record<string, string> = {
  ht: "text-warning",
  ft: "text-muted-foreground",
  upcoming: "text-info",
};

function StatusBadge({ status, time }: { status: LiveMatch["status"]; time: string }) {
  if (status === "live") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="text-xs font-semibold text-primary">{time}</span>
      </div>
    );
  }

  return (
    <span className={cn("text-xs font-medium", STATUS_COLORS[status])}>
      {status === "upcoming" ? time : STATUS_LABELS[status]}
    </span>
  );
}

function MatchRow({ match }: { match: LiveMatch }) {
  const homeTotal = parseGaaScore(match.homeScore);
  const awayTotal = parseGaaScore(match.awayScore);
  const isLive = match.status === "live" || match.status === "ht";
  const homeWinning = isLive && homeTotal > awayTotal;
  const awayWinning = isLive && awayTotal > homeTotal;

  return (
    <div className="rounded-lg border border-border/30 bg-background/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {match.competition}
        </span>
        <StatusBadge status={match.status} time={match.time} />
      </div>
      <div className="space-y-1.5">
        {/* Home team */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-sm",
              homeWinning ? "font-semibold text-foreground" : "font-medium"
            )}
          >
            {match.homeTeam}
          </span>
          {match.status !== "upcoming" ? (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-mono text-sm font-bold tabular-nums",
                  homeWinning && "text-primary"
                )}
              >
                {match.homeScore}
              </span>
              <span className="w-6 text-right font-mono text-[10px] text-muted-foreground">
                ({homeTotal})
              </span>
            </div>
          ) : null}
        </div>
        {/* Away team */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-sm",
              awayWinning ? "font-semibold text-foreground" : "font-medium"
            )}
          >
            {match.awayTeam}
          </span>
          {match.status !== "upcoming" ? (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-mono text-sm font-bold tabular-nums",
                  awayWinning && "text-primary"
                )}
              >
                {match.awayScore}
              </span>
              <span className="w-6 text-right font-mono text-[10px] text-muted-foreground">
                ({awayTotal})
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface LiveScoresWidgetProps {
  matches: LiveMatch[];
  className?: string;
}

export function LiveScoresWidget({ matches, className }: LiveScoresWidgetProps) {
  const liveCount = matches.filter((m) => m.status === "live").length;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Live Scores</h3>
        {liveCount > 0 ? (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] font-semibold text-primary">
              {liveCount} LIVE
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-auto">
        {matches.length > 0 ? (
          matches.map((match) => <MatchRow key={match.id} match={match} />)
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No matches scheduled
          </div>
        )}
      </div>
    </div>
  );
}
