
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import MuxPlayer from '@mux/mux-player-react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

// Using the Mux Playback ID for both desktop and mobile for now.
// If you have a different Mux ID for mobile, update MOBILE_MUX_PLAYBACK_ID.
const DESKTOP_MUX_PLAYBACK_ID = "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU";
const MOBILE_MUX_PLAYBACK_ID = "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU"; // Or your mobile-specific Mux ID

const PARALLAX_FACTOR = 0.4;
const SCROLL_SPEED_TO_PLAYBACK_RATE_FACTOR = 0.02;
const MIN_PLAYBACK_RATE = 0.5;
const MAX_PLAYBACK_RATE = 1.5; // Adjusted for potentially smoother Mux experience
const PAUSE_TIMEOUT_MS = 250; // Slightly longer timeout for Mux

export function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const parallaxVideoWrapperRef = useRef<HTMLDivElement>(null);

  const [textVisible, setTextVisible] = useState(false);
  const isMobile = useIsMobile();
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastScrollTime = useRef(Date.now());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScrollPlayback = useCallback(() => {
    const playerElement = playerRef.current?.mediaElement;
    if (!playerElement || !sectionRef.current || !parallaxVideoWrapperRef.current) {
      return;
    }

    const sectionRect = sectionRef.current.getBoundingClientRect();
    const scrollPosition = window.scrollY;
    const sectionTop = sectionRef.current.offsetTop || 0; // Ensure offsetTop is defined
    const translateY = (scrollPosition - sectionTop) * PARALLAX_FACTOR;

    if (parallaxVideoWrapperRef.current) {
      parallaxVideoWrapperRef.current.style.transform = `translateY(${translateY}px)`;
    }

    const windowHeight = window.innerHeight;
    const sectionCenterY = sectionRect.top + sectionRect.height / 2;
    const viewportCenterFocusMin = windowHeight * 0.1; // Adjust focus area if needed
    const viewportCenterFocusMax = windowHeight * 0.9;

    const isInFocus = sectionCenterY > viewportCenterFocusMin && sectionCenterY < viewportCenterFocusMax &&
                      sectionRect.bottom > 0 && sectionRect.top < windowHeight;

    const currentTime = Date.now();
    const currentScrollY = window.scrollY;
    const timeDiff = currentTime - lastScrollTime.current;
    const scrollDiff = currentScrollY - lastScrollY.current;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (playerElement.paused || playerElement.ended) {
      playerElement.play().catch(e => console.warn("Mux player play error:", e));
    }

    if (timeDiff > 20 && scrollDiff !== 0) {
      const speed = Math.abs(scrollDiff) / timeDiff;
      let newRate = 1 + (speed * SCROLL_SPEED_TO_PLAYBACK_RATE_FACTOR);
      newRate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, newRate));
      if (Math.abs(playerElement.playbackRate - newRate) > 0.1) {
        playerElement.playbackRate = newRate;
      }
    } else if (scrollDiff === 0 && !playerElement.paused) {
      playerElement.playbackRate = 1; // Reset to normal speed
    }

    lastScrollY.current = currentScrollY;
    lastScrollTime.current = currentTime;

    scrollTimeoutRef.current = setTimeout(() => {
      if (!playerElement.paused) {
        playerElement.pause();
      }
    }, PAUSE_TIMEOUT_MS);

  }, []);


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

    window.addEventListener('scroll', handleScrollPlayback);
    handleScrollPlayback(); // Initial call

    return () => {
      if (currentTextRef) textObserver.unobserve(currentTextRef);
      window.removeEventListener('scroll', handleScrollPlayback);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScrollPlayback]);


  const currentPlaybackId = isMobile ? MOBILE_MUX_PLAYBACK_ID : DESKTOP_MUX_PLAYBACK_ID;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center"
    >
      <div className={cn("absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none")}>
        <div ref={parallaxVideoWrapperRef} className="relative w-full h-[150%] top-[-25%]">
          <MuxPlayer
            ref={playerRef}
            playbackId={currentPlaybackId}
            muted
            loop
            autoPlay={false} // We control play/pause via scroll
            playsInline
            className="w-full h-full object-cover scale-[2.5] sm:scale-[2.0] md:scale-[1.8] lg:scale-150"
            noControls // Hide Mux default controls
          />
        </div>
      </div>

      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/20 via-transparent to-[hsl(var(--background))] z-[2]"></div>

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
              Your Smile, Our Passion!
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
