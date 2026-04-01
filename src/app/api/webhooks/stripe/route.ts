import { NextRequest, NextResponse } from "next/server";
import { constructStripeEvent } from "@/lib/stripe/webhook";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const event = await constructStripeEvent(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(supabase, session);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(supabase, subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(supabase, subscription);
      break;
    }

    default:
      // Unhandled event type — acknowledge and move on
      break;
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  if (session.mode === "subscription") {
    await handleSubscriptionCheckout(supabase, session);
  } else {
    await handlePaymentCheckout(supabase, session);
  }
}

async function handlePaymentCheckout(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const memberId = session.metadata?.member_id;
  const orgId = session.metadata?.org_id;
  const membershipType = session.metadata?.membership_type;

  if (!memberId || !orgId) return;

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await supabase
    .from("members")
    .update({
      membership_status: "active",
      membership_type: membershipType ?? undefined,
      membership_expires_at: expiresAt.toISOString().split("T")[0],
      stripe_customer_id: session.customer as string | null,
    })
    .eq("id", memberId)
    .eq("organization_id", orgId);

  await supabase.from("audit_log").insert({
    organization_id: orgId,
    entity_type: "members",
    entity_id: memberId,
    action: "membership_activated",
    new_values: {
      membership_type: membershipType ?? null,
      payment_intent: typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
      amount_total: session.amount_total,
      currency: session.currency,
    },
  });
}

async function handleSubscriptionCheckout(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const memberId = session.metadata?.member_id;
  const orgId = session.metadata?.org_id;
  const planType = session.metadata?.plan_type;
  const stripeSubscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;
  const stripeCustomerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id;

  if (!memberId || !orgId || !stripeSubscriptionId || !stripeCustomerId) return;

  // Look up the member for phone info
  const { data: member } = await supabase
    .from("members")
    .select("phone_number, phone_hash")
    .eq("id", memberId)
    .single();

  if (!member) return;

  // Create subscription record
  await supabase.from("subscriptions").insert({
    organization_id: orgId,
    member_id: memberId,
    phone_number: member.phone_number,
    phone_hash: member.phone_hash,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    plan_type: planType ?? "monthly",
    status: "active",
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(
      Date.now() + (planType === "monthly" ? 30 : 365) * 86400000
    ).toISOString(),
  });

  // Update member's stripe_customer_id
  await supabase
    .from("members")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("id", memberId);

  await supabase.from("audit_log").insert({
    organization_id: orgId,
    entity_type: "subscriptions",
    entity_id: memberId,
    action: "subscription_created",
    new_values: {
      plan_type: planType,
      stripe_subscription_id: stripeSubscriptionId,
    },
  });
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const stripeSubscriptionId = subscription.id;
  const status = mapStripeStatus(subscription.status);

  // In Stripe v21+, current_period_start/end moved to SubscriptionItem
  const firstItem = subscription.items?.data?.[0];
  const periodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000).toISOString()
    : null;
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : null;

  await supabase
    .from("subscriptions")
    .update({
      status,
      ...(periodStart && { current_period_start: periodStart }),
      ...(periodEnd && { current_period_end: periodEnd }),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const stripeSubscriptionId = subscription.id;

  await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  // Also expire the member if they have no other active subscriptions
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("member_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (sub?.member_id) {
    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("member_id", sub.member_id)
      .eq("status", "active");

    if (count === 0) {
      await supabase
        .from("members")
        .update({ membership_status: "expired" })
        .eq("id", sub.member_id);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "cancelled";
    default:
      return "expired";
  }
}
