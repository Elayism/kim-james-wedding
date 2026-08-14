"use client";

import { useState, FormEvent } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.reload();
      } else {
        setError(data.message || "Incorrect password");
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{ backgroundColor: "var(--color-ivory)" }}
    >
      <div className="w-full max-w-md p-8 rounded-xl shadow-xl border border-[var(--color-champagne)] bg-[var(--color-antique-white)] text-center">
        <div className="text-xs uppercase tracking-widest text-[var(--color-soft-taupe)] font-semibold mb-2">
          Wedding Admin
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-gold-brown)] mb-6">
          Organizer Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-2 font-sans">
              Enter Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-md border border-[var(--color-champagne)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-brown)] transition"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 font-sans text-center py-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full text-xs uppercase tracking-widest font-semibold text-[var(--color-ivory)] shadow transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--color-gold-brown)" }}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              "Access Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
