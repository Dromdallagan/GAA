import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FixtureForm } from "@/components/fixtures/fixture-form";

export const metadata: Metadata = {
  title: "New Fixture | ClubOS",
};

export default async function NewFixturePage() {
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
      mode="create"
      teams={teamsResult.data ?? []}
      competitions={competitionsResult.data ?? []}
      venues={venuesResult.data ?? []}
    />
  );
}
