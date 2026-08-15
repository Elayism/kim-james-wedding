import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { SAMPLE_DATA } from "@/lib/sampleData";

export async function POST() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const { data: existing, error: fetchError } = await supabase
      .from("rsvps")
      .select("id")
      .limit(1);

    if (fetchError) {
      console.error("Supabase seed check error:", fetchError);
      return NextResponse.json({ success: false, message: fetchError.message }, { status: 500 });
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, message: "Table already has data", skipped: true });
    }

    const { error: insertError } = await supabase.from("rsvps").insert(SAMPLE_DATA);

    if (insertError) {
      console.error("Supabase seed insert error:", insertError);
      return NextResponse.json({ success: false, message: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Sample data seeded successfully" });
  } catch (error: any) {
    console.error("Supabase seed exception:", error);
    return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 });
  }
}
