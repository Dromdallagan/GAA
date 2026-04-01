import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberForm } from "@/components/members/member-form";

export const metadata: Metadata = {
  title: "Register Member | ClubOS",
};

export default async function NewMemberPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <MemberForm />;
}
