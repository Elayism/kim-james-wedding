import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    // Lightweight query to keep the database active
    const { error } = await supabase.from("rsvps").select("id", { count: "exact", head: true });

    if (error) {
      console.error("Supabase ping error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Supabase is active" });
  } catch (error: any) {
    console.error("Supabase ping exception:", error);
    return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 });
  }
}
