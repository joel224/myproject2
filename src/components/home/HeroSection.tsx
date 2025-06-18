// src/components/home/HeroSection.tsx
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react'; // Added useRef
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { MuxPlayerProps } from '@mux/mux-player-react';
import { BookingPopupDialog } from './BookingPopupDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';

const MuxPlayer = dynamic<MuxPlayerProps>(
  () => import('@mux/mux-player-react').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="absolute top-0 left-0 w-full h-full bg-black/50" /> }
);

const HERO_VIDEO_PLAYBACK_ID_DESKTOP = "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU";
const HERO_VIDEO_PLAYBACK_ID_MOBILE = "d6029nUGS7fZ00W027QSUwzd01GtdUAyLC01qd02CaPX2t00Cc";
const PROMO_IMAGE_URL = "https://drive.google.com/uc?export=download&id=1NhzQDy42-S4O69a6y1F6ti5HuUE8LWkn";

export function HeroSection() {
  const videoRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [textVisible, setTextVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const isMobile = useIsMobile();

  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const promoImageContainerRef = useRef<HTMLDivElement>(null); // Ref for the image container

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
    const timer = setTimeout(() => handleScroll(), 100); // Delay to ensure layout is stable
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [handleScroll, isPlayerReady]); // Re-run if player readiness changes to apply initial parallax

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

  useEffect(() => {
    // Temporarily removed sessionStorage for easier testing.
    // console.log('HeroSection: Pop-up effect hook running.');
    const popupTimer = setTimeout(() => {
      // console.log('HeroSection: Timer fired! Attempting to show booking pop-up.');
      setShowBookingPopup(true);
    }, 10000);

    return () => {
      // console.log('HeroSection: Cleaning up booking pop-up timer.');
      clearTimeout(popupTimer);
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-neutral-800"
      >
        {/* Video Background */}
        <div
          ref={playerContainerRef}
          className="absolute top-0 left-0 w-full h-[150%]" // Increased height to allow for parallax shift
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
            className="absolute top-0 left-0 w-full h-full object-cover min-w-full min-h-full"
            onLoadedMetadata={() => { setIsPlayerReady(true); handleScroll(); }}
            onPlayerReady={() => { setIsPlayerReady(true); handleScroll(); }}
            onError={(evt) => { console.error("Hero MuxPlayer Raw Error Event:", evt); }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/60 via-black/40 to-transparent z-[2] pointer-events-none"></div>

        {/* Hero Content */}
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
                <div
                  className="relative" // Wrapper for hover trigger
                  onMouseEnter={() => {
                    setShowPromoPopup(true);
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    // Check if the mouse is leaving to the promo image container itself
                    if (promoImageContainerRef.current && e.relatedTarget instanceof Node && promoImageContainerRef.current.contains(e.relatedTarget)) {
                      return; // Do not hide if mouse is moving to the image pop-up
                    }
                    setShowPromoPopup(false); // Hide if mouse is leaving to somewhere else
                  }}
                >
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
        </div>

        {/* Large Promotional Image Pop-up */}
        <div
          className={cn(
            "fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16",
            "bg-black/75 backdrop-blur-md",
            "transition-opacity duration-300 ease-out",
            showPromoPopup ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          // The overlay itself doesn't need mouse events for this specific show/hide logic
        >
          <div
            ref={promoImageContainerRef} // Assign the ref to the image's direct container
            className={cn(
              "relative w-[80vw] max-w-4xl aspect-video transition-all duration-300 ease-out",
              showPromoPopup ? "scale-100 opacity-100" : "scale-95 opacity-0"
            )}
            onMouseEnter={() => {
              setShowPromoPopup(true); // Keep open if mouse enters the image area
            }}
            onMouseLeave={() => {
              setShowPromoPopup(false); // Hide if mouse leaves the image area
            }}
          >
            <Image
              src={PROMO_IMAGE_URL}
              alt="Promotional Offer: Happy Patient"
              layout="fill"
              objectFit="contain"
              className="rounded-lg shadow-2xl"
              data-ai-hint="dental promotion happy patient"
            />
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
