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
  Chicken: "#B8A88A",
  Beef: "#8B5E3C",
  Vegetarian: "#6B8E23",
  Fish: "#4682B4",
  Pork: "#D2691E",
  "Kids Meal": "#E4D5B7",
  Other: "#A9A9A9",
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [activeRecords, setActiveRecords] = useState<RsvpRecord[]>([]);
  const [deletedRecords, setDeletedRecords] = useState<RsvpRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  useEffect(() => {
    setIsAuthenticated(false);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "wedding2027") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPasswordInput("");
    }
  };

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [resActive, resDeleted] = await Promise.all([
        fetch("/api/rsvp?type=active"),
        fetch("/api/rsvp?type=deleted"),
      ]);

      const [jsonActive, jsonDeleted] = await Promise.all([
        resActive.json(),
        resDeleted.json(),
      ]);

      if (resActive.ok && jsonActive.success) {
        setActiveRecords(jsonActive.data || []);
      }
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

  const handleDelete = async (id: string | number, name: string) => {
    if (!confirm(`Are you sure you want to move RSVP for "${name}" to Deleted History?`)) return;

    const record = activeRecords.find((r) => r.id === id);
    if (!record) return;

    setActiveRecords((prev) => prev.filter((r) => r.id !== id));
    setDeletedRecords((prev) => [record, ...prev]);
    showToast(`Moved "${name}" to Deleted History`, "info");

    try {
      const res = await fetch(`/api/rsvp?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.message || "Failed to delete record", "info");
        fetchRecords();
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Network error while deleting", "info");
      fetchRecords();
    }
  };

  const handleRestore = async (id: string | number, name: string) => {
    const record = deletedRecords.find((r) => r.id === id);
    if (!record) return;

    setDeletedRecords((prev) => prev.filter((r) => r.id !== id));
    setActiveRecords((prev) => [record, ...prev]);
    showToast(`Restored "${name}" back to Active RSVPs`, "success");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.message || "Failed to restore record", "info");
        fetchRecords();
      }
    } catch (err) {
      console.error("Restore error:", err);
      showToast("Network error while restoring", "info");
      fetchRecords();
    }
  };

  const handlePermanentDelete = async (id: string | number, name: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete the RSVP for "${name}"? This action cannot be undone.`)) return;

    const record = deletedRecords.find((r) => r.id === id);
    if (record) {
      setDeletedRecords((prev) => prev.filter((r) => r.id !== id));
    }

    try {
      const res = await fetch(`/api/rsvp?id=${id}&permanent=true`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Permanently deleted "${name}"`, "info");
      } else {
        showToast(json.message || "Failed to permanently delete record", "info");
        fetchRecords();
      }
    } catch (err) {
      console.error("Permanent Delete error:", err);
      showToast("Network error while deleting", "info");
      fetchRecords();
    }
  };

  const stats = useMemo(() => {
    const totalResponses = activeRecords.length;
    const totalAttendingEntries = activeRecords.filter((r) => r.attending === "accepts");
    const totalDeclinedEntries = activeRecords.filter((r) => r.attending === "declines");

    const totalAttendingGuests = totalAttendingEntries.reduce(
      (sum, r) => sum + (Number(r.guest_count) || 1),
      0
    );

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
    <div className="min-h-screen w-full bg-[var(--color-ivory)] text-[var(--color-espresso)] font-serif">
      {!isAuthenticated ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-sm p-6 md:p-8 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-lg text-center">
            <div className="mb-4 text-3xl">🔒</div>
            <h2 className="text-2xl font-serif text-[var(--color-gold-brown)] mb-1">Admin Dashboard</h2>
            <p className="text-xs text-[var(--color-soft-taupe)] mb-6">Please enter the password to access this area.</p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-brown)] text-center font-sans text-sm md:text-base"
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-600 font-sans">{error}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-lg text-sm font-sans font-semibold text-[var(--color-ivory)] shadow transition hover:opacity-90"
                style={{ backgroundColor: "var(--color-gold-brown)" }}
              >
                Unlock Dashboard
              </button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-[var(--color-champagne)]">
              <Link
                href="/"
                className="text-xs uppercase tracking-widest font-sans font-bold text-[var(--color-gold-brown)] hover:underline"
              >
                ← Back to Invitation Site
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
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
          <div className="flex flex-col gap-4 pb-6 border-b border-[var(--color-champagne)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Link
                  href="/"
                  className="text-xs uppercase tracking-widest font-sans font-bold text-[var(--color-gold-brown)] hover:underline"
                >
                  ← Back to Invitation Site
                </Link>
                <h1 className="text-2xl md:text-4xl font-serif text-[var(--color-gold-brown)] mt-1">
                  Guest RSVP Analytics & Management Dashboard
                </h1>
                <p className="text-xs text-[var(--color-soft-taupe)] font-sans mt-0.5">
                  Live Overview, Food Preferences, Duplicate Prevention & Deleted History
                </p>
              </div>

              <div className="flex items-center gap-3 font-sans">
                <button
                  onClick={fetchRecords}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full border border-[var(--color-gold-brown)] text-[var(--color-gold-brown)] hover:bg-[var(--color-ecru)] transition whitespace-nowrap"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={exportCSV}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full text-[var(--color-ivory)] shadow transition hover:opacity-90 whitespace-nowrap"
                  style={{ backgroundColor: "var(--color-gold-brown)" }}
                >
                  📥 Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 font-sans">
            <div className="p-4 md:p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
                Total RSVPs Received
              </p>
              <p className="text-2xl md:text-3xl font-serif font-bold text-[var(--color-gold-brown)] mt-2">
                {stats.totalResponses}
              </p>
              <p className="text-[10px] md:text-[11px] text-[var(--color-espresso)] mt-1">Active party responses</p>
            </div>

            <div className="p-4 md:p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
                Total Attending Guests
              </p>
              <p className="text-2xl md:text-3xl font-serif font-bold text-emerald-700 mt-2">
                {stats.totalAttendingGuests}
              </p>
              <p className="text-[10px] md:text-[11px] text-emerald-800 mt-1 font-medium">Confirmed attendees</p>
            </div>

            <div className="p-4 md:p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
                Regretfully Declined
              </p>
              <p className="text-2xl md:text-3xl font-serif font-bold text-rose-700 mt-2">
                {stats.totalDeclined}
              </p>
              <p className="text-[10px] md:text-[11px] text-rose-800 mt-1 font-medium">Unable to attend</p>
            </div>

            <div className="p-4 md:p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
                Deleted History Items
              </p>
              <p className="text-2xl md:text-3xl font-serif font-bold text-amber-700 mt-2">
                {deletedRecords.length}
              </p>
              <p className="text-[10px] md:text-[11px] text-amber-800 mt-1 font-medium">Available to restore</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="p-4 md:p-6 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--color-champagne)] pb-3">
                <div>
                  <h2 className="text-lg md:text-xl font-serif text-[var(--color-gold-brown)] font-bold">
                    Food Preferences Breakdown
                  </h2>
                  <p className="text-[10px] md:text-xs text-[var(--color-soft-taupe)] font-sans">
                    Distribution of guest meal choices
                  </p>
                </div>
                <span className="text-[10px] md:text-xs font-sans px-2.5 py-1 rounded bg-[var(--color-ecru)] text-[var(--color-gold-brown)] font-semibold whitespace-nowrap self-start">
                  Pie Chart
                </span>
              </div>

              {pieSlices.length === 0 ? (
                <div className="py-8 md:py-12 text-center text-xs text-[var(--color-soft-taupe)] font-sans">
                  No food choices submitted yet.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 py-4">
                  <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
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

                  <div className="space-y-2 w-full font-sans text-xs">
                    {pieSlices.map((slice, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full inline-block flex-shrink-0"
                            style={{ backgroundColor: slice.color }}
                          />
                          <span className="font-semibold text-[var(--color-espresso)] text-[11px] md:text-xs">
                            {slice.meal}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <span className="font-bold text-[var(--color-gold-brown)] text-[11px] md:text-xs">
                            {slice.count} {slice.count === 1 ? "guest" : "guests"}
                          </span>
                          <span className="text-[var(--color-soft-taupe)] text-[10px] md:text-xs">
                            ({slice.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--color-champagne)] pb-3">
                <div>
                  <h2 className="text-lg md:text-xl font-serif text-[var(--color-gold-brown)] font-bold">
                    Party Size Distribution
                  </h2>
                  <p className="text-[10px] md:text-xs text-[var(--color-soft-taupe)] font-sans">
                    Number of guests per attending party
                  </p>
                </div>
                <span className="text-[10px] md:text-xs font-sans px-2.5 py-1 rounded bg-[var(--color-ecru)] text-[var(--color-gold-brown)] font-semibold whitespace-nowrap self-start">
                  Bar Chart
                </span>
              </div>

              <div className="py-4 md:py-6 space-y-3 md:space-y-4 font-sans">
                {Object.entries(stats.partySizes).map(([group, count]) => {
                  const maxCount = Math.max(...Object.values(stats.partySizes), 1);
                  const percent = (count / maxCount) * 100;
                  return (
                    <div key={group} className="space-y-1">
                      <div className="flex justify-between text-[11px] md:text-xs font-semibold text-[var(--color-espresso)]">
                        <span>{group}</span>
                        <span>
                          {count} {count === 1 ? "party" : "parties"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 md:h-3 rounded-full bg-[var(--color-champagne)]/40 overflow-hidden">
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
          <div className="p-4 md:p-6 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm space-y-4">
            <div className="flex flex-col gap-4 pb-4 border-b border-[var(--color-champagne)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`px-3 py-2 text-[11px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
                      activeTab === "active"
                        ? "bg-[var(--color-gold-brown)] text-white shadow"
                        : "bg-[var(--color-ivory)] text-[var(--color-espresso)] border border-[var(--color-champagne)]"
                    }`}
                  >
                    📋 Active RSVPs ({activeRecords.length})
                  </button>

                  <button
                    onClick={() => setActiveTab("deleted")}
                    className={`px-3 py-2 text-[11px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
                      activeTab === "deleted"
                        ? "bg-amber-800 text-white shadow"
                        : "bg-[var(--color-ivory)] text-[var(--color-espresso)] border border-[var(--color-champagne)]"
                    }`}
                  >
                    🗑️ Deleted History ({deletedRecords.length})
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Search name, meal, note..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 text-xs rounded border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)] w-full sm:w-auto"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-8 md:py-12 text-center text-xs font-sans text-[var(--color-soft-taupe)]">
                Loading RSVP records...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-8 md:py-12 text-center text-xs font-sans text-[var(--color-soft-taupe)]">
                {activeTab === "active"
                  ? "No active guest records found."
                  : "No deleted records in history."}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full px-4 md:px-0">
                  <table className="w-full text-left text-[10px] md:text-xs font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--color-champagne)] text-[var(--color-gold-brown)] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-2 md:px-3 text-left">Primary Contact</th>
                        <th className="py-3 px-2 md:px-3 text-center">Status</th>
                        <th className="py-3 px-2 md:px-3 text-center">Guests</th>
                        <th className="py-3 px-2 md:px-3 text-left">Guest List & Meals</th>
                        <th className="py-3 px-2 md:px-3 text-left">Dietary / Notes</th>
                        <th className="py-3 px-2 md:px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-champagne)]/40">
                      {filteredRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-[var(--color-ivory)] transition">
                          <td className="py-3 px-2 md:px-3 font-semibold text-[var(--color-espresso)]">
                            <div className="text-[11px] md:text-xs">{r.full_name}</div>
                            {r.email && (
                              <div className="text-[10px] text-[var(--color-soft-taupe)] font-normal truncate max-w-[120px] md:max-w-none">
                                {r.email}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2 md:px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                                r.attending === "accepts"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {r.attending === "accepts" ? "Attending" : "Declined"}
                            </span>
                          </td>
                          <td className="py-3 px-2 md:px-3 text-center font-bold text-[var(--color-gold-brown)] text-[11px] md:text-xs">
                            {r.guest_count}
                          </td>
                          <td className="py-3 px-2 md:px-3">
                            {r.guest_details && r.guest_details.length > 0 ? (
                              <ul className="space-y-1">
                                {r.guest_details.map((g, gIdx) => (
                                  <li key={gIdx} className="flex items-center gap-1 flex-wrap">
                                    <span className="w-1 h-1 rounded-full bg-[var(--color-gold-brown)] inline-block flex-shrink-0" />
                                    <span className="font-medium text-[var(--color-espresso)] text-[10px] md:text-xs">
                                      {g.name}:
                                    </span>
                                    <span className="text-[var(--color-soft-taupe)] font-semibold text-[10px] md:text-xs">
                                      {g.meal}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-[var(--color-soft-taupe)] italic text-[10px] md:text-xs">
                                {r.meal_preference}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 md:px-3">
                            {r.dietary_restrictions && (
                              <div className="text-[10px] md:text-[11px] text-amber-900 font-semibold mb-0.5">
                                ⚠️ {r.dietary_restrictions}
                              </div>
                            )}
                            {r.message && (
                              <div className="text-[10px] md:text-[11px] text-[var(--color-espresso)] italic line-clamp-2">
                                &quot;{r.message}&quot;
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2 md:px-3 text-right">
                            {activeTab === "active" ? (
                              <button
                                onClick={() => handleDelete(r.id, r.full_name)}
                                className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] md:text-[11px] transition whitespace-nowrap"
                                title="Move to Deleted History"
                              >
                                🗑️ Delete
                              </button>
                            ) : (
                              <div className="flex flex-col gap-1.5 items-end">
                                <button
                                  onClick={() => handleRestore(r.id, r.full_name)}
                                  className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[10px] md:text-[11px] transition whitespace-nowrap"
                                  title="Restore back to active RSVPs"
                                >
                                  ↺ Restore
                                </button>
                                <button
                                  onClick={() => handlePermanentDelete(r.id, r.full_name)}
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] md:text-[11px] transition whitespace-nowrap"
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
