"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface HeroVideoProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isMuted: boolean;
  onToggleMute: () => void;
  onVideoEnd: () => void;
}

export default function HeroVideo({ audioRef, isMuted, onToggleMute, onVideoEnd }: HeroVideoProps) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(true);

  const handleCanPlay = useCallback(() => {
    if (isMountedRef.current) {
      // Video ready, no special action needed
    }
  }, []);

  const handleLoadedData = useCallback(() => {
    if (isMountedRef.current) {
      // Video loaded, no special action needed
    }
  }, []);

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

      // Start background music using the shared audio instance
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.muted = false;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("Music play failed:", err);
          });
        }
      }
    }
  }, [hasInteracted, audioRef]);

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
        src="/videos/envelope-open.mp4"
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

      {/* Mute/Unmute button - shown after interaction */}
      {hasInteracted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="absolute top-4 right-4 z-30 w-12 h-12 rounded-full border border-white/30 bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-lg hover:bg-black/60 transition"
          aria-label={isMuted ? "Unmute music" : "Mute music"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354L2.17 15.78A1.74 1.74 0 003.09 17.25h3.24c.88 0 1.704-.507 1.938-1.354l1.17-4.32z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354L2.17 15.78A1.74 1.74 0 003.09 17.25h3.24c.88 0 1.704-.507 1.938-1.354l1.17-4.32z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
