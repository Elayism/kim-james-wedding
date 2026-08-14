"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";
import { CornerFlourish, SectionDivider } from "./Flourishes";

export default function GiftRegistry() {
  const [copied, setCopied] = useState(false);
  const accountInfo = "Maribank: Kimberlyn Oliver (14848808514) | GCash: 0917-123-4567";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountInfo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center py-12"
      style={{ backgroundColor: "var(--color-ivory)" }}
    >
      <FadeInSection>
        <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-serif text-[var(--color-gold-brown)] font-letterpress mb-1">
          Gift Registry
        </motion.h2>

        <motion.div variants={childVariants}>
          <SectionDivider />
        </motion.div>

        <motion.div variants={childVariants} className="relative p-8 rounded-lg bg-[var(--color-antique-white)] border border-[var(--color-champagne)] shadow-sm max-w-xl mx-auto font-serif">
          <CornerFlourish position="top-left" />
          <CornerFlourish position="bottom-right" />

          <p className="text-base md:text-lg text-[var(--color-espresso)] leading-relaxed mb-6">
            Your presence at our wedding is the greatest gift of all. However, should you wish to honor us with a gift, a monetary contribution toward our future together would be sincerely appreciated.
          </p>

          <div className="text-xs uppercase tracking-widest text-[var(--color-soft-taupe)] font-sans font-semibold mb-4 text-center">
            Maribank (Kimberlyn Oliver: 14848808514) • GCash (0917-123-4567) • Email for international details
          </div>

          {/* Copy to Clipboard Button with Wax Seal Checkmark Animation */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={handleCopy}
              className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-ivory)] shadow transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ backgroundColor: "var(--color-gold-brown)" }}
            >
              <span>📋 Copy Gift Details</span>
            </button>

            {/* Wax Seal Checkmark Animated Scale-In/Out */}
            <AnimatePresence>
              {copied && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-ecru)] border border-[var(--color-warm-sand)] text-xs text-[var(--color-gold-brown)] font-sans font-semibold shadow-md"
                >
                  <svg className="w-4 h-4 text-[var(--color-gold-brown)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span>Copied to Clipboard!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </FadeInSection>
    </div>
  );
}
