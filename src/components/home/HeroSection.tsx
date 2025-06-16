
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { MuxPlayerProps } from '@mux/mux-player-react';

// Dynamically import MuxPlayer with SSR disabled
const MuxPlayer = dynamic<MuxPlayerProps>(
  () => import('@mux/mux-player-react').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="absolute top-0 left-0 w-full h-full bg-black/50" /> }
);

const HERO_VIDEO_PLAYBACK_ID = "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU";

export function HeroSection() {
  const videoRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [textVisible, setTextVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false); // Added state for player readiness


  const handleScroll = useCallback(() => {
    if (playerContainerRef.current && sectionRef.current) {
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const scrollY = window.scrollY; // Use window.scrollY for consistency
      const windowHeight = window.innerHeight;

      // Calculate the scroll position relative to the center of the section
      // The parallax offset is based on how far the viewport center is from the section center
      const sectionCenterY = sectionRect.top + sectionRect.height / 2 + scrollY;
      const viewportCenterY = scrollY + windowHeight / 2;
      const parallaxOffset = (viewportCenterY - sectionCenterY) * 0.2; // Adjust 0.2 to control intensity


      // Apply transform to the player container
      // The -50% for translateY is to initially center the video vertically if its height matches the section
      // Then add the parallaxOffset.
      playerContainerRef.current.style.transform = `translateY(calc(-0% + ${parallaxOffset}px))`;
    }
  }, []);


  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTextVisible(true);
          textObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const currentTextRef = textRef.current;
    if (currentTextRef) textObserver.observe(currentTextRef);

    return () => {
      if (currentTextRef) textObserver.unobserve(currentTextRef);
    };
  }, []);


  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-neutral-900"
    >
      <div
        ref={playerContainerRef}
        className="absolute top-0 left-0 w-full h-[150%]" // Make container taller to allow for parallax movement
        style={{ transition: 'transform 0.1s linear' }} // Smooth parallax transition
      >
        <MuxPlayer
            ref={videoRef}
            playbackId={HERO_VIDEO_PLAYBACK_ID}
            autoPlay
            loop
            muted
            playsInline
            noControls
            className="absolute top-0 left-0 w-full h-full object-cover"
            onLoadedMetadata={() => setIsPlayerReady(true)}
            onPlayerReady={() => setIsPlayerReady(true)}
            onError={(evt) => {
              console.error("Hero MuxPlayer Raw Error Event:", evt);
            }}
          />
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/60 via-black/40 to-transparent z-[2] pointer-events-none"></div>

      <div className="container relative px-4 md:px-6 z-[3] py-12 md:py-24 lg:py-32">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <div
            ref={textRef}
            className={cn(
              "space-y-6",
              "initial-fade-in-up",
              textVisible && "is-visible",
              "text-neutral-100",
              "max-w-2xl"
            )}
          >
            <h1 className="font-manrope text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your <span className="inline-block transition-transform duration-300 ease-in-out hover:scale-105 [text-shadow:0_0_8px_hsl(var(--primary)/0.7)]">Smile</span>, Our Passion!
            </h1>
            <p className="max-w-[600px] text-neutral-200 md:text-xl mx-auto">
              Experience exceptional dental care at Dr. Loji's Dental Hub. We're dedicated to creating healthy, beautiful smiles for life.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
              <Link href="/#appointment">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg shadow-lg bg-medicalAccent text-medicalAccent-foreground hover:bg-medicalAccent/90 transition-shadow"
                >
                  Book an Appointment in 30 Seconds
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
