"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const fixtureSchema = z
  .object({
    competition_id: z.string().uuid("Select a competition"),
    home_team_id: z.string().uuid("Select a home team"),
    away_team_id: z.string().uuid("Select an away team"),
    venue_id: z.string().optional(),
    scheduled_at: z.string().min(1, "Select a date and time"),
  })
  .refine((data) => data.home_team_id !== data.away_team_id, {
    message: "Home and away teams must be different",
    path: ["away_team_id"],
  });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FixtureActionState {
  errors?: Record<string, string[]>;
  message?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getOrgId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  return orgUser?.organization_id ?? null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function createFixture(
  _prevState: FixtureActionState,
  formData: FormData
): Promise<FixtureActionState> {
  const orgId = await getOrgId();
  if (!orgId) {
    redirect("/login");
  }

  const raw = {
    competition_id: formData.get("competition_id") as string,
    home_team_id: formData.get("home_team_id") as string,
    away_team_id: formData.get("away_team_id") as string,
    venue_id: (formData.get("venue_id") as string) || undefined,
    scheduled_at: formData.get("scheduled_at") as string,
  };

  const result = fixtureSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("fixtures").insert({
    organization_id: orgId,
    competition_id: result.data.competition_id,
    home_team_id: result.data.home_team_id,
    away_team_id: result.data.away_team_id,
    venue_id: result.data.venue_id || null,
    scheduled_at: new Date(result.data.scheduled_at).toISOString(),
    status: "scheduled",
  });

  if (error) {
    return { message: `Failed to create fixture: ${error.message}` };
  }

  revalidatePath("/admin/fixtures");
  revalidatePath("/admin/dashboard");
  redirect("/admin/fixtures");
}

export async function updateFixture(
  _prevState: FixtureActionState,
  formData: FormData
): Promise<FixtureActionState> {
  const orgId = await getOrgId();
  if (!orgId) {
    redirect("/login");
  }

  const fixtureId = formData.get("fixture_id") as string;
  if (!fixtureId) {
    return { message: "Missing fixture ID" };
  }

  const raw = {
    competition_id: formData.get("competition_id") as string,
    home_team_id: formData.get("home_team_id") as string,
    away_team_id: formData.get("away_team_id") as string,
    venue_id: (formData.get("venue_id") as string) || undefined,
    scheduled_at: formData.get("scheduled_at") as string,
  };

  const result = fixtureSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("fixtures")
    .update({
      competition_id: result.data.competition_id,
      home_team_id: result.data.home_team_id,
      away_team_id: result.data.away_team_id,
      venue_id: result.data.venue_id || null,
      scheduled_at: new Date(result.data.scheduled_at).toISOString(),
    })
    .eq("id", fixtureId)
    .eq("organization_id", orgId);

  if (error) {
    return { message: `Failed to update fixture: ${error.message}` };
  }

  revalidatePath("/admin/fixtures");
  revalidatePath("/admin/dashboard");
  redirect(`/admin/fixtures/${fixtureId}`);
}

export async function cancelFixture(
  fixtureId: string
): Promise<FixtureActionState> {
  const orgId = await getOrgId();
  if (!orgId) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("fixtures")
    .update({ status: "cancelled" })
    .eq("id", fixtureId)
    .eq("organization_id", orgId);

  if (error) {
    return { message: `Failed to cancel fixture: ${error.message}` };
  }

  revalidatePath("/admin/fixtures");
  revalidatePath("/admin/dashboard");
  redirect("/admin/fixtures");
}
