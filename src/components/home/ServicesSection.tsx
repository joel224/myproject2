
// src/components/home/ServicesSection.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

// Service definitions (without descriptions)
const services = [
  { icon: <Zap className="h-8 w-8 text-white" />, title: 'General Dentistry' },
  { icon: <Gem className="h-8 w-8 text-white" />, title: 'Cosmetic Dentistry' },
  { icon: <Settings className="h-8 w-8 text-white" />, title: 'Orthodontics' },
  { icon: <Users className="h-8 w-8 text-white" />, title: 'Pediatric Dentistry' },
  { icon: <CheckCircle className="h-8 w-8 text-white" />, title: 'Dental Implants' },
  { icon: <Zap className="h-8 w-8 text-red-400" />, title: 'Emergency Care' },
];

const MUX_PLAYBACK_ID = "1BDuplVB02AJgtBfToI1kc3S4ITsqCI4b2H3uuTvpz00I";
const PARALLAX_AMOUNT = 0.2; 
const MIN_PLAYBACK_RATE = 0.8; 
const MAX_PLAYBACK_RATE = 1.8; 
const PAUSE_TIMEOUT_MS = 200; 


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
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false); 
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the section is visible
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
    if (!videoPlayerRef.current || !sectionRef.current || !videoContainerRef.current) return;

    const player = videoPlayerRef.current.mediaElement as HTMLVideoElement | undefined;
    if (!player) return;
    
    // Parallax for video container
    const sectionTop = sectionRef.current.offsetTop || 0;
    const scrollAmountForParallax = window.scrollY - sectionTop;
    const translateY = scrollAmountForParallax * PARALLAX_AMOUNT;
    videoContainerRef.current.style.transform = `translateY(${translateY}px)`;

    const currentTime = Date.now();
    const currentScrollY = window.scrollY;
    
    const timeDiff = currentTime - lastScrollTime.current;
    const scrollDistance = currentScrollY - lastScrollY.current; // Positive for down, negative for up

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (player.paused && scrollDistance !== 0 && isVisible) { // Check isVisible here too
      player.play().catch((e: any) => console.warn("Video play on scroll failed:", e));
    }
    
    if (timeDiff > 16 && scrollDistance !== 0) { // Min time diff (for ~60fps) and actual scroll
        const absoluteScrollSpeed = Math.abs(scrollDistance) / timeDiff; // pixels per millisecond
        
        let newRate;
        // Adjust this range and factor to get desired "normal to speeding" feel
        const baseSpeedThreshold = 0.3; // px/ms, below this is considered "normal" speed
        const maxSpeedForScaling = 4.0; // px/ms, speed beyond this won't further increase rate beyond MAX_PLAYBACK_RATE

        if (absoluteScrollSpeed < baseSpeedThreshold) { 
            newRate = 1.0;
        } else {
            // Scale speed: map range [baseSpeedThreshold, maxSpeedForScaling] to playbackRate range [1.0, MAX_PLAYBACK_RATE]
            const speedInRange = Math.min(Math.max(absoluteScrollSpeed, baseSpeedThreshold), maxSpeedForScaling); 
            newRate = 1.0 + ((speedInRange - baseSpeedThreshold) / (maxSpeedForScaling - baseSpeedThreshold)) * (MAX_PLAYBACK_RATE - 1.0);
        }
        newRate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, newRate));
        
        if (Math.abs(player.playbackRate - newRate) > 0.05) { // Apply if significant change
          player.playbackRate = newRate;
        }
    }

    lastScrollY.current = currentScrollY;
    lastScrollTime.current = currentTime;

    scrollTimeoutRef.current = setTimeout(() => {
      if (player && !player.paused) {
        player.playbackRate = 1.0; 
        player.pause();
      }
    }, PAUSE_TIMEOUT_MS);

  }, [isVisible, PARALLAX_AMOUNT, MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE, PAUSE_TIMEOUT_MS]); 

  useEffect(() => {
    const player = videoPlayerRef.current?.mediaElement as HTMLVideoElement | undefined;
    if (isVisible) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial call to set parallax and potentially play if already scrolling
    } else {
      window.removeEventListener('scroll', handleScroll);
      if (player && !player.paused) {
        player.playbackRate = 1.0;
        player.pause();
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (player && !player.paused) { // Ensure cleanup on unmount
        player.playbackRate = 1.0;
        player.pause();
      }
    };
  }, [isVisible, handleScroll]);
  
  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[70vh] md:min-h-[80vh]" // Ensure section has enough height
    >
      <div 
        ref={videoContainerRef}
        className="absolute top-[-25%] left-0 w-full h-[150%] z-[-10] pointer-events-none" // Increased height for parallax
      >
        <MuxPlayer
          ref={videoPlayerRef}
          playbackId={MUX_PLAYBACK_ID}
          muted
          loop // Video will loop if it reaches the end while playing
          autoPlay={false} // Playback is controlled by scroll
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 w-full h-full bg-black/70 z-[-5]"></div> {/* Overlay for text readability */}

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
                "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20", 
                "initial-fade-in-up", 
                isVisible && "is-visible"
              )}
              style={{ transitionDelay: isVisible ? `${200 + index * 100}ms` : '0ms' }}
            >
              <CardHeader className="items-center pt-8 pb-4">
                {React.cloneElement(service.icon, { 
                    className: cn(service.icon.props.className, "mb-3 h-10 w-10 group-hover:scale-110 transition-transform") // Slightly larger icons
                })}
                <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
              </CardHeader>
              {/* Service descriptions are intentionally removed as per previous request */}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

