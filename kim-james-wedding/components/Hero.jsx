"use client";

import { motion } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";

export default function Hero() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Image — slow 2s zoom-out from 1.08x to 1x */}
      <motion.div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/images/hero-bg.jpg")' }}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 5, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      {/* Subtle dark scrim so text stays readable over any photo */}
      <div className="absolute inset-0 z-0 bg-black/30 pointer-events-none" />

      {/* Main Content */}
      <FadeInSection className="relative z-10 flex flex-col items-center text-center px-4">
        {/* "We're getting married" label */}
        <motion.div
          variants={childVariants}
          className="text-sm md:text-base uppercase tracking-[0.3em] text-white/80 mb-4 font-sans font-semibold"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
        >
          We&apos;re getting married
        </motion.div>

        {/* Names */}
        <motion.div variants={childVariants} className="relative inline-block mb-3">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-serif leading-tight text-white"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
          >
            Kimberlyn &amp; James
          </h1>

          {/* Thin gold line draws itself on load */}
          <svg className="w-full h-4 mt-1 overflow-visible" viewBox="0 0 300 20" fill="none">
            <path
              d="M 5 10 Q 150 18 295 10"
              stroke="rgba(255,220,150,0.9)"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-draw-line"
            />
          </svg>
        </motion.div>

        {/* Date */}
        <motion.div
          variants={childVariants}
          className="text-lg md:text-2xl font-serif text-white/90 mb-2 mt-4"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
        >
          March 8, 2027 · Monday · 10:00 AM
        </motion.div>

        {/* Tagline */}
        <motion.div
          variants={childVariants}
          className="text-sm md:text-lg text-white/70 font-serif italic max-w-md text-center mt-2"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
        >
          A celebration of love and new beginnings.
        </motion.div>
      </FadeInSection>
    </div>
  );
}
