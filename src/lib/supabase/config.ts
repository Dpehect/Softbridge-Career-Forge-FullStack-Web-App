const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function hasValidPublicConfig(url: string | undefined, key: string | undefined): boolean {
  if (!url || !key || url === "[SENSITIVE]" || key === "[SENSITIVE]") return false;
  try {
    const parsed = new URL(url);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = hasValidPublicConfig(supabaseUrl, supabasePublishableKey);

export function getSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey || !isSupabaseConfigured) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return { url: supabaseUrl, publishableKey: supabasePublishableKey };
}
