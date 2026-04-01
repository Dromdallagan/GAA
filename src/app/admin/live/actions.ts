"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const matchEventSchema = z.object({
  fixture_id: z.string().uuid(),
  event_type: z.enum(["goal", "point", "wide", "card", "substitution", "half_time", "full_time"]),
  team: z.enum(["home", "away"]),
  player_name: z.string().optional(),
  minute: z.coerce.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export interface LiveActionState {
  error?: string;
}

async function getOrgId(): Promise<string> {
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
  return orgUser.organization_id;
}

/** Add a match event and update fixture scores. */
export async function addMatchEvent(
  _prev: LiveActionState,
  formData: FormData
): Promise<LiveActionState> {
  const orgId = await getOrgId();

  const raw = {
    fixture_id: formData.get("fixture_id") as string,
    event_type: formData.get("event_type") as string,
    team: formData.get("team") as string,
    player_name: (formData.get("player_name") as string) || undefined,
    minute: formData.get("minute") as string | undefined,
    description: (formData.get("description") as string) || undefined,
  };

  const result = matchEventSchema.safeParse(raw);
  if (!result.success) {
    const firstError = Object.values(result.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError ?? "Invalid input" };
  }

  const supabase = await createClient();

  // Insert match event
  const { error: insertErr } = await supabase.from("match_events").insert({
    organization_id: orgId,
    fixture_id: result.data.fixture_id,
    event_type: result.data.event_type,
    team: result.data.team,
    player_name: result.data.player_name ?? null,
    minute: result.data.minute ?? null,
    description: result.data.description ?? null,
  });

  if (insertErr) return { error: insertErr.message };

  // Update fixture score for goals and points
  if (result.data.event_type === "goal" || result.data.event_type === "point") {
    const scoreCol = result.data.team === "home"
      ? result.data.event_type === "goal" ? "home_score_goals" : "home_score_points"
      : result.data.event_type === "goal" ? "away_score_goals" : "away_score_points";

    // Fetch current score then increment
    const { data: fixture } = await supabase
      .from("fixtures")
      .select("home_score_goals, home_score_points, away_score_goals, away_score_points")
      .eq("id", result.data.fixture_id)
      .single();

    if (fixture) {
      const current = (fixture[scoreCol as keyof typeof fixture] as number | null) ?? 0;
      await supabase
        .from("fixtures")
        .update({ [scoreCol]: current + 1 })
        .eq("id", result.data.fixture_id);
    }
  }

  // Handle half_time and full_time events
  if (result.data.event_type === "full_time") {
    await supabase
      .from("fixtures")
      .update({ status: "completed" })
      .eq("id", result.data.fixture_id);
  }

  revalidatePath(`/admin/live/${result.data.fixture_id}`);
  revalidatePath("/admin/live");
  revalidatePath("/admin/dashboard");
  return {};
}

/** Set a fixture status to live (start match). */
export async function startMatch(fixtureId: string): Promise<LiveActionState> {
  const orgId = await getOrgId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("fixtures")
    .update({
      status: "live",
      home_score_goals: 0,
      home_score_points: 0,
      away_score_goals: 0,
      away_score_points: 0,
    })
    .eq("id", fixtureId)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };

  revalidatePath("/admin/live");
  revalidatePath("/admin/dashboard");
  return {};
}
