"use client";

import { useState, useRef, useEffect } from "react";
import HeroVideo from "@/components/HeroVideo";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import OurStory from "@/components/OurStory";
import EventDetails from "@/components/EventDetails";
import DressCode from "@/components/DressCode";
import RSVPForm from "@/components/RSVPForm";
import GiftRegistry from "@/components/GiftRegistry";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import FloatingPetals from "@/components/FloatingPetals";

const COLOR_A = "var(--color-section-a)";
const COLOR_B = "var(--color-section-b)";

export default function Home() {
  // Landing flow states: thumbnail -> video -> hero
  const [thumbnailVisible, setThumbnailVisible] = useState(true);
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Single global audio instance for the whole site
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleThumbnailTap = () => {
    // Fade out thumbnail immediately
    setThumbnailVisible(false);
    // Show video and play it
    setVideoVisible(true);
    // Start background music
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
  };

  const handleVideoEnd = () => {
    // Fade out video and show hero section
    setVideoFinished(true);
    setVideoVisible(false);
    // Re-enable scrolling after transition
    setTimeout(() => {
      document.body.style.overflow = "";
    }, 1000);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.muted = false;
      setIsMuted(false);
      audioRef.current.volume = 1.0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("Audio play failed:", err);
        });
      }
    } else {
      audioRef.current.pause();
    }
  };

  // Lock scroll while thumbnail/video is the landing view
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/cant-help-falling.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      audioRef.current.preload = "auto";
    }
  }, []);

  const showLandingUI = thumbnailVisible || videoVisible;

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

      {/* Navigation - hide during landing flow */}
      {!showLandingUI && (
        <NavBar
          isPlaying={!audioRef.current?.paused}
          onToggleAudio={toggleMusic}
          showAudioToggle
        />
      )}
      {!showLandingUI && <FloatingPetals />}

      {/* Main Scroll Container */}
      <div className="snap-container">
        {/* Thumbnail Section - full-screen static image, scroll locked */}
        <section
          id="hero"
          className="fixed inset-0 h-screen md:h-screen"
          style={{
            backgroundColor: "#111",
            zIndex: 50,
            opacity: thumbnailVisible ? 1 : 0,
            pointerEvents: thumbnailVisible ? "auto" : "none",
            transition: "opacity 200ms ease-out",
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: 'url("/videos/thumbnail.jpg")' }}
            onClick={handleThumbnailTap}
            onTouchEnd={handleThumbnailTap}
          >
            {/* Bouncing "Tap to open" text */}
            <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center pointer-events-none">
              <div
                className="animate-bounce px-6 py-3 rounded-full border border-white/30 text-white text-base md:text-lg font-sans tracking-[0.25em] uppercase shadow-2xl"
                style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
              >
                Tap to open
              </div>
            </div>
          </div>
        </section>

        {/* Video Section - always mounted, visibility controlled via opacity */}
        <section
          className="fixed inset-0 h-screen md:h-screen"
          style={{
            backgroundColor: "#111",
            zIndex: 40,
            opacity: videoVisible ? 1 : 0,
            pointerEvents: videoVisible ? "auto" : "none",
            transition: "opacity 500ms ease-out",
          }}
        >
            <HeroVideo
              audioRef={audioRef}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onVideoEnd={handleVideoEnd}
              shouldPlay={videoVisible}
            />
        </section>

        {/* Hero Section - fades in after video ends with subtle zoom-out */}
        <section
          className={`snap-section relative h-screen md:h-screen transition-all duration-1000 ${
            videoFinished ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          style={{ backgroundColor: COLOR_B }}
        >
          <Hero />
        </section>

        {/* Our Story Section */}
        <section
          id="our-story"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: COLOR_A }}
        >
          <OurStory />
        </section>

        {/* Event Details Section */}
        <section
          id="event-details"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: COLOR_B }}
        >
          <EventDetails />
        </section>

        {/* Dress Code Section */}
        <section
          id="dress-code"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: COLOR_A }}
        >
          <DressCode />
        </section>

        {/* RSVP Section */}
        <section
          id="rsvp"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: COLOR_B }}
        >
          <RSVPForm />
        </section>

        {/* Gift Registry Section */}
        <section
          id="gift-registry"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: COLOR_A }}
        >
          <GiftRegistry />
        </section>

        {/* Gallery Section */}
        <section
          id="gallery"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: COLOR_B }}
        >
          <Gallery />
        </section>

        {/* Footer Section */}
        <section
          id="footer"
          className="snap-section flex min-h-screen flex-col items-center justify-center py-6 md:py-0"
          style={{ backgroundColor: COLOR_A }}
        >
          <Footer />
        </section>
      </div>
    </>
  );
}
