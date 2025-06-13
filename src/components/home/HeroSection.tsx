
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import MuxPlayer from '@mux/mux-player-react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

const DESKTOP_MUX_PLAYBACK_ID = "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU";
const MOBILE_MUX_PLAYBACK_ID = "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU"; // Using same Mux ID for mobile for now

const PARALLAX_FACTOR = 0.4;

export function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const parallaxVideoWrapperRef = useRef<HTMLDivElement>(null);

  const [textVisible, setTextVisible] = useState(false);
  const isMobile = useIsMobile();

  const handleParallaxScroll = useCallback(() => {
    if (!sectionRef.current || !parallaxVideoWrapperRef.current) {
      return;
    }

    const scrollPosition = window.scrollY;
    const sectionTop = sectionRef.current.offsetTop || 0;
    const translateY = (scrollPosition - sectionTop) * PARALLAX_FACTOR;

    if (parallaxVideoWrapperRef.current) {
      parallaxVideoWrapperRef.current.style.transform = `translateY(${translateY}px)`;
    }

    // Optional: Ensure video is playing if somehow paused (though autoPlay and loop should handle it)
    const playerElement = playerRef.current?.mediaElement;
    if (playerElement && (playerElement.paused || playerElement.ended)) {
        playerElement.play().catch(e => console.warn("Mux player play error during scroll (safeguard):", e));
    }

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

    window.addEventListener('scroll', handleParallaxScroll);
    handleParallaxScroll(); // Initial call for parallax positioning

    return () => {
      if (currentTextRef) textObserver.unobserve(currentTextRef);
      window.removeEventListener('scroll', handleParallaxScroll);
    };
  }, [handleParallaxScroll]);


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
            autoPlay={true} // Changed to true for autoplay
            playsInline
            className="w-full h-full object-cover scale-[2.5] sm:scale-[2.0] md:scale-[1.8] lg:scale-150"
            noControls
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
