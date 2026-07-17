import { requireAuthenticatedUser } from "@/lib/supabase/auth";

export async function ProtectedWorkspace({
  children,
  nextPath,
}: {
  children: React.ReactNode;
  nextPath: string;
}) {
  // Authentication is now optional for general workspace pages to support local-only usage.
  // Account management (/account) will still strictly enforce authentication.
  return children;
}
