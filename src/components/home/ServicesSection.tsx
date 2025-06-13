
// src/components/home/ServicesSection.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

const services = [
  { icon: <Zap className="h-10 w-10" />, title: 'General Dentistry' },
  { icon: <Gem className="h-10 w-10" />, title: 'Cosmetic Dentistry' },
  { icon: <Settings className="h-10 w-10" />, title: 'Orthodontics' },
  { icon: <Users className="h-10 w-10" />, title: 'Pediatric Dentistry' },
  { icon: <CheckCircle className="h-10 w-10" />, title: 'Dental Implants' },
  { icon: <Zap className="h-10 w-10" />, title: 'Emergency Care' },
];

const MUX_PLAYBACK_ID = "1BDuplVB02AJgtBfToI1kc3S4ITsqCI4b2H3uuTvpz00I";
const PARALLAX_AMOUNT = 0.15; // How much the video background moves relative to scroll

const MIN_PLAYBACK_RATE = 0.8;
const MAX_PLAYBACK_RATE = 1.8; // Max speed for faster scrolls
const IDLE_PLAYBACK_RATE = 1.0;
const PAUSE_TIMEOUT_MS = 200; // Time of no scroll before pausing
const SCROLL_EVENT_DEBOUNCE_MS = 16; // roughly 60fps

