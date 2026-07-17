import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function requireAuthenticatedUser(nextPath: string) {
  const loginPath = `/login?next=${encodeURIComponent(nextPath)}`;
  if (!isSupabaseConfigured) redirect(`${loginPath}&error=config`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect(loginPath);
  return data.user;
}
