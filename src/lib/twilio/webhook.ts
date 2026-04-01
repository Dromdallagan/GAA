import twilio from "twilio";

const { validateRequest } = twilio;

export async function validateTwilioWebhook(
  request: Request
): Promise<{ valid: boolean; params: Record<string, string> }> {
  const signature = request.headers.get("x-twilio-signature");
  if (!signature) return { valid: false, params: {} };

  const body = await request.text();
  const params = Object.fromEntries(new URLSearchParams(body));
  const url = process.env.TWILIO_WEBHOOK_URL!;

  const valid = validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );

  return { valid, params };
}
