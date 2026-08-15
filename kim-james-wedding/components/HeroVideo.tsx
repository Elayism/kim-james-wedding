"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface HeroVideoProps {
  onVideoReady: () => void;
  onVideoError: (error: Error) => void;
  onShowFallback: () => void;
  onHideFallback: () => void;
}

export default function HeroVideo({ onVideoReady, onVideoError, onShowFallback, onHideFallback }: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      onShowFallback();
    }, 400);
  }, [clearTimers, onShowFallback]);

  const handleCanPlay = useCallback(() => {
    clearTimers();
    onHideFallback();
    onVideoReady();
  }, [clearTimers, onHideFallback, onVideoReady]);

  const handleLoadedData = useCallback(() => {
    clearTimers();
    onHideFallback();
    onVideoReady();
  }, [clearTimers, onHideFallback, onVideoReady]);

  const handleError = useCallback(() => {
    clearTimers();
    const error = new Error("Video failed to load");
    onVideoError(error);

    // Exponential backoff retry: 1s, 2s, 4s, 8s, max 16s
    const delay = Math.min(1000 * Math.pow(2, retryCount), 16000);
    setRetryCount((prev) => prev + 1);

    retryTimerRef.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        startFallbackTimer();
      }
    }, delay);
  }, [clearTimers, onVideoError, retryCount, startFallbackTimer]);

  const handleTap = useCallback(() => {
    if (isPlaying || !videoRef.current) return;

    videoRef.current.muted = false;
    videoRef.current.volume = 1.0;
    videoRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.error("Video play failed:", err);
    });
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start the 400ms fallback timer immediately
    startFallbackTimer();

    return () => {
      clearTimers();
    };
  }, [startFallbackTimer, clearTimers]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src="/videos/envelope-open.mp4"
        playsInline
        preload="auto"
        muted
        poster="/images/hero-bg.jpg"
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onClick={handleTap}
        onTouchEnd={handleTap}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        style={{ opacity: 1 }}
      />

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full border-2 border-white/60 flex items-center justify-center"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
              className="ml-1"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        </div>
      )}
    </div>
  );
}
