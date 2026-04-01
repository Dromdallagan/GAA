import { inngest } from "../client";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/claude/client";
import { sendEmail } from "@/lib/email/send";

/**
 * Revenue Sentinel — runs every Monday at 9am.
 * Generates weekly treasurer digest: revenue, renewals, outstanding payments.
 */
export const revenueSentinel = inngest.createFunction(
  {
    id: "revenue-sentinel",
    name: "Revenue Sentinel",
    triggers: [{ cron: "0 9 * * 1" }], // Monday 9am
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
      await step.run(`digest-${org.id}`, async () => {
        // Active members
        const { count: activeCount } = await supabase
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", org.id)
          .eq("membership_status", "active");

        // Pending members (unpaid)
        const { count: pendingCount } = await supabase
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", org.id)
          .eq("membership_status", "pending");

        // Expiring this month
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
        const { count: expiringCount } = await supabase
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", org.id)
          .eq("membership_status", "active")
          .lte("membership_expires_at", endOfMonth.toISOString().split("T")[0]);

        // Active subscriptions
        const { count: subCount } = await supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", org.id)
          .eq("status", "active");

        // Latest revenue report
        const { data: latestReport } = await supabase
          .from("revenue_reports")
          .select("gross_revenue, net_to_organization, stripe_fees, qed_margin_amount")
          .eq("organization_id", org.id)
          .order("period_start", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Generate digest with Claude
        const digest = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          messages: [{
            role: "user",
            content: `You are a GAA treasurer's assistant. Generate a concise weekly revenue digest.

Active members: ${activeCount ?? 0}
Pending (unpaid): ${pendingCount ?? 0}
Expiring this month: ${expiringCount ?? 0}
Active subscriptions: ${subCount ?? 0}
Latest report gross: £${latestReport?.gross_revenue?.toFixed(2) ?? "0.00"}
Latest report net: £${latestReport?.net_to_organization?.toFixed(2) ?? "0.00"}

Write a 4-5 sentence treasurer digest. Include key metrics, flag concerns (high pending count, many expirations), and suggest one action item. Be professional and concise.`,
          }],
        });

        const digestText = digest.content[0].type === "text" ? digest.content[0].text : "Revenue check completed.";

        // Email admins/treasurers
        const { data: admins } = await supabase
          .from("org_users")
          .select("user_id")
          .eq("organization_id", org.id)
          .in("role", ["admin", "treasurer"])
          .limit(3);

        if (admins?.length) {
          for (const admin of admins) {
            const { data: authUser } = await supabase.auth.admin.getUserById(admin.user_id);
            if (authUser?.user?.email) {
              await sendEmail({
                to: authUser.user.email,
                subject: `Weekly Revenue Digest — ${org.name}`,
                html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#1a1a1a;color:#e5e5e5;border-radius:12px">
<h2 style="color:#fff;margin:0 0 16px">Revenue Sentinel — Weekly Digest</h2>
<p style="font-size:14px;line-height:1.6">${digestText.replace(/\n/g, "<br>")}</p>
<table style="width:100%;font-size:13px;color:#ccc;margin-top:16px;border-collapse:collapse">
<tr><td style="padding:4px 0;color:#888">Active Members</td><td style="text-align:right">${activeCount ?? 0}</td></tr>
<tr><td style="padding:4px 0;color:#888">Pending Payment</td><td style="text-align:right;color:#f59e0b">${pendingCount ?? 0}</td></tr>
<tr><td style="padding:4px 0;color:#888">Expiring This Month</td><td style="text-align:right;color:#ef4444">${expiringCount ?? 0}</td></tr>
<tr><td style="padding:4px 0;color:#888">Active Subscriptions</td><td style="text-align:right">${subCount ?? 0}</td></tr>
</table>
<p style="font-size:11px;color:#555;margin-top:16px">Powered by ClubOS</p>
</div>`,
              });
            }
          }
        }

        await supabase.from("agent_runs").insert({
          organization_id: org.id,
          agent_type: "revenue_sentinel",
          status: "completed",
          findings: {
            active_members: activeCount ?? 0,
            pending_members: pendingCount ?? 0,
            expiring_this_month: expiringCount ?? 0,
            active_subscriptions: subCount ?? 0,
          },
          actions_taken: [{ action: "treasurer_digest_sent", count: admins?.length ?? 0 }],
          ran_at: new Date().toISOString(),
        });
      });
    }

    return { orgs: orgs.length };
  }
);
