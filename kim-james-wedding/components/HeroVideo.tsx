"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface HeroVideoProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isMuted: boolean;
  onToggleMute: () => void;
  onVideoEnd: () => void;
  shouldPlay?: boolean;
}

export default function HeroVideo({ audioRef, isMuted, onToggleMute, onVideoEnd, shouldPlay = false }: HeroVideoProps) {
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

  useEffect(() => {
    if (shouldPlay && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error("Video play failed:", err);
      });
    }
  }, [shouldPlay]);

  return (
    <div
      className="hero-video-container relative w-full h-full"
    >
      <video
        ref={videoRef}
        src="/videos/envelope-open.mp4"
        poster="/videos/thumbnail.jpg"
        playsInline
        preload="auto"
        muted
        disablePictureInPicture
        controlsList="nodownload"
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: 1,
          display: "block",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
