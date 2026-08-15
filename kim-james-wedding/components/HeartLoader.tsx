"use client";

import { motion, AnimatePresence } from "framer-motion";

interface HeartLoaderProps {
  isVisible: boolean;
  retryCount: number;
}

export default function HeartLoader({ isVisible, retryCount }: HeartLoaderProps) {
  const isError = retryCount >= 3;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
          style={{ backgroundColor: "var(--color-antique-white)" }}
        >
          <motion.div
            animate={{
              scale: [1, 1.15, 1, 1.1, 1],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-6"
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="var(--color-gold-brown)"
              className="drop-shadow-lg"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center px-6 max-w-sm"
          >
            <span className="block text-lg md:text-xl font-serif text-[var(--color-gold-brown)] mb-2">
              {isError ? "Having trouble loading…" : "Love is loading…"}
            </span>
            <span className="block text-sm md:text-base text-[var(--color-soft-taupe)] font-serif italic">
              {isError
                ? "Please check your connection and try again."
                : "Please hold our hearts while we prepare your invitation."}
            </span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
