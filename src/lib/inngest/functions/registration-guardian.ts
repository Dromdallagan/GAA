import { inngest } from "../client";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/claude/client";
import { sendEmail } from "@/lib/email/send";

/**
 * Registration Guardian — runs nightly at 8am.
 * Finds members with pending status for >7 days and alerts the registrar.
 */
export const registrationGuardian = inngest.createFunction(
  {
    id: "registration-guardian",
    name: "Registration Guardian",
    triggers: [{ cron: "0 8 * * *" }],
  },
  async ({ step }) => {
    const supabase = createAdminClient();

    // Find all orgs
    const orgs = await step.run("get-orgs", async () => {
      const { data } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("type", "county_board");
      return data ?? [];
    });

    let totalAlerts = 0;

    for (const org of orgs) {
      const result = await step.run(`check-org-${org.id}`, async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Find members stuck in pending for >7 days
        const { data: pendingMembers } = await supabase
          .from("members")
          .select("id, first_name, last_name, email, phone_number, membership_type, created_at")
          .eq("organization_id", org.id)
          .eq("membership_status", "pending")
          .lte("created_at", sevenDaysAgo.toISOString())
          .order("created_at");

        if (!pendingMembers?.length) return { alerts: 0 };

        // Find members with expired memberships who haven't renewed
        const { data: expiredMembers } = await supabase
          .from("members")
          .select("id, first_name, last_name, membership_type, membership_expires_at")
          .eq("organization_id", org.id)
          .eq("membership_status", "expired")
          .order("membership_expires_at", { ascending: false })
          .limit(20);

        // Use Claude to generate a summary for the registrar
        const summary = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          messages: [{
            role: "user",
            content: `You are a GAA club registrar assistant. Generate a brief daily alert summary.

Pending registrations (>7 days old): ${pendingMembers.length}
${pendingMembers.slice(0, 10).map((m) => `- ${m.first_name} ${m.last_name} (${m.membership_type ?? "unknown"}) — registered ${m.created_at ? new Date(m.created_at).toLocaleDateString("en-GB") : "unknown"}`).join("\n")}

Expired memberships: ${expiredMembers?.length ?? 0}
${(expiredMembers ?? []).slice(0, 5).map((m) => `- ${m.first_name} ${m.last_name} — expired ${m.membership_expires_at ?? "unknown"}`).join("\n")}

Write a concise registrar alert in 3-4 sentences. Be direct and actionable.`,
          }],
        });

        const alertText = summary.content[0].type === "text" ? summary.content[0].text : "Registration check completed.";

        // Find registrar email (org_users with role 'registrar' or 'admin')
        const { data: admins } = await supabase
          .from("org_users")
          .select("user_id")
          .eq("organization_id", org.id)
          .in("role", ["admin", "registrar"])
          .limit(3);

        if (admins?.length) {
          for (const admin of admins) {
            const { data: authUser } = await supabase.auth.admin.getUserById(admin.user_id);
            if (authUser?.user?.email) {
              await sendEmail({
                to: authUser.user.email,
                subject: `Registration Alert — ${org.name}`,
                html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#1a1a1a;color:#e5e5e5;border-radius:12px">
<h2 style="color:#fff;margin:0 0 16px">Registration Guardian</h2>
<p style="font-size:14px;line-height:1.6">${alertText.replace(/\n/g, "<br>")}</p>
<p style="font-size:12px;color:#888;margin-top:16px">Pending: ${pendingMembers.length} | Expired: ${expiredMembers?.length ?? 0}</p>
<p style="font-size:11px;color:#555;margin-top:12px">Powered by ClubOS</p>
</div>`,
              });
            }
          }
        }

        // Log to agent_runs
        await supabase.from("agent_runs").insert({
          organization_id: org.id,
          agent_type: "registration_guardian",
          status: "completed",
          findings: {
            pending_members: pendingMembers.length,
            expired_members: expiredMembers?.length ?? 0,
            summary: alertText,
          },
          actions_taken: [{ action: "registrar_alert_sent", count: admins?.length ?? 0 }],
          ran_at: new Date().toISOString(),
        });

        return { alerts: pendingMembers.length };
      });

      totalAlerts += result.alerts;
    }

    return { orgs: orgs.length, totalAlerts };
  }
);
