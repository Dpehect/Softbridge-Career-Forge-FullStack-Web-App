import { requireAuthenticatedUser } from "@/lib/supabase/auth";

export async function ProtectedWorkspace({
  children,
  nextPath,
}: {
  children: React.ReactNode;
  nextPath: string;
}) {
  await requireAuthenticatedUser(nextPath);
  return children;
}
