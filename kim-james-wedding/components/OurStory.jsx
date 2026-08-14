"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";
import { SectionDivider } from "./Flourishes";

const storyImages = [
  { src: "/images/story-1.jpg", alt: "Our Story" },
  { src: "/images/story-2.jpg", alt: "Our Story" },
  // Add more story images here — they'll slot in automatically
];

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function OurStory() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [dragStart, setDragStart] = useState(null);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % storyImages.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + storyImages.length) % storyImages.length);
  }, []);

  // Auto-slide every 2.5s, pauses on hover/touch
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 2500);
    return () => clearInterval(timer);
  }, [paused, next]);

  const onDragStart = (e) => {
    setPaused(true);
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setDragStart(x);
  };
  const onDragEnd = (e) => {
    if (dragStart === null) return;
    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart - x;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setDragStart(null);
    setTimeout(() => setPaused(false), 3000);
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center py-10"
      style={{ backgroundColor: "var(--color-antique-white)" }}
    >
      <FadeInSection>
        <motion.h2
          variants={childVariants}
          className="text-3xl md:text-5xl font-serif text-[var(--color-gold-brown)] text-center mb-1"
        >
          Our Story
        </motion.h2>

        <motion.div variants={childVariants}>
          <SectionDivider />
        </motion.div>

        <motion.p
          variants={childVariants}
          className="text-base md:text-lg text-[var(--color-espresso)] leading-relaxed max-w-2xl mx-auto mb-6 font-serif text-center px-6"
        >
          [COUPLE_STORY_TEXT]
        </motion.p>

        {/* Slide carousel — full width on mobile, constrained on desktop */}
        <motion.div
          variants={childVariants}
          className="relative w-full sm:max-w-2xl mx-auto sm:px-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Image frame */}
          <div
            className="relative overflow-hidden sm:rounded-xl border-0 sm:border-2 sm:border-[var(--color-champagne)] sm:shadow-xl bg-[var(--color-ivory)]"
            style={{ aspectRatio: "4/3" }}
            onMouseDown={onDragStart}
            onMouseUp={onDragEnd}
            onTouchStart={onDragStart}
            onTouchEnd={onDragEnd}
          >
            {/* Gold corner flourishes — desktop only */}
            <div className="hidden sm:block absolute top-2 left-2 z-10 w-6 h-6 border-t-2 border-l-2 border-[var(--color-gold-brown)] opacity-60 rounded-tl pointer-events-none" />
            <div className="hidden sm:block absolute bottom-2 right-2 z-10 w-6 h-6 border-b-2 border-r-2 border-[var(--color-gold-brown)] opacity-60 rounded-br pointer-events-none" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.img
                key={current}
                src={storyImages[current].src}
                alt={storyImages[current].alt}
                variants={slideVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full object-contain select-none"
                draggable={false}
              />
            </AnimatePresence>

            {/* Arrow — Left */}
            <button
              onClick={() => { setPaused(true); prev(); setTimeout(() => setPaused(false), 3000); }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-ivory)]/70 hover:bg-[var(--color-champagne)] border border-[var(--color-champagne)] transition-all duration-200 text-[var(--color-gold-brown)] text-xl shadow"
            >
              ‹
            </button>

            {/* Arrow — Right */}
            <button
              onClick={() => { setPaused(true); next(); setTimeout(() => setPaused(false), 3000); }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-ivory)]/70 hover:bg-[var(--color-champagne)] border border-[var(--color-champagne)] transition-all duration-200 text-[var(--color-gold-brown)] text-xl shadow"
            >
              ›
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4 px-4 sm:px-0">
            {storyImages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPaused(true);
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                  setTimeout(() => setPaused(false), 3000);
                }}
                aria-label={`Go to photo ${i + 1}`}
                className="transition-all duration-300"
                style={{
                  width: i === current ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor:
                    i === current
                      ? "var(--color-gold-brown)"
                      : "var(--color-champagne)",
                }}
              />
            ))}
          </div>

          <p className="text-center mt-2 text-sm font-serif text-[var(--color-soft-taupe)] tracking-widest">
            {current + 1} / {storyImages.length}
          </p>
        </motion.div>
      </FadeInSection>
    </div>
  );
}
