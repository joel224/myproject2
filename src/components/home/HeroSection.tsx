
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
import Image from 'next/image';
import { WaitTimeWidget } from './WaitTimeWidget';

const MuxPlayer = dynamic<MuxPlayerProps>(
  () => import('@mux/mux-player-react').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="absolute top-0 left-0 w-full h-full bg-black/50" /> }
);

const HERO_VIDEO_PLAYBACK_ID_DESKTOP = "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU";
const HERO_VIDEO_PLAYBACK_ID_MOBILE = "D3mIJKP4RyoacfufEKanS3gcEKo95gzWJjlzkfPMLUk";
const PROMO_IMAGE_URL = "https://drive.google.com/uc?export=download&id=1NhzQDy42-S4O69a6y1F6ti5HuUE8LWkn";

export function HeroSection() {
  const videoRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const promoImageContainerRef = useRef<HTMLDivElement>(null);
  const hidePromoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [textVisible, setTextVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const isMobile = useIsMobile();

  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  
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
    const timer = setTimeout(() => handleScroll(), 100); 
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

  useEffect(() => {
    const popupDelay = isMobile ? 17000 : 10000; // 20s for mobile, 10s for desktop
    console.log(`HeroSection: Timer for booking pop-up is being set (${popupDelay / 1000} seconds). Mobile: ${isMobile}`);
    const timer = setTimeout(() => {
      console.log(`HeroSection: ${popupDelay / 1000}-second timer fired. Setting showBookingPopup to true.`);
      setShowBookingPopup(true);
    }, popupDelay);
    return () => {
      console.log("HeroSection: Cleanup function for booking pop-up timer.");
      clearTimeout(timer);
    };
  }, [isMobile]);

  const handlePromoTriggerMouseEnter = () => {
    if (hidePromoTimerRef.current) {
      clearTimeout(hidePromoTimerRef.current);
      hidePromoTimerRef.current = null;
    }
    setShowPromoPopup(true);
  };

  const handlePromoTriggerMouseLeave = () => {
    hidePromoTimerRef.current = setTimeout(() => {
      setShowPromoPopup(false);
    }, 200); 
  };

  const handlePromoPopupMouseEnter = () => {
    if (hidePromoTimerRef.current) {
      clearTimeout(hidePromoTimerRef.current);
      hidePromoTimerRef.current = null;
    }
    setShowPromoPopup(true); 
  };
  
  const handlePromoPopupMouseLeave = () => {
     hidePromoTimerRef.current = setTimeout(() => {
        setShowPromoPopup(false); 
    }, 100); 
  };


  return (
    <>
      <section
        ref={sectionRef}
        className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-neutral-800"
      >
        <div
          ref={playerContainerRef}
          className="absolute top-0 left-0 w-full h-[165%] z-[1] bg-black"
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
            className="absolute inset-0 w-full h-full object-cover min-w-full min-h-full transform -translate-y-6"
            onLoadedMetadata={() => { setIsPlayerReady(true); handleScroll(); }}
            onPlayerReady={() => { setIsPlayerReady(true); handleScroll(); }}
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
              <div className="relative inline-block">
                 <h1 className="font-sans text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Your <span className="inline-block transition-transform duration-300 ease-in-out hover:scale-105 [text-shadow:0_0_8px_hsl(var(--primary)/0.7)]">Smile</span>, Our <span className="inline-block transition-transform duration-300 ease-in-out hover:scale-105 [text-shadow:0_0_8px_hsl(var(--primary)/0.7)]">Passion!</span>
                </h1>
                <svg
                  className="absolute -bottom-1 left-0 w-full h-[12px]"
                  viewBox="0 0 500 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M5 5C 50 15, 200 0, 245 6" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" />
                  <path d="M280 6C 350 12, 450 0, 495 5" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <p className="max-w-[600px] text-neutral-200 md:text-xl mx-auto">
                Experience exceptional dental care at Dr. Loji's Dental Hub. We're dedicated to creating healthy, beautiful smiles for life.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <div
                  className="relative" 
                  onMouseEnter={handlePromoTriggerMouseEnter}
                  onMouseLeave={handlePromoTriggerMouseLeave}
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

        {/* Promotional Image Pop-up */}
        {showPromoPopup && (
         <div
          ref={promoImageContainerRef}
          className={cn(
            "fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16",
            "bg-black/75 backdrop-blur-md",
            "transition-opacity duration-300 ease-out",
            showPromoPopup ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onMouseEnter={handlePromoPopupMouseEnter}
          onMouseLeave={handlePromoPopupMouseLeave}
        >
         <div
            className={cn(
              "relative w-[80vw] max-w-4xl aspect-video transition-all duration-300 ease-out",
              showPromoPopup ? "scale-100 opacity-100" : "scale-95 opacity-0"
            )}
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
        )}
        <WaitTimeWidget />
      </section>

      <BookingPopupDialog
        isOpen={showBookingPopup}
        onClose={() => setShowBookingPopup(false)}
        onOpenChange={setShowBookingPopup}
      />
    </>
  );
}
