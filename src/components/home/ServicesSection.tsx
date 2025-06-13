
// src/components/home/ServicesSection.tsx
'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

const services = [
  {
    icon: <Zap className="h-8 w-8 text-white" />,
    title: 'General Dentistry',
  },
  {
    icon: <Gem className="h-8 w-8 text-white" />,
    title: 'Cosmetic Dentistry',
  },
  {
    icon: <Settings className="h-8 w-8 text-white" />,
    title: 'Orthodontics',
  },
  {
    icon: <Users className="h-8 w-8 text-white" />,
    title: 'Pediatric Dentistry',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-white" />,
    title: 'Dental Implants',
  },
  {
    icon: <Zap className="h-8 w-8 text-red-400" />,
    title: 'Emergency Care',
  },
];

const MUX_PLAYBACK_ID = "1BDuplVB02AJgtBfToI1kc3S4ITsqCI4b2H3uuTvpz00I";
const PARALLAX_AMOUNT = 0.2;
const SCROLL_SPEED_TO_PLAYBACK_RATE_FACTOR = 0.02;
const MIN_PLAYBACK_RATE = 0.5;
const MAX_PLAYBACK_RATE = 1.75;
const PAUSE_TIMEOUT_MS = 200;


export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<MuxPlayerRefAttributes>(null);
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastScrollTime = useRef(Date.now());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          } else {
            // Optionally set isVisible to false if you want to re-trigger
            // animations or listeners when scrolling back into view.
            // For now, we only set it to true once.
          }
        });
      },
      { threshold: 0.1 } 
    );

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (!videoPlayerRef.current || !sectionRef.current || !videoContainerRef.current) return;

    const player = videoPlayerRef.current.mediaElement as HTMLVideoElement | undefined;
    if (!player) return;

    const sectionRect = sectionRef.current.getBoundingClientRect();
    
    // Parallax effect for video container
    // Only apply parallax if the section is somewhat in view to avoid large initial jumps
    if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
      const scrollAmount = window.scrollY - (sectionRef.current.offsetTop || 0);
      const translateY = scrollAmount * PARALLAX_AMOUNT;
      videoContainerRef.current.style.transform = `translateY(${translateY}px)`;
    }


    const currentTime = Date.now();
    const currentScrollY = window.scrollY;
    
    const timeDiff = currentTime - lastScrollTime.current;
    const scrollDiff = currentScrollY - lastScrollY.current;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (player.paused || player.ended) {
      player.play().catch((e: any) => console.warn("Video play interrupted or failed on scroll:", e));
    }
    
    if (timeDiff > 20 && scrollDiff !== 0) { 
        const speed = Math.abs(scrollDiff) / timeDiff; 
        let newRate = 1 + (speed * SCROLL_SPEED_TO_PLAYBACK_RATE_FACTOR);
        newRate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, newRate));
        
        if (Math.abs(player.playbackRate - newRate) > 0.05) { // Reduced threshold for smoother rate changes
          player.playbackRate = newRate;
        }
    } else if (scrollDiff === 0 && !player.paused) { 
         player.playbackRate = 1; 
    }

    lastScrollY.current = currentScrollY;
    lastScrollTime.current = currentTime;

    scrollTimeoutRef.current = setTimeout(() => {
      if (!player.paused) {
        player.pause();
      }
    }, PAUSE_TIMEOUT_MS);

  }, []); // Empty dependency array as refs and constants don't change

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      // Attempt to play when first visible and scroll listener is attached
      const player = videoPlayerRef.current?.mediaElement as HTMLVideoElement | undefined;
      if (player && (player.paused || player.ended)) {
        // Delay initial play slightly to ensure Mux player is fully ready
        setTimeout(() => {
            player.play().catch(e => console.warn("Initial play attempt on visibility failed:", e));
        }, 100);
      }
    } else {
      window.removeEventListener('scroll', handleScroll);
      const player = videoPlayerRef.current?.mediaElement as HTMLVideoElement | undefined;
      if (player && !player.paused) {
        player.pause();
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Ensure video is paused on unmount or if isVisible becomes false (if that logic is added)
      const player = videoPlayerRef.current?.mediaElement as HTMLVideoElement | undefined;
      if (player && !player.paused) {
        player.pause();
      }
    };
  }, [isVisible, handleScroll]);


  return (
    <section
      id="services"
      ref={sectionRef}
      className={cn(
        "relative w-full py-16 md:py-20 lg:py-24 overflow-hidden",
        // "initial-fade-in", // Keep if you want initial section fade-in
        // isVisible && "is-visible" 
        // Fade-in for the section itself can be managed independently or removed if video is main focus
      )}
    >
      <div 
        ref={videoContainerRef}
        className="absolute top-[-20%] left-0 w-full h-[140%] z-[-10] pointer-events-none" 
      >
        <MuxPlayer
          ref={videoPlayerRef}
          playbackId={MUX_PLAYBACK_ID}
          muted
          loop
          autoPlay={false} // Playback is controlled by scroll
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 w-full h-full bg-black/70 z-[-5]"></div>

      <div className="container relative px-4 md:px-6 z-10">
        <div 
            className={cn(
                "text-center mb-10 md:mb-12",
                "initial-fade-in-up", // Animation for text content
                isVisible && "is-visible"
            )} 
            style={{ transitionDelay: isVisible ? `0ms` : '0ms' }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Our Services</h2>
          <p className="mt-3 text-neutral-300 md:text-lg max-w-xl mx-auto">
            Comprehensive dental solutions tailored to your needs.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className={cn(
                "flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out group",
                "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
                "initial-fade-in-up", // Animation for cards
                isVisible && "is-visible"
              )}
              style={{ transitionDelay: isVisible ? `${200 + index * 100}ms` : '0ms' }}
            >
              <CardHeader className="items-center pt-8 pb-4">
                {React.cloneElement(service.icon, { 
                    className: cn(service.icon.props.className, "mb-3 group-hover:scale-110 transition-transform")
                })}
                <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

    