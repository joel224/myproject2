
// src/components/home/ServicesSection.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

const services = [
  { icon: <Zap className="h-10 w-10 text-white" />, title: 'General Dentistry' },
  { icon: <Gem className="h-10 w-10 text-white" />, title: 'Cosmetic Dentistry' },
  { icon: <Settings className="h-10 w-10 text-white" />, title: 'Orthodontics' },
  { icon: <Users className="h-10 w-10 text-white" />, title: 'Pediatric Dentistry' },
  { icon: <CheckCircle className="h-10 w-10 text-white" />, title: 'Dental Implants' },
  { icon: <Zap className="h-10 w-10 text-red-400" />, title: 'Emergency Care' },
];

const MUX_PLAYBACK_ID = "1BDuplVB02AJgtBfToI1kc3S4ITsqCI4b2H3uuTvpz00I";
const PARALLAX_AMOUNT = 0.15; // How much the video background moves relative to scroll
const MIN_PLAYBACK_RATE = 0.8;
const MAX_PLAYBACK_RATE = 1.8; // Max speed for faster scrolls
const PAUSE_TIMEOUT_MS = 200; // Pause after 200ms of no scrolling
const baseSpeedThreshold = 0.1; // Scroll speed (px/ms) below which playback aims for 1.0x
const maxSpeedForScaling = 2.5; // Scroll speed at which playback rate should reach MAX_PLAYBACK_RATE

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<MuxPlayerRefAttributes>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastScrollTime = useRef(Date.now());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.2 } // Trigger when 20% of the section is visible
    );

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    const player = videoPlayerRef.current?.mediaElement as HTMLVideoElement | undefined;

    if (videoContainerRef.current && sectionRef.current) {
      const sectionTop = sectionRef.current.offsetTop || 0;
      const scrollAmountForParallax = window.scrollY - sectionTop;
      const translateY = scrollAmountForParallax * PARALLAX_AMOUNT;
      videoContainerRef.current.style.transform = `translateY(${translateY}px)`;
    }

    if (!player || !isVisible) {
      if (player && !player.paused) {
        // console.log('handleScroll: Pausing because !isVisible or no player');
        player.playbackRate = 1.0;
        player.pause();
      }
      return;
    }

    const currentTime = Date.now();
    const currentScrollY = window.scrollY;
    const timeDiff = currentTime - lastScrollTime.current;
    const scrollDistance = currentScrollY - lastScrollY.current;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // If there's any scroll, or if the player is paused and we are visible (e.g. initial trigger)
    if (scrollDistance !== 0 || (player.paused && isVisible)) {
      if (player.paused) {
        // console.log('Playing video due to scroll or initial visible state');
        player.play().catch((e: any) => console.warn("Video play on scroll failed:", e));
      }

      if (timeDiff > 16 && scrollDistance !== 0) { // Avoid division by zero or tiny time diffs for rate change
        const scrollSpeed = scrollDistance / timeDiff;
        const absoluteScrollSpeed = Math.abs(scrollSpeed);
        let newRate;

        if (absoluteScrollSpeed < baseSpeedThreshold) {
          newRate = 1.0;
        } else {
          const speedInRange = Math.min(Math.max(absoluteScrollSpeed, baseSpeedThreshold), maxSpeedForScaling);
          newRate = 1.0 + ((speedInRange - baseSpeedThreshold) / (maxSpeedForScaling - baseSpeedThreshold)) * (MAX_PLAYBACK_RATE - 1.0);
        }
        newRate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, newRate));

        if (Math.abs(player.playbackRate - newRate) > 0.05) {
          // console.log('Setting playbackRate to:', newRate, 'Scroll speed:', absoluteScrollSpeed.toFixed(2));
          player.playbackRate = newRate;
        }
      }
    }

    lastScrollY.current = currentScrollY;
    lastScrollTime.current = currentTime;

    scrollTimeoutRef.current = setTimeout(() => {
      if (player && !player.paused) {
        // console.log('Pausing video due to scroll stop');
        player.playbackRate = 1.0;
        player.pause();
      }
    }, PAUSE_TIMEOUT_MS);
  }, [isVisible]); // isVisible is the main dependency here, refs are stable

  useEffect(() => {
    const player = videoPlayerRef.current?.mediaElement as HTMLVideoElement | undefined;

    if (isVisible && player) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      // Call handleScroll once when the component becomes visible and player is ready
      // This ensures that if the page loads with the section already in view and scrolled,
      // the playback logic (including initial play if conditions met) is evaluated.
      handleScroll();
    } else {
      window.removeEventListener('scroll', handleScroll);
      if (player && !player.paused) {
        // console.log('Pausing video in useEffect due to !isVisible or no player');
        player.playbackRate = 1.0;
        player.pause();
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Ensure player is paused and rate reset when component unmounts or isVisible changes to false
      const cleanupPlayer = videoPlayerRef.current?.mediaElement as HTMLVideoElement | undefined;
      if (cleanupPlayer && !cleanupPlayer.paused) {
        // console.log('Pausing video in useEffect cleanup');
        cleanupPlayer.playbackRate = 1.0;
        cleanupPlayer.pause();
      }
    };
  }, [isVisible, handleScroll]);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[70vh] md:min-h-[80vh]"
    >
      <div
        ref={videoContainerRef}
        className="absolute top-[-25%] left-0 w-full h-[150%] z-[-10] pointer-events-none"
      >
        <MuxPlayer
          ref={videoPlayerRef}
          playbackId={MUX_PLAYBACK_ID}
          muted
          loop={true} // Ensure looping
          autoPlay={false} // Controlled by scroll
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 w-full h-full bg-black/70 z-[-5]"></div>

      <div className="container relative px-4 md:px-6 z-10">
        <div
            className={cn(
                "text-center mb-10 md:mb-12",
                "initial-fade-in-up",
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
                "initial-fade-in-up",
                isVisible && "is-visible"
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
