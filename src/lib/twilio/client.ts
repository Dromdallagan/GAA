import twilio from "twilio";
import type { Twilio } from "twilio";

let _client: Twilio | null = null;

function getTwilioClient(): Twilio {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  return _client;
}

export const twilioClient: Twilio = new Proxy({} as Twilio, {
  get(_target, prop, receiver) {
    const instance = getTwilioClient();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
