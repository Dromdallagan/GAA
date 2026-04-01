import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminDashboard } from "./super-admin-dashboard";

export const metadata: Metadata = {
  title: "Super Admin | ClubOS",
};

export default async function SuperAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if user belongs to QED (parent org — type = 'platform')
  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id, role, organizations!inner(type)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const orgType = (orgUser?.organizations as { type: string } | null)?.type;
  if (!orgUser || (orgType !== "platform" && orgUser.role !== "super_admin")) {
    redirect("/admin/dashboard");
  }

  // Fetch all county board orgs
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug, stripe_connect_id, created_at")
    .eq("type", "county_board")
    .order("name");

  // Get member counts per org
  const orgStats: Array<{
    id: string;
    name: string;
    slug: string;
    hasStripe: boolean;
    memberCount: number;
    activeCount: number;
    createdAt: string | null;
  }> = [];

  for (const org of orgs ?? []) {
    const { count: total } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", org.id);

    const { count: active } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", org.id)
      .eq("membership_status", "active");

    orgStats.push({
      id: org.id,
      name: org.name,
      slug: org.slug,
      hasStripe: Boolean(org.stripe_connect_id),
      memberCount: total ?? 0,
      activeCount: active ?? 0,
      createdAt: org.created_at,
    });
  }

  // Platform totals
  const { count: totalMembers } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true });

  const { data: revenueData } = await supabase
    .from("revenue_reports")
    .select("qed_margin_amount")
    .not("qed_margin_amount", "is", null);

  const totalMargin = (revenueData ?? []).reduce(
    (sum, r) => sum + (r.qed_margin_amount ?? 0), 0
  );

  return (
    <SuperAdminDashboard
      orgs={orgStats}
      totalMembers={totalMembers ?? 0}
      totalMargin={totalMargin}
    />
  );
}
