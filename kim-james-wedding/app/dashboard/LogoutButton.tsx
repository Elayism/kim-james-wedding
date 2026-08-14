"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/dashboard-logout", { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold border border-[var(--color-soft-taupe)] text-[var(--color-espresso)] hover:bg-[var(--color-ecru)] transition disabled:opacity-50"
    >
      {isLoggingOut ? "Logging Out..." : "Log Out"}
    </button>
  );
}
