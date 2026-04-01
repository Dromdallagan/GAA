import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { paymentReminders } from "@/lib/inngest/functions/payment-reminders";
import { fixtureBroadcast } from "@/lib/inngest/functions/fixture-broadcast";
import { registrationGuardian } from "@/lib/inngest/functions/registration-guardian";
import { revenueSentinel } from "@/lib/inngest/functions/revenue-sentinel";
import { fixtureIntelligence } from "@/lib/inngest/functions/fixture-intelligence";
import { contentEngine } from "@/lib/inngest/functions/content-engine";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    paymentReminders,
    fixtureBroadcast,
    registrationGuardian,
    revenueSentinel,
    fixtureIntelligence,
    contentEngine,
  ],
});
