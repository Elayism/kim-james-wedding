import { NextResponse } from "next/server";
import { getDatabaseClient, isDatabaseConfigured } from "@/lib/supabaseServer";

// Vercel Cron: pings the Supabase database periodically to prevent free-tier pause
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { success: false, message: "Database not configured" },
        { status: 500 }
      );
    }

    const db = getDatabaseClient();

    // Lightweight query that does not modify or pollute any user data
    const { count, error } = await db
      .from("rsvps")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[keep-alive] Supabase ping error:", error.message);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();
    console.log(`[keep-alive] Supabase active at ${now}. RSVP count: ${count}`);

    return NextResponse.json({
      success: true,
      message: "Supabase keep-alive ping successful. Database is active.",
      rsvp_count: count,
      timestamp: now,
    });
  } catch (error: any) {
    console.error("[keep-alive] Supabase ping exception:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
