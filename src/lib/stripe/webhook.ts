import Stripe from "stripe";
import { stripe } from "./client";

export async function constructStripeEvent(
  body: string,
  signature: string
): Promise<Stripe.Event | null> {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return null;
  }
}
