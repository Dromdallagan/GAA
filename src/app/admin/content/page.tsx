import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentList } from "./content-list";

export const metadata: Metadata = {
  title: "Content Queue | ClubOS",
};

export default async function ContentPage() {
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

  const { data: items } = await supabase
    .from("content_queue")
    .select("*")
    .eq("organization_id", orgUser.organization_id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <ContentList items={items ?? []} />;
}
