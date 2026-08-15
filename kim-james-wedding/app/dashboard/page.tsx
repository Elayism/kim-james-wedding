import { cookies } from "next/headers";
import Login from "./login";
import LogoutButton from "./LogoutButton";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface RsvpRecord {
  id?: string | number;
  full_name: string;
  email?: string | null;
  attending: "accepts" | "declines" | string;
  guest_count: number;
  meal_preference: string;
  meal_other?: string | null;
  dietary_restrictions?: string | null;
  message: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  } catch {
    return dateStr;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("dashboard_auth");

  // Check authentication
  if (!authCookie || authCookie.value !== "true") {
    return <Login />;
  }

  // Fetch RSVPs from Supabase using admin service role key (with a 3s timeout)
  let rsvps: RsvpRecord[] = [];
  let fetchError: string | null = null;

  try {
    const fetchPromise = supabaseAdmin
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: "Supabase connection timeout (placeholder credentials configured)." } }), 3000)
    );

    const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any;

    if (error) {
      console.error("Supabase admin fetch error:", error);
      fetchError = error.message;
    } else if (data) {
      rsvps = data as RsvpRecord[];
    }
  } catch (err: any) {
    console.error("Dashboard fetch exception:", err);
    fetchError = "Could not connect to database.";
  }

  // Calculate total guests attending (sum of guest_count where attending = 'accepts')
  const totalAttendingGuests = rsvps
    .filter((r) => r.attending === "accepts")
    .reduce((sum, r) => sum + (Number(r.guest_count) || 1), 0);

  return (
    <div
      className="min-h-screen w-full p-4 md:p-8"
      style={{ backgroundColor: "var(--color-ivory)" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-champagne)]">
          <div>
            <div className="text-xs uppercase tracking-widest text-[var(--color-soft-taupe)] font-semibold mb-1">
              Organizer Panel
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-gold-brown)]">
              RSVP Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-[var(--color-antique-white)] border border-[var(--color-warm-sand)] text-xs text-[var(--color-espresso)] font-semibold">
              Total Guests Attending:{" "}
              <span className="text-[var(--color-gold-brown)] font-bold text-sm ml-1">
                {totalAttendingGuests}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Database Connection Notice / Error */}
        {fetchError && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-sans">
            <strong>Database Status Notice:</strong> {fetchError} (Showing local view)
          </div>
        )}

        {/* RSVP Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--color-warm-sand)] shadow-md bg-[var(--color-antique-white)]">
          <table className="w-full text-left border-collapse font-serif">
            <thead>
              <tr className="bg-[var(--color-ecru)] border-b border-[var(--color-warm-sand)] text-xs uppercase tracking-wider text-[var(--color-gold-brown)] font-sans font-semibold">
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Guests</th>
                <th className="py-3.5 px-4">Meal Preference</th>
                <th className="py-3.5 px-4">Dietary Restrictions</th>
                <th className="py-3.5 px-4">Message</th>
                <th className="py-3.5 px-4">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-champagne)] text-sm text-[var(--color-espresso)]">
              {rsvps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-[var(--color-soft-taupe)] italic">
                    No RSVP submissions found yet.
                  </td>
                </tr>
              ) : (
                rsvps.map((rsvp, idx) => {
                  const isEven = idx % 2 === 0;
                  const displayMeal =
                    rsvp.meal_preference === "Other" && rsvp.meal_other
                      ? `Other: ${rsvp.meal_other}`
                      : rsvp.meal_preference || "Standard";

                  return (
                    <tr
                      key={rsvp.id || idx}
                      className={`transition-colors ${
                        isEven ? "bg-[var(--color-ivory)]" : "bg-[var(--color-antique-white)]"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium font-sans">
                        {rsvp.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-sans text-[var(--color-soft-taupe)]">
                        {rsvp.email || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center text-base">
                        {rsvp.attending === "accepts" ? (
                          <span title="Joyfully Accepts" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                        ) : (
                          <span title="Regretfully Declines" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans font-semibold">
                        {rsvp.guest_count || 1}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-sans">
                        {displayMeal}
                      </td>
                      <td className="py-3.5 px-4 text-xs italic">
                        {rsvp.dietary_restrictions || "None"}
                      </td>
                      <td className="py-3.5 px-4 text-xs max-w-xs truncate" title={rsvp.message}>
                        {rsvp.message || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-sans text-[var(--color-soft-taupe)] whitespace-nowrap">
                        {formatDate(rsvp.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
