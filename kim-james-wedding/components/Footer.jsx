"use client";

import { motion } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";
import { SectionDivider } from "./Flourishes";

export default function Footer() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--color-ivory)" }}
    >
      <FadeInSection>
        <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-serif text-[var(--color-gold-brown)] font-letterpress mb-1">
          We can&apos;t wait to celebrate with you!
        </motion.h2>

        <motion.div variants={childVariants}>
          <SectionDivider />
        </motion.div>

        <motion.div variants={childVariants} className="text-xl md:text-2xl font-serif tracking-wide text-[var(--color-espresso)] font-letterpress mb-6">
          #KimJamesBiscarra
        </motion.div>

        <motion.div variants={childVariants} className="text-xs text-[var(--color-soft-taupe)] max-w-md mx-auto italic font-serif">
          
        </motion.div>
      </FadeInSection>
    </div>
  );
}
