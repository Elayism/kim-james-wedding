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
  const [videoReady, setVideoReady] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  const handleVideoEnd = () => {
    // Smooth transition: fade out video section and fade in hero
    setVideoFinished(true);
    // Re-enable page scrolling after video finishes
    document.body.style.overflow = "";
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.muted = false;
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

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handlePlay = () => {};
    const handlePause = () => {};

    audioEl.addEventListener("play", handlePlay);
    audioEl.addEventListener("pause", handlePause);

    return () => {
      audioEl.removeEventListener("play", handlePlay);
      audioEl.removeEventListener("pause", handlePause);
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
      <NavBar isPlaying={!audioRef.current?.paused} onToggleAudio={toggleMusic} />
      <FloatingPetals />

      {/* Main Scroll Container */}
      <div className="snap-container">
        {/* Video Section - full viewport, scroll locked until video ends */}
        <section
          id="hero"
          className={`snap-section relative h-screen md:h-screen transition-all duration-1000 ${
            videoFinished ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{ backgroundColor: COLOR_A }}
        >
          <div className="absolute inset-0">
            <HeroVideo
              onVideoReady={handleVideoReady}
              onVideoEnd={handleVideoEnd}
            />
          </div>
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
