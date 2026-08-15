"use client";

import { motion } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";
import { CornerFlourish, SectionDivider } from "./Flourishes";

const cardFlipLeft = {
  hidden: { rotateY: -35, opacity: 0 },
  visible: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const cardFlipRight = {
  hidden: { rotateY: 35, opacity: 0 },
  visible: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.15 },
  },
};

export default function EventDetails() {
  const mapLink = "https://maps.google.com/?q=Vista+Villa+DSB+Negros+Occidental";

  return (
    <div
      className="w-full flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--color-ivory)" }}
    >
      <FadeInSection>
        <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-serif text-[var(--color-gold-brown)] font-letterpress mb-1">
          Event Details
        </motion.h2>

        <motion.div variants={childVariants}>
          <SectionDivider />
        </motion.div>

        {/* Two 3D Flip Cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8 text-left" style={{ perspective: "1000px" }}>
          {/* Ceremony Card */}
          <motion.div
            variants={cardFlipLeft}
            className="relative p-6 rounded-lg border border-[var(--color-champagne)] shadow-md flex flex-col justify-between"
            style={{ backgroundColor: "var(--color-antique-white)", transformStyle: "preserve-3d" }}
          >
            <CornerFlourish position="top-left" />
            <CornerFlourish position="bottom-right" />
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--color-soft-taupe)] font-semibold font-sans mb-2">
                The Ceremony
              </div>
              <h3 className="text-2xl font-serif text-[var(--color-espresso)] font-letterpress mb-3">
                Wedding Ceremony
              </h3>
              <p className="text-sm text-[var(--color-espresso)] mb-1 font-serif">
                <strong>Time:</strong> March 8, 2027 · 10:00 AM
              </p>
              <p className="text-sm text-[var(--color-espresso)] mb-1 font-serif">
                <strong>Venue:</strong> Vista Villa DSB
              </p>
              <p className="text-sm text-[var(--color-soft-taupe)] font-serif">
                Negros Occidental, Philippines
              </p>
            </div>
          </motion.div>

          {/* Reception Card */}
          <motion.div
            variants={cardFlipRight}
            className="relative p-6 rounded-lg border border-[var(--color-champagne)] shadow-md flex flex-col justify-between"
            style={{ backgroundColor: "var(--color-antique-white)", transformStyle: "preserve-3d" }}
          >
            <CornerFlourish position="top-left" />
            <CornerFlourish position="bottom-right" />
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--color-soft-taupe)] font-semibold font-sans mb-2">
                The Reception
              </div>
              <h3 className="text-2xl font-serif text-[var(--color-espresso)] font-letterpress mb-3">
                Celebration & Dinner
              </h3>
              <p className="text-sm text-[var(--color-espresso)] mb-1 font-serif">
                <strong>Time:</strong> March 8, 2027 · 12:00 PM
              </p>
              <p className="text-sm text-[var(--color-espresso)] mb-1 font-serif">
                <strong>Venue:</strong> Vista Villa DSB
              </p>
              <p className="text-sm text-[var(--color-soft-taupe)] font-serif">
                Negros Occidental, Philippines
              </p>
            </div>
          </motion.div>
        </div>

        {/* Realistic Wedding Venue Map UI Card */}
        <motion.div variants={childVariants} className="max-w-md mx-auto">
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-xl border-2 border-[var(--color-warm-sand)] shadow-lg hover:shadow-xl transition-all duration-300 bg-[var(--color-antique-white)]"
          >
            {/* Map Canvas Illustration */}
            <div className="relative w-full h-44 bg-[#F2EFE9] overflow-hidden flex items-center justify-center">
              {/* Map Road Patterns */}
              <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <path d="M-20 60 Q 100 20 200 80 T 450 40" stroke="#CBB996" strokeWidth="12" fill="none" />
                <path d="M80 -10 Q 120 100 160 200" stroke="#DFD5C0" strokeWidth="8" fill="none" />
                <path d="M250 -10 Q 220 90 280 200" stroke="#CBB996" strokeWidth="6" fill="none" strokeDasharray="6 4" />
                {/* River/Water Feature */}
                <path d="M 0 140 Q 150 110 400 150" stroke="#B8D0DB" strokeWidth="18" fill="none" opacity="0.6" />
              </svg>

              {/* Topographic Contour Lines */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8B5E3C_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Glowing Venue Marker Pin */}
              <div className="relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform duration-300">
                <div className="w-10 h-10 rounded-full bg-[var(--color-gold-brown)] text-[var(--color-ivory)] flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[var(--color-gold-brown)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div className="mt-1 px-3 py-1 bg-white/90 backdrop-blur border border-[var(--color-champagne)] rounded-full shadow text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--color-espresso)]">
                  Vista Villa DSB
                </div>
              </div>
            </div>

            {/* Bottom Card Bar */}
            <div className="p-3 bg-[var(--color-ivory)] border-t border-[var(--color-champagne)] flex items-center justify-between">
              <div className="text-left font-sans">
                <div className="text-xs font-bold text-[var(--color-espresso)]">
                  Vista Villa DSB, Negros Occidental
                </div>
                <div className="text-[10px] text-[var(--color-soft-taupe)]">
                  Tap to view location on Google Maps
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[var(--color-gold-brown)] text-[var(--color-ivory)] shadow group-hover:opacity-90 transition font-sans">
                Get Directions ↗
              </span>
            </div>
          </a>
        </motion.div>
      </FadeInSection>
    </div>
  );
}
