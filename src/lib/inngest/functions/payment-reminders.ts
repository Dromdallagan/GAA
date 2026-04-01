import { inngest } from "../client";
import { createAdminClient } from "@/lib/supabase/admin";
import { twilioClient } from "@/lib/twilio/client";
import { sendReminderEmail } from "@/lib/email/send";

/**
 * Payment reminder sequence — runs daily, finds members expiring in 21/14/7 days
 * and sends WhatsApp + email reminders.
 */
export const paymentReminders = inngest.createFunction(
  {
    id: "payment-reminders",
    name: "Payment Reminder Sequence",
    triggers: [{ cron: "0 10 * * *" }], // 10am daily
  },
  async ({ step }) => {
    const supabase = createAdminClient();

    const reminders = await step.run("find-expiring-members", async () => {
      const today = new Date();
      const targets = [7, 14, 21];
      const results: Array<{
        memberId: string;
        email: string;
        phone: string;
        firstName: string;
        orgId: string;
        orgName: string;
        daysUntilExpiry: number;
        twilioPhoneSid: string | null;
      }> = [];

      for (const days of targets) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + days);
        const dateStr = targetDate.toISOString().split("T")[0];

        const { data: members } = await supabase
          .from("members")
          .select(`
            id, first_name, email, phone_number, organization_id,
            organizations!members_organization_id_fkey ( name, twilio_phone_sid )
          `)
          .eq("membership_status", "active")
          .eq("membership_expires_at", dateStr);

        if (members) {
          for (const m of members) {
            const org = m.organizations as unknown as { name: string; twilio_phone_sid: string | null } | null;
            if (m.email && org) {
              results.push({
                memberId: m.id,
                email: m.email,
                phone: m.phone_number,
                firstName: m.first_name ?? "Member",
                orgId: m.organization_id,
                orgName: org.name,
                daysUntilExpiry: days,
                twilioPhoneSid: org.twilio_phone_sid,
              });
            }
          }
        }
      }

      return results;
    });

    if (reminders.length === 0) return { sent: 0 };

    let sent = 0;
    for (const reminder of reminders) {
      await step.run(`remind-${reminder.memberId}-${reminder.daysUntilExpiry}d`, async () => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5555";
        const renewUrl = `${baseUrl}/admin/members?renew=${reminder.memberId}`;

        // Send email
        await sendReminderEmail({
          to: reminder.email,
          memberName: reminder.firstName,
          orgName: reminder.orgName,
          daysUntilExpiry: reminder.daysUntilExpiry,
          renewUrl,
        });

        // Send WhatsApp if Twilio number configured
        if (reminder.twilioPhoneSid) {
          const urgency = reminder.daysUntilExpiry <= 7
            ? "expires in *7 days*"
            : reminder.daysUntilExpiry <= 14
              ? "expires in *2 weeks*"
              : "expires in *3 weeks*";

          await twilioClient.messages.create({
            body: `Hi ${reminder.firstName}, your ${reminder.orgName} membership ${urgency}. Renew now to stay connected with your club. Reply RENEW for a payment link.`,
            from: `whatsapp:${reminder.twilioPhoneSid}`,
            to: `whatsapp:${reminder.phone}`,
          });
        }

        sent++;
      });
    }

    // Log agent run
    await step.run("log-agent-run", async () => {
      await supabase.from("agent_runs").insert({
        organization_id: reminders[0]?.orgId ?? null,
        agent_type: "revenue_sentinel",
        status: "completed",
        findings: { expiring_members: reminders.length, reminders_sent: sent },
        actions_taken: [{ action: "sent_payment_reminders", count: sent }],
        ran_at: new Date().toISOString(),
      });
    });

    return { sent, total: reminders.length };
  }
);
