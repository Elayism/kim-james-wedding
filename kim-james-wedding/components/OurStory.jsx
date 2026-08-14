"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";
import { SectionDivider } from "./Flourishes";
import Lightbox from "./Lightbox";

const storyImages = [
  { src: "/images/story-1.jpg", alt: "Our Story" },
  { src: "/images/story-2.jpg", alt: "Our Story" },
  // Add more story images here — they'll slot in automatically
];

export default function OurStory() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % storyImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + storyImages.length) % storyImages.length);
  };

  return (
    <div
      className="w-full flex flex-col items-center justify-center py-10"
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
          className="text-base md:text-lg text-[var(--color-espresso)] leading-relaxed max-w-2xl mx-auto mb-8 font-serif text-center px-6"
        >
          {/* GENERIC PLACEHOLDER STORY */}
          Every love story is beautiful, but ours is our favorite. We met, we fell in love, and now we are committing to a lifetime of adventures together. Thank you for being a part of our journey.
        </motion.p>

        {/* Photo Grid - click to zoom */}
        <motion.div variants={childVariants} className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto px-4">
          {storyImages.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative overflow-hidden rounded-lg sm:rounded-xl border-0 sm:border-2 sm:border-[var(--color-champagne)] shadow-md hover:shadow-xl transition-all duration-300 bg-[var(--color-ivory)]"
              style={{ aspectRatio: "4/3" }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--color-gold-brown)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </motion.div>
      </FadeInSection>

      {/* Lightbox */}
      <Lightbox
        images={storyImages}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </div>
  );
}
