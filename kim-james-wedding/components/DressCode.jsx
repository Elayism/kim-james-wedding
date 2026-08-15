"use client";

import { motion } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";
import { CornerFlourish, SectionDivider } from "./Flourishes";

export default function DressCode() {
  const swatches = [
    { name: "Ivory", hex: "var(--color-ivory)", border: true },
    { name: "Antique White", hex: "var(--color-antique-white)", border: true },
    { name: "Ecru", hex: "var(--color-ecru)", border: false },
    { name: "Champagne", hex: "var(--color-champagne)", border: false },
    { name: "Warm Sand", hex: "var(--color-warm-sand)", border: false },
    { name: "Soft Taupe", hex: "var(--color-soft-taupe)", border: false },
  ];

  return (
    <div
      className="w-full flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--color-antique-white)" }}
    >
      <FadeInSection>
        <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-serif text-[var(--color-gold-brown)] font-letterpress mb-1">
          Dress Code
        </motion.h2>

        <motion.div variants={childVariants}>
          <SectionDivider />
        </motion.div>

        <motion.div variants={childVariants} className="max-w-2xl mx-auto space-y-6 text-center mb-8 font-serif">
          <div className="relative p-5 rounded-lg bg-[var(--color-ivory)] border border-[var(--color-champagne)] shadow-sm">
            <CornerFlourish position="top-left" />
            <CornerFlourish position="bottom-right" />
            <h3 className="text-xs uppercase tracking-widest text-[var(--color-gold-brown)] font-sans font-semibold mb-1">
              Entourage
            </h3>
            <p className="text-base text-[var(--color-espresso)]">
              <strong>Bridesmaids:</strong> White satin dress
            </p>
            <p className="text-base text-[var(--color-espresso)] mt-1">
              <strong>Groomsmen:</strong> Piña cocoon barong, dark brown pants
            </p>
          </div>

          <div className="relative p-5 rounded-lg bg-[var(--color-ivory)] border border-[var(--color-champagne)] shadow-sm">
            <CornerFlourish position="top-left" />
            <CornerFlourish position="bottom-right" />
            <h3 className="text-xs uppercase tracking-widest text-[var(--color-gold-brown)] font-sans font-semibold mb-1">
              Guests
            </h3>
            <p className="text-base text-[var(--color-espresso)]">
              Formal beige and cream attire. Strictly no other colors.
            </p>
          </div>
        </motion.div>

        {/* Color Swatches Palette Row with Hover-Lift Effect */}
        <motion.div variants={childVariants}>
          <div className="text-xs uppercase tracking-widest text-[var(--color-soft-taupe)] mb-3 font-sans font-semibold">
            Allowed Palette Tones
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 max-w-md mx-auto">
            {swatches.map((swatch) => (
              <div
                key={swatch.name}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                {/* Hover-lift effect: slight translateY up + soft box-shadow increase */}
                <div
                  className={`w-11 h-11 rounded-full transition-all duration-300 transform group-hover:-translate-y-1.5 group-hover:shadow-lg ${
                    swatch.border ? "border border-[var(--color-soft-taupe)]/40" : "shadow-sm"
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-soft-taupe)] font-sans transition-colors group-hover:text-[var(--color-gold-brown)]">
                  {swatch.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </FadeInSection>
    </div>
  );
}
