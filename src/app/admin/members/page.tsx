import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MembersList } from "./members-list";

export const metadata: Metadata = {
  title: "Members | ClubOS",
};

export default async function MembersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the user's organization
  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!orgUser) {
    redirect("/login?error=no_org");
  }

  // Fetch all members for this organization
  const { data: members } = await supabase
    .from("members")
    .select(
      "id, first_name, last_name, email, membership_type, membership_status, membership_expires_at, engagement_score, created_at"
    )
    .eq("organization_id", orgUser.organization_id)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  return <MembersList members={members ?? []} />;
}
