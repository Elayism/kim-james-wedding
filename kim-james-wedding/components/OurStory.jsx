"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";
import { SectionDivider } from "./Flourishes";
import Lightbox from "./Lightbox";

const storyImages = [
  { src: "/images/story-1.jpg", alt: "Our Story" },
  { src: "/images/story-2.jpg", alt: "Our Story" },
];

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function OurStory() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % storyImages.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + storyImages.length) % storyImages.length);
  }, []);

  // Auto-advance every 3s
  useEffect(() => {
    if (paused || lightboxOpen) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [paused, lightboxOpen, next]);

  const openLightbox = () => setLightboxOpen(true);

  return (
    <div
      className="w-full flex flex-col items-center justify-center"
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
          className="text-base md:text-lg text-[var(--color-espresso)] leading-relaxed max-w-2xl mx-auto mb-8 font-serif text-center px-6"
        >
          Every love story is beautiful, but ours is our favorite. We met, we fell in love, and now we are committing to a lifetime of adventures together. Thank you for being a part of our journey.
        </motion.p>

        {/* Carousel */}
        <motion.div
          variants={childVariants}
          className="relative w-full sm:max-w-2xl mx-auto sm:px-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Image frame */}
          <div
            className="relative overflow-hidden sm:rounded-xl border-0 sm:border-2 sm:border-[var(--color-champagne)] sm:shadow-xl bg-white cursor-pointer"
            style={{ aspectRatio: "4/3" }}
            onClick={openLightbox}
          >
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

            {/* Subtle zoom icon hint */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[var(--color-gold-brown)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Arrow — Left */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white/80 hover:bg-white border border-[var(--color-champagne)] text-[var(--color-gold-brown)] shadow-lg transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Arrow — Right */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white/80 hover:bg-white border border-[var(--color-champagne)] text-[var(--color-gold-brown)] shadow-lg transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {storyImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setDirection(i > current ? 1 : -1); setCurrent(i); }}
                aria-label={`Go to photo ${i + 1}`}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? "24px" : "8px",
                  height: "8px",
                  backgroundColor: i === current ? "var(--color-gold-brown)" : "var(--color-champagne)",
                }}
              />
            ))}
          </div>

          <p className="text-center mt-2 text-sm font-serif text-[var(--color-soft-taupe)] tracking-widest">
            {current + 1} / {storyImages.length}
          </p>
        </motion.div>
      </FadeInSection>

      {/* Lightbox */}
      <Lightbox
        images={storyImages}
        currentIndex={current}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={next}
        onPrev={prev}
      />
    </div>
  );
}
