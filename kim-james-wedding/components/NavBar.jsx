"use client";

import { motion } from "framer-motion";

export default function NavBar({ isPlaying, onToggleAudio }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 p-6 flex items-center justify-between pointer-events-none"
    >
      {/* Burger Menu for mobile - currently just decorative placeholder for actual menu implementation later */}
      <button
        className="pointer-events-auto p-2 text-[var(--color-espresso)] hover:text-[var(--color-gold-brown)] transition-colors"
        aria-label="Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Music Toggle */}
      <button
        onClick={onToggleAudio}
        className={`pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full border border-[var(--color-champagne)] transition-all duration-300 shadow-md backdrop-blur-sm ${
          isPlaying ? "bg-[var(--color-antique-white)]" : "bg-white/80"
        }`}
        aria-label="Toggle Audio"
        style={{ color: "var(--color-gold-brown)" }}
      >
        <div className={isPlaying ? "animate-spin-slow" : ""}>
          {isPlaying ? (
            <span className="text-xl leading-none">♫</span>
          ) : (
            <div className="relative">
              <span className="text-xl leading-none opacity-50">♫</span>
              {/* Strike-through line for muted state */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-0.5 bg-[var(--color-gold-brown)] rotate-45 transform origin-center" />
              </div>
            </div>
          )}
        </div>
      </button>
    </motion.nav>
  );
}
