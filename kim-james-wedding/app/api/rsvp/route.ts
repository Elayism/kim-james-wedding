import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/rsvpSchema";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getInMemoryRSVPs,
  addInMemoryRSVP,
  softDeleteInMemoryRSVP,
  restoreInMemoryRSVP,
  permanentDeleteInMemoryRSVP,
  updateInMemoryRSVP,
  checkDuplicateName,
  RsvpRecord,
} from "@/lib/mockStore";

// Helper to fetch all records from Supabase (admin/service-role) or fallback
async function fetchAllRecords(): Promise<RsvpRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Supabase fetchAllRecords error:", error.message, error.code);
      } else if (data) {
        return data as RsvpRecord[];
      }
    } catch (e) {
      console.error("Supabase fetchAllRecords exception:", e);
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
          const { error } = await supabaseAdmin
            .from("rsvps")
            .update({ is_deleted: false })
            .eq("id", body.id);
          if (!error) {
            return NextResponse.json({ success: true, message: "RSVP restored successfully" });
          }
          console.error("Supabase restore error:", error.message);
        } catch (e) {
          console.error("Supabase restore exception:", e);
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
    const namesToCheck: string[] = [data.full_name];
    if (Array.isArray(data.guests)) {
      data.guests.forEach((g) => {
        if (g.name && g.name.trim() !== "") {
          namesToCheck.push(g.name);
        }
      });
    }

    const duplicateName = await checkDuplicateName(namesToCheck);

    if (duplicateName) {
      return NextResponse.json(
        {
          success: false,
          message: `RSVP Duplicate Warning: "${duplicateName}" has already registered or been added to a party. Duplicate submissions are not allowed.`,
        },
        { status: 400 }
      );
    }

    // Prepare payload — only include columns that exist in the Supabase table.
    // The full schema: id (auto), full_name, email, attending, guest_count,
    //   meal_preference, dietary_restrictions, message, created_at (auto),
    //   is_deleted (added via migration), guest_details (added via migration).
    const rsvpPayload: Record<string, unknown> = {
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
      // created_at is auto-set by Supabase — do not send it manually
    };

    // Include soft-delete + guest_details only if the columns exist (migration applied)
    // The code attempts to insert them; Supabase will reject with PGRST204 if missing.
    // After running the migration SQL below, these will always succeed.
    rsvpPayload.is_deleted = false;
    rsvpPayload.guest_details = data.guests || [];

    if (isSupabaseConfigured()) {
      const { error } = await supabaseAdmin.from("rsvps").insert([rsvpPayload]);

      if (!error) {
        console.log("RSVP successfully inserted into Supabase for:", data.full_name);
        return NextResponse.json({
          success: true,
          message: "RSVP saved successfully!",
        });
      }

      // Log the full error for debugging
      console.error("Supabase INSERT failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      // If columns are missing (PGRST204), fall back to a minimal payload
      if (error.code === "PGRST204") {
        console.warn("Schema mismatch detected — columns missing. Retrying with minimal payload.");
        const minimalPayload: Record<string, unknown> = {
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
        };

        const { error: fallbackError } = await supabaseAdmin.from("rsvps").insert([minimalPayload]);

        if (!fallbackError) {
          console.log("RSVP inserted with minimal payload (migration needed for full schema).");
          return NextResponse.json({
            success: true,
            message: "RSVP saved successfully! (Note: run the schema migration for full feature support.)",
          });
        }

        console.error("Minimal payload insert also failed:", fallbackError.message);
        return NextResponse.json({
          success: false,
          message: `Database error: ${fallbackError.message}. Please contact the couple.`,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: false,
        message: `Failed to save RSVP: ${error.message}`,
      }, { status: 500 });
    }

    // Local Fallback only when Supabase is NOT configured
    addInMemoryRSVP({
      ...rsvpPayload,
      id: "local-" + Date.now(),
      created_at: new Date().toISOString(),
      is_deleted: false,
    } as unknown as RsvpRecord);

    return NextResponse.json({
      success: true,
      message: "RSVP received successfully.",
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("RSVP POST route error:", err?.message || err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
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
      let query = supabaseAdmin.from("rsvps").select("*").order("created_at", { ascending: false });
      if (type === "deleted") {
        query = query.eq("is_deleted", true);
      } else if (type !== "all") {
        // is_deleted may not exist yet — filter safely
        query = query.or("is_deleted.is.null,is_deleted.eq.false");
      }

      const { data, error } = await query;
      if (error) {
        // If is_deleted column missing, retry without filter
        if (error.code === "PGRST204" || error.code === "42703") {
          console.warn("is_deleted column missing — fetching without filter");
          const { data: allData, error: allError } = await supabaseAdmin
            .from("rsvps")
            .select("*")
            .order("created_at", { ascending: false });
          if (!allError && allData) {
            return NextResponse.json({ success: true, data: allData }, {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
              },
            });
          }
        }
        console.error("Supabase GET error:", error.message);
      } else if (data) {
        return NextResponse.json({ success: true, data }, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache",
          },
        });
      }
    } catch (e) {
      console.error("Supabase GET exception:", e);
    }
  }

  // Fallback
  const records = await getInMemoryRSVPs(type === "all" || type === "deleted");
  const filtered =
    type === "deleted"
      ? records.filter((r) => r.is_deleted)
      : type === "all"
      ? records
      : records.filter((r) => !r.is_deleted);

  return NextResponse.json({ success: true, data: filtered }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}

// PUT: Update an RSVP record
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing record ID" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabaseAdmin
        .from("rsvps")
        .update(updates)
        .eq("id", id);
      if (!error) {
        return NextResponse.json({ success: true, message: "RSVP updated successfully" });
      }
      console.error("Supabase PUT error:", error.message);
      return NextResponse.json({
        success: false,
        message: `Failed to update RSVP: ${error.message}`,
      }, { status: 500 });
    }

    const updated = await updateInMemoryRSVP(String(id), updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "RSVP updated", data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE: Soft delete or permanently delete an RSVP record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing record ID" }, { status: 400 });
    }

    const permanent = searchParams.get("permanent") === "true";

    if (isSupabaseConfigured()) {
      let error;
      if (permanent) {
        const res = await supabaseAdmin.from("rsvps").delete().eq("id", id);
        error = res.error;
      } else {
        const res = await supabaseAdmin.from("rsvps").update({ is_deleted: true }).eq("id", id);
        error = res.error;
      }
      if (!error) {
        return NextResponse.json({
          success: true,
          message: permanent ? "Record permanently deleted" : "Record deleted successfully",
        });
      }
      console.error("Supabase DELETE error:", error.message);
      return NextResponse.json({
        success: false,
        message: `Failed to delete RSVP: ${error.message}`,
      }, { status: 500 });
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
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}
