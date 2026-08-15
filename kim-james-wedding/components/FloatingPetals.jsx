"use client";

import { useEffect, useState } from "react";

export default function FloatingPetals() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const generatedPetals = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${(i * 6.5) + 2}%`,
      duration: `${8 + (i % 5) * 2}s`,
      delay: `${(i % 5) * 1.5}s`,
      size: `${8 + (i % 3) * 4}px`,
    }));
    setPetals(generatedPetals);
  }, []);

  const removePetal = (id) => {
    setPetals((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="animate-petal absolute rounded-full opacity-40"
          style={{
            left: petal.left,
            width: petal.size,
            height: `calc(${petal.size} * 1.5)`,
            backgroundColor: petal.id % 2 === 0 ? "var(--color-warm-sand)" : "var(--color-champagne)",
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            transform: "rotate(45deg)",
          }}
          onAnimationEnd={() => removePetal(petal.id)}
        />
      ))}
    </div>
  );
}
