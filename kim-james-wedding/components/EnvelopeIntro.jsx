"use client";

import { useState, useRef } from "react";

export default function EnvelopeIntro({ onOpenComplete, onPlayAudio }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const videoRef = useRef(null);

  const handleTap = () => {
    if (isPlaying) return;
    
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        if (onPlayAudio) onPlayAudio();
      }).catch((err) => {
        console.error("Video play failed", err);
      });
    }
  };

  const handleVideoEnded = () => {
    // Start the fade to white transition
    setIsEnding(true);
    
    // Wait for the transition to finish (1s) before calling onComplete
    setTimeout(() => {
      if (onOpenComplete) onOpenComplete();
    }, 1000);
  };

  return (
    <div
      className={`relative w-full h-full bg-white transition-opacity duration-1000 ${
        isEnding ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        src="/videos/envelope-open.mp4"
        muted
        playsInline
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Tappable overlay for the entire viewport */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={handleTap}
        aria-label="Tap to open invitation"
      />
    </div>
  );
}
