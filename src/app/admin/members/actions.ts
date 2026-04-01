"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatE164, hashPhone } from "@/lib/utils/phone";
import { stripe } from "@/lib/stripe/client";
import { createCheckoutSession } from "@/lib/stripe/connect";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const memberSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone_number: z.string().min(7, "Phone number is required"),
  date_of_birth: z.string().optional(),
  membership_type: z.enum(["adult", "youth", "student", "family", "social"], {
    message: "Select a membership type",
  }),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MemberActionState {
  errors?: Record<string, string[]>;
  message?: string;
  checkoutUrl?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id")
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

  return { supabase, org };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Register a new member and optionally generate a checkout link. */
export async function registerMember(
  _prevState: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const { supabase, org } = await getAuthContext();

  const raw = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    phone_number: formData.get("phone_number") as string,
    date_of_birth: (formData.get("date_of_birth") as string) || undefined,
    membership_type: formData.get("membership_type") as string,
  };

  const result = memberSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const phone = formatE164(result.data.phone_number);
  const phoneHash = hashPhone(result.data.phone_number);

  // Check for duplicate phone in this org
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("organization_id", org.id)
    .eq("phone_hash", phoneHash)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { message: "A member with this phone number already exists." };
  }

  // Create Stripe customer on the connected account (if Stripe is set up)
  let stripeCustomerId: string | null = null;
  if (org.stripe_connect_id) {
    try {
      const customer = await stripe.customers.create(
        {
          email: result.data.email,
          name: `${result.data.first_name} ${result.data.last_name}`,
          phone,
          metadata: { org_id: org.id },
        },
        { stripeAccount: org.stripe_connect_id }
      );
      stripeCustomerId = customer.id;
    } catch {
      return { message: "Failed to create Stripe customer. Check Stripe connection." };
    }
  }

  // Insert member into Supabase
  const { data: member, error: insertError } = await supabase
    .from("members")
    .insert({
      organization_id: org.id,
      first_name: result.data.first_name,
      last_name: result.data.last_name,
      email: result.data.email,
      phone_number: phone,
      phone_hash: phoneHash,
      date_of_birth: result.data.date_of_birth || null,
      membership_type: result.data.membership_type,
      membership_status: "pending",
      stripe_customer_id: stripeCustomerId,
    })
    .select("id")
    .single();

  if (insertError) {
    return { message: `Failed to register member: ${insertError.message}` };
  }

  // Generate checkout URL if Stripe is fully configured
  const settings = (org.settings ?? {}) as Record<string, unknown>;
  const priceMap = settings.stripe_price_map as Record<string, string> | undefined;

  if (org.stripe_connect_id && priceMap && priceMap[result.data.membership_type]) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5555";
      const checkoutUrl = await createCheckoutSession({
        connectedAccountId: org.stripe_connect_id,
        priceId: priceMap[result.data.membership_type],
        customerEmail: result.data.email,
        membershipType: result.data.membership_type,
        memberId: member.id,
        orgId: org.id,
        successUrl: `${baseUrl}/admin/members?payment=success`,
        cancelUrl: `${baseUrl}/admin/members?payment=cancelled`,
      });

      revalidatePath("/admin/members");
      revalidatePath("/admin/dashboard");
      return { checkoutUrl };
    } catch {
      // Member created but checkout failed — still redirect to members list
      revalidatePath("/admin/members");
      revalidatePath("/admin/dashboard");
      return { message: "Member registered but payment link generation failed. You can retry from the member detail page." };
    }
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin/dashboard");
  redirect("/admin/members");
}

/** Generate a payment checkout link for an existing pending member. */
export async function generatePaymentLink(
  memberId: string
): Promise<MemberActionState> {
  const { supabase, org } = await getAuthContext();

  if (!org.stripe_connect_id) {
    return { message: "Stripe is not connected. Go to Settings to set up Stripe." };
  }

  const settings = (org.settings ?? {}) as Record<string, unknown>;
  const priceMap = settings.stripe_price_map as Record<string, string> | undefined;
  if (!priceMap) {
    return { message: "Membership products not set up. Go to Settings to create them." };
  }

  const { data: member } = await supabase
    .from("members")
    .select("id, email, membership_type, stripe_customer_id")
    .eq("id", memberId)
    .eq("organization_id", org.id)
    .single();

  if (!member) {
    return { message: "Member not found." };
  }

  const membershipType = member.membership_type ?? "adult";
  const priceId = priceMap[membershipType];
  if (!priceId) {
    return { message: `No price configured for membership type: ${membershipType}` };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5555";
    const checkoutUrl = await createCheckoutSession({
      connectedAccountId: org.stripe_connect_id,
      priceId,
      customerEmail: member.email ?? "",
      membershipType,
      memberId: member.id,
      orgId: org.id,
      successUrl: `${baseUrl}/admin/members?payment=success`,
      cancelUrl: `${baseUrl}/admin/members?payment=cancelled`,
    });

    return { checkoutUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { message: `Failed to generate payment link: ${message}` };
  }
}
