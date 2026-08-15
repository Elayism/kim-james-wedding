"use client";

import { useState, useRef } from "react";

export default function EnvelopeIntro({ onOpenComplete, onPlayAudio }) {
  const [isEnding, setIsEnding] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
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
    setHasError(true);
    setIsEnding(true);
    setTimeout(() => {
      if (onOpenComplete) onOpenComplete();
    }, 800);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handlePlaying = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`relative w-full h-full bg-black transition-opacity duration-1000 ${
        isEnding ? "opacity-0" : "opacity-100"
      }`}
    >
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/80 text-xs font-sans tracking-widest uppercase">Loading</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          <div className="text-center px-6">
            <p className="text-white/90 text-sm font-sans mb-3">Unable to load video</p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="px-5 py-2 rounded-full border border-white/40 text-white text-xs font-sans uppercase tracking-wider hover:bg-white/10 transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src="/videos/envelope-open.mp4"
        playsInline
        preload="auto"
        poster="/images/hero-bg.jpg"
        onEnded={handleVideoEnded}
        onError={handleVideoError}
        onLoadedData={handleLoadedData}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
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
      {!hasInteracted && !isLoading && !hasError && (
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <div className="animate-bounce px-6 py-3 rounded-full bg-black/50 backdrop-blur-md text-white text-base md:text-lg font-sans tracking-[0.25em] uppercase border border-white/20 shadow-2xl">
            Tap to open
          </div>
        </div>
      )}
    </div>
  );
}
