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
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Audio play failed:", err);
      });
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Audio play failed:", err);
      });
    }
  };

  // Sync state with audio element just in case it pauses unexpectedly
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
        preload="none"
      />

      <div
        className="snap-y snap-proximity overflow-y-scroll w-full"
        style={{ height: "100vh" }}
      >
        {/* Envelope Section (Unmounts when complete) */}
        {!showSite && (
          <section
            id="envelope"
            className="snap-start w-full"
            style={{ height: "100vh" }}
          >
            <EnvelopeIntro 
              onOpenComplete={handleOpenComplete} 
              onPlayAudio={handlePlayAudio} 
            />
          </section>
        )}

        {/* Main Wedding Site Content (Fades in when showSite is true) */}
        {showSite && (
          <>
            <NavBar isPlaying={isPlaying} onToggleAudio={toggleMusic} />
            <FloatingPetals />
            
            <div
              className="animate-fade-in transition-opacity duration-1000 opacity-0"
              style={{ animation: "fadeIn 1s ease-in forwards" }}
            >
              {/* 2. Hero Section */}
              <section
                id="hero"
                className="snap-start w-full"
                style={{ height: "100vh" }}
              >
                <Hero />
              </section>

              {/* 3. Our Story Section */}
              <section
                id="our-story"
                className="snap-start w-full"
                style={{ height: "100vh" }}
              >
                <OurStory />
              </section>

              {/* 4. Event Details Section */}
              <section
                id="event-details"
                className="snap-start w-full"
                style={{ height: "100vh" }}
              >
                <EventDetails />
              </section>

              {/* 5. Dress Code Section */}
              <section
                id="dress-code"
                className="snap-start w-full"
                style={{ height: "100vh" }}
              >
                <DressCode />
              </section>

              {/* 6. RSVP Section */}
              <section
                id="rsvp"
                className="snap-start w-full flex items-center justify-center py-12"
                style={{
                  height: "100vh",
                  backgroundColor: "var(--color-ivory)",
                }}
              >
                <FadeInSection>
                  <RSVPForm />
                </FadeInSection>
              </section>

              {/* 7. Gift Registry Section */}
              <section
                id="gift-registry"
                className="snap-start w-full"
                style={{ height: "100vh" }}
              >
                <GiftRegistry />
              </section>

              {/* 8. Gallery Section */}
              <section
                id="gallery"
                className="snap-start w-full"
                style={{ height: "100vh" }}
              >
                <Gallery />
              </section>

              {/* 9. Footer Section */}
              <section
                id="footer"
                className="snap-start w-full"
                style={{ height: "100vh" }}
              >
                <Footer />
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
}
