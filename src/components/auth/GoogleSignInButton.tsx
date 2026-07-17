"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/useMessages";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton({ nextPath }: { nextPath: string }) {
  const { messages } = useMessages();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const signIn = async () => {
    if (!isSupabaseConfigured || pending) return;
    setPending(true);
    setErrorMessage("");

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", nextPath);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl.toString() },
      });

      if (error) throw error;
    } catch {
      setPending(false);
      setErrorMessage(messages.auth.signInError);
    }
  };

  return (
    <div>
      <Button
        type="button"
        size="lg"
        onClick={signIn}
        disabled={!isSupabaseConfigured || pending}
        className="w-full"
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-xs font-bold" aria-hidden>
            G
          </span>
        )}
        {pending ? messages.auth.signingIn : messages.auth.signInWithGoogle}
      </Button>
      {errorMessage && <p className="mt-3 text-xs text-negative" role="alert">{errorMessage}</p>}
    </div>
  );
}
