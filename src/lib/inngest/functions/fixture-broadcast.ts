import { inngest } from "../client";
import { createAdminClient } from "@/lib/supabase/admin";
import { twilioClient } from "@/lib/twilio/client";

/**
 * Fixture broadcasting — runs every 6 hours, finds fixtures 48h away
 * and sends WhatsApp reminders to all active members.
 *
 * Tracks which fixtures have been broadcast via agent_runs to avoid duplicates.
 */
export const fixtureBroadcast = inngest.createFunction(
  {
    id: "fixture-broadcast",
    name: "Fixture Broadcast",
    triggers: [{ cron: "0 */6 * * *" }], // Every 6 hours
  },
  async ({ step }) => {
    const supabase = createAdminClient();

    // Find fixtures scheduled within the next 48 hours
    const fixtures = await step.run("find-upcoming-fixtures", async () => {
      const now = new Date();
      const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const { data } = await supabase
        .from("fixtures")
        .select(`
          id, organization_id, scheduled_at, status,
          teams!fixtures_home_team_id_fkey ( name ),
          away:teams!fixtures_away_team_id_fkey ( name ),
          venues ( name, address ),
          organizations!fixtures_organization_id_fkey ( name, twilio_phone_sid )
        `)
        .eq("status", "scheduled")
        .gte("scheduled_at", now.toISOString())
        .lte("scheduled_at", in48h.toISOString());

      if (!data?.length) return [];

      // Check which fixtures have already been broadcast via agent_runs
      const fixtureIds = data.map((f) => f.id);
      const { data: pastRuns } = await supabase
        .from("agent_runs")
        .select("findings")
        .eq("agent_type", "content_engine")
        .contains("findings", { action: "fixture_broadcast" });

      const broadcastFixtureIds = new Set<string>();
      if (pastRuns) {
        for (const run of pastRuns) {
          const findings = run.findings as Record<string, unknown> | null;
          const ids = findings?.fixture_ids as string[] | undefined;
          if (ids) ids.forEach((id) => broadcastFixtureIds.add(id));
        }
      }

      return data.filter((f) => !broadcastFixtureIds.has(f.id) && fixtureIds.includes(f.id));
    });

    if (fixtures.length === 0) return { broadcast: 0 };

    let broadcastCount = 0;
    const broadcastFixtureIds: string[] = [];

    for (const fixture of fixtures) {
      await step.run(`broadcast-${fixture.id}`, async () => {
        const org = fixture.organizations as unknown as { name: string; twilio_phone_sid: string | null } | null;
        if (!org?.twilio_phone_sid) return;

        const homeTeam = (fixture.teams as unknown as { name: string } | null)?.name ?? "Home";
        const awayTeam = (fixture.away as unknown as { name: string } | null)?.name ?? "Away";
        const venue = fixture.venues as unknown as { name: string; address: string | null } | null;
        const matchDate = new Date(fixture.scheduled_at);
        const dateStr = matchDate.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
        const timeStr = matchDate.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const message = [
          `*Fixture Reminder*`,
          ``,
          `*${homeTeam}* vs *${awayTeam}*`,
          `${dateStr} at ${timeStr}`,
          venue ? `${venue.name}${venue.address ? ` - ${venue.address}` : ""}` : null,
          ``,
          `Best of luck to all involved!`,
        ]
          .filter(Boolean)
          .join("\n");

        // Get all active members for this org
        const { data: members } = await supabase
          .from("members")
          .select("phone_number")
          .eq("organization_id", fixture.organization_id)
          .eq("membership_status", "active");

        if (!members?.length) return;

        // Send to each member
        const sendPromises = members.map((m) =>
          twilioClient.messages
            .create({
              body: message,
              from: `whatsapp:${org.twilio_phone_sid}`,
              to: `whatsapp:${m.phone_number}`,
            })
            .catch(() => null)
        );

        await Promise.all(sendPromises);
        broadcastCount++;
        broadcastFixtureIds.push(fixture.id);
      });
    }

    // Log agent run with fixture IDs for dedup
    if (broadcastCount > 0) {
      await step.run("log-agent-run", async () => {
        await supabase.from("agent_runs").insert({
          organization_id: fixtures[0]?.organization_id ?? null,
          agent_type: "content_engine",
          status: "completed",
          findings: {
            action: "fixture_broadcast",
            fixtures_found: fixtures.length,
            fixture_ids: broadcastFixtureIds,
          },
          actions_taken: [{ action: "fixture_broadcast", count: broadcastCount }],
          ran_at: new Date().toISOString(),
        });
      });
    }

    return { broadcast: broadcastCount, fixtures: fixtures.length };
  }
);
