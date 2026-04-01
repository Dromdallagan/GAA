import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RevenueContent } from "./revenue-content";

export const metadata: Metadata = {
  title: "Revenue | ClubOS",
};

export default async function RevenuePage() {
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

  const orgId = orgUser.organization_id;

  // Fetch revenue reports
  const { data: reports } = await supabase
    .from("revenue_reports")
    .select("*")
    .eq("organization_id", orgId)
    .order("period_start", { ascending: false })
    .limit(12);

  // Fetch active member count
  const { count: activeMembers } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("membership_status", "active");

  // Fetch active subscriptions count
  const { count: activeSubscriptions } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "active");

  // Fetch pending members (revenue potential)
  const { count: pendingMembers } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("membership_status", "pending");

  return (
    <RevenueContent
      reports={reports ?? []}
      activeMembers={activeMembers ?? 0}
      activeSubscriptions={activeSubscriptions ?? 0}
      pendingMembers={pendingMembers ?? 0}
    />
  );
}
