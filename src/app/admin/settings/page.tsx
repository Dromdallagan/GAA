import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccountStatus } from "@/lib/stripe/connect";
import { StripeSettings } from "./stripe-settings";

export const metadata: Metadata = {
  title: "Settings | ClubOS",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!orgUser) redirect("/login?error=no_org");

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, stripe_connect_id, settings")
    .eq("id", orgUser.organization_id)
    .single();

  if (!org) redirect("/login?error=org_not_found");

  // Fetch Stripe account status if connected
  let stripeStatus: { chargesEnabled: boolean; detailsSubmitted: boolean } | null = null;
  if (org.stripe_connect_id) {
    try {
      stripeStatus = await getAccountStatus(org.stripe_connect_id);
    } catch {
      stripeStatus = null;
    }
  }

  const settings = (org.settings ?? {}) as Record<string, unknown>;
  const hasPriceMap = Boolean(settings.stripe_price_map);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organisation&apos;s integrations and configuration.
        </p>
      </div>

      <StripeSettings
        isConnected={Boolean(org.stripe_connect_id)}
        chargesEnabled={stripeStatus?.chargesEnabled ?? false}
        detailsSubmitted={stripeStatus?.detailsSubmitted ?? false}
        hasPriceMap={hasPriceMap}
      />
    </div>
  );
}
