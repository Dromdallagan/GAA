import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { validateTwilioWebhook } from "@/lib/twilio/webhook";
import { twilioClient } from "@/lib/twilio/client";
import { resolveTenantByTwilioNumber } from "@/lib/tenant/resolve";
import { createAdminClient } from "@/lib/supabase/admin";
import { webhookRatelimit } from "@/lib/ratelimit";
import { chat } from "@/lib/claude/chat";
import { hashPhone, maskPhone } from "@/lib/utils/phone";
import { handleError, AppError, ErrorCodes } from "@/lib/utils/errors";

// Twilio expects TwiML or 200 — never cache
export const dynamic = "force-dynamic";

// Maximum conversation history to send to Claude (pairs of messages)
const MAX_HISTORY_MESSAGES = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyTwiml(): Response {
  return new Response("<Response/>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function stripWhatsAppPrefix(phone: string): string {
  return phone.replace(/^whatsapp:/, "");
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/twilio
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  // 1. Validate Twilio signature
  const { valid, params } = await validateTwilioWebhook(request);
  if (!valid) {
    handleError(
      new AppError("Invalid Twilio signature", ErrorCodes.TWILIO_INVALID_SIGNATURE, 403),
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const from = params.From ?? "";
  const to = params.To ?? "";
  const body = (params.Body ?? "").trim();
  const callerPhone = stripWhatsAppPrefix(from);
  const toPhone = stripWhatsAppPrefix(to);

  // Ignore empty messages
  if (!body) return emptyTwiml();

  // 2. Rate limit by caller phone
  const { success: rateLimitOk } = await webhookRatelimit.limit(callerPhone);
  if (!rateLimitOk) {
    handleError(
      new AppError("Rate limited", ErrorCodes.RATE_LIMITED, 429),
    );
    return emptyTwiml();
  }

  // 3. Resolve tenant by the Twilio number (To)
  const tenant = await resolveTenantByTwilioNumber(toPhone);
  if (!tenant) {
    handleError(
      new AppError(
        `No tenant for number ${maskPhone(toPhone)}`,
        ErrorCodes.TENANT_NOT_FOUND,
        404,
      ),
    );
    return emptyTwiml();
  }

  const supabase = createAdminClient();

  // 4. Find or create conversation
  const { data: existingConvo } = await supabase
    .from("conversations")
    .select("id, member_id, is_admin_session, context")
    .eq("organization_id", tenant.id)
    .eq("phone_number", callerPhone)
    .limit(1)
    .single();

  let conversationId: string;
  let memberId: string | null = null;
  let isAdmin = false;
  let history: Anthropic.Messages.MessageParam[] = [];

  if (existingConvo) {
    conversationId = existingConvo.id;
    memberId = existingConvo.member_id;
    isAdmin = existingConvo.is_admin_session ?? false;

    // Load conversation history from context
    const ctx = existingConvo.context as {
      history?: Array<{ role: string; content: string }>;
    } | null;
    if (ctx?.history) {
      history = ctx.history
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
    }

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
  } else {
    // Look up member by phone hash
    const phoneHash = hashPhone(callerPhone);
    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("organization_id", tenant.id)
      .eq("phone_hash", phoneHash)
      .limit(1)
      .single();

    memberId = member?.id ?? null;

    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({
        organization_id: tenant.id,
        phone_number: callerPhone,
        member_id: memberId,
        is_admin_session: false,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    conversationId = newConvo?.id ?? "";
  }

  // 5. Call Claude AI
  const reply = await chat(body, {
    orgId: tenant.id,
    orgName: tenant.name,
    callerPhone,
    isAdmin,
    history,
  });

  // 6. Update conversation context with new messages
  const updatedHistory = [
    ...history.map((m) => ({ role: m.role, content: m.content as string })),
    { role: "user", content: body },
    { role: "assistant", content: reply },
  ].slice(-MAX_HISTORY_MESSAGES);

  await supabase
    .from("conversations")
    .update({
      context: { history: updatedHistory },
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  // 7. Update member last_interaction_at
  if (memberId) {
    await supabase
      .from("members")
      .update({ last_interaction_at: new Date().toISOString() })
      .eq("id", memberId);
  }

  // 8. Send reply via Twilio REST API
  try {
    await twilioClient.messages.create({
      from: params.To,
      to: params.From,
      body: reply,
    });
  } catch (error) {
    handleError(error, {
      code: ErrorCodes.TWILIO_SEND_FAILED,
      conversationId,
    });
  }

  // 9. Return empty TwiML (response already sent via REST)
  return emptyTwiml();
}
