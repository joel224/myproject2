
// src/components/home/HeroSection.tsx
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { MuxPlayerProps } from '@mux/mux-player-react';
import { BookingPopupDialog } from './BookingPopupDialog';
import { useIsMobile } from '@/hooks/use-mobile';


// Dynamically import MuxPlayer with SSR disabled
const MuxPlayer = dynamic<MuxPlayerProps>(
  () => import('@mux/mux-player-react').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="absolute top-0 left-0 w-full h-full bg-black/50" /> }
);

const HERO_VIDEO_PLAYBACK_ID_DESKTOP = "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU";
const HERO_VIDEO_PLAYBACK_ID_MOBILE = "d6029nUGS7fZ00W027QSUwzd01GtdUAyLC01qd02CaPX2t00Cc";

export function HeroSection() {
  const videoRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [textVisible, setTextVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const isMobile = useIsMobile();

  const [showBookingPopup, setShowBookingPopup] = useState(false);

  const currentPlaybackId = isMobile ? HERO_VIDEO_PLAYBACK_ID_MOBILE : HERO_VIDEO_PLAYBACK_ID_DESKTOP;

  const handleScroll = useCallback(() => {
    if (playerContainerRef.current && sectionRef.current && sectionRef.current.clientHeight > 0) {
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const initialCenteringShift = -(sectionRef.current.clientHeight * 0.25);
      const sectionCenterY = sectionRect.top + sectionRect.height / 2 + scrollY;
      const viewportCenterY = scrollY + windowHeight / 2;
      const parallaxDelta = (viewportCenterY - sectionCenterY) * 0.2;
      playerContainerRef.current.style.transform = `translateY(${initialCenteringShift + parallaxDelta}px)`;
    }
  }, []);


  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(() => handleScroll(), 100); // Ensure initial call after layout
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [handleScroll, isPlayerReady]); 

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

  // useEffect for the booking pop-up timer
  useEffect(() => {
    console.log('HeroSection: Pop-up effect hook running.');
    if (typeof window !== "undefined") {
      // Removed sessionStorage check to make it pop up every time for dev
      console.log('HeroSection: Setting 10s timer for booking pop-up (dev mode - always shows).');
      const popupTimer = setTimeout(() => {
        console.log('HeroSection: Timer fired! Attempting to show pop-up.');
        setShowBookingPopup(true);
        console.log('HeroSection: Pop-up should be visible now (showBookingPopup set to true).');
      }, 10000); // 10 seconds

      return () => {
        console.log('HeroSection: Cleaning up pop-up timer.');
        clearTimeout(popupTimer);
      };
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  return (
    <> 
      <section
        ref={sectionRef}
        className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-neutral-800"
      >
        <div
          ref={playerContainerRef}
          className="absolute top-0 left-0 w-full h-[150%]" 
          style={{ transition: 'transform 0.1s linear' }}
        >
          <MuxPlayer
              ref={videoRef}
              playbackId={currentPlaybackId}
              autoPlay
              loop
              muted
              playsInline
              noControls
              className="absolute top-0 left-0 w-full h-full object-cover"
              onLoadedMetadata={() => {
                setIsPlayerReady(true);
                handleScroll(); 
              }}
              onPlayerReady={() => { 
                setIsPlayerReady(true);
                handleScroll(); 
              }}
              onError={(evt) => {
                console.error("Hero MuxPlayer Raw Error Event:", evt);
              }}
            />
        </div>

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
                    className="px-8 py-6 text-lg shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-shadow"
                  >
                    Book an Appointment in 30 Seconds
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BookingPopupDialog 
        isOpen={showBookingPopup} 
        onClose={() => setShowBookingPopup(false)}
        onOpenChange={setShowBookingPopup}
      />
    </>
  );
}
