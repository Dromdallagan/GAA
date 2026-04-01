import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AgentHistory } from "./agent-history";

export const metadata: Metadata = {
  title: "AI Agents | ClubOS",
};

export default async function AgentsPage() {
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

  const { data: runs } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("organization_id", orgUser.organization_id)
    .order("ran_at", { ascending: false })
    .limit(50);

  return <AgentHistory runs={runs ?? []} />;
}
