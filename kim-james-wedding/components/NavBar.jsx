"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "our-story", label: "Our Story" },
  { id: "event-details", label: "Event" },
  { id: "dress-code", label: "Dress Code" },
  { id: "rsvp", label: "RSVP" },
  { id: "gift-registry", label: "Gifts" },
  { id: "gallery", label: "Gallery" },
];

export default function NavBar({ isPlaying, onToggleAudio }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const scrollTo = (id) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`fixed top-0 left-0 w-full z-50 px-5 py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "bg-[var(--color-ivory)]/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 rounded-full transition-colors"
          style={{ color: scrolled ? "var(--color-espresso)" : "var(--color-ivory)" }}
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <button
          onClick={onToggleAudio}
          className={`flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-300 shadow-md backdrop-blur-sm ${
            isPlaying ? "bg-[var(--color-antique-white)]/90" : "bg-white/80"
          }`}
          aria-label="Toggle Audio"
          style={{ color: "var(--color-gold-brown)", borderColor: "var(--color-champagne)" }}
        >
          <div className={isPlaying ? "animate-spin-slow" : ""}>
            {isPlaying ? (
              <span className="text-lg leading-none">♫</span>
            ) : (
              <div className="relative">
                <span className="text-lg leading-none opacity-50">♫</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-0.5 bg-[var(--color-gold-brown)] rotate-45 transform origin-center" />
                </div>
              </div>
            )}
          </div>
        </button>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[70] h-full w-[280px] bg-[var(--color-ivory)] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--color-champagne)]">
                <span className="text-sm font-serif italic" style={{ color: "var(--color-gold-brown)" }}>
                  Navigation
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-[var(--color-champagne)]/30 transition-colors"
                  style={{ color: "var(--color-espresso)" }}
                  aria-label="Close menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-5">
                <div className="space-y-1">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollTo(section.id)}
                      className="w-full text-left px-4 py-3 rounded-lg text-base font-serif transition-all duration-200 hover:bg-[var(--color-champagne)]/40"
                      style={{ color: "var(--color-espresso)" }}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-[var(--color-champagne)]">
                <p className="text-[10px] uppercase tracking-widest text-center font-sans" style={{ color: "var(--color-soft-taupe)" }}>
                  Kimberlyn &amp; James
                </p>
                <p className="text-[10px] text-center mt-1 font-serif italic" style={{ color: "var(--color-soft-taupe)" }}>
                  March 8, 2027
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
