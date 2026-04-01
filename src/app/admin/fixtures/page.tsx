import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FixturesList } from "./fixtures-list";

export const metadata: Metadata = {
  title: "Fixtures | ClubOS",
};

export default async function FixturesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(
      `
      id,
      scheduled_at,
      status,
      home_score_goals,
      home_score_points,
      away_score_goals,
      away_score_points,
      competition:competitions(name, code),
      home_team:teams!fixtures_home_team_id_fkey(name, club_id),
      away_team:teams!fixtures_away_team_id_fkey(name, club_id),
      venue:venues(name)
    `
    )
    .order("scheduled_at", { ascending: false });

  return <FixturesList fixtures={fixtures ?? []} />;
}
