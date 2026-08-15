"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface HeroVideoProps {
  onVideoReady: () => void;
  onVideoError: (error: Error) => void;
  onShowFallback: () => void;
  onHideFallback: () => void;
  onVideoEnd: () => void;
}

const MAX_RETRIES = 3;

export default function HeroVideo({
  onVideoReady,
  onVideoError,
  onShowFallback,
  onHideFallback,
  onVideoEnd,
}: HeroVideoProps) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const startFallbackTimer = useCallback(() => {
    clearTimers();
    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onShowFallback();
      }
    }, 500);
  }, [clearTimers, onShowFallback]);

  const handleCanPlay = useCallback(() => {
    clearTimers();
    if (isMountedRef.current) {
      onHideFallback();
      onVideoReady();
    }
  }, [clearTimers, onHideFallback, onVideoReady]);

  const handleLoadedData = useCallback(() => {
    clearTimers();
    if (isMountedRef.current) {
      onHideFallback();
      onVideoReady();
    }
  }, [clearTimers, onHideFallback, onVideoReady]);

  const handleError = useCallback(() => {
    clearTimers();
    const error = new Error("Video failed to load");
    if (isMountedRef.current) {
      onVideoError(error);
    }

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
      setRetryCount((prev) => prev + 1);

      retryTimerRef.current = setTimeout(() => {
        if (videoRef.current && isMountedRef.current) {
          videoRef.current.load();
          startFallbackTimer();
        }
      }, delay);
    }
  }, [clearTimers, onVideoError, retryCount, startFallbackTimer]);

  const handleTap = useCallback(() => {
    if (!videoRef.current) return;

    if (!hasInteracted) {
      setHasInteracted(true);
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Video play failed:", err);
      });
    } else if (isPlaying) {
      onVideoEnd();
    }
  }, [hasInteracted, isPlaying, onVideoEnd]);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    onVideoEnd();
  }, [onVideoEnd]);

  useEffect(() => {
    isMountedRef.current = true;
    const video = videoRef.current;
    if (!video) return;

    startFallbackTimer();

    return () => {
      isMountedRef.current = false;
      clearTimers();
    };
  }, [startFallbackTimer, clearTimers]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src="/envelope-open.mp4"
        playsInline
        preload="auto"
        muted
        disablePictureInPicture
        controlsList="nodownload"
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onEnded={handleVideoEnded}
        onClick={handleTap}
        onTouchEnd={handleTap}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        style={{ opacity: 1 }}
      />

      {/* Bouncing "Tap to open" text - shown only before first interaction */}
      {!hasInteracted && (
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <div
            className="animate-bounce px-6 py-3 rounded-full border border-white/30 text-white text-base md:text-lg font-sans tracking-[0.25em] uppercase shadow-2xl"
            style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
          >
            Tap to open
          </div>
        </div>
      )}
    </div>
  );
}
