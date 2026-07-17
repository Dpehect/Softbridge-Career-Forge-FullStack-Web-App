import type { Metadata } from "next";
import { AccountView } from "@/components/auth/AccountView";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await requireAuthenticatedUser("/account");
  const metadata = user.user_metadata as { full_name?: string; name?: string };
  const name = metadata.full_name || metadata.name || user.email?.split("@")[0] || "CareerForge";

  return (
    <AccountView
      email={user.email || ""}
      name={name}
      provider={String(user.app_metadata.provider || "google")}
    />
  );
}
