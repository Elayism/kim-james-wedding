"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface GuestItem {
  name: string;
  meal: string;
}

interface RsvpRecord {
  id: string | number;
  full_name: string;
  email?: string | null;
  attending: "accepts" | "declines";
  guest_count: number;
  meal_preference: string;
  dietary_restrictions?: string | null;
  message?: string | null;
  guest_details?: GuestItem[];
  is_deleted?: boolean;
  created_at?: string;
}

const PIE_COLORS: Record<string, string> = {
  Chicken: "#B8A88A", // warm taupe/gold
  Beef: "#8B5E3C", // espresso/gold-brown
  Vegetarian: "#6B8E23", // olive sage
  Fish: "#4682B4", // slate blue
  Pork: "#D2691E", // copper / bronze
  "Kids Meal": "#E4D5B7", // light champagne
  Other: "#A9A9A9", // gray
};

export default function AdminDashboard() {
  const [activeRecords, setActiveRecords] = useState<RsvpRecord[]>([]);
  const [deletedRecords, setDeletedRecords] = useState<RsvpRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Fetch active records
      const resActive = await fetch("/api/rsvp?type=active");
      const jsonActive = await resActive.json();
      if (resActive.ok && jsonActive.success) {
        setActiveRecords(jsonActive.data || []);
      }

      // Fetch deleted records
      const resDeleted = await fetch("/api/rsvp?type=deleted");
      const jsonDeleted = await resDeleted.json();
      if (resDeleted.ok && jsonDeleted.success) {
        setDeletedRecords(jsonDeleted.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch RSVPs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Delete handler
  const handleDelete = async (id: string | number, name: string) => {
    if (!confirm(`Are you sure you want to move RSVP for "${name}" to Deleted History?`)) return;

    try {
      const res = await fetch(`/api/rsvp?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Moved "${name}" to Deleted History`, "info");
        fetchRecords();
      } else {
        alert(json.message || "Failed to delete record");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error while deleting");
    }
  };

  // Restore handler
  const handleRestore = async (id: string | number, name: string) => {
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Restored "${name}" back to Active RSVPs`, "success");
        fetchRecords();
      } else {
        alert(json.message || "Failed to restore record");
      }
    } catch (err) {
      console.error("Restore error:", err);
      alert("Network error while restoring");
    }
  };

  // Permanent delete handler
  const handlePermanentDelete = async (id: string | number, name: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete the RSVP for "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/rsvp?id=${id}&permanent=true`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Permanently deleted "${name}"`, "info");
        fetchRecords();
      } else {
        alert(json.message || "Failed to permanently delete record");
      }
    } catch (err) {
      console.error("Permanent Delete error:", err);
      alert("Network error while deleting");
    }
  };

  // Compute key stats for active records
  const stats = useMemo(() => {
    const totalResponses = activeRecords.length;
    const totalAttendingEntries = activeRecords.filter((r) => r.attending === "accepts");
    const totalDeclinedEntries = activeRecords.filter((r) => r.attending === "declines");

    const totalAttendingGuests = totalAttendingEntries.reduce(
      (sum, r) => sum + (Number(r.guest_count) || 1),
      0
    );

    // Food Preference breakdown
    const mealCounts: Record<string, number> = {};
    activeRecords.forEach((r) => {
      if (r.attending === "accepts") {
        if (r.guest_details && Array.isArray(r.guest_details) && r.guest_details.length > 0) {
          r.guest_details.forEach((g) => {
            const m = g.meal || r.meal_preference || "Chicken";
            const cleanKey = m.startsWith("Other") ? "Other" : m;
            mealCounts[cleanKey] = (mealCounts[cleanKey] || 0) + 1;
          });
        } else {
          const count = Number(r.guest_count) || 1;
          const cleanKey = r.meal_preference?.startsWith("Other")
            ? "Other"
            : r.meal_preference || "Chicken";
          mealCounts[cleanKey] = (mealCounts[cleanKey] || 0) + count;
        }
      }
    });

    // Party size breakdown
    const partySizes: Record<string, number> = {
      "1 Guest": 0,
      "2 Guests": 0,
      "3-4 Guests": 0,
      "5+ Guests": 0,
    };
    totalAttendingEntries.forEach((r) => {
      const c = Number(r.guest_count) || 1;
      if (c === 1) partySizes["1 Guest"]++;
      else if (c === 2) partySizes["2 Guests"]++;
      else if (c <= 4) partySizes["3-4 Guests"]++;
      else partySizes["5+ Guests"]++;
    });

    return {
      totalResponses,
      totalAttendingGuests,
      totalDeclined: totalDeclinedEntries.length,
      mealCounts,
      partySizes,
    };
  }, [activeRecords]);

  // Compute SVG Pie Chart Slices
  const pieSlices = useMemo(() => {
    const entries = Object.entries(stats.mealCounts);
    const totalMeals = entries.reduce((sum, [_, count]) => sum + count, 0);

    if (totalMeals === 0) return [];

    let accumulatedAngle = 0;
    return entries.map(([meal, count]) => {
      const percentage = (count / totalMeals) * 100;
      const angle = (count / totalMeals) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      const x1 = Math.cos((Math.PI * startAngle) / 180);
      const y1 = Math.sin((Math.PI * startAngle) / 180);
      const x2 = Math.cos((Math.PI * (startAngle + angle)) / 180);
      const y2 = Math.sin((Math.PI * (startAngle + angle)) / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return {
        meal,
        count,
        percentage: percentage.toFixed(1),
        pathData,
        color: PIE_COLORS[meal] || "#8B5E3C",
      };
    });
  }, [stats.mealCounts]);

  // Filter records for table view
  const currentList = activeTab === "active" ? activeRecords : deletedRecords;
  const filteredRecords = useMemo(() => {
    return currentList.filter((r) => {
      if (search.trim() !== "") {
        const q = search.toLowerCase();
        const mainMatch =
          r.full_name.toLowerCase().includes(q) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.message && r.message.toLowerCase().includes(q));

        const guestMatch = r.guest_details?.some(
          (g) => g.name.toLowerCase().includes(q) || g.meal.toLowerCase().includes(q)
        );
        return mainMatch || guestMatch;
      }
      return true;
    });
  }, [currentList, search]);

  const exportCSV = () => {
    const headers = [
      "ID",
      "Primary Name",
      "Email",
      "Attending",
      "Guest Count",
      "Meal Preference",
      "Individual Guests & Meals",
      "Dietary Restrictions",
      "Message",
      "Date",
    ];

    const rows = activeRecords.map((r) => [
      r.id || "",
      `"${r.full_name.replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
      r.attending,
      r.guest_count,
      `"${(r.meal_preference || "").replace(/"/g, '""')}"`,
      `"${(r.guest_details || []).map((g) => `${g.name} (${g.meal})`).join("; ").replace(/"/g, '""')}"`,
      `"${(r.dietary_restrictions || "").replace(/"/g, '""')}"`,
      `"${(r.message || "").replace(/"/g, '""')}"`,
      r.created_at || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wedding_rsvps_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[var(--color-ivory)] text-[var(--color-espresso)] p-4 md:p-8 font-serif z-50">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl text-xs font-sans font-semibold border flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700"
                : "bg-amber-900 text-amber-100 border-amber-700"
            }`}
          >
            <span>{notification.type === "success" ? "✅" : "ℹ️"}</span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-champagne)] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="text-xs uppercase tracking-widest font-sans font-bold text-[var(--color-gold-brown)] hover:underline"
              >
                ← Back to Wedding Site
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-gold-brown)] mt-1">
              Guest RSVP Analytics & Management Dashboard
            </h1>
            <p className="text-xs text-[var(--color-soft-taupe)] font-sans mt-0.5">
              Live Overview, Food Preferences, Duplicate Prevention & Deleted History
            </p>
          </div>

          <div className="flex items-center gap-3 font-sans">
            <button
              onClick={fetchRecords}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full border border-[var(--color-gold-brown)] text-[var(--color-gold-brown)] hover:bg-[var(--color-ecru)] transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full text-[var(--color-ivory)] shadow transition hover:opacity-90"
              style={{ backgroundColor: "var(--color-gold-brown)" }}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
          <div className="p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
              Total RSVPs Received
            </p>
            <p className="text-3xl font-serif font-bold text-[var(--color-gold-brown)] mt-2">
              {stats.totalResponses}
            </p>
            <p className="text-[11px] text-[var(--color-espresso)] mt-1">Active party responses</p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
              Total Attending Guests
            </p>
            <p className="text-3xl font-serif font-bold text-emerald-700 mt-2">
              {stats.totalAttendingGuests}
            </p>
            <p className="text-[11px] text-emerald-800 mt-1 font-medium">Confirmed attendees</p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
              Regretfully Declined
            </p>
            <p className="text-3xl font-serif font-bold text-rose-700 mt-2">
              {stats.totalDeclined}
            </p>
            <p className="text-[11px] text-rose-800 mt-1 font-medium">Unable to attend</p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
            <p className="text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
              Deleted History Items
            </p>
            <p className="text-3xl font-serif font-bold text-amber-700 mt-2">
              {deletedRecords.length}
            </p>
            <p className="text-[11px] text-amber-800 mt-1 font-medium">Available to restore</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Food Preference Pie Chart */}
          <div className="p-6 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-champagne)] pb-3">
              <div>
                <h2 className="text-xl font-serif text-[var(--color-gold-brown)] font-bold">
                  Food Preferences Breakdown
                </h2>
                <p className="text-xs text-[var(--color-soft-taupe)] font-sans">
                  Distribution of guest meal choices
                </p>
              </div>
              <span className="text-xs font-sans px-2.5 py-1 rounded bg-[var(--color-ecru)] text-[var(--color-gold-brown)] font-semibold">
                Pie Chart
              </span>
            </div>

            {pieSlices.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--color-soft-taupe)] font-sans">
                No food choices submitted yet.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
                {/* SVG Pie Chart */}
                <div className="relative w-48 h-48 flex-shrink-0">
                  <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
                    {pieSlices.map((slice, i) => (
                      <path
                        key={i}
                        d={slice.pathData}
                        fill={slice.color}
                        className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                      >
                        <title>{`${slice.meal}: ${slice.count} guests (${slice.percentage}%)`}</title>
                      </path>
                    ))}
                  </svg>
                </div>

                {/* Legend & Breakdown list */}
                <div className="space-y-2.5 w-full font-sans text-xs">
                  {pieSlices.map((slice, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span className="font-semibold text-[var(--color-espresso)]">
                          {slice.meal}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-gold-brown)]">
                          {slice.count} {slice.count === 1 ? "guest" : "guests"}
                        </span>
                        <span className="text-[var(--color-soft-taupe)]">
                          ({slice.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart 2: Party Size Distribution Bar Chart */}
          <div className="p-6 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-champagne)] pb-3">
              <div>
                <h2 className="text-xl font-serif text-[var(--color-gold-brown)] font-bold">
                  Party Size Distribution
                </h2>
                <p className="text-xs text-[var(--color-soft-taupe)] font-sans">
                  Number of guests per attending party
                </p>
              </div>
              <span className="text-xs font-sans px-2.5 py-1 rounded bg-[var(--color-ecru)] text-[var(--color-gold-brown)] font-semibold">
                Bar Chart
              </span>
            </div>

            <div className="py-6 space-y-4 font-sans">
              {Object.entries(stats.partySizes).map(([group, count]) => {
                const maxCount = Math.max(...Object.values(stats.partySizes), 1);
                const percent = (count / maxCount) * 100;
                return (
                  <div key={group} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-[var(--color-espresso)]">
                      <span>{group}</span>
                      <span>
                        {count} {count === 1 ? "party" : "parties"}
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[var(--color-champagne)]/40 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: "var(--color-gold-brown)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Guest Directory Table & Deleted Recycle Bin */}
        <div className="p-6 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm space-y-4">
          {/* Tabs header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-champagne)] pb-4 font-sans">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                  activeTab === "active"
                    ? "bg-[var(--color-gold-brown)] text-white shadow"
                    : "bg-[var(--color-ivory)] text-[var(--color-espresso)] border border-[var(--color-champagne)]"
                }`}
              >
                📋 Active RSVPs ({activeRecords.length})
              </button>

              <button
                onClick={() => setActiveTab("deleted")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                  activeTab === "deleted"
                    ? "bg-amber-800 text-white shadow"
                    : "bg-[var(--color-ivory)] text-[var(--color-espresso)] border border-[var(--color-champagne)]"
                }`}
              >
                🗑️ Deleted History ({deletedRecords.length})
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search name, meal, note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs rounded border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)]"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-sans text-[var(--color-soft-taupe)]">
              Loading RSVP records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-xs font-sans text-[var(--color-soft-taupe)]">
              {activeTab === "active"
                ? "No active guest records found."
                : "No deleted records in history."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-champagne)] text-[var(--color-gold-brown)] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Primary Contact</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Party Size</th>
                    <th className="py-3 px-3">Guest List & Meal Choices</th>
                    <th className="py-3 px-3">Dietary / Notes</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-champagne)]/40">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--color-ivory)] transition">
                      <td className="py-3 px-3 font-semibold text-[var(--color-espresso)]">
                        <div>{r.full_name}</div>
                        {r.email && (
                          <div className="text-[10px] text-[var(--color-soft-taupe)] font-normal">
                            {r.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.attending === "accepts"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {r.attending === "accepts" ? "Attending" : "Declined"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[var(--color-gold-brown)]">
                        {r.guest_count} {r.guest_count === 1 ? "Guest" : "Guests"}
                      </td>
                      <td className="py-3 px-3">
                        {r.guest_details && r.guest_details.length > 0 ? (
                          <ul className="space-y-1">
                            {r.guest_details.map((g, gIdx) => (
                              <li key={gIdx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-brown)] inline-block" />
                                <span className="font-medium text-[var(--color-espresso)]">
                                  {g.name}:
                                </span>
                                <span className="text-[var(--color-soft-taupe)] font-semibold">
                                  {g.meal}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[var(--color-soft-taupe)] italic">
                            Main Choice: {r.meal_preference}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        {r.dietary_restrictions && (
                          <div className="text-[11px] text-amber-900 font-semibold mb-1">
                            ⚠️ {r.dietary_restrictions}
                          </div>
                        )}
                        {r.message && (
                          <div className="text-[11px] text-[var(--color-espresso)] italic">
                            &quot;{r.message}&quot;
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {activeTab === "active" ? (
                          <button
                            onClick={() => handleDelete(r.id, r.full_name)}
                            className="px-3 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] transition"
                            title="Move to Deleted History"
                          >
                            🗑️ Delete
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleRestore(r.id, r.full_name)}
                              className="px-3 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] transition"
                              title="Restore back to active RSVPs"
                            >
                              ↺ Restore
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(r.id, r.full_name)}
                              className="px-3 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] transition"
                              title="Permanently Delete"
                            >
                              ✕ Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
