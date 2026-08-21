import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isAdminConfigured = () =>
  Boolean(supabaseUrl) &&
  Boolean(supabaseServiceRoleKey) &&
  supabaseUrl.startsWith("https://") &&
  !supabaseUrl.includes("placeholder-project") &&
  !supabaseServiceRoleKey.includes("placeholder");

// Server-side only admin client with service role privileges.
// Bypasses Row Level Security — only used in API routes (server-side), never exposed to browser.
export const supabaseAdmin = createClient(
  isAdminConfigured() ? supabaseUrl : "https://placeholder-project.supabase.co",
  isAdminConfigured() ? supabaseServiceRoleKey : "placeholder-service-role-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
