import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginView } from "@/components/auth/LoginView";
import { safeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to CareerForge securely with Google and Supabase Auth.",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  if (isSupabaseConfigured) {
    let signedIn = false;

    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getClaims();
      signedIn = Boolean(data?.claims);
    } catch {
      // Keep the sign-in page available during a temporary auth service outage.
    }

    if (signedIn) redirect(nextPath);
  }

  return <LoginView configured={isSupabaseConfigured} nextPath={nextPath} errorCode={params.error} />;
}
