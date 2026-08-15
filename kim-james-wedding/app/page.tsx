"use client";

import { useState, useRef, useEffect } from "react";
import FadeInSection from "@/components/FadeInSection";
import EnvelopeIntro from "@/components/EnvelopeIntro";
import Hero from "@/components/Hero";
import NavBar from "@/components/NavBar";
import OurStory from "@/components/OurStory";
import EventDetails from "@/components/EventDetails";
import DressCode from "@/components/DressCode";
import GiftRegistry from "@/components/GiftRegistry";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import RSVPForm from "@/components/RSVPForm";

import FloatingPetals from "@/components/FloatingPetals";

export default function Home() {
  const [showSite, setShowSite] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleOpenComplete = () => {
    setShowSite(true);
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
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
    
    audioEl.addEventListener('pause', handlePause);
    audioEl.addEventListener('play', handlePlay);
    
    return () => {
      audioEl.removeEventListener('pause', handlePause);
      audioEl.removeEventListener('play', handlePlay);
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

      {/* Phase 1: Envelope Video (full screen overlay, hidden after video ends) */}
      {!showSite && (
        <section id="envelope" className="fixed inset-0 z-40">
          <EnvelopeIntro 
            onOpenComplete={handleOpenComplete} 
            onPlayAudio={handlePlayAudio} 
          />
        </section>
      )}

      {/* Phase 2: Main Wedding Site (revealed after video) */}
      {showSite && (
        <div className="animate-fade-in">
          <NavBar isPlaying={isPlaying} onToggleAudio={toggleMusic} />
          <FloatingPetals />
          
          {/* All sections in snap scroll container */}
          <div className="snap-container">
            {/* Hero Section - full viewport height */}
            <section id="hero" className="snap-section h-screen">
              <Hero />
            </section>

            {/* Our Story Section */}
            <section id="our-story" className="snap-section min-h-screen py-16 md:py-24">
              <OurStory />
            </section>

            {/* Event Details Section */}
            <section id="event-details" className="snap-section min-h-screen py-16 md:py-24">
              <EventDetails />
            </section>

            {/* Dress Code Section */}
            <section id="dress-code" className="snap-section min-h-screen py-16 md:py-24">
              <DressCode />
            </section>

            {/* RSVP Section */}
            <section id="rsvp" className="snap-section min-h-screen py-16 md:py-24" style={{ backgroundColor: "var(--color-ivory)" }}>
              <FadeInSection>
                <RSVPForm />
              </FadeInSection>
            </section>

            {/* Gift Registry Section */}
            <section id="gift-registry" className="snap-section min-h-screen py-16 md:py-24">
              <GiftRegistry />
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="snap-section min-h-screen py-16 md:py-24">
              <Gallery />
            </section>

            {/* Footer Section */}
            <section id="footer" className="snap-section min-h-screen py-16 md:py-24">
              <Footer />
            </section>
          </div>
        </div>
      )}
    </>
  );
}
