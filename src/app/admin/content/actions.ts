"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getOrgId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!orgUser) redirect("/login?error=no_org");
  return orgUser.organization_id;
}

export async function approveContent(contentId: string): Promise<{ error?: string }> {
  const orgId = await getOrgId();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("content_queue")
    .update({
      status: "approved",
      approved_by: user?.id ?? null,
      approved_at: new Date().toISOString(),
    })
    .eq("id", contentId)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/admin/content");
  revalidatePath("/admin/dashboard");
  return {};
}

export async function rejectContent(contentId: string): Promise<{ error?: string }> {
  const orgId = await getOrgId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_queue")
    .update({ status: "rejected" })
    .eq("id", contentId)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/admin/content");
  revalidatePath("/admin/dashboard");
  return {};
}

export async function publishContent(contentId: string): Promise<{ error?: string }> {
  const orgId = await getOrgId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_queue")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", contentId)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/admin/content");
  revalidatePath("/admin/dashboard");
  return {};
}
