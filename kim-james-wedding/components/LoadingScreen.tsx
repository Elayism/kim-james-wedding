"use client";

import { useEffect, useState } from "react";

const MIN_DISPLAY_MS = 1500;
const CRITICAL_IMAGES = ["/images/hero-bg.jpg"];

export default function LoadingScreen({ onLoaded }: { onLoaded: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    let isMounted = true;

    const preloadAssets = async () => {
      try {
        const fontReady = document.fonts.ready;
        await fontReady;

        const imagePromises = CRITICAL_IMAGES.map((src) => {
          return new Promise<void>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          });
        });

        await Promise.all(imagePromises);

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = "/videos/envelope-open.mp4";

        await new Promise<void>((resolve) => {
          const onCanPlay = () => {
            video.removeEventListener("canplay", onCanPlay);
            video.removeEventListener("error", onError);
            resolve();
          };
          const onError = () => {
            video.removeEventListener("canplay", onCanPlay);
            video.removeEventListener("error", onError);
            resolve();
          };
          video.addEventListener("canplay", onCanPlay);
          video.addEventListener("error", onError);
          setTimeout(() => resolve(), 4000);
        });
      } catch {
        // ignore preload errors
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (isMounted) onLoaded();
        }, 700);
      }, remaining);
    };

    preloadAssets();

    return () => {
      isMounted = false;
    };
  }, [onLoaded]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        backgroundColor: "var(--color-ivory)",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(232,220,196,0.2) 0%, transparent 60%)",
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center text-center px-6">
        <div className="relative mb-6">
          <svg
            className="w-24 h-24 md:w-28 md:h-28"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M60 90C60 90 18 62 18 38C18 24 26 16 40 16C47 16 53 20 60 28C67 20 73 16 80 16C94 16 102 24 102 38C102 62 60 90 60 90Z"
              fill="var(--color-gold-brown)"
              filter="url(#heartGlow)"
              className="animate-heartbeat"
              opacity="0.9"
            />
            <path
              d="M60 80C60 80 26 58 26 38C26 28 32 22 40 22C45 22 50 25 60 34C70 25 75 22 80 22C88 22 94 28 94 38C94 58 60 80 60 80Z"
              fill="var(--color-ivory)"
              opacity="0.5"
              className="animate-heartbeat"
            />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif tracking-wide mb-3" style={{ color: "var(--color-gold-brown)" }}>
          Kim &amp; James
        </h1>

        <p className="text-xs md:text-sm uppercase tracking-[0.35em] mb-6 font-sans font-semibold" style={{ color: "var(--color-soft-taupe)" }}>
          Delivering our love story...
        </p>

        <div className="w-40 h-px bg-gradient-to-r from-transparent via-[var(--color-champagne)] to-transparent opacity-70 mb-5" />

        <p className="text-[11px] md:text-xs italic font-serif max-w-[260px] leading-relaxed" style={{ color: "var(--color-soft-taupe)" }}>
          Please wait while we prepare your invitation
        </p>
      </div>
    </div>
  );
}
