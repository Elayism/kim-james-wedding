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

      {/* Envelope Section (always rendered so it can be blurred during loading) */}
      {!showSite && (
        <section id="envelope" className="w-full">
          <EnvelopeIntro 
            onOpenComplete={handleOpenComplete} 
            onPlayAudio={handlePlayAudio} 
          />
        </section>
      )}

      {/* Main Wedding Site Content */}
      {showSite && (
        <>
          <NavBar isPlaying={isPlaying} onToggleAudio={toggleMusic} />
          <FloatingPetals />
          
          <div
            className="animate-fade-in transition-opacity duration-1000 opacity-0"
            style={{ animation: "fadeIn 1s ease-in forwards" }}
          >
            {/* Hero Section */}
            <section id="hero" className="w-full">
              <Hero />
            </section>

            {/* Our Story Section */}
            <section id="our-story" className="py-24 md:py-32">
              <OurStory />
            </section>

            {/* Event Details Section */}
            <section id="event-details" className="py-24 md:py-32">
              <EventDetails />
            </section>

            {/* Dress Code Section */}
            <section id="dress-code" className="py-24 md:py-32">
              <DressCode />
            </section>

            {/* RSVP Section */}
            <section id="rsvp" className="py-24 md:py-32" style={{ backgroundColor: "var(--color-ivory)" }}>
              <FadeInSection>
                <RSVPForm />
              </FadeInSection>
            </section>

            {/* Gift Registry Section */}
            <section id="gift-registry" className="py-24 md:py-32">
              <GiftRegistry />
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="py-24 md:py-32">
              <Gallery />
            </section>

            {/* Footer Section */}
            <section id="footer" className="py-24 md:py-32">
              <Footer />
            </section>
          </div>
        </>
      )}
    </>
  );
}
