import { inngest } from "../client";
import { createAdminClient } from "@/lib/supabase/admin";
import { twilioClient } from "@/lib/twilio/client";

/**
 * Member Retention — runs every Wednesday at 9am.
 * Scores engagement based on interaction recency, identifies at-risk members,
 * sends re-engagement WhatsApp to low-engagement active members.
 */
export const memberRetention = inngest.createFunction(
  {
    id: "member-retention",
    name: "Member Retention",
    triggers: [{ cron: "0 9 * * 3" }], // Wednesday 9am
  },
  async ({ step }) => {
    const supabase = createAdminClient();

    const orgs = await step.run("get-orgs", async () => {
      const { data } = await supabase
        .from("organizations")
        .select("id, name, twilio_phone_sid")
        .eq("type", "county_board");
      return data ?? [];
    });

    let totalUpdated = 0;
    let totalReengaged = 0;

    for (const org of orgs) {
      await step.run(`retention-${org.id}`, async () => {
        // Get all active members with interaction data
        const { data: members } = await supabase
          .from("members")
          .select("id, first_name, phone_number, engagement_score, last_interaction_at, created_at")
          .eq("organization_id", org.id)
          .eq("membership_status", "active");

        if (!members?.length) return;

        const now = Date.now();
        const atRisk: typeof members = [];

        for (const member of members) {
          // Calculate engagement score based on recency of last interaction
          const lastInteraction = member.last_interaction_at
            ? new Date(member.last_interaction_at).getTime()
            : member.created_at
              ? new Date(member.created_at).getTime()
              : now;

          const daysSinceInteraction = Math.floor((now - lastInteraction) / 86400000);

          let newScore: number;
          if (daysSinceInteraction <= 7) newScore = 90;
          else if (daysSinceInteraction <= 14) newScore = 75;
          else if (daysSinceInteraction <= 30) newScore = 60;
          else if (daysSinceInteraction <= 60) newScore = 40;
          else if (daysSinceInteraction <= 90) newScore = 20;
          else newScore = 10;

          // Update score if changed
          if (newScore !== member.engagement_score) {
            await supabase
              .from("members")
              .update({ engagement_score: newScore })
              .eq("id", member.id);
            totalUpdated++;
          }

          // At-risk: score dropped below 30 and was higher before
          if (newScore <= 30 && (member.engagement_score ?? 50) > 30) {
            atRisk.push(member);
          }
        }

        // Send re-engagement messages to at-risk members
        if (org.twilio_phone_sid && atRisk.length > 0) {
          for (const member of atRisk.slice(0, 20)) { // Cap at 20 per org per run
            await twilioClient.messages
              .create({
                body: `Hi ${member.first_name ?? "there"}! We haven't heard from you in a while at ${org.name}. Check out the latest fixtures and results — reply FIXTURES to see what's coming up. We'd love to see you at the next match!`,
                from: `whatsapp:${org.twilio_phone_sid}`,
                to: `whatsapp:${member.phone_number}`,
              })
              .catch(() => null);
            totalReengaged++;
          }
        }

        await supabase.from("agent_runs").insert({
          organization_id: org.id,
          agent_type: "member_retention",
          status: "completed",
          findings: {
            members_scored: members.length,
            scores_updated: totalUpdated,
            at_risk_members: atRisk.length,
          },
          actions_taken: [
            { action: "engagement_scores_updated", count: totalUpdated },
            { action: "reengagement_messages_sent", count: totalReengaged },
          ],
          ran_at: new Date().toISOString(),
        });
      });
    }

    return { orgs: orgs.length, updated: totalUpdated, reengaged: totalReengaged };
  }
);
