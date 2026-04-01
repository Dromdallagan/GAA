import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { RealtimeScoreboard } from "@/components/live/realtime-scoreboard";

export const metadata: Metadata = {
  title: "Live Scores | ClubOS",
};

export const dynamic = "force-dynamic";

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

  // Map to flat shape for the client component
  const mapped = (fixtures ?? []).map((f) => ({
    id: f.id,
    scheduled_at: f.scheduled_at,
    status: f.status,
    home_score_goals: f.home_score_goals,
    home_score_points: f.home_score_points,
    away_score_goals: f.away_score_goals,
    away_score_points: f.away_score_points,
    home_team: (f.teams as { name: string } | null)?.name ?? "Home",
    away_team: (f.away as { name: string } | null)?.name ?? "Away",
    competition: (f.competitions as { name: string } | null)?.name ?? "",
    venue: (f.venues as { name: string } | null)?.name ?? "",
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Live Scores</h1>
      <RealtimeScoreboard initialFixtures={mapped} />
    </div>
  );
}
