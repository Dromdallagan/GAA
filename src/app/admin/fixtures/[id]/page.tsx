import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FixtureForm } from "@/components/fixtures/fixture-form";
import { FixtureDetail } from "./fixture-detail";

export const metadata: Metadata = {
  title: "Fixture Detail | ClubOS",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function FixtureDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { edit } = await searchParams;
  const isEditing = edit === "true";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!orgUser) {
    redirect("/login?error=no_org");
  }

  const orgId = orgUser.organization_id;

  // Fetch fixture with joins
  const { data: fixture } = await supabase
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
      competition_id,
      home_team_id,
      away_team_id,
      venue_id,
      competition:competitions(name, code),
      home_team:teams!fixtures_home_team_id_fkey(name),
      away_team:teams!fixtures_away_team_id_fkey(name),
      venue:venues(name)
    `
    )
    .eq("id", id)
    .eq("organization_id", orgId)
    .single();

  if (!fixture) {
    notFound();
  }

  // If editing, fetch form options
  if (isEditing) {
    const [teamsResult, competitionsResult, venuesResult] = await Promise.all([
      supabase
        .from("teams")
        .select("id, name")
        .eq("organization_id", orgId)
        .order("name"),
      supabase
        .from("competitions")
        .select("id, name")
        .eq("organization_id", orgId)
        .eq("status", "active")
        .order("name"),
      supabase
        .from("venues")
        .select("id, name")
        .eq("organization_id", orgId)
        .order("name"),
    ]);

    return (
      <FixtureForm
        mode="edit"
        defaults={{
          id: fixture.id,
          competition_id: fixture.competition_id ?? "",
          home_team_id: fixture.home_team_id ?? "",
          away_team_id: fixture.away_team_id ?? "",
          venue_id: fixture.venue_id ?? "",
          scheduled_at: fixture.scheduled_at,
        }}
        teams={teamsResult.data ?? []}
        competitions={competitionsResult.data ?? []}
        venues={venuesResult.data ?? []}
      />
    );
  }

  const homeTeam = fixture.home_team as { name: string } | null;
  const awayTeam = fixture.away_team as { name: string } | null;
  const competition = fixture.competition as {
    name: string;
    code: string;
  } | null;
  const venue = fixture.venue as { name: string } | null;

  return (
    <FixtureDetail
      fixture={{
        id: fixture.id,
        scheduled_at: fixture.scheduled_at,
        status: fixture.status ?? "scheduled",
        home_team: homeTeam?.name ?? "TBC",
        away_team: awayTeam?.name ?? "TBC",
        home_score_goals: fixture.home_score_goals,
        home_score_points: fixture.home_score_points,
        away_score_goals: fixture.away_score_goals,
        away_score_points: fixture.away_score_points,
        competition: competition?.name ?? "",
        competition_code: competition?.code ?? "",
        venue: venue?.name ?? "",
      }}
    />
  );
}
