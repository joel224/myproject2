
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';

const HERO_VIDEO_PLAYBACK_ID = "VA2YqY01Og02W3Gk01N5zB2NMYX00eF00zjcLJeBhtFksU";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | MuxPlayer>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [textVisible, setTextVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const handleScroll = useCallback(() => {
    if (videoRef.current && sectionRef.current) {
      const sectionTop = sectionRef.current.offsetTop;
      const sectionHeight = sectionRef.current.offsetHeight;
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Calculate when the middle of the section is at the middle of the viewport
      const scrollMidpoint = sectionTop + sectionHeight / 2 - windowHeight / 2;
      const parallaxOffset = (scrollPosition - scrollMidpoint) * 0.2; // Adjust 0.2 for more/less parallax

      // Apply transform to the video player's direct parent for parallax
      const playerElement = (videoRef.current as any)?.getInternalPlayer?.() || videoRef.current;
      if (playerElement && playerElement.parentElement) {
         playerElement.parentElement.style.transform = `translateY(${parallaxOffset}px)`;
      }
    }
  }, []);


  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 

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
      className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center"
    >
      <div className={cn("absolute top-0 left-0 w-full h-[120%] z-0 pointer-events-none")}>
        {/* The MuxPlayer needs a wrapper that can be transformed for parallax */}
        {/* The extra 20% height and slight negative top offset helps ensure no gaps during parallax */}
        <div className="absolute -top-[10%] left-0 w-full h-full">
          <MuxPlayer
            ref={videoRef as React.Ref<MuxPlayer>}
            playbackId={HERO_VIDEO_PLAYBACK_ID}
            autoPlay
            loop
            muted
            playsInline
            noControls
            className="absolute top-0 left-0 w-full h-full object-cover"
            onLoadedMetadata={() => setIsPlayerReady(true)}
            onPlayerReady={() => {
              setIsPlayerReady(true);
              console.log("Hero MuxPlayer: Player is ready");
            }}
            onError={(error) => console.error("Hero MuxPlayer Error:", error)}
          />
        </div>
      </div>

      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/40 via-black/20 to-[hsl(var(--background))] z-[2]"></div>

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
