"use client";

// Regency Engraving Style Corner Flourish
export function CornerFlourish({ position = "top-left" }: { position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const getRotation = () => {
    switch (position) {
      case "top-right": return "rotate-90 top-2 right-2";
      case "bottom-right": return "rotate-180 bottom-2 right-2";
      case "bottom-left": return "-rotate-90 bottom-2 left-2";
      default: return "rotate-0 top-2 left-2";
    }
  };

  return (
    <svg
      className={`absolute w-6 h-6 text-[var(--color-gold-brown)] opacity-40 pointer-events-none ${getRotation()}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M2 2h8M2 2v8M2 2c3 0 6 3 6 6" />
      <circle cx="4" cy="4" r="0.75" fill="currentColor" />
    </svg>
  );
}

// Section Divider with Centered Floral/Feather Ornament
export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 my-4 w-full max-w-xs mx-auto ${className}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-soft-taupe)] to-transparent opacity-60" />
      {/* Centered Regency Feather/Floral Accent Icon */}
      <svg
        className="w-5 h-5 text-[var(--color-gold-brown)] opacity-75 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C10.5 4.5 7 7 7 11c0 2.5 1.5 4.5 3.5 5.5V20a1.5 1.5 0 0 0 3 0v-3.5c2-.5 3.5-3 3.5-5.5 0-4-3.5-6.5-5-9zM12 14c-1.5 0-3-1.5-3-3 0-2 2-4 3-5.5 1 1.5 3 3.5 3 5.5 0 1.5-1.5 3-3 3z" />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-soft-taupe)] to-transparent opacity-60" />
    </div>
  );
}
