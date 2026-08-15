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
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Single global audio instance for the whole site
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleThumbnailTap = () => {
    // Fade out thumbnail and start video
    setShowThumbnail(false);
    setShowVideo(true);
  };

  const handleVideoEnd = () => {
    // Fade out video and show hero section
    setVideoFinished(true);
    setShowVideo(false);
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
      <NavBar isPlaying={!audioRef.current?.paused} onToggleAudio={toggleMusic} />
      <FloatingPetals />

      {/* Main Scroll Container */}
      <div className="snap-container">
        {/* Thumbnail Section - full-screen static image, scroll locked */}
        {showThumbnail && (
          <section
            id="hero"
            className="snap-section relative h-screen md:h-screen"
            style={{ backgroundColor: COLOR_A }}
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
        )}

        {/* Video Section - plays after thumbnail tap */}
        {showVideo && !videoFinished && (
          <section
            className={`snap-section relative h-screen md:h-screen transition-all duration-1000 ${
              videoFinished ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            style={{ backgroundColor: COLOR_A }}
          >
            <HeroVideo
              audioRef={audioRef}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onVideoEnd={handleVideoEnd}
            />
          </section>
        )}

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
