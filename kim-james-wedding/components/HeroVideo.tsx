"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface HeroVideoProps {
  onVideoReady: () => void;
  onVideoEnd: () => void;
}

export default function HeroVideo({ onVideoReady, onVideoEnd }: HeroVideoProps) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(true);

  const handleCanPlay = useCallback(() => {
    if (isMountedRef.current) {
      onVideoReady();
    }
  }, [onVideoReady]);

  const handleLoadedData = useCallback(() => {
    if (isMountedRef.current) {
      onVideoReady();
    }
  }, [onVideoReady]);

  const handleTap = useCallback(() => {
    if (!videoRef.current) return;

    if (!hasInteracted) {
      setHasInteracted(true);
      // Keep video muted, just play it
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Video play failed:", err);
      });

      // Play background music - using existing audio file
      // Note: Add /wedding-music.mp3 to public folder if a different track is desired
      const music = new Audio("/audio/cant-help-falling.mp3");
      music.loop = true;
      music.volume = 0.5;
      music.play().catch((err) => {
        console.error("Music play failed:", err);
      });
    }
  }, [hasInteracted]);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    onVideoEnd();
  }, [onVideoEnd]);

  useEffect(() => {
    isMountedRef.current = true;
    const video = videoRef.current;
    if (!video) return;

    // Lock body scroll while video is the initial full-screen view
    document.body.style.overflow = "hidden";

    return () => {
      isMountedRef.current = false;
      // Restore scroll when component unmounts
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="hero-video-container relative w-full h-full"
    >
      <video
        ref={videoRef}
        src="/envelope-open.mp4"
        poster="/envelope-poster.jpg"
        playsInline
        preload="auto"
        muted
        disablePictureInPicture
        controlsList="nodownload"
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onEnded={handleVideoEnded}
        onClick={handleTap}
        onTouchEnd={handleTap}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        style={{
          opacity: 1,
          display: "block",
          objectFit: "cover",
        }}
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
