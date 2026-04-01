import { stripe } from "./client";
import type Stripe from "stripe";

const QED_APPLICATION_FEE_PERCENT = 10;

/**
 * Membership pricing defaults (GBP pence).
 * County boards can override via Stripe Dashboard.
 */
export const MEMBERSHIP_PRICES: Record<
  string,
  { label: string; amountPence: number; description: string }
> = {
  adult: { label: "Adult", amountPence: 5000, description: "Adult membership (16+)" },
  youth: { label: "Youth", amountPence: 2500, description: "Youth membership (U16)" },
  student: { label: "Student", amountPence: 3000, description: "Student membership" },
  family: { label: "Family", amountPence: 10000, description: "Family membership (2 adults + children)" },
  social: { label: "Social", amountPence: 2000, description: "Social / non-playing membership" },
};

/** Create a Stripe Express connected account for a county board. */
export async function createConnectAccount(
  orgName: string,
  orgEmail: string
): Promise<Stripe.Account> {
  return stripe.accounts.create({
    type: "express",
    country: "GB",
    email: orgEmail,
    business_type: "non_profit",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      name: orgName,
      mcc: "7941", // Sports clubs / recreation
    },
  });
}

/** Generate onboarding link for an Express account. */
export async function createAccountLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    return_url: returnUrl,
    refresh_url: refreshUrl,
  });
  return link.url;
}

/** Generate Stripe Express dashboard login link. */
export async function createDashboardLink(
  accountId: string
): Promise<string> {
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}

/** Check if an Express account has completed onboarding. */
export async function getAccountStatus(
  accountId: string
): Promise<{ chargesEnabled: boolean; detailsSubmitted: boolean }> {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
  };
}

/** Create a Stripe product + price for a membership type on a connected account. */
export async function createMembershipProduct(
  connectedAccountId: string,
  type: string
): Promise<{ productId: string; priceId: string }> {
  const config = MEMBERSHIP_PRICES[type];
  if (!config) throw new Error(`Unknown membership type: ${type}`);

  const product = await stripe.products.create(
    {
      name: `${config.label} Membership`,
      description: config.description,
      metadata: { membership_type: type },
    },
    { stripeAccount: connectedAccountId }
  );

  const price = await stripe.prices.create(
    {
      product: product.id,
      unit_amount: config.amountPence,
      currency: "gbp",
      metadata: { membership_type: type },
    },
    { stripeAccount: connectedAccountId }
  );

  return { productId: product.id, priceId: price.id };
}

/** Create all membership products for a connected account. Returns price map. */
export async function createAllMembershipProducts(
  connectedAccountId: string
): Promise<Record<string, string>> {
  const priceMap: Record<string, string> = {};
  for (const type of Object.keys(MEMBERSHIP_PRICES)) {
    const { priceId } = await createMembershipProduct(connectedAccountId, type);
    priceMap[type] = priceId;
  }
  return priceMap;
}

/** Create a Checkout Session on the connected account with QED application fee. */
export async function createCheckoutSession(opts: {
  connectedAccountId: string;
  priceId: string;
  customerEmail: string;
  membershipType: string;
  memberId: string;
  orgId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [{ price: opts.priceId, quantity: 1 }],
      customer_email: opts.customerEmail,
      payment_intent_data: {
        application_fee_amount: Math.round(
          (MEMBERSHIP_PRICES[opts.membershipType]?.amountPence ?? 0) *
            (QED_APPLICATION_FEE_PERCENT / 100)
        ),
      },
      metadata: {
        member_id: opts.memberId,
        org_id: opts.orgId,
        membership_type: opts.membershipType,
      },
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
    },
    { stripeAccount: opts.connectedAccountId }
  );

  if (!session.url) throw new Error("Failed to create checkout session");
  return session.url;
}

// ---------------------------------------------------------------------------
// Supporter Subscriptions (recurring billing)
// ---------------------------------------------------------------------------

export const SUPPORTER_PLANS: Record<
  string,
  { label: string; amountPence: number; interval: "month" | "year" }
> = {
  monthly: { label: "Monthly Supporter", amountPence: 500, interval: "month" },
  annual: { label: "Annual Supporter", amountPence: 5000, interval: "year" },
  family: { label: "Family Annual Supporter", amountPence: 8000, interval: "year" },
};

/** Create recurring subscription products + prices on connected account. */
export async function createSubscriptionProducts(
  connectedAccountId: string
): Promise<Record<string, string>> {
  const priceMap: Record<string, string> = {};

  for (const [planType, config] of Object.entries(SUPPORTER_PLANS)) {
    const product = await stripe.products.create(
      {
        name: config.label,
        metadata: { plan_type: planType },
      },
      { stripeAccount: connectedAccountId }
    );

    const price = await stripe.prices.create(
      {
        product: product.id,
        unit_amount: config.amountPence,
        currency: "gbp",
        recurring: { interval: config.interval },
        metadata: { plan_type: planType },
      },
      { stripeAccount: connectedAccountId }
    );

    priceMap[planType] = price.id;
  }

  return priceMap;
}

/** Create a Checkout Session for a recurring subscription. */
export async function createSubscriptionCheckout(opts: {
  connectedAccountId: string;
  priceId: string;
  planType: string;
  customerEmail: string;
  memberId: string;
  orgId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      line_items: [{ price: opts.priceId, quantity: 1 }],
      customer_email: opts.customerEmail,
      subscription_data: {
        application_fee_percent: QED_APPLICATION_FEE_PERCENT,
        metadata: {
          member_id: opts.memberId,
          org_id: opts.orgId,
          plan_type: opts.planType,
        },
      },
      metadata: {
        member_id: opts.memberId,
        org_id: opts.orgId,
        plan_type: opts.planType,
      },
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
    },
    { stripeAccount: opts.connectedAccountId }
  );

  if (!session.url) throw new Error("Failed to create subscription checkout");
  return session.url;
}

/** Create a Stripe Customer Portal session for self-serve billing. */
export async function createCustomerPortalSession(
  connectedAccountId: string,
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create(
    {
      customer: customerId,
      return_url: returnUrl,
    },
    { stripeAccount: connectedAccountId }
  );

  return session.url;
}
