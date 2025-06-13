
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
const PARALLAX_AMOUNT = 0.2; // How much the video background moves relative to scroll
const MIN_PLAYBACK_RATE = 0.75;
const MAX_PLAYBACK_RATE = 2.0; // Max speed for faster scrolls
const BASE_SCROLL_SPEED_THRESHOLD = 0.1; // px/ms: scrolls slower than this target 1x speed
const MAX_SCROLL_SPEED_FOR_SCALING = 2.5; // px/ms: scroll speed at which max playback rate is achieved
const PAUSE_TIMEOUT_MS = 150; // Pause video if no scroll for this duration

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<MuxPlayerRefAttributes>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastScrollTime = useRef(Date.now());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSectionVisible(entry.isIntersecting);
          if (!entry.isIntersecting) {
            const player = videoPlayerRef.current?.mediaElement;
            if (player && !player.paused) {
              player.pause();
              player.playbackRate = 1.0;
            }
          }
        });
      },
      { threshold: 0.1 } // Adjust threshold as needed (0.1 means 10% visible)
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
    const player = videoPlayerRef.current?.mediaElement;

    if (videoContainerRef.current && sectionRef.current) {
      const sectionTop = sectionRef.current.offsetTop || 0;
      const scrollAmountForParallax = window.scrollY - sectionTop;
      const translateY = scrollAmountForParallax * PARALLAX_AMOUNT;
      videoContainerRef.current.style.transform = `translateY(${translateY}px)`;
    }

    if (!player || !isSectionVisible || !isPlayerReady) {
      return;
    }

    const currentTime = Date.now();
    const currentScrollY = window.scrollY;
    const timeDiff = currentTime - lastScrollTime.current;
    const scrollDistance = Math.abs(currentScrollY - lastScrollY.current);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (timeDiff > 10 && scrollDistance > 1) { // Actively scrolling
      if (player.paused) {
        player.play().catch(e => console.warn("Mux player play error on scroll:", e));
      }

      const scrollSpeed = scrollDistance / timeDiff; // pixels per millisecond

      let newRate;
      if (scrollSpeed < BASE_SCROLL_SPEED_THRESHOLD) {
        newRate = 1.0;
      } else {
        // Scale speed: map scrollSpeed from [BASE_SCROLL_SPEED_THRESHOLD, MAX_SCROLL_SPEED_FOR_SCALING] to [1.0, MAX_PLAYBACK_RATE]
        const speedInRange = Math.min(Math.max(scrollSpeed, BASE_SCROLL_SPEED_THRESHOLD), MAX_SCROLL_SPEED_FOR_SCALING);
        const normalizedSpeed = (speedInRange - BASE_SCROLL_SPEED_THRESHOLD) / (MAX_SCROLL_SPEED_FOR_SCALING - BASE_SCROLL_SPEED_THRESHOLD);
        newRate = 1.0 + normalizedSpeed * (MAX_PLAYBACK_RATE - 1.0);
      }
      
      newRate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, newRate));
      
      if (Math.abs(player.playbackRate - newRate) > 0.05) {
        player.playbackRate = newRate;
      }
    } else {
      // Very slow scroll or stationary, aim for normal speed before potential pause
      if (player.playbackRate !== 1.0) {
          player.playbackRate = 1.0;
      }
    }

    lastScrollY.current = currentScrollY;
    lastScrollTime.current = currentTime;

    scrollTimeoutRef.current = setTimeout(() => {
      if (player && !player.paused && isSectionVisible) {
        player.playbackRate = 1.0;
        player.pause();
      }
    }, PAUSE_TIMEOUT_MS);

  }, [isSectionVisible, isPlayerReady]);

  useEffect(() => {
    if (isSectionVisible && isPlayerReady) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      // Initial scroll check in case page loads scrolled into view
      handleScroll();
    } else {
      window.removeEventListener('scroll', handleScroll);
      const player = videoPlayerRef.current?.mediaElement;
      if (player && !player.paused) {
        player.pause();
        player.playbackRate = 1.0;
      }
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isSectionVisible, isPlayerReady, handleScroll]);

  const handlePlayerReady = () => {
    setIsPlayerReady(true);
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[70vh] md:min-h-[80vh]"
    >
      <div
        ref={videoContainerRef}
        className="absolute top-[-15%] left-0 w-full h-[130%] z-[-10] pointer-events-none" // Adjusted for parallax
      >
        <MuxPlayer
          ref={videoPlayerRef}
          playbackId={MUX_PLAYBACK_ID}
          muted
          loop={true}
          autoPlay={false} // Playback controlled by scroll
          playsInline
          noControls
          onLoadedMetadata={handlePlayerReady}
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
          style={{ transitionDelay: isSectionVisible ? `0ms` : '0ms' }}
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
                  className: cn(service.icon.props.className, "mb-3 group-hover:scale-110 transition-transform text-white") // Ensure icon is white
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
