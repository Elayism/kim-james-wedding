import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/rsvpSchema";
import { getDatabaseClient, isDatabaseConfigured } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

interface GuestDetail {
  name?: string;
  meal?: string;
}

interface RsvpRow {
  id?: string;
  full_name: string;
  email?: string | null;
  attending: string;
  guest_count: number;
  meal_preference: string;
  dietary_restrictions?: string | null;
  message?: string | null;
  guest_details?: GuestDetail[];
  is_deleted?: boolean;
  created_at?: string;
}

// POST: Submit a new RSVP directly to Supabase
export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database configuration error: Supabase environment variables are missing on the server.",
        },
        { status: 500 }
      );
    }

    const db = getDatabaseClient();
    const body = await request.json();

    // Handle Restore Action if requested via body
    if (body.action === "restore" && body.id) {
      const { error } = await db
        .from("rsvps")
        .update({ is_deleted: false })
        .eq("id", body.id);

      if (error) {
        console.error("Supabase restore error:", error);
        return NextResponse.json(
          { success: false, message: `Failed to restore: ${error.message}` },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "RSVP restored successfully in Supabase.",
      });
    }

    // Validate request body with Zod schema
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

    // --- DUPLICATE CHECK AGAINST LIVE DATABASE ---
    const namesToCheck: string[] = [data.full_name.trim().toLowerCase()];
    if (Array.isArray(data.guests)) {
      data.guests.forEach((g) => {
        if (g.name && g.name.trim() !== "") {
          namesToCheck.push(g.name.trim().toLowerCase());
        }
      });
    }

    // Fetch existing active accepted RSVPs from Supabase
    const { data: existingRows, error: fetchErr } = await db
      .from("rsvps")
      .select("full_name, guest_details")
      .eq("is_deleted", false)
      .eq("attending", "accepts");

    if (fetchErr) {
      console.warn("Could not check duplicates from database:", fetchErr.message);
    } else if (existingRows) {
      const registeredNames = new Set<string>();
      existingRows.forEach((row: { full_name?: string; guest_details?: GuestDetail[] }) => {
        if (row.full_name) {
          registeredNames.add(row.full_name.trim().toLowerCase());
        }
        if (Array.isArray(row.guest_details)) {
          row.guest_details.forEach((g) => {
            if (g.name) {
              registeredNames.add(g.name.trim().toLowerCase());
            }
          });
        }
      });

      for (const name of namesToCheck) {
        if (registeredNames.has(name)) {
          return NextResponse.json(
            {
              success: false,
              message: `RSVP Duplicate Notice: "${name}" has already registered or been added to a party. Duplicate submissions are not allowed.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Prepare clean row payload for Supabase
    const rsvpPayload: RsvpRow = {
      full_name: data.full_name.trim(),
      email: data.email && data.email.trim() !== "" ? data.email.trim() : null,
      attending: data.attending,
      guest_count: data.guest_count,
      meal_preference:
        data.meal_preference === "Other" && data.meal_other
          ? `Other: ${data.meal_other}`
          : data.meal_preference,
      dietary_restrictions: data.dietary_restrictions && data.dietary_restrictions.trim() !== ""
        ? data.dietary_restrictions.trim()
        : null,
      message: data.message ? data.message.trim() : "",
      is_deleted: false,
      guest_details: data.guests || [],
    };

    // Insert directly into Supabase rsvps table
    const { data: insertedData, error: insertError } = await db
      .from("rsvps")
      .insert([rsvpPayload])
      .select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        {
          success: false,
          message: `Database error saving RSVP: ${insertError.message}`,
        },
        { status: 500 }
      );
    }

    console.log("RSVP successfully persisted to Supabase:", insertedData);

    return NextResponse.json({
      success: true,
      message: "RSVP confirmed and saved successfully to database.",
      data: insertedData,
    });
  } catch (error: any) {
    console.error("RSVP route exception:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error processing RSVP.",
      },
      { status: 500 }
    );
  }
}

// GET: Fetch RSVPs directly from Supabase
export async function GET(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { success: false, message: "Database is not configured.", data: [] },
        { status: 500 }
      );
    }

    const db = getDatabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'active' | 'deleted' | 'all'

    let query = db
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });

    if (type === "deleted") {
      query = query.eq("is_deleted", true);
    } else if (type !== "all") {
      // Default: show active (is_deleted is false or null)
      query = query.or("is_deleted.is.null,is_deleted.eq.false");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json(
        { success: false, message: error.message, data: [] },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error: any) {
    console.error("Supabase GET exception:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Server error", data: [] },
      { status: 500 }
    );
  }
}

// PUT: Update an RSVP record directly in Supabase
export async function PUT(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { success: false, message: "Database is not configured." },
        { status: 500 }
      );
    }

    const db = getDatabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing record ID" },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from("rsvps")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase PUT error:", error);
      return NextResponse.json(
        { success: false, message: `Failed to update: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "RSVP updated successfully.",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete or permanently delete an RSVP record in Supabase
export async function DELETE(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { success: false, message: "Database is not configured." },
        { status: 500 }
      );
    }

    const db = getDatabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing record ID" },
        { status: 400 }
      );
    }

    const permanent = searchParams.get("permanent") === "true";

    let dbError;
    if (permanent) {
      const res = await db.from("rsvps").delete().eq("id", id);
      dbError = res.error;
    } else {
      const res = await db.from("rsvps").update({ is_deleted: true }).eq("id", id);
      dbError = res.error;
    }

    if (dbError) {
      console.error("Supabase DELETE error:", dbError);
      return NextResponse.json(
        { success: false, message: `Failed to delete: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: permanent
        ? "Record permanently deleted from Supabase."
        : "Record moved to deleted history in Supabase.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
