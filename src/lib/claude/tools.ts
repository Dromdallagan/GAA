import type Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPhone } from "@/lib/utils/phone";

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

type Tool = Anthropic.Messages.Tool;

const lookupFixtures: Tool = {
  name: "lookup_fixtures",
  description:
    "Look up upcoming or recent fixtures. Returns match details including teams, date, venue, and competition.",
  input_schema: {
    type: "object" as const,
    properties: {
      team_name: {
        type: "string",
        description: "Optional: filter by team name (partial match)",
      },
      status: {
        type: "string",
        enum: ["scheduled", "live", "completed"],
        description:
          "Filter by status. Defaults to scheduled (upcoming matches).",
      },
      limit: {
        type: "number",
        description: "Max results. Defaults to 5.",
      },
    },
  },
};

const getResults: Tool = {
  name: "get_results",
  description:
    "Get recent match results with final scores in GAA format (Goals-Points).",
  input_schema: {
    type: "object" as const,
    properties: {
      team_name: {
        type: "string",
        description: "Optional: filter by team name (partial match)",
      },
      limit: {
        type: "number",
        description: "Max results. Defaults to 5.",
      },
    },
  },
};

const getVenue: Tool = {
  name: "get_venue",
  description:
    "Get venue details including name, address, and GPS coordinates for directions.",
  input_schema: {
    type: "object" as const,
    properties: {
      venue_name: {
        type: "string",
        description: "Venue name or partial name to search for",
      },
    },
    required: ["venue_name"],
  },
};

const checkMembership: Tool = {
  name: "check_my_membership",
  description:
    "Check the membership status of the person sending this message, using their phone number.",
  input_schema: {
    type: "object" as const,
    properties: {},
  },
};

const searchMembers: Tool = {
  name: "search_members",
  description:
    "Search for members by name. Admin only — returns name, membership type, status, and expiry.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: {
        type: "string",
        description: "Name to search for (first or last name, partial match)",
      },
    },
    required: ["name"],
  },
};

const getMemberStats: Tool = {
  name: "get_member_stats",
  description:
    "Get membership statistics: total count and breakdown by status (active, expired, pending).",
  input_schema: {
    type: "object" as const,
    properties: {},
  },
};

const getCalendarLink: Tool = {
  name: "get_calendar_link",
  description:
    "Generate a calendar (.ics) download link for a fixture so the member can add it to their phone calendar.",
  input_schema: {
    type: "object" as const,
    properties: {
      fixture_id: {
        type: "string",
        description: "UUID of the fixture. Use lookup_fixtures to find it first.",
      },
    },
    required: ["fixture_id"],
  },
};

export const MEMBER_TOOLS: Tool[] = [
  lookupFixtures,
  getResults,
  getVenue,
  checkMembership,
  getCalendarLink,
];

const submitResult: Tool = {
  name: "submit_result",
  description:
    "Submit a match result. Parse the user's message to extract the fixture, scores in GAA format (Goals-Points for each team), and optional scorers. Admin only.",
  input_schema: {
    type: "object" as const,
    properties: {
      fixture_id: {
        type: "string",
        description: "UUID of the fixture. Use lookup_fixtures to find the right one first.",
      },
      home_goals: { type: "number", description: "Home team goals scored" },
      home_points: { type: "number", description: "Home team points scored" },
      away_goals: { type: "number", description: "Away team goals scored" },
      away_points: { type: "number", description: "Away team points scored" },
      match_report: {
        type: "string",
        description: "Brief AI-generated match summary (2-3 sentences)",
      },
      scorers: {
        type: "object",
        description: "Optional scorers: { home: ['Name (1-2)'], away: ['Name (0-3)'] }",
        properties: {
          home: { type: "array", items: { type: "string" } },
          away: { type: "array", items: { type: "string" } },
        },
      },
    },
    required: ["fixture_id", "home_goals", "home_points", "away_goals", "away_points"],
  },
};

const cancelFixtureTool: Tool = {
  name: "cancel_fixture",
  description: "Cancel a scheduled fixture. Admin only. Use lookup_fixtures to find the fixture ID first.",
  input_schema: {
    type: "object" as const,
    properties: {
      fixture_id: { type: "string", description: "UUID of the fixture to cancel" },
      reason: { type: "string", description: "Reason for cancellation" },
    },
    required: ["fixture_id"],
  },
};

const sendPaymentReminders: Tool = {
  name: "send_payment_reminders",
  description: "Trigger payment reminder emails to all members with expiring memberships. Admin only (treasurer function).",
  input_schema: {
    type: "object" as const,
    properties: {},
  },
};

export const ADMIN_TOOLS: Tool[] = [
  ...MEMBER_TOOLS,
  searchMembers,
  getMemberStats,
  submitResult,
  cancelFixtureTool,
  sendPaymentReminders,
];

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

interface ToolContext {
  orgId: string;
  callerPhone: string;
}

