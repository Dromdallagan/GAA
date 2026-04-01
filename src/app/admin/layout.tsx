import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's organization membership
  const { data: orgUser } = await supabase
    .from("org_users")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!orgUser) {
    redirect("/login?error=no_org");
  }

  // Fetch the organization details
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, name_irish, slug, type")
    .eq("id", orgUser.organization_id)
    .single();

  if (!org) {
    redirect("/login?error=org_not_found");
  }

  return (
    <AdminShell
      orgName={org.name}
      orgNameIrish={org.name_irish}
      userEmail={user.email ?? ""}
      userAvatarUrl={user.user_metadata?.avatar_url as string | null ?? null}
    >
      {children}
    </AdminShell>
  );
}
