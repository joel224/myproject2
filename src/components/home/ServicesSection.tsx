
// src/components/home/ServicesSection.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react'; // EmergencyCare icon removed as per previous request
import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

const services = [
  { icon: <Zap className="h-10 w-10 text-white" />, title: 'General Dentistry' },
  { icon: <Gem className="h-10 w-10 text-white" />, title: 'Cosmetic Dentistry' },
  { icon: <Settings className="h-10 w-10 text-white" />, title: 'Orthodontics' },
  { icon: <Users className="h-10 w-10 text-white" />, title: 'Pediatric Dentistry' },
  { icon: <CheckCircle className="h-10 w-10 text-white" />, title: 'Dental Implants' },
  { icon: <Zap className="h-10 w-10 text-red-400" />, title: 'Emergency Care' }, // Re-added Emergency Care for visual consistency if descriptions are gone
];

const MUX_PLAYBACK_ID = "1BDuplVB02AJgtBfToI1kc3S4ITsqCI4b2H3uuTvpz00I";
// const PARALLAX_AMOUNT = 0.15;
// const MIN_PLAYBACK_RATE = 0.8;
// const MAX_PLAYBACK_RATE = 1.8;
// const baseSpeedThreshold = 0.15; 
// const maxSpeedForScaling = 3.0; 
// const PAUSE_TIMEOUT_MS = 200;

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<MuxPlayerRefAttributes>(null);
  // const videoContainerRef = useRef<HTMLDivElement>(null); // Parallax also commented out
  const [isVisible, setIsVisible] = useState(false);

  // const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  // const lastScrollTime = useRef(Date.now());
  // const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const hasScrolledSinceVisible = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const currentlyVisible = entry.isIntersecting;
          setIsVisible(currentlyVisible);
          // Basic play/pause on visibility for debugging
          const player = videoPlayerRef.current?.mediaElement as HTMLVideoElement | undefined;
          if (player) {
            if (currentlyVisible) {
              player.play().catch(e => console.warn("Mux player play error on visibility:", e));
            } else {
              player.pause();
            }
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
      // if (scrollTimeoutRef.current) {
      //   clearTimeout(scrollTimeoutRef.current);
      // }
    };
  }, []);

  // const handleScroll = useCallback(() => {
    // const player = videoPlayerRef.current?.mediaElement as HTMLVideoElement | undefined;

    // if (videoContainerRef.current && sectionRef.current) {
    //   const sectionTop = sectionRef.current.offsetTop || 0;
    //   const scrollAmountForParallax = window.scrollY - sectionTop;
    //   const translateY = scrollAmountForParallax * PARALLAX_AMOUNT;
    //   videoContainerRef.current.style.transform = `translateY(${translateY}px)`;
    // }
    
    // if (!player || !isVisible) {
    //   if(player && !isVisible) player.pause(); // Ensure pause if not visible
    //   return;
    // }

    // if (!hasScrolledSinceVisible.current && isVisible) {
    //   hasScrolledSinceVisible.current = true;
    //    // console.log('First scroll since visible, attempting play');
    //   player.play().catch((e: any) => console.warn("Video play on first scroll failed:", e));
    // }

    // const currentTime = Date.now();
    // const currentScrollY = window.scrollY;
    // const timeDiff = currentTime - lastScrollTime.current;
    // const scrollDistance = currentScrollY - lastScrollY.current; // Use signed distance
    // const absoluteScrollDistance = Math.abs(scrollDistance);

    // if (scrollTimeoutRef.current) {
    //   clearTimeout(scrollTimeoutRef.current);
    // }

    // if (absoluteScrollDistance > 0 || (player.paused && isVisible)) { 
    //   if (player.paused && isVisible) {
    //     // console.log('Playing video due to scroll while paused and visible');
    //     player.play().catch((e: any) => console.warn("Video play on scroll (was paused) failed:", e));
    //   }

    //   if (timeDiff > 16 && absoluteScrollDistance > 1) { 
    //     const absoluteScrollSpeed = absoluteScrollDistance / timeDiff; 
    //     let newRate;

    //     if (absoluteScrollSpeed < baseSpeedThreshold) {
    //       newRate = 1.0;
    //     } else {
    //       const speedInRange = Math.min(Math.max(absoluteScrollSpeed, baseSpeedThreshold), maxSpeedForScaling);
    //       newRate = 1.0 + ((speedInRange - baseSpeedThreshold) / (maxSpeedForScaling - baseSpeedThreshold)) * (MAX_PLAYBACK_RATE - 1.0);
    //     }
    //     newRate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, newRate));
        
    //     if (Math.abs(player.playbackRate - newRate) > 0.05) {
    //       player.playbackRate = newRate;
    //       // console.log('Setting playbackRate to:', newRate, 'Scroll speed:', absoluteScrollSpeed.toFixed(2));
    //     }
    //   } else if (timeDiff > 16 && absoluteScrollDistance <= 1) { // Very slow scroll or stationary
    //       if (player.playbackRate !== 1.0) {
    //           player.playbackRate = 1.0;
    //           // console.log('Resetting playbackRate to 1.0 due to slow/no scroll');
    //       }
    //   }
    // }

    // lastScrollY.current = currentScrollY;
    // lastScrollTime.current = currentTime;

    // scrollTimeoutRef.current = setTimeout(() => {
    //   if (player && !player.paused && isVisible) { // Only pause if it was playing and section is still visible
    //     player.playbackRate = 1.0; 
    //     player.pause();
    //     // console.log('Pausing video due to scroll stop');
    //   }
    // }, PAUSE_TIMEOUT_MS);
  // }, [isVisible]); 

  // useEffect(() => {
  //   if (isVisible && hasScrolledSinceVisible.current) { // Re-add listener if visible and has scrolled before
  //     window.addEventListener('scroll', handleScroll, { passive: true });
  //   } else {
  //     window.removeEventListener('scroll', handleScroll);
  //   }
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //     if (scrollTimeoutRef.current) {
  //       clearTimeout(scrollTimeoutRef.current);
  //     }
  //   };
  // }, [isVisible, handleScroll]); // Removed hasScrolledSinceVisible.current from deps to avoid stale closure issues if it changes elsewhere


  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[70vh] md:min-h-[80vh]"
    >
      <div
        // ref={videoContainerRef} // Parallax container also commented out
        className="absolute top-0 left-0 w-full h-full z-[-10] pointer-events-none" // Simplified container, no extra height for parallax for now
      >
        <MuxPlayer
          ref={videoPlayerRef}
          playbackId={MUX_PLAYBACK_ID}
          muted
          loop={true} 
          autoPlay={true} // Set to true for simple playback
          playsInline
          noControls 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 w-full h-full bg-black/70 z-[-5]"></div>

      <div className="container relative px-4 md:px-6 z-10">
        <div
            className={cn(
                "text-center mb-10 md:mb-12",
                "initial-fade-in-up",
                isVisible && "is-visible" // Keep this for text animation
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
                "initial-fade-in-up",
                isVisible && "is-visible" // Keep this for card animation
              )}
              style={{ transitionDelay: isVisible ? `${200 + index * 100}ms` : '0ms' }}
            >
              <CardHeader className="items-center pt-8 pb-4">
                {React.cloneElement(service.icon, {
                    className: cn(service.icon.props.className, "h-10 w-10 mb-3 group-hover:scale-110 transition-transform")
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
    