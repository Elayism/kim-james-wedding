"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";
import { SectionDivider } from "./Flourishes";
import Lightbox from "./Lightbox";

const galleryImages = [
  { id: 1, src: "/images/gallery-1.jpg", alt: "Kimberlyn & James" },
  { id: 2, src: "/images/gallery-2.jpg", alt: "Kimberlyn & James" },
  { id: 3, src: "/images/gallery-3.jpg", alt: "Kimberlyn & James" },
  { id: 4, src: "/images/gallery-4.jpg", alt: "Kimberlyn & James" },
  { id: 5, src: "/images/gallery-5.jpg", alt: "Kimberlyn & James" },
];

export default function Gallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
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
          Gallery
        </motion.h2>

        <motion.div variants={childVariants}>
          <SectionDivider />
        </motion.div>

        {/* Photo Grid - click to zoom */}
        <motion.div variants={childVariants} className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto px-4">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
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
        images={galleryImages}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </div>
  );
}
