"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useMessages } from "@/i18n/useMessages";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

interface AuthControlProps {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

function displayName(user: User) {
  const metadata = user.user_metadata as { full_name?: string; name?: string };
  return metadata.full_name || metadata.name || user.email?.split("@")[0] || "Account";
}

export function AuthControl({ variant = "desktop", onNavigate }: AuthControlProps) {
  const pathname = usePathname();
  const { messages } = useMessages();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <span
        className={cn(
          "animate-pulse bg-surface-2",
          variant === "mobile"
            ? "h-11 w-full"
            : "hidden h-11 w-24 rounded-[var(--radius-control)] sm:block"
        )}
        aria-hidden
      />
    );
  }

  const returnPath = pathname === "/login" || pathname.startsWith("/auth")
    ? "/dashboard"
    : pathname || "/dashboard";
  const href = user ? "/account" : `/login?next=${encodeURIComponent(returnPath)}`;
  const label = user ? displayName(user) : messages.auth.signIn;
  const Icon = user ? UserRound : LogIn;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface text-xs font-medium text-ink transition-colors hover:bg-surface-2",
        variant === "mobile"
          ? "flex min-h-11 w-full px-3"
          : "hidden h-11 max-w-32 px-2.5 sm:flex"
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-brand-strong" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
