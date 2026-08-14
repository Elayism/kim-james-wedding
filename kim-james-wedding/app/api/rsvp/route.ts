import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/rsvpSchema";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  getInMemoryRSVPs,
  addInMemoryRSVP,
  softDeleteInMemoryRSVP,
  restoreInMemoryRSVP,
  permanentDeleteInMemoryRSVP,
  checkDuplicateName,
  RsvpRecord,
} from "@/lib/mockStore";

// Helper to fetch all records from Supabase or fallback
async function fetchAllRecords(): Promise<RsvpRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data as RsvpRecord[];
      }
    } catch (e) {
      console.warn("Supabase fetch error, using local fallback store:", e);
    }
  }
  return getInMemoryRSVPs(true);
}

// POST: Submit new RSVP
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle Restore Action if requested via body
    if (body.action === "restore" && body.id) {
      if (isSupabaseConfigured()) {
        try {
          const { error } = await supabase
            .from("rsvps")
            .update({ is_deleted: false })
            .eq("id", body.id);
          if (!error) {
            return NextResponse.json({ success: true, message: "RSVP restored successfully" });
          }
        } catch (e) {
          console.warn("Supabase restore error:", e);
        }
      }
      restoreInMemoryRSVP(String(body.id));
      return NextResponse.json({ success: true, message: "RSVP restored in local memory" });
    }

    // Validate against Zod schema
    const parseResult = rsvpSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // --- DUPLICATE CHECK ---
    // Extract primary full_name + all guest names
    const namesToCheck: string[] = [data.full_name];
    if (Array.isArray(data.guests)) {
      data.guests.forEach((g) => {
        if (g.name && g.name.trim() !== "") {
          namesToCheck.push(g.name);
        }
      });
    }

    const allRecords = await fetchAllRecords();
    const duplicateName = checkDuplicateName(allRecords, namesToCheck);

    if (duplicateName) {
      return NextResponse.json(
        {
          success: false,
          message: `RSVP Duplicate Warning: "${duplicateName}" has already registered or been added to a party. Duplicate submissions are not allowed.`,
        },
        { status: 400 }
      );
    }

    // Prepare payload
    const rsvpPayload = {
      full_name: data.full_name,
      email: data.email || null,
      attending: data.attending,
      guest_count: data.guest_count,
      meal_preference:
        data.meal_preference === "Other" && data.meal_other
          ? `Other: ${data.meal_other}`
          : data.meal_preference,
      dietary_restrictions: data.dietary_restrictions || null,
      message: data.message,
      guest_details: data.guests || [],
      is_deleted: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("rsvps").insert([rsvpPayload]);
        if (!error) {
          return NextResponse.json({
            success: true,
            message: "RSVP saved to Supabase successfully!",
          });
        }
        console.warn("Supabase insert failed, attempting legacy schema fallback:", error.message);
      } catch (err) {
        console.warn("Supabase connection error:", err);
      }
    }

    // Local Fallback if Supabase credentials are not set yet
    addInMemoryRSVP(rsvpPayload);

    return NextResponse.json({
      success: true,
      message: "RSVP received successfully (Saved to local memory).",
    });
  } catch (error: any) {
    console.error("RSVP route error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Fetch RSVPs (active or deleted)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'active' | 'deleted' | 'all'

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from("rsvps").select("*").order("created_at", { ascending: false });
      if (type === "deleted") {
        query = query.eq("is_deleted", true);
      } else if (type !== "all") {
        query = query.or("is_deleted.is.null,is_deleted.eq.false");
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    } catch (e) {
      console.warn("Supabase fetch error, fallback to in-memory:", e);
    }
  }

  // Fallback
  const records = getInMemoryRSVPs(type === "all" || type === "deleted");
  const filtered =
    type === "deleted"
      ? records.filter((r) => r.is_deleted)
      : records.filter((r) => !r.is_deleted);

  return NextResponse.json({ success: true, data: filtered });
}

// DELETE: Soft delete an RSVP record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing record ID" }, { status: 400 });
    }

    const permanent = searchParams.get("permanent") === "true";

    if (isSupabaseConfigured()) {
      try {
        let error;
        if (permanent) {
          const res = await supabase.from("rsvps").delete().eq("id", id);
          error = res.error;
        } else {
          const res = await supabase.from("rsvps").update({ is_deleted: true }).eq("id", id);
          error = res.error;
        }
        if (!error) {
          return NextResponse.json({ success: true, message: permanent ? "Record permanently deleted" : "Record deleted successfully" });
        }
      } catch (e) {
        console.warn("Supabase delete error:", e);
      }
    }

    if (permanent) {
      permanentDeleteInMemoryRSVP(id);
    } else {
      softDeleteInMemoryRSVP(id);
    }

    return NextResponse.json({
      success: true,
      message: permanent ? "Record permanently deleted" : "Record moved to deleted history",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}
