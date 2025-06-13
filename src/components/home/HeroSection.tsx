
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

  }, []);

  // // --- Scroll-Driven Playback Logic ---
  // const lastScrollY = useRef(0);
  // const animationFrame = useRef(0);
  // const scrollVelocity = useRef(0);

  // // Calculate scroll velocity over time
  // useEffect(() => {
  //   const calculateScrollVelocity = () => {
  //     const currentScrollY = window.scrollY;
  //     const deltaTime = 100; // ms
  //     const distance = currentScrollY - lastScrollY.current;

  //     // Velocity in pixels per second
  //     scrollVelocity.current = Math.abs(distance) / (deltaTime / 1000);

  //     lastScrollY.current = currentScrollY;
  //     animationFrame.current = requestAnimationFrame(calculateScrollVelocity);
  //   };

  //   calculateScrollVelocity();

  //   return () => {
  //     cancelAnimationFrame(animationFrame.current);
  //   };
  // }, []);

  // // Handle scroll events to adjust playback speed
  // const handleScrollPlayback = useCallback(() => {
  //   if (!playerRef.current?.mediaElement) return;

  //   // Map scroll velocity to playback rate (adjust sensitivity as needed)
  //   const maxScrollSpeed = 500; // px/s - adjust based on your content
  //   const baseRate = 1;
  //   const rateMultiplier = 0.005; // Adjust sensitivity here

  //   const normalizedVelocity = Math.min(scrollVelocity.current / maxScrollSpeed, 1);
  //   const playbackRate = baseRate + normalizedVelocity * rateMultiplier;

    // Clamp playback rate between 0.5x and 3x
    // playerRef.current.mediaElement.playbackRate = Math.min(
    //   Math.max(playbackRate, 0.5),
    //   3
    // );

    // // Ensure video is playing if paused
    // if (playerRef.current.mediaElement.paused) {
    //   playerRef.current.mediaElement.play().catch(e => console.warn("Mux player play error on scroll:", e));
    // }

  // }, []);
  // // --- End Scroll-Driven Playback Logic ---


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

    // Add scroll listeners for both parallax and playback control
    window.addEventListener('scroll', handleParallaxScroll, { passive: true }); // Add passive for performance
    // window.addEventListener('scroll', handleScrollPlayback, { passive: true }); // Use passive for performance

    handleParallaxScroll(); // Initial call for parallax positioning
    
    return () => {
      // Clean up all scroll listeners
      window.removeEventListener('scroll', handleScrollPlayback);
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
            playbackId={currentPlaybackId} // Use the dynamically determined playback ID
            metadata={{
              // Add appropriate metadata for your video
              video_id: 'hero-section-video',
              video_title: 'Dental Hub Hero Video',
            }}
            muted
            onPlay={() => console.log('Mux Player: Play event triggered')}
 onPause={() => console.log('Mux Player: Pause event triggered')}
            onError={(event) => console.error('Mux Player: Error occurred', event.detail)}
            loop
            autoPlay={true} // Changed to true for autoplay
            playsInline
            className="w-full h-full object-cover scale-[2.5] sm:scale-[2.0] md:scale-[1.8] lg:scale-150"
            controls={true}
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
