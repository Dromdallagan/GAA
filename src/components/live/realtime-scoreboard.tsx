"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";

interface LiveFixture {
  id: string;
  scheduled_at: string;
  status: string | null;
  home_score_goals: number | null;
  home_score_points: number | null;
  away_score_goals: number | null;
  away_score_points: number | null;
  home_team: string;
  away_team: string;
  competition: string;
  venue: string;
}

interface MatchEvent {
  id: string;
  fixture_id: string;
  event_type: string;
  team: string;
  player_name: string | null;
  minute: number | null;
  created_at: string | null;
}

function formatScore(goals: number | null, points: number | null): string {
  return `${goals ?? 0}-${String(points ?? 0).padStart(2, "0")}`;
}

function totalScore(goals: number | null, points: number | null): number {
  return (goals ?? 0) * 3 + (points ?? 0);
}

export function RealtimeScoreboard({ initialFixtures }: { initialFixtures: LiveFixture[] }) {
  const [fixtures, setFixtures] = useState<LiveFixture[]>(initialFixtures);
  const [events, setEvents] = useState<MatchEvent[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to fixture score changes
    const fixtureChannel = supabase
      .channel("live-fixtures")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fixtures",
          filter: "status=in.(live,completed)",
        },
        (payload) => {
          const updated = payload.new as Record<string, unknown>;
          setFixtures((prev) =>
            prev.map((f) =>
              f.id === updated.id
                ? {
                    ...f,
                    home_score_goals: updated.home_score_goals as number | null,
                    home_score_points: updated.home_score_points as number | null,
                    away_score_goals: updated.away_score_goals as number | null,
                    away_score_points: updated.away_score_points as number | null,
                    status: updated.status as string | null,
                  }
                : f
            )
          );
        }
      )
      .subscribe();

    // Subscribe to new match events
    const eventsChannel = supabase
      .channel("live-events")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_events",
        },
        (payload) => {
          const newEvent = payload.new as MatchEvent;
          setEvents((prev) => [newEvent, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(fixtureChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  const live = fixtures.filter((f) => f.status === "live");
  const completed = fixtures.filter((f) => f.status === "completed");

  return (
    <div className="space-y-6">
      {live.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Radio className="h-4 w-4 text-red-400 animate-pulse" /> Live
          </h2>
          <div className="grid gap-3">
            {live.map((f) => (
              <ScoreCard key={f.id} fixture={f} isLive />
            ))}
          </div>
        </div>
      )}

      {/* Recent events ticker */}
      {events.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Latest Events</h2>
          <div className="space-y-1.5">
            {events.slice(0, 8).map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-2 rounded-lg bg-card border border-border/50 px-3 py-2 text-xs"
              >
                <Badge
                  className={
                    e.event_type === "goal"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]"
                      : e.event_type === "point"
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/20 text-[10px]"
                        : "text-[10px]"
                  }
                  variant="secondary"
                >
                  {e.event_type}
                </Badge>
                <span className="text-muted-foreground capitalize">{e.team}</span>
                {e.player_name && <span className="font-medium">{e.player_name}</span>}
                {e.minute != null && <span className="text-muted-foreground">{e.minute}&apos;</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recent Results</h2>
          <div className="grid gap-3">
            {completed.map((f) => (
              <ScoreCard key={f.id} fixture={f} />
            ))}
          </div>
        </div>
      )}

      {live.length === 0 && completed.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No live matches or recent results.
        </p>
      )}
    </div>
  );
}

function ScoreCard({ fixture, isLive }: { fixture: LiveFixture; isLive?: boolean }) {
  const homeScore = formatScore(fixture.home_score_goals, fixture.home_score_points);
  const awayScore = formatScore(fixture.away_score_goals, fixture.away_score_points);

  return (
    <Card className={isLive ? "border-red-500/30" : ""}>
      <CardContent className="p-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{fixture.home_team}</span>
            <span className="text-lg font-bold tabular-nums">
              {homeScore}
              <span className="ml-1 text-xs text-muted-foreground">
                ({totalScore(fixture.home_score_goals, fixture.home_score_points)})
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{fixture.away_team}</span>
            <span className="text-lg font-bold tabular-nums">
              {awayScore}
              <span className="ml-1 text-xs text-muted-foreground">
                ({totalScore(fixture.away_score_goals, fixture.away_score_points)})
              </span>
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {isLive && (
            <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[10px]">LIVE</Badge>
          )}
          {fixture.competition && <span>{fixture.competition}</span>}
          {fixture.venue && <span>— {fixture.venue}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
