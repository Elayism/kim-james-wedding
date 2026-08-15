"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
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

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    return res.json().then((json) => {
      throw new Error(json.message || `HTTP ${res.status}`);
    });
  }
  return res.json();
}).then((json) => {
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as any).data as RsvpRecord[];
  }
  return json as RsvpRecord[];
});

function IconLock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992h4.992m12.984 0h4.992v4.992M2.985 9.348h4.992v4.992" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function IconRestore() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.66-2.166 1.638m9.332 0c.065.616.216 1.206.444 1.764M15.666 3.888A2.25 2.25 0 0118 6.75v9a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 014.5 15.75v-9A2.25 2.25 0 016.75 3.5h9m0 0a2.25 2.25 0 012.25 2.25" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IconX() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "info";
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const [editModal, setEditModal] = useState<{
    open: boolean;
    record: RsvpRecord | null;
  }>({ open: false, record: null });

  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    attending: "accepts" as "accepts" | "declines",
    guest_count: 1,
    meal_preference: "Chicken",
    dietary_restrictions: "",
    message: "",
  });

  useEffect(() => {
    setIsAuthenticated(false);
  }, []);

  const { data: activeData, isLoading: activeLoading, error: activeError } = useSWR<RsvpRecord[]>(
    isAuthenticated ? "/api/rsvp?type=active" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0,
      onError: (err) => {
        console.error("SWR active fetch error:", err);
        setApiError(err.message);
      },
    }
  );

  const { data: deletedData, isLoading: deletedLoading, error: deletedError } = useSWR<RsvpRecord[]>(
    isAuthenticated ? "/api/rsvp?type=deleted" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0,
      onError: (err) => {
        console.error("SWR deleted fetch error:", err);
        setApiError(err.message);
      },
    }
  );

  const activeRecords = useMemo(() => {
    if (activeError) return [] as RsvpRecord[];
    return Array.isArray(activeData) ? activeData : [];
  }, [activeData, activeError]);

  const deletedRecords = useMemo(() => {
    if (deletedError) return [] as RsvpRecord[];
    return Array.isArray(deletedData) ? deletedData : [];
  }, [deletedData, deletedError]);

  const loading = activeLoading || deletedLoading;

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const openModal = (title: string, message: string, onConfirm: () => void, variant: "danger" | "info" = "danger") => {
    setModal({ open: true, title, message, onConfirm, variant });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  const revalidate = () => {
    mutate("/api/rsvp?type=active");
    mutate("/api/rsvp?type=deleted");
    setApiError(null);
  };

  const handleDelete = async (id: string | number, name: string) => {
    openModal(
      "Move to Deleted History?",
      `Are you sure you want to move RSVP for "${name}" to Deleted History?`,
      async () => {
        closeModal();
        const record = activeRecords.find((r) => r.id === id);
        if (!record) return;

        const updatedActive = activeRecords.filter((r) => r.id !== id);
        const updatedDeleted = [record, ...deletedRecords];

        mutate("/api/rsvp?type=active", updatedActive, false);
        mutate("/api/rsvp?type=deleted", updatedDeleted, false);
        showToast(`Moved "${name}" to Deleted History`, "info");

        try {
          const res = await fetch(`/api/rsvp?id=${id}`, { method: "DELETE" });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.message || "Failed to delete record", "info");
            revalidate();
          }
        } catch (err) {
          console.error("Delete error:", err);
          showToast("Network error while deleting", "info");
          revalidate();
        }
      },
      "danger"
    );
  };

  const handleRestore = async (id: string | number, name: string) => {
    openModal(
      "Restore RSVP?",
      `Are you sure you want to restore "${name}" back to Active RSVPs?`,
      async () => {
        closeModal();
        const record = deletedRecords.find((r) => r.id === id);
        if (!record) return;

        const updatedDeleted = deletedRecords.filter((r) => r.id !== id);
        const updatedActive = [record, ...activeRecords];

        mutate("/api/rsvp?type=deleted", updatedDeleted, false);
        mutate("/api/rsvp?type=active", updatedActive, false);
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
            revalidate();
          }
        } catch (err) {
          console.error("Restore error:", err);
          showToast("Network error while restoring", "info");
          revalidate();
        }
      },
      "info"
    );
  };

  const handlePermanentDelete = async (id: string | number, name: string) => {
    openModal(
      "Permanently Delete?",
      `Are you sure you want to PERMANENTLY delete the RSVP for "${name}"? This action cannot be undone.`,
      async () => {
        closeModal();
        const record = deletedRecords.find((r) => r.id === id);
        if (!record) return;

        const updatedDeleted = deletedRecords.filter((r) => r.id !== id);
        mutate("/api/rsvp?type=deleted", updatedDeleted, false);
        showToast(`Permanently deleted "${name}"`, "info");

        try {
          const res = await fetch(`/api/rsvp?id=${id}&permanent=true`, { method: "DELETE" });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.message || "Failed to permanently delete record", "info");
            revalidate();
          }
        } catch (err) {
          console.error("Permanent Delete error:", err);
          showToast("Network error while deleting", "info");
          revalidate();
        }
      },
      "danger"
    );
  };

  const openEditModal = (record: RsvpRecord) => {
    setEditForm({
      full_name: record.full_name || "",
      email: record.email || "",
      attending: record.attending,
      guest_count: Number(record.guest_count) || 1,
      meal_preference: record.meal_preference || "Chicken",
      dietary_restrictions: record.dietary_restrictions || "",
      message: record.message || "",
    });
    setEditModal({ open: true, record });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, record: null });
  };

  const handleEditSave = async () => {
    if (!editModal.record) return;

    const updates = {
      full_name: editForm.full_name,
      email: editForm.email || null,
      attending: editForm.attending,
      guest_count: editForm.guest_count,
      meal_preference: editForm.meal_preference,
      dietary_restrictions: editForm.dietary_restrictions || null,
      message: editForm.message,
    };

    const updatedRecord = { ...editModal.record, ...updates };

    mutate("/api/rsvp?type=active", activeRecords.map((r) => r.id === editModal.record!.id ? updatedRecord : r), false);
    mutate("/api/rsvp?type=deleted", deletedRecords.map((r) => r.id === editModal.record!.id ? updatedRecord : r), false);
    showToast(`Updated RSVP for "${editForm.full_name}"`, "success");
    closeEditModal();

    try {
      const res = await fetch("/api/rsvp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editModal.record.id, ...updates }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.message || "Failed to update record", "info");
        revalidate();
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast("Network error while updating", "info");
      revalidate();
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
          (r.full_name && r.full_name.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.message && r.message.toLowerCase().includes(q));

        const guestMatch = r.guest_details?.some(
          (g) => (g.name && g.name.toLowerCase().includes(q)) || (g.meal && g.meal.toLowerCase().includes(q))
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
      `"${(r.full_name || "").replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
      r.attending,
      r.guest_count,
      `"${(r.meal_preference || "").replace(/"/g, '""')}"`,
      `"${(r.guest_details || []).map((g) => `${g.name || ""} (${g.meal})`).join("; ").replace(/"/g, '""')}"`,
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "wedding2027") {
      setIsAuthenticated(true);
      setError("");
      setApiError(null);
    } else {
      setError("Incorrect password. Please try again.");
      setPasswordInput("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-ivory)] text-[var(--color-espresso)] font-serif">
      {!isAuthenticated ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-sm p-6 md:p-8 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-lg text-center">
            <div className="mb-4 text-[var(--color-gold-brown)]">
              <IconLock />
            </div>
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
                <p className="text-xs text-red-700 font-sans">{error}</p>
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
        <div className="min-h-screen w-full">
          {notification && (
            <div
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl text-xs font-sans font-semibold border flex items-center gap-2 ${
                notification.type === "success"
                  ? "bg-[var(--color-espresso)] text-[var(--color-ivory)] border-[var(--color-gold-brown)]"
                  : "bg-[var(--color-antique-white)] text-[var(--color-gold-brown)] border-[var(--color-champagne)]"
              }`}
            >
              <span>{notification.type === "success" ? <IconCheck /> : <IconRefresh />}</span>
              <span>{notification.message}</span>
            </div>
          )}

          {apiError && (
            <div className="mx-4 md:mx-8 mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-sans">
              <strong>Connection Notice:</strong> {apiError}. Showing cached data if available.
              <button onClick={revalidate} className="ml-3 underline font-semibold">Retry</button>
            </div>
          )}

          {/* Modal */}
          {modal.open && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
              <div className="relative bg-[var(--color-antique-white)] rounded-xl border border-[var(--color-champagne)] shadow-2xl max-w-sm w-full p-6 text-center">
                <div className={`mx-auto mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full ${
                  modal.variant === "danger" ? "bg-rose-100 text-rose-700" : "bg-[var(--color-ecru)] text-[var(--color-gold-brown)]"
                }`}>
                  {modal.variant === "danger" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-serif text-[var(--color-gold-brown)] mb-2">{modal.title}</h3>
                <p className="text-xs text-[var(--color-soft-taupe)] font-sans mb-6">{modal.message}</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg text-xs font-sans font-semibold border border-[var(--color-champagne)] text-[var(--color-espresso)] hover:bg-[var(--color-ivory)] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      modal.onConfirm();
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-sans font-semibold text-[var(--color-ivory)] shadow transition hover:opacity-90 ${
                      modal.variant === "danger" ? "bg-rose-700" : "bg-[var(--color-gold-brown)]"
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editModal.open && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditModal} />
              <div className="relative bg-[var(--color-antique-white)] rounded-xl border border-[var(--color-champagne)] shadow-2xl max-w-lg w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif text-[var(--color-gold-brown)]">Edit RSVP</h3>
                  <button onClick={closeEditModal} className="p-1 rounded-full hover:bg-[var(--color-champagne)]/30 transition">
                    <IconX />
                  </button>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)] text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">Status</label>
                      <select
                        value={editForm.attending}
                        onChange={(e) => setEditForm({ ...editForm, attending: e.target.value as "accepts" | "declines" })}
                        className="w-full px-3 py-2 rounded border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)] text-sm"
                      >
                        <option value="accepts">Attending</option>
                        <option value="declines">Declined</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">Guest Count</label>
                      <input
                        type="number"
                        min={1}
                        value={editForm.guest_count}
                        onChange={(e) => setEditForm({ ...editForm, guest_count: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)] text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">Meal Preference</label>
                    <select
                      value={editForm.meal_preference}
                      onChange={(e) => setEditForm({ ...editForm, meal_preference: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)] text-sm"
                    >
                      <option value="Chicken">Chicken</option>
                      <option value="Beef">Beef</option>
                      <option value="Fish">Fish</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Pork">Pork</option>
                      <option value="Kids Meal">Kids Meal</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">Dietary Restrictions</label>
                    <input
                      type="text"
                      value={editForm.dietary_restrictions}
                      onChange={(e) => setEditForm({ ...editForm, dietary_restrictions: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">Message</label>
                    <textarea
                      value={editForm.message}
                      onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)] text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[var(--color-champagne)]">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded-lg text-xs font-sans font-semibold border border-[var(--color-champagne)] text-[var(--color-espresso)] hover:bg-[var(--color-ivory)] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-4 py-2 rounded-lg text-xs font-sans font-semibold text-[var(--color-ivory)] shadow transition hover:opacity-90"
                    style={{ backgroundColor: "var(--color-gold-brown)" }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Dashboard Content */}
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-4 md:space-y-6">
            {/* Navigation / Header */}
            <div className="flex flex-col gap-3 pb-4 border-b border-[var(--color-champagne)] sticky top-0 bg-[var(--color-ivory)] z-30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Link
                    href="/"
                    className="text-xs uppercase tracking-widest font-sans font-bold text-[var(--color-gold-brown)] hover:underline"
                  >
                    ← Back to Invitation Site
                  </Link>
                  <h1 className="text-xl md:text-3xl font-serif text-[var(--color-gold-brown)] mt-1">
                    Guest RSVP Analytics & Management
                  </h1>
                  <p className="text-[10px] md:text-xs text-[var(--color-soft-taupe)] font-sans mt-0.5">
                    Live Overview, Food Preferences, Duplicate Prevention & Deleted History
                  </p>
                </div>

                <div className="flex items-center gap-2 font-sans">
                  <button
                    onClick={revalidate}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-full border border-[var(--color-gold-brown)] text-[var(--color-gold-brown)] hover:bg-[var(--color-ecru)] transition whitespace-nowrap"
                  >
                    <IconRefresh />
                    Refresh
                  </button>
                  <button
                    onClick={exportCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-full text-[var(--color-ivory)] shadow transition hover:opacity-90 whitespace-nowrap"
                    style={{ backgroundColor: "var(--color-gold-brown)" }}
                  >
                    <IconDownload />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 font-sans">
              <div className="p-3 md:p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
                <p className="text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
                  Total RSVPs
                </p>
                <p className="text-xl md:text-3xl font-serif font-bold text-[var(--color-gold-brown)] mt-1 md:mt-2">
                  {stats.totalResponses}
                </p>
                <p className="text-[10px] md:text-[11px] text-[var(--color-espresso)] mt-1">Active responses</p>
              </div>

              <div className="p-3 md:p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
                <p className="text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
                  Attending Guests
                </p>
                <p className="text-xl md:text-3xl font-serif font-bold text-emerald-700 mt-1 md:mt-2">
                  {stats.totalAttendingGuests}
                </p>
                <p className="text-[10px] md:text-[11px] text-emerald-800 mt-1 font-medium">Confirmed attendees</p>
              </div>

              <div className="p-3 md:p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
                <p className="text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
                  Regretfully Declined
                </p>
                <p className="text-xl md:text-3xl font-serif font-bold text-rose-700 mt-1 md:mt-2">
                  {stats.totalDeclined}
                </p>
                <p className="text-[10px] md:text-[11px] text-rose-800 mt-1 font-medium">Unable to attend</p>
              </div>

              <div className="p-3 md:p-5 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
                <p className="text-[10px] md:text-xs uppercase tracking-wider text-[var(--color-soft-taupe)] font-semibold">
                  Deleted History
                </p>
                <p className="text-xl md:text-3xl font-serif font-bold text-amber-700 mt-1 md:mt-2">
                  {deletedRecords.length}
                </p>
                <p className="text-[10px] md:text-[11px] text-amber-800 mt-1 font-medium">Available to restore</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5">
              <div className="p-3 md:p-6 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-[var(--color-champagne)] pb-3">
                  <div>
                    <h2 className="text-base md:text-xl font-serif text-[var(--color-gold-brown)] font-bold">
                      Food Preferences
                    </h2>
                    <p className="text-[10px] md:text-xs text-[var(--color-soft-taupe)] font-sans">
                      Distribution of guest meal choices
                    </p>
                  </div>
                  <span className="text-[10px] md:text-xs font-sans px-2 py-1 rounded bg-[var(--color-ecru)] text-[var(--color-gold-brown)] font-semibold whitespace-nowrap self-start">
                    Pie Chart
                  </span>
                </div>

                {pieSlices.length === 0 ? (
                  <div className="py-6 md:py-10 text-center text-xs text-[var(--color-soft-taupe)] font-sans">
                    No food choices submitted yet.
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 py-3 md:py-4">
                    <div className="relative w-36 h-36 md:w-44 md:h-44 flex-shrink-0">
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

              <div className="p-3 md:p-6 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-[var(--color-champagne)] pb-3">
                  <div>
                    <h2 className="text-base md:text-xl font-serif text-[var(--color-gold-brown)] font-bold">
                      Party Size Distribution
                    </h2>
                    <p className="text-[10px] md:text-xs text-[var(--color-soft-taupe)] font-sans">
                      Number of guests per attending party
                    </p>
                  </div>
                  <span className="text-[10px] md:text-xs font-sans px-2 py-1 rounded bg-[var(--color-ecru)] text-[var(--color-gold-brown)] font-semibold whitespace-nowrap self-start">
                    Bar Chart
                  </span>
                </div>

                <div className="py-3 md:py-5 space-y-2 md:space-y-3 font-sans">
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
                        <div className="w-full h-2 md:h-2.5 rounded-full bg-[var(--color-champagne)]/40 overflow-hidden">
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
            <div className="p-3 md:p-6 rounded-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] shadow-sm space-y-3 md:space-y-4">
              <div className="flex flex-col gap-3 pb-3 border-b border-[var(--color-champagne)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab("active")}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-[11px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
                        activeTab === "active"
                          ? "bg-[var(--color-gold-brown)] text-white shadow"
                          : "bg-[var(--color-ivory)] text-[var(--color-espresso)] border border-[var(--color-champagne)]"
                      }`}
                    >
                      <IconClipboard />
                      Active RSVPs ({activeRecords.length})
                    </button>

                    <button
                      onClick={() => setActiveTab("deleted")}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-[11px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
                        activeTab === "deleted"
                          ? "bg-[var(--color-espresso)] text-white shadow"
                          : "bg-[var(--color-ivory)] text-[var(--color-espresso)] border border-[var(--color-champagne)]"
                      }`}
                    >
                      <IconTrash />
                      Deleted History ({deletedRecords.length})
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
                <div className="py-8 md:py-10 text-center text-xs font-sans text-[var(--color-soft-taupe)]">
                  Loading RSVP records...
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="py-8 md:py-10 text-center text-xs font-sans text-[var(--color-soft-taupe)]">
                  {activeTab === "active"
                    ? "No active guest records found."
                    : "No deleted records in history."}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-3 md:mx-0">
                  <div className="inline-block min-w-full px-3 md:px-0">
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
                                  {r.dietary_restrictions}
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
                                <div className="flex flex-col gap-1.5 items-end">
                                  <button
                                    onClick={() => openEditModal(r)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[10px] md:text-[11px] transition whitespace-nowrap"
                                    title="Edit RSVP"
                                  >
                                    <IconEdit />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(r.id, r.full_name)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] md:text-[11px] transition whitespace-nowrap"
                                    title="Move to Deleted History"
                                  >
                                    <IconTrash />
                                    Delete
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1.5 items-end">
                                  <button
                                    onClick={() => handleRestore(r.id, r.full_name)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[10px] md:text-[11px] transition whitespace-nowrap"
                                    title="Restore back to active RSVPs"
                                  >
                                    <IconRestore />
                                    Restore
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDelete(r.id, r.full_name)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] md:text-[11px] transition whitespace-nowrap"
                                    title="Permanently Delete"
                                  >
                                    <IconX />
                                    Delete
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
        </div>
      )}
    </div>
  );
}
