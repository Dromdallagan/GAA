import { createAdminClient } from "@/lib/supabase/admin";

export interface Tenant {
  id: string;
  name: string;
  nameIrish: string | null;
  slug: string;
  type: "county_board" | "club";
  parentId: string | null;
  domain: string | null;
  theme: {
    accent_color: string;
    crest_url?: string;
    secondary_color?: string;
  };
}

const tenantCache = new Map<string, { tenant: Tenant; expires: number }>();
const CACHE_TTL = 60_000; // 1 minute

export async function resolveTenantByDomain(
  hostname: string
): Promise<Tenant | null> {
  const cached = tenantCache.get(hostname);
  if (cached && cached.expires > Date.now()) {
    return cached.tenant;
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("domain", hostname)
    .single();

  if (!data) return null;

  const tenant: Tenant = {
    id: data.id,
    name: data.name,
    nameIrish: data.name_irish,
    slug: data.slug,
    type: data.type,
    parentId: data.parent_id,
    domain: data.domain,
    theme: data.theme as Tenant["theme"],
  };

  tenantCache.set(hostname, { tenant, expires: Date.now() + CACHE_TTL });
  return tenant;
}

export async function resolveTenantByTwilioNumber(
  phoneNumber: string
): Promise<Tenant | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("twilio_phone_sid", phoneNumber)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    nameIrish: data.name_irish,
    slug: data.slug,
    type: data.type,
    parentId: data.parent_id,
    domain: data.domain,
    theme: data.theme as Tenant["theme"],
  };
}
