"use client";

import { useState, useRef, useEffect } from "react";
import HeroVideo from "@/components/HeroVideo";
import HeartLoader from "@/components/HeartLoader";
import NavBar from "@/components/NavBar";
import OurStory from "@/components/OurStory";
import EventDetails from "@/components/EventDetails";
import DressCode from "@/components/DressCode";
import RSVPForm from "@/components/RSVPForm";
import GiftRegistry from "@/components/GiftRegistry";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import FloatingPetals from "@/components/FloatingPetals";

export default function Home() {
  const [videoReady, setVideoReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVideoReady = () => {
    setVideoReady(true);
    setShowFallback(false);
  };

  const handleVideoError = (error: Error) => {
    console.error("Hero video error:", error);
    setRetryCount((prev) => prev + 1);
    setShowFallback(true);
  };

  const handleShowFallback = () => {
    setShowFallback(true);
  };

  const handleHideFallback = () => {
    setShowFallback(false);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.muted = false;
      audioRef.current.volume = 1.0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Audio play failed:", err);
          });
      }
    }
  };

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audioEl.addEventListener("pause", handlePause);
    audioEl.addEventListener("play", handlePlay);

    return () => {
      audioEl.removeEventListener("pause", handlePause);
      audioEl.removeEventListener("play", handlePlay);
    };
  }, []);

  return (
    <>
      {/* Global Audio Element */}
      <audio
        ref={audioRef}
        src="/audio/cant-help-falling.mp3"
        loop
        preload="auto"
        playsInline
      />

      {/* Navigation */}
      <NavBar isPlaying={isPlaying} onToggleAudio={toggleMusic} />
      <FloatingPetals />

      {/* Main Scroll Container */}
      <div className="snap-container">
        {/* Hero Section with Video */}
        <section
          id="hero"
          className="snap-section relative h-screen md:h-screen"
          style={{ backgroundColor: "var(--color-antique-white)" }}
        >
          <div className="absolute inset-0">
            <HeroVideo
              onVideoReady={handleVideoReady}
              onVideoError={handleVideoError}
              onShowFallback={handleShowFallback}
              onHideFallback={handleHideFallback}
            />
          </div>

          {/* Heart Loader Fallback - positioned within hero, covers hero only */}
          {showFallback && (
            <HeartLoader isVisible={showFallback} retryCount={retryCount} />
          )}
        </section>

        {/* Our Story Section */}
        <section
          id="our-story"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: "var(--color-antique-white)" }}
        >
          <OurStory />
        </section>

        {/* Event Details Section */}
        <section
          id="event-details"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: "var(--color-ivory)" }}
        >
          <EventDetails />
        </section>

        {/* Dress Code Section */}
        <section
          id="dress-code"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: "var(--color-ecru)" }}
        >
          <DressCode />
        </section>

        {/* RSVP Section */}
        <section
          id="rsvp"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: "var(--color-antique-white)" }}
        >
          <RSVPForm />
        </section>

        {/* Gift Registry Section */}
        <section
          id="gift-registry"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: "var(--color-ivory)" }}
        >
          <GiftRegistry />
        </section>

        {/* Gallery Section */}
        <section
          id="gallery"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: "var(--color-ecru)" }}
        >
          <Gallery />
        </section>

        {/* Footer Section */}
        <section
          id="footer"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: "var(--color-antique-white)" }}
        >
          <Footer />
        </section>
      </div>
    </>
  );
}
