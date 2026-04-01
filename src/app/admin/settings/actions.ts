"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createConnectAccount,
  createAccountLink,
  createDashboardLink,
  createAllMembershipProducts,
  getAccountStatus,
} from "@/lib/stripe/connect";

async function getAuthContext() {
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
    .select("id, name, slug, stripe_connect_id, settings")
    .eq("id", orgUser.organization_id)
    .single();

  if (!org) redirect("/login?error=org_not_found");

  return { supabase, user, orgUser, org };
}

export interface StripeSetupState {
  error?: string;
  url?: string;
}

/** Step 1: Create Express account + redirect to Stripe onboarding. */
export async function setupStripeConnect(): Promise<StripeSetupState> {
  const { supabase, user, org } = await getAuthContext();

  // Already connected — return dashboard link
  if (org.stripe_connect_id) {
    try {
      const url = await createDashboardLink(org.stripe_connect_id);
      return { url };
    } catch {
      return { error: "Failed to generate Stripe dashboard link." };
    }
  }

  try {
    const account = await createConnectAccount(
      org.name,
      user.email ?? `admin@${org.slug}.clubos.app`
    );

    // Save connect ID to organization
    const { error: updateError } = await supabase
      .from("organizations")
      .update({ stripe_connect_id: account.id })
      .eq("id", org.id);

    if (updateError) {
      return { error: `Failed to save Stripe account: ${updateError.message}` };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5555";
    const url = await createAccountLink(
      account.id,
      `${baseUrl}/admin/settings?stripe=complete`,
      `${baseUrl}/admin/settings?stripe=refresh`
    );

    revalidatePath("/admin/settings");
    return { url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: `Stripe setup failed: ${message}` };
  }
}

/** Resume onboarding if it was interrupted. */
export async function resumeStripeOnboarding(): Promise<StripeSetupState> {
  const { org } = await getAuthContext();

  if (!org.stripe_connect_id) {
    return { error: "No Stripe account found. Start setup first." };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5555";
    const url = await createAccountLink(
      org.stripe_connect_id,
      `${baseUrl}/admin/settings?stripe=complete`,
      `${baseUrl}/admin/settings?stripe=refresh`
    );
    return { url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: `Failed to generate onboarding link: ${message}` };
  }
}

/** Step 2: After onboarding, create membership products on the connected account. */
export async function initializeMembershipProducts(): Promise<StripeSetupState> {
  const { supabase, org } = await getAuthContext();

  if (!org.stripe_connect_id) {
    return { error: "Connect Stripe first before creating products." };
  }

  // Check if products already exist
  const settings = (org.settings ?? {}) as Record<string, unknown>;
  if (settings.stripe_price_map) {
    return { error: "Membership products already created." };
  }

  try {
    const status = await getAccountStatus(org.stripe_connect_id);
    if (!status.chargesEnabled) {
      return { error: "Complete Stripe onboarding before creating products." };
    }

    const priceMap = await createAllMembershipProducts(org.stripe_connect_id);

    // Store price IDs in org settings
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        settings: { ...settings, stripe_price_map: priceMap },
      })
      .eq("id", org.id);

    if (updateError) {
      return { error: `Failed to save price map: ${updateError.message}` };
    }

    revalidatePath("/admin/settings");
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: `Failed to create products: ${message}` };
  }
}

/** Get Stripe Express dashboard login link. */
export async function getStripeDashboardUrl(): Promise<StripeSetupState> {
  const { org } = await getAuthContext();

  if (!org.stripe_connect_id) {
    return { error: "Stripe not connected." };
  }

  try {
    const url = await createDashboardLink(org.stripe_connect_id);
    return { url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: `Failed to get dashboard link: ${message}` };
  }
}
