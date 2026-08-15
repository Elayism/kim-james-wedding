"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface HeroVideoProps {
  onVideoReady: () => void;
  onVideoError: (error: Error) => void;
  onShowFallback: () => void;
  onHideFallback: () => void;
}

const MAX_RETRIES = 3;

export default function HeroVideo({ onVideoReady, onVideoError, onShowFallback, onHideFallback }: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
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

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      videoRef.current.play().then(() => {
        setHasInteracted(true);
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Video play failed:", err);
      });
    }
  }, [isPlaying]);

  useEffect(() => {
    isMountedRef.current = true;
    const video = videoRef.current;
    if (!video) return;

    // Start the 500ms fallback timer immediately
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
        src="/videos/envelope-open.mp4"
        playsInline
        preload="auto"
        muted
        disablePictureInPicture
        controlsList="nodownload"
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onClick={handleTap}
        onTouchEnd={handleTap}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        style={{ opacity: 1 }}
      />
    </div>
  );
}
