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

export const MEMBER_TOOLS: Tool[] = [
  lookupFixtures,
  getResults,
  getVenue,
  checkMembership,
];

export const ADMIN_TOOLS: Tool[] = [
  ...MEMBER_TOOLS,
  searchMembers,
  getMemberStats,
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

    default:
      return `Unknown tool: ${toolName}`;
  }
}
