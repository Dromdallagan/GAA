import { inngest } from "../client";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/claude/client";

/**
 * Content Engine — runs Sunday at 7pm.
 * Generates weekly roundup from results, queues for PRO approval.
 */
export const contentEngine = inngest.createFunction(
  {
    id: "content-engine",
    name: "Content Engine",
    triggers: [{ cron: "0 19 * * 0" }], // Sunday 7pm
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

    let generated = 0;

    for (const org of orgs) {
      await step.run(`roundup-${org.id}`, async () => {
        // Get this week's completed fixtures
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: results } = await supabase
          .from("fixtures")
          .select(`
            scheduled_at,
            home_score_goals, home_score_points,
            away_score_goals, away_score_points,
            match_report,
            teams!fixtures_home_team_id_fkey ( name ),
            away:teams!fixtures_away_team_id_fkey ( name ),
            competitions ( name )
          `)
          .eq("organization_id", org.id)
          .eq("status", "completed")
          .gte("scheduled_at", weekAgo.toISOString())
          .order("scheduled_at");

        if (!results?.length) return;

        // Format results for Claude
        const resultsSummary = results.map((r) => {
          const home = (r.teams as { name: string } | null)?.name ?? "Home";
          const away = (r.away as { name: string } | null)?.name ?? "Away";
          const comp = (r.competitions as { name: string } | null)?.name ?? "";
          const homeScore = `${r.home_score_goals ?? 0}-${String(r.home_score_points ?? 0).padStart(2, "0")}`;
          const awayScore = `${r.away_score_goals ?? 0}-${String(r.away_score_points ?? 0).padStart(2, "0")}`;
          return `${comp}: ${home} ${homeScore} — ${away} ${awayScore}`;
        }).join("\n");

        // Generate weekly roundup with Claude
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `You are the PRO (Public Relations Officer) for ${org.name} GAA. Write a weekly roundup post for social media and the club website.

This week's results:
${resultsSummary}

Write an engaging, professional weekly roundup (200-300 words). Include:
- Opening line celebrating the week's action
- Brief mention of each result with context
- Standout performances if match reports are available
- Look-ahead to next week
- Use GAA terminology naturally (points, goals, parish, etc.)
- Keep it upbeat and community-focused
- End with a call to action (come support, get your membership)

Do NOT use emojis. Write in a warm but professional tone.`,
          }],
        });

        const roundupText = response.content[0].type === "text" ? response.content[0].text : "";
        if (!roundupText) return;

        // Queue for PRO approval
        await supabase.from("content_queue").insert({
          organization_id: org.id,
          type: "weekly_roundup",
          content: roundupText,
          status: "pending_approval",
          metadata: {
            results_count: results.length,
            week_ending: new Date().toISOString().split("T")[0],
            generated_by: "content_engine",
          },
        });

        generated++;

        await supabase.from("agent_runs").insert({
          organization_id: org.id,
          agent_type: "content_engine",
          status: "completed",
          findings: {
            results_this_week: results.length,
            content_generated: "weekly_roundup",
          },
          actions_taken: [{ action: "weekly_roundup_queued", count: 1 }],
          ran_at: new Date().toISOString(),
        });
      });
    }

    return { orgs: orgs.length, generated };
  }
);
