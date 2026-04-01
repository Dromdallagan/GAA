import { inngest } from "../client";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/claude/client";
import { sendEmail } from "@/lib/email/send";

/**
 * Smart Scheduler — runs every Friday at 8am.
 * Analyses upcoming fixture schedule, detects gaps, suggests optimal slots
 * based on venue availability and team workload.
 */
export const smartScheduler = inngest.createFunction(
  {
    id: "smart-scheduler",
    name: "Smart Scheduler",
    triggers: [{ cron: "0 8 * * 5" }], // Friday 8am
  },
  async ({ step }) => {
    const supabase = createAdminClient();

    const orgs = await step.run("get-orgs", async () => {
      const { data } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("type", "county_board");
      return data ?? [];
    });

    for (const org of orgs) {
      await step.run(`schedule-${org.id}`, async () => {
        // Get fixtures for the next 4 weeks
        const now = new Date();
        const in4w = new Date(now.getTime() + 28 * 86400000);

        const { data: fixtures } = await supabase
          .from("fixtures")
          .select(`
            id, scheduled_at, status,
            home_team_id, away_team_id,
            venue_id,
            teams!fixtures_home_team_id_fkey ( name ),
            away:teams!fixtures_away_team_id_fkey ( name ),
            venues ( name )
          `)
          .eq("organization_id", org.id)
          .eq("status", "scheduled")
          .gte("scheduled_at", now.toISOString())
          .lte("scheduled_at", in4w.toISOString())
          .order("scheduled_at");

        // Get all venues
        const { data: venues } = await supabase
          .from("venues")
          .select("id, name")
          .eq("organization_id", org.id);

        // Get all teams
        const { data: teams } = await supabase
          .from("teams")
          .select("id, name")
          .eq("organization_id", org.id);

        if (!fixtures?.length && !teams?.length) return;

        // Build a schedule summary for Claude
        const fixtureList = (fixtures ?? []).map((f) => {
          const date = new Date(f.scheduled_at);
          const home = (f.teams as { name: string } | null)?.name ?? "?";
          const away = (f.away as { name: string } | null)?.name ?? "?";
          const venue = (f.venues as { name: string } | null)?.name ?? "TBC";
          return `${date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} — ${home} vs ${away} @ ${venue}`;
        }).join("\n");

        const venueList = (venues ?? []).map((v) => v.name).join(", ");
        const teamList = (teams ?? []).map((t) => t.name).join(", ");

        // Ask Claude for scheduling analysis
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          messages: [{
            role: "user",
            content: `You are a GAA fixtures secretary assistant for ${org.name}. Analyse the upcoming schedule and provide recommendations.

Fixtures (next 4 weeks):
${fixtureList || "No fixtures scheduled."}

Available venues: ${venueList || "None listed"}
Teams: ${teamList || "None listed"}

In 3-5 bullet points:
- Flag any weekends with no fixtures (potential gaps to fill)
- Flag any teams not scheduled in the next 4 weeks
- Flag potential venue bottlenecks (too many games at one venue)
- Suggest 1-2 optimal time slots for additional fixtures
- Note any balance issues (some teams playing much more than others)

Be concise and actionable. Use GAA terminology.`,
          }],
        });

        const analysis = response.content[0].type === "text" ? response.content[0].text : "";
        if (!analysis) return;

        // Email the secretary
        const { data: admins } = await supabase
          .from("org_users")
          .select("user_id")
          .eq("organization_id", org.id)
          .in("role", ["admin", "secretary"])
          .limit(3);

        if (admins?.length) {
          for (const admin of admins) {
            const { data: authUser } = await supabase.auth.admin.getUserById(admin.user_id);
            if (authUser?.user?.email) {
              await sendEmail({
                to: authUser.user.email,
                subject: `Scheduling Analysis — ${org.name}`,
                html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#1a1a1a;color:#e5e5e5;border-radius:12px">
<h2 style="color:#fff;margin:0 0 16px">Smart Scheduler — Weekly Analysis</h2>
<div style="font-size:14px;line-height:1.7;white-space:pre-line">${analysis.replace(/</g, "&lt;")}</div>
<p style="font-size:12px;color:#888;margin-top:16px">${(fixtures ?? []).length} fixtures in the next 4 weeks</p>
<p style="font-size:11px;color:#555;margin-top:12px">Powered by ClubOS</p>
</div>`,
              });
            }
          }
        }

        await supabase.from("agent_runs").insert({
          organization_id: org.id,
          agent_type: "smart_scheduler",
          status: "completed",
          findings: {
            fixtures_analysed: (fixtures ?? []).length,
            venues_available: (venues ?? []).length,
            teams_total: (teams ?? []).length,
            summary: analysis.slice(0, 500),
          },
          actions_taken: [{ action: "schedule_analysis_sent", count: admins?.length ?? 0 }],
          ran_at: new Date().toISOString(),
        });
      });
    }

    return { orgs: orgs.length };
  }
);
