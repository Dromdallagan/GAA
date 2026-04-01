import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Radio } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Scores | ClubOS",
};

export const revalidate = 30; // ISR: revalidate every 30s

export default async function PublicLivePage() {
  const supabase = createAdminClient();

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      id, scheduled_at, status,
      home_score_goals, home_score_points,
      away_score_goals, away_score_points,
      teams!fixtures_home_team_id_fkey ( name ),
      away:teams!fixtures_away_team_id_fkey ( name ),
      competitions ( name ),
      venues ( name )
    `)
    .in("status", ["live", "completed"])
    .order("scheduled_at", { ascending: false })
    .limit(20);

  const live = (fixtures ?? []).filter((f) => f.status === "live");
  const completed = (fixtures ?? []).filter((f) => f.status === "completed");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Live Scores</h1>

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

      {!fixtures?.length && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No live matches or recent results.
        </p>
      )}
    </div>
  );
}

function ScoreCard({ fixture, isLive }: { fixture: Record<string, unknown>; isLive?: boolean }) {
  const f = fixture as {
    id: string;
    scheduled_at: string;
    home_score_goals: number | null;
    home_score_points: number | null;
    away_score_goals: number | null;
    away_score_points: number | null;
    teams: { name: string } | null;
    away: { name: string } | null;
    competitions: { name: string } | null;
    venues: { name: string } | null;
  };

  const homeScore = `${f.home_score_goals ?? 0}-${String(f.home_score_points ?? 0).padStart(2, "0")}`;
  const awayScore = `${f.away_score_goals ?? 0}-${String(f.away_score_points ?? 0).padStart(2, "0")}`;
  const homeTotal = (f.home_score_goals ?? 0) * 3 + (f.home_score_points ?? 0);
  const awayTotal = (f.away_score_goals ?? 0) * 3 + (f.away_score_points ?? 0);

  return (
    <Card className={isLive ? "border-red-500/30" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{f.teams?.name ?? "Home"}</span>
              <span className="text-lg font-bold tabular-nums">
                {homeScore}
                <span className="ml-1 text-xs text-muted-foreground">({homeTotal})</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{f.away?.name ?? "Away"}</span>
              <span className="text-lg font-bold tabular-nums">
                {awayScore}
                <span className="ml-1 text-xs text-muted-foreground">({awayTotal})</span>
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {isLive && <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[10px]">LIVE</Badge>}
          {f.competitions?.name && <span>{f.competitions.name}</span>}
          {f.venues?.name && <span>— {f.venues.name}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