export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  ctx: ToolContext
): Promise<string> {
  const supabase = createAdminClient();

  switch (toolName) {
    case "lookup_fixtures": {
      const status = (input.status as string) ?? "scheduled";
      const limit = (input.limit as number) ?? 5;
      const teamName = input.team_name as string | undefined;

      let query = supabase
        .from("fixtures")
        .select(
          `
          scheduled_at, status,
          home_score_goals, home_score_points,
          away_score_goals, away_score_points,
          competition:competitions(name, code),
          home_team:teams!fixtures_home_team_id_fkey(name),
          away_team:teams!fixtures_away_team_id_fkey(name),
          venue:venues(name, address)
        `
        )
        .eq("organization_id", ctx.orgId)
        .eq("status", status)
        .order("scheduled_at", {
          ascending: status === "scheduled",
        })
        .limit(limit);

      const { data, error } = await query;
      if (error) return `Error looking up fixtures: ${error.message}`;
      if (!data?.length) return `No ${status} fixtures found.`;

      let fixtures = data;
      if (teamName) {
        const lower = teamName.toLowerCase();
        fixtures = fixtures.filter((f) => {
          const home = (f.home_team as { name: string } | null)?.name ?? "";
          const away = (f.away_team as { name: string } | null)?.name ?? "";
          return (
            home.toLowerCase().includes(lower) ||
            away.toLowerCase().includes(lower)
          );
        });
      }

      return JSON.stringify(
        fixtures.map((f) => ({
          home: (f.home_team as { name: string } | null)?.name,
          away: (f.away_team as { name: string } | null)?.name,
          date: f.scheduled_at,
          status: f.status,
          competition: (f.competition as { name: string; code: string } | null)
            ?.name,
          venue: (f.venue as { name: string; address: string | null } | null)
            ?.name,
          home_score:
            f.home_score_goals != null
              ? `${f.home_score_goals}-${String(f.home_score_points ?? 0).padStart(2, "0")}`
              : null,
          away_score:
            f.away_score_goals != null
              ? `${f.away_score_goals}-${String(f.away_score_points ?? 0).padStart(2, "0")}`
              : null,
        }))
      );
    }

    case "get_results": {
      const limit = (input.limit as number) ?? 5;
      const teamName = input.team_name as string | undefined;

      const { data, error } = await supabase
        .from("fixtures")
        .select(
          `
          scheduled_at,
          home_score_goals, home_score_points,
          away_score_goals, away_score_points,
          competition:competitions(name),
          home_team:teams!fixtures_home_team_id_fkey(name),
          away_team:teams!fixtures_away_team_id_fkey(name)
        `
        )
        .eq("organization_id", ctx.orgId)
        .eq("status", "completed")
        .order("scheduled_at", { ascending: false })
        .limit(limit);

      if (error) return `Error: ${error.message}`;
      if (!data?.length) return "No completed matches found.";

      let results = data;
      if (teamName) {
        const lower = teamName.toLowerCase();
        results = results.filter((f) => {
          const home = (f.home_team as { name: string } | null)?.name ?? "";
          const away = (f.away_team as { name: string } | null)?.name ?? "";
          return (
            home.toLowerCase().includes(lower) ||
            away.toLowerCase().includes(lower)
          );
        });
      }

      return JSON.stringify(
        results.map((f) => ({
          home: (f.home_team as { name: string } | null)?.name,
          away: (f.away_team as { name: string } | null)?.name,
          home_score: `${f.home_score_goals ?? 0}-${String(f.home_score_points ?? 0).padStart(2, "0")}`,
          away_score: `${f.away_score_goals ?? 0}-${String(f.away_score_points ?? 0).padStart(2, "0")}`,
          home_total:
            (f.home_score_goals ?? 0) * 3 + (f.home_score_points ?? 0),
          away_total:
            (f.away_score_goals ?? 0) * 3 + (f.away_score_points ?? 0),
          date: f.scheduled_at,
          competition: (f.competition as { name: string } | null)?.name,
        }))
      );
    }

    case "get_venue": {
      const venueName = input.venue_name as string;
      const { data, error } = await supabase
        .from("venues")
        .select("name, address, latitude, longitude, capacity, facilities")
        .eq("organization_id", ctx.orgId)
        .ilike("name", `%${venueName}%`)
        .limit(3);

      if (error) return `Error: ${error.message}`;
      if (!data?.length) return `No venue found matching "${venueName}".`;

      return JSON.stringify(
        data.map((v) => ({
          name: v.name,
          address: v.address,
          gps:
            v.latitude && v.longitude
              ? `${v.latitude},${v.longitude}`
              : null,
          capacity: v.capacity,
        }))
      );
    }

    case "check_my_membership": {
      const phoneHash = hashPhone(ctx.callerPhone);
      const { data, error } = await supabase
        .from("members")
        .select(
          "first_name, last_name, membership_type, membership_status, membership_expires_at"
        )
        .eq("organization_id", ctx.orgId)
        .eq("phone_hash", phoneHash)
        .limit(1)
        .single();

      if (error || !data) {
        return "No membership record found for your phone number.";
      }

      return JSON.stringify({
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        type: data.membership_type,
        status: data.membership_status,
        expires: data.membership_expires_at,
      });
    }

    case "search_members": {
      const name = input.name as string;
      const { data, error } = await supabase
        .from("members")
        .select(
          "first_name, last_name, membership_type, membership_status, membership_expires_at"
        )
        .eq("organization_id", ctx.orgId)
        .or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`)
        .order("last_name")
        .limit(10);

      if (error) return `Error: ${error.message}`;
      if (!data?.length) return `No members found matching "${name}".`;

      return JSON.stringify(
        data.map((m) => ({
          name: `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim(),
          type: m.membership_type,
          status: m.membership_status,
          expires: m.membership_expires_at,
        }))
      );
    }

    case "get_member_stats": {
      const { data, error } = await supabase
        .from("members")
        .select("membership_status")
        .eq("organization_id", ctx.orgId);

      if (error) return `Error: ${error.message}`;
      if (!data?.length) return "No members found.";

      const counts: Record<string, number> = {};
      for (const m of data) {
        const status = m.membership_status ?? "unknown";
        counts[status] = (counts[status] ?? 0) + 1;
      }

      return JSON.stringify({ total: data.length, by_status: counts });
    }

    case "get_calendar_link": {
      const fixtureId = input.fixture_id as string;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5555";
      return `Add this fixture to your calendar: ${baseUrl}/api/calendar/${fixtureId}`;
    }

    case "submit_result": {
      const fixtureId = input.fixture_id as string;
      const homeGoals = input.home_goals as number;
      const homePoints = input.home_points as number;
      const awayGoals = input.away_goals as number;
      const awayPoints = input.away_points as number;
      const matchReport = input.match_report as string | undefined;
      const scorers = input.scorers as { home?: string[]; away?: string[] } | undefined;

      // Verify fixture exists and belongs to org
      const { data: fixture, error: fetchErr } = await supabase
        .from("fixtures")
        .select("id, status")
        .eq("id", fixtureId)
        .eq("organization_id", ctx.orgId)
        .single();

      if (fetchErr || !fixture) return "Fixture not found.";
      if (fixture.status === "completed") return "This fixture already has a result submitted.";

      const { error: updateErr } = await supabase
        .from("fixtures")
        .update({
          home_score_goals: homeGoals,
          home_score_points: homePoints,
          away_score_goals: awayGoals,
          away_score_points: awayPoints,
          status: "completed",
          match_report: matchReport ?? null,
          scorers: scorers ?? null,
          submitted_by: ctx.callerPhone,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", fixtureId)
        .eq("organization_id", ctx.orgId);

      if (updateErr) return `Failed to submit result: ${updateErr.message}`;

      // Write audit log
      await supabase.from("audit_log").insert({
        organization_id: ctx.orgId,
        entity_type: "fixtures",
        entity_id: fixtureId,
        action: "result_submitted",
        new_values: {
          home_score: `${homeGoals}-${String(homePoints).padStart(2, "0")}`,
          away_score: `${awayGoals}-${String(awayPoints).padStart(2, "0")}`,
          submitted_by: ctx.callerPhone,
        },
      });

      const homeTotal = homeGoals * 3 + homePoints;
      const awayTotal = awayGoals * 3 + awayPoints;
      return `Result submitted! Final score: ${homeGoals}-${String(homePoints).padStart(2, "0")} (${homeTotal}) to ${awayGoals}-${String(awayPoints).padStart(2, "0")} (${awayTotal}).`;
    }

    case "cancel_fixture": {
      const fixtureId = input.fixture_id as string;
      const reason = input.reason as string | undefined;

      const { data: fixture, error: fetchErr } = await supabase
        .from("fixtures")
        .select("id, status")
        .eq("id", fixtureId)
        .eq("organization_id", ctx.orgId)
        .single();

      if (fetchErr || !fixture) return "Fixture not found.";
      if (fixture.status === "cancelled") return "This fixture is already cancelled.";
      if (fixture.status === "completed") return "Cannot cancel a completed fixture.";

      const { error: updateErr } = await supabase
        .from("fixtures")
        .update({ status: "cancelled" })
        .eq("id", fixtureId)
        .eq("organization_id", ctx.orgId);

      if (updateErr) return `Failed to cancel: ${updateErr.message}`;

      await supabase.from("audit_log").insert({
        organization_id: ctx.orgId,
        entity_type: "fixtures",
        entity_id: fixtureId,
        action: "fixture_cancelled",
        new_values: { reason: reason ?? "No reason provided", cancelled_by: ctx.callerPhone },
      });

      return `Fixture cancelled successfully.${reason ? ` Reason: ${reason}` : ""}`;
    }

    case "send_payment_reminders": {
      // Count members expiring in next 30 days
      const today = new Date();
      const in30d = new Date(today);
      in30d.setDate(in30d.getDate() + 30);

      const { data: expiring, count } = await supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", ctx.orgId)
        .eq("membership_status", "active")
        .lte("membership_expires_at", in30d.toISOString().split("T")[0])
        .gte("membership_expires_at", today.toISOString().split("T")[0]);

      return `Found ${count ?? 0} members with memberships expiring in the next 30 days. Payment reminders run automatically daily at 10am via the scheduled agent. Members expiring in 7, 14, and 21 days receive WhatsApp and email reminders.`;
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}
