"use client";

import { useState, useRef } from "react";

export default function EnvelopeIntro({ onOpenComplete, onPlayAudio }) {
  const [isEnding, setIsEnding] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef(null);

  const handleTap = () => {
    if (hasInteracted) return;
    setHasInteracted(true);

    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      videoRef.current.play().then(() => {
        if (onPlayAudio) {
          onPlayAudio();
        }
      }).catch((err) => {
        console.error("Video play failed", err);
        setTimeout(() => {
          if (onOpenComplete) onOpenComplete();
        }, 800);
      });
    }
  };

  const handleVideoEnded = () => {
    setIsEnding(true);
    setTimeout(() => {
      if (onOpenComplete) onOpenComplete();
    }, 1000);
  };

  const handleVideoError = () => {
    setIsEnding(true);
    setTimeout(() => {
      if (onOpenComplete) onOpenComplete();
    }, 800);
  };

  return (
    <div
      className={`relative w-full h-full bg-black transition-opacity duration-1000 ${
        isEnding ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        src="/videos/envelope-open.mp4"
        playsInline
        preload="auto"
        poster="/images/hero-bg.jpg"
        onEnded={handleVideoEnded}
        onError={handleVideoError}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Tappable overlay for the entire viewport */}
      <button
        className={`absolute inset-0 z-10 cursor-pointer bg-transparent border-none p-0 ${hasInteracted ? 'pointer-events-none' : ''}`}
        onClick={handleTap}
        onTouchEnd={handleTap}
        aria-label="Tap to open invitation"
      />
      
      {/* Tap hint - bigger, centered on video */}
      {!hasInteracted && (
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <div className="animate-bounce px-6 py-3 rounded-full bg-black/50 backdrop-blur-md text-white text-base md:text-lg font-sans tracking-[0.25em] uppercase border border-white/20 shadow-2xl">
            Tap to open
          </div>
        </div>
      )}
    </div>
  );
}
