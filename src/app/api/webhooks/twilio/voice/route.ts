import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/claude/client";
import { hashPhone } from "@/lib/utils/phone";
import twilio from "twilio";

/**
 * Twilio voice/media webhook — handles voice notes sent via WhatsApp.
 * Twilio provides a MediaUrl and optionally a transcription.
 * We use Claude to parse the transcribed text into structured match data.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  // Validate Twilio signature
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL_VOICE ?? process.env.TWILIO_WEBHOOK_URL ?? "";
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    webhookUrl,
    params
  );
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const from = (params.From ?? "").replace("whatsapp:", "");
  const messageBody = params.Body ?? "";
  const toNumber = (params.To ?? "").replace("whatsapp:", "");

  const supabase = createAdminClient();

  // Resolve org by Twilio number
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("twilio_phone_sid", toNumber)
    .single();

  if (!org) {
    return new NextResponse("<Response/>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const phoneHash = hashPhone(from);
  const { data: member } = await supabase
    .from("members")
    .select("id, first_name")
    .eq("organization_id", org.id)
    .eq("phone_hash", phoneHash)
    .maybeSingle();

  // Twilio sends transcription in Body or TranscriptionText
  const transcription = params.TranscriptionText ?? messageBody;

  if (!transcription?.trim()) {
    return new NextResponse("<Response/>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Use Claude to parse the voice transcription
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    messages: [{
      role: "user",
      content: `You are a GAA match result parser. A club officer sent a voice note that was transcribed. Extract structured match data.

Transcription: "${transcription}"

If this contains a match result, respond in JSON format:
{"type": "result", "home_team": "...", "away_team": "...", "home_goals": N, "home_points": N, "away_goals": N, "away_points": N, "notes": "any extra info"}

If this contains a match update (goal, point, card), respond:
{"type": "event", "event_type": "goal|point|card", "team": "home|away", "player": "name or null", "minute": N or null, "notes": "..."}

If you can't parse it, respond:
{"type": "unknown", "text": "original text"}

Respond ONLY with the JSON, no other text.`,
    }],
  });

  const aiText = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const parsed = JSON.parse(aiText) as Record<string, unknown>;

    if (parsed.type === "result") {
      await supabase.from("content_queue").insert({
        organization_id: org.id,
        type: "match_report",
        content: `Voice result from ${member?.first_name ?? "officer"}: ${transcription}`,
        status: "pending_approval",
        metadata: JSON.parse(JSON.stringify({
          source: "voice_note",
          parsed_result: parsed,
          from_phone: phoneHash,
          member_id: member?.id ?? null,
        })),
      });
    }

    if (parsed.type === "event" && typeof parsed.event_type === "string") {
      const { data: liveFixture } = await supabase
        .from("fixtures")
        .select("id")
        .eq("organization_id", org.id)
        .eq("status", "live")
        .limit(1)
        .maybeSingle();

      if (liveFixture) {
        await supabase.from("match_events").insert({
          organization_id: org.id,
          fixture_id: liveFixture.id,
          event_type: parsed.event_type as string,
          team: (parsed.team as string) ?? "home",
          player_name: (parsed.player as string) ?? null,
          minute: typeof parsed.minute === "number" ? parsed.minute : null,
          description: `Voice update: ${transcription}`,
        });
      }
    }
  } catch {
    await supabase.from("content_queue").insert({
      organization_id: org.id,
      type: "match_report",
      content: `Voice note (unparsed): ${transcription}`,
      status: "draft",
      metadata: JSON.parse(JSON.stringify({
        source: "voice_note",
        raw_transcription: transcription,
        ai_response: aiText,
        from_phone: phoneHash,
      })),
    });
  }

  return new NextResponse("<Response/>", {
    headers: { "Content-Type": "text/xml" },
  });
}
