import { createHash } from "crypto";

export function formatE164(phone: string, defaultCountry = "+44"): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("0")) {
      cleaned = defaultCountry + cleaned.slice(1);
    } else {
      cleaned = defaultCountry + cleaned;
    }
  }
  return cleaned;
}

export function hashPhone(phone: string): string {
  const e164 = formatE164(phone);
  return createHash("sha256").update(e164).digest("hex");
}

export function maskPhone(phone: string): string {
  if (phone.length <= 6) return "***" + phone.slice(-3);
  return phone.slice(0, 4) + "***" + phone.slice(-3);
}
