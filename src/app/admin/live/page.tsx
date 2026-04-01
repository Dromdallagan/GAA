import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LiveDashboard } from "./live-dashboard";

export const metadata: Metadata = {
  title: "Live Scoring | ClubOS",
};

export default async function LivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!orgUser) redirect("/login?error=no_org");

  // Fetch live + today's scheduled fixtures
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      id, scheduled_at, status,
      home_score_goals, home_score_points,
      away_score_goals, away_score_points,
      teams!fixtures_home_team_id_fkey ( name ),
      away:teams!fixtures_away_team_id_fkey ( name ),
      venues ( name )
    `)
    .eq("organization_id", orgUser.organization_id)
    .or(`status.eq.live,and(status.eq.scheduled,scheduled_at.gte.${today.toISOString()},scheduled_at.lt.${tomorrow.toISOString()})`)
    .order("scheduled_at");

  return <LiveDashboard fixtures={fixtures ?? []} />;
}
