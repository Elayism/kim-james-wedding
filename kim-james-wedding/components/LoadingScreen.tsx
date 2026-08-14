"use client";

import { useEffect, useState } from "react";

const MIN_DISPLAY_MS = 1500;
const CRITICAL_IMAGES = ["/images/hero-bg.jpg"];

export default function LoadingScreen({ onLoaded }: { onLoaded: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    let isMounted = true;

    const updateProgress = (value: number) => {
      if (isMounted) setProgress(Math.min(value, 100));
    };

    const preloadAssets = async () => {
      try {
        updateProgress(10);

        const fontReady = document.fonts.ready;
        await fontReady;
        updateProgress(30);

        const imagePromises = CRITICAL_IMAGES.map((src) => {
          return new Promise<void>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          });
        });

        await Promise.all(imagePromises);
        updateProgress(60);

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

          setTimeout(() => {
            video.removeEventListener("canplay", onCanPlay);
            video.removeEventListener("error", onError);
            resolve();
          }, 4000);
        });

        updateProgress(90);

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

        setTimeout(() => {
          updateProgress(100);
          setTimeout(() => {
            if (isMounted) {
              setIsVisible(false);
              setTimeout(() => onLoaded(), 700);
            }
          }, 300);
        }, remaining);
      } catch {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
        setTimeout(() => {
          updateProgress(100);
          setTimeout(() => {
            if (isMounted) {
              setIsVisible(false);
              setTimeout(() => onLoaded(), 700);
            }
          }, 300);
        }, remaining);
      }
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
          "radial-gradient(circle at 50% 50%, rgba(232,220,196,0.15) 0%, transparent 60%)",
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center text-center px-6">
        <div className="relative mb-6">
          <svg
            className="w-20 h-20 md:w-24 md:h-24 animate-spin-slow"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="var(--color-champagne)"
              strokeWidth="1.5"
              strokeDasharray="8 6"
              opacity="0.6"
            />
            <path
              d="M60 20C50 35 35 45 35 60C35 75 47 88 60 88C73 88 85 75 85 60C85 45 70 35 60 20Z"
              fill="var(--color-ivory)"
              stroke="var(--color-gold-brown)"
              strokeWidth="2"
            />
            <path
              d="M60 32C55 42 48 48 48 58C48 66 54 74 60 74C66 74 72 66 72 58C72 48 65 42 60 32Z"
              fill="var(--color-champagne)"
              opacity="0.7"
            />
            <circle cx="60" cy="56" r="3" fill="var(--color-gold-brown)" />
            <path
              d="M56 50C58 48 62 48 64 50"
              stroke="var(--color-gold-brown)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-serif tracking-wide mb-2" style={{ color: "var(--color-gold-brown)" }}>
          Kim &amp; James
        </h1>

        <p className="text-xs md:text-sm uppercase tracking-[0.3em] mb-8 font-sans" style={{ color: "var(--color-soft-taupe)" }}>
          Delivering our love story...
        </p>

        <div className="w-48 h-px bg-gradient-to-r from-transparent via-[var(--color-champagne)] to-transparent opacity-60 mb-4" />

        <p className="text-[10px] md:text-xs italic font-serif max-w-xs" style={{ color: "var(--color-soft-taupe)" }}>
          Please wait while we prepare your invitation
        </p>
      </div>
    </div>
  );
}
