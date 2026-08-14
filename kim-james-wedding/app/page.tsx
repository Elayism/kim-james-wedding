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

      {/* Phase 1: Envelope Video (always first, hidden after video ends) */}
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
          
          {/* Hero - always full viewport height */}
          <section id="hero" className="relative w-full h-screen min-h-screen">
            <Hero />
          </section>

          {/* Content sections - readable scrollable layout */}
          <div className="bg-[var(--color-ivory)]">
            <section id="our-story" className="py-16 md:py-24">
              <OurStory />
            </section>

            <section id="event-details" className="py-16 md:py-24">
              <EventDetails />
            </section>

            <section id="dress-code" className="py-16 md:py-24">
              <DressCode />
            </section>

            <section id="rsvp" className="py-16 md:py-24">
              <FadeInSection>
                <RSVPForm />
              </FadeInSection>
            </section>

            <section id="gift-registry" className="py-16 md:py-24">
              <GiftRegistry />
            </section>

            <section id="gallery" className="py-16 md:py-24">
              <Gallery />
            </section>

            <section id="footer" className="py-16 md:py-24">
              <Footer />
            </section>
          </div>
        </div>
      )}
    </>
  );
}
