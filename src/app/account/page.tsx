import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountView } from "@/components/auth/AccountView";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  if (!isSupabaseConfigured) redirect("/login?error=config&next=/account");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?next=/account");

  const metadata = data.user.user_metadata as { full_name?: string; name?: string };
  const name = metadata.full_name || metadata.name || data.user.email?.split("@")[0] || "CareerForge";

  return (
    <AccountView
      email={data.user.email || ""}
      name={name}
      provider={String(data.user.app_metadata.provider || "google")}
    />
  );
}