// Scroll speed thresholds for playback rate adjustment
const baseSpeedThreshold = 0.15; // px/ms, scrolls slower than this aim for 1.0x
const maxSpeedForScaling = 1.5; // px/ms, scroll speed at which playback rate should ideally hit MAX_PLAYBACK_RATE

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<MuxPlayerRefAttributes>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(performance.now());
  const scrollSpeed = useRef(0);
  const pauseTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const scrollEventTimeoutId = useRef<NodeJS.Timeout | null>(null);

  const handlePlayerReady = useCallback(() => {
    // console.log("Mux Player is ready (onLoadedData)");
    setIsPlayerReady(true);
  }, []);

  // IntersectionObserver to determine if the section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSectionVisible(entry.isIntersecting);
          if (!entry.isIntersecting) {
            // If section is not visible, ensure player is paused
            const player = videoPlayerRef.current?.mediaElement;
            if (player && !player.paused) {
              player.pause();
              player.playbackRate = IDLE_PLAYBACK_RATE;
              // console.log("Section not visible, pausing video.");
            }
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of section is visible
    );

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }
    return () => {
      if (currentSectionRef) observer.unobserve(currentSectionRef);
    };
  }, []);

  const handleScroll = useCallback(() => {
    const player = videoPlayerRef.current?.mediaElement;
    const currentSection = sectionRef.current;
    const currentVideoContainer = videoContainerRef.current;

    if (!player || !currentSection || !currentVideoContainer || !isPlayerReady) {
      return;
    }

    // Parallax effect
    const scrollAmountForParallax = window.scrollY - (currentSection.offsetTop || 0);
    currentVideoContainer.style.transform = `translateY(${scrollAmountForParallax * PARALLAX_AMOUNT}px)`;

    if (!isSectionVisible) {
      if (!player.paused) {
        player.pause();
        player.playbackRate = IDLE_PLAYBACK_RATE;
        // console.log("handleScroll: Section not visible, ensuring pause.");
      }
      return;
    }

    const currentTime = performance.now();
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY.current;
    const deltaTime = currentTime - lastScrollTime.current;

    if (deltaTime > 0) { // Avoid division by zero
      scrollSpeed.current = Math.abs(deltaY / deltaTime); // pixels per millisecond
    }

    lastScrollY.current = currentScrollY;
    lastScrollTime.current = currentTime;

    if (player.paused) {
      player.play().catch(e => console.warn("Mux player play error in handleScroll:", e));
      // console.log("Playing video due to scroll");
    }

    let newRate = IDLE_PLAYBACK_RATE;
    if (scrollSpeed.current > baseSpeedThreshold) {
      const speedRatio = Math.min((scrollSpeed.current - baseSpeedThreshold) / (maxSpeedForScaling - baseSpeedThreshold), 1);
      newRate = IDLE_PLAYBACK_RATE + speedRatio * (MAX_PLAYBACK_RATE - IDLE_PLAYBACK_RATE);
    } else if (scrollSpeed.current > 0.01) { // Gentle scroll or slowing down
       newRate = Math.max(MIN_PLAYBACK_RATE, IDLE_PLAYBACK_RATE - (baseSpeedThreshold - scrollSpeed.current) * 2);
    }


    player.playbackRate = Math.min(Math.max(newRate, MIN_PLAYBACK_RATE), MAX_PLAYBACK_RATE);
    // console.log(`Scroll speed: ${scrollSpeed.current.toFixed(2)} px/ms, Playback rate: ${player.playbackRate.toFixed(2)}`);

    if (pauseTimeoutId.current) {
      clearTimeout(pauseTimeoutId.current);
    }
    pauseTimeoutId.current = setTimeout(() => {
      if (player && !player.paused) {
        player.pause();
        player.playbackRate = IDLE_PLAYBACK_RATE; // Reset rate on pause
        // console.log("Pausing video due to scroll stop");
      }
    }, PAUSE_TIMEOUT_MS);

  }, [isPlayerReady, isSectionVisible]);

  // Debounced scroll handler
  const debouncedScrollHandler = useCallback(() => {
    if (scrollEventTimeoutId.current) {
        clearTimeout(scrollEventTimeoutId.current);
    }
    scrollEventTimeoutId.current = setTimeout(() => {
        handleScroll();
    }, SCROLL_EVENT_DEBOUNCE_MS);
  }, [handleScroll]);


  useEffect(() => {
    if (isSectionVisible && isPlayerReady) {
      window.addEventListener('scroll', debouncedScrollHandler);
      // Initialize refs for first scroll detection
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = performance.now();
      // console.log("Scroll listener added for ServicesSection");
    } else {
      window.removeEventListener('scroll', debouncedScrollHandler);
      // console.log("Scroll listener removed for ServicesSection");
      if (pauseTimeoutId.current) {
        clearTimeout(pauseTimeoutId.current);
      }
       if (scrollEventTimeoutId.current) {
        clearTimeout(scrollEventTimeoutId.current);
      }
    }

    return () => {
      window.removeEventListener('scroll', debouncedScrollHandler);
      if (pauseTimeoutId.current) {
        clearTimeout(pauseTimeoutId.current);
      }
       if (scrollEventTimeoutId.current) {
        clearTimeout(scrollEventTimeoutId.current);
      }
    };
  }, [isSectionVisible, isPlayerReady, debouncedScrollHandler]);


  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[70vh] md:min-h-[80vh]"
    >
      <div
        ref={videoContainerRef}
        className="absolute top-[-15%] left-0 w-full h-[130%] z-[-10] pointer-events-none"
      >
        <MuxPlayer
          ref={videoPlayerRef}
          playbackId={MUX_PLAYBACK_ID}
          muted
          loop
          playsInline
          noControls
          autoPlay={false} // Scroll will control playback
          onLoadedData={handlePlayerReady} // Use onLoadedData
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 w-full h-full bg-black/70 z-[-5]"></div>

      <div className="container relative px-4 md:px-6 z-10">
        <div
          className={cn(
            "text-center mb-10 md:mb-12",
            "initial-fade-in-up",
            isSectionVisible && "is-visible"
          )}
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
                "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
                "initial-fade-in-up",
                isSectionVisible && "is-visible"
              )}
              style={{ transitionDelay: isSectionVisible ? `${200 + index * 100}ms` : '0ms' }}
            >
              <CardHeader className="items-center pt-8 pb-4">
                {React.cloneElement(service.icon, {
                  className: cn(service.icon.props.className, "mb-3 group-hover:scale-110 transition-transform text-white")
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

    