import { inngest } from "../client";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fixture Intelligence — runs daily at 6am.
 * Detects scheduling clashes and flags potential venue conflicts.
 */
export const fixtureIntelligence = inngest.createFunction(
  {
    id: "fixture-intelligence",
    name: "Fixture Intelligence",
    triggers: [{ cron: "0 6 * * *" }],
  },
  async ({ step }) => {
    const supabase = createAdminClient();

    const findings = await step.run("detect-clashes", async () => {
      // Get all scheduled fixtures in the next 14 days
      const now = new Date();
      const in14d = new Date(now.getTime() + 14 * 86400000);

      const { data: fixtures } = await supabase
        .from("fixtures")
        .select(`
          id, organization_id, scheduled_at, venue_id,
          home_team_id, away_team_id,
          teams!fixtures_home_team_id_fkey ( name ),
          away:teams!fixtures_away_team_id_fkey ( name ),
          venues ( name )
        `)
        .eq("status", "scheduled")
        .gte("scheduled_at", now.toISOString())
        .lte("scheduled_at", in14d.toISOString())
        .order("scheduled_at");

      if (!fixtures?.length) return { clashes: [], venueConflicts: [], fixturesChecked: 0 };

      const clashes: Array<{ fixture1: string; fixture2: string; team: string; date: string }> = [];
      const venueConflicts: Array<{ fixture1: string; fixture2: string; venue: string; date: string }> = [];

      // Check for team clashes (same team in 2 fixtures on same day)
      for (let i = 0; i < fixtures.length; i++) {
        for (let j = i + 1; j < fixtures.length; j++) {
          const a = fixtures[i];
          const b = fixtures[j];

          const dateA = new Date(a.scheduled_at).toDateString();
          const dateB = new Date(b.scheduled_at).toDateString();
          if (dateA !== dateB) continue;

          // Team clash
          const teamsA = [a.home_team_id, a.away_team_id].filter(Boolean);
          const teamsB = [b.home_team_id, b.away_team_id].filter(Boolean);
          const overlap = teamsA.filter((t) => teamsB.includes(t));

          if (overlap.length > 0) {
            const homeA = (a.teams as { name: string } | null)?.name ?? "";
            const awayA = (a.away as { name: string } | null)?.name ?? "";
            const homeB = (b.teams as { name: string } | null)?.name ?? "";
            const awayB = (b.away as { name: string } | null)?.name ?? "";
            clashes.push({
              fixture1: `${homeA} vs ${awayA}`,
              fixture2: `${homeB} vs ${awayB}`,
              team: "overlapping team",
              date: dateA,
            });
          }

          // Venue clash (same venue, within 3 hours)
          if (a.venue_id && a.venue_id === b.venue_id) {
            const timeA = new Date(a.scheduled_at).getTime();
            const timeB = new Date(b.scheduled_at).getTime();
            if (Math.abs(timeA - timeB) < 3 * 3600000) {
              const venueName = (a.venues as { name: string } | null)?.name ?? "Unknown venue";
              venueConflicts.push({
                fixture1: `${(a.teams as { name: string } | null)?.name} vs ${(a.away as { name: string } | null)?.name}`,
                fixture2: `${(b.teams as { name: string } | null)?.name} vs ${(b.away as { name: string } | null)?.name}`,
                venue: venueName,
                date: dateA,
              });
            }
          }
        }
      }

      return { clashes, venueConflicts, fixturesChecked: fixtures.length };
    });

    // Log findings
    if (findings.clashes.length > 0 || findings.venueConflicts.length > 0) {
      await step.run("log-findings", async () => {
        // Get first org from fixtures for logging
        const { data: firstFixture } = await supabase
          .from("fixtures")
          .select("organization_id")
          .eq("status", "scheduled")
          .limit(1)
          .maybeSingle();

        if (!firstFixture?.organization_id) return;

        await supabase.from("agent_runs").insert({
          organization_id: firstFixture.organization_id,
          agent_type: "fixture_intelligence",
          status: "completed",
          findings: {
            fixtures_checked: findings.fixturesChecked ?? 0,
            team_clashes: findings.clashes.length,
            venue_conflicts: findings.venueConflicts.length,
            details: [...findings.clashes, ...findings.venueConflicts].slice(0, 10),
          },
          actions_taken: [
            { action: "clashes_detected", count: findings.clashes.length },
            { action: "venue_conflicts_detected", count: findings.venueConflicts.length },
          ],
          ran_at: new Date().toISOString(),
        });
      });
    }

    return findings;
  }
);
