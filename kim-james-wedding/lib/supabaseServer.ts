import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isDatabaseConfigured = (): boolean => {
  const hasUrl =
    Boolean(supabaseUrl) &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("placeholder-project");

  const hasKey =
    (Boolean(serviceRoleKey) && !serviceRoleKey.includes("placeholder")) ||
    (Boolean(anonKey) && !anonKey.includes("placeholder"));

  return hasUrl && hasKey;
};

// Returns the best available server-side client (prefers service_role key to bypass RLS, falls back to anon key)
export const getDatabaseClient = (): SupabaseClient => {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or API keys in environment variables."
    );
  }

  const activeKey =
    serviceRoleKey && !serviceRoleKey.includes("placeholder")
      ? serviceRoleKey
      : anonKey;

  return createClient(supabaseUrl, activeKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
