import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabaseAdmin";

// Vercel Cron: runs every 6 hours to prevent Supabase free-tier pause
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/ping-supabase", "schedule": "0 */6 * * *" }] }
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 200 });
    }

    // Minimal read — just checks row count, does not touch any user data
    const { count, error } = await supabaseAdmin
      .from("rsvps")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Supabase keep-alive ping error:", error.message);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const ts = new Date().toISOString();
    console.log(`[keep-alive] Supabase active at ${ts}. RSVP count: ${count}`);
    return NextResponse.json({
      success: true,
      message: "Supabase is active",
      rsvp_count: count,
      pinged_at: ts,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Supabase keep-alive exception:", err?.message);
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}
