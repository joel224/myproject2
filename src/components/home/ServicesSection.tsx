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
    icon: <Zap className="h-8 w-8 text-red-400" />, // Emergency icon can retain a distinct color
    title: 'Emergency Care',
  },
];

const MUX_PLAYBACK_ID = "1BDuplVB02AJgtBfToI1kc3S4ITsqCI4b2H3uuTvpz00I";
const PARALLAX_AMOUNT = 0.2; // 0 = no parallax, 1 = video moves with scroll
const SCROLL_SPEED_TO_PLAYBACK_RATE_FACTOR = 0.02; // Adjust for sensitivity
const MIN_PLAYBACK_RATE = 0.5;
const MAX_PLAYBACK_RATE = 1.75; // Slightly reduced max rate
const PAUSE_TIMEOUT_MS = 200; // Increased slightly


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
            // Initial play attempt can be done here if desired, or rely on scroll
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (!videoPlayerRef.current || !sectionRef.current || !videoContainerRef.current) return;

    const player = videoPlayerRef.current.mediaElement as HTMLVideoElement | undefined;
    if (!player) return;

    const sectionRect = sectionRef.current.getBoundingClientRect();
    
    // Parallax effect for video container
    if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
      const scrollAmount = window.scrollY - (sectionRef.current.offsetTop || 0);
      const translateY = scrollAmount * PARALLAX_AMOUNT;
      videoContainerRef.current.style.transform = `translateY(${translateY}px)`;
    }


    const currentTime = Date.now();
    const currentScrollY = window.scrollY;
    
    const timeDiff = currentTime - lastScrollTime.current;
    const scrollDiff = currentScrollY - lastScrollY.current; // Use signed difference for direction

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (player.paused || player.ended) {
      player.play().catch((e: any) => console.warn("Video play interrupted or failed:", e));
    }
    
    if (timeDiff > 20 && scrollDiff !== 0) { // Process if there's movement and enough time passed
        const speed = Math.abs(scrollDiff) / timeDiff; // Absolute speed
        let newRate = 1 + (speed * SCROLL_SPEED_TO_PLAYBACK_RATE_FACTOR);
        newRate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, newRate));
        
        if (Math.abs(player.playbackRate - newRate) > 0.1) { // Apply if rate changed significantly
          player.playbackRate = newRate;
        }
    } else if (scrollDiff === 0 && !player.paused) { // If no scroll, prepare to pause
         player.playbackRate = 1; // Reset to normal speed when not actively scrolling fast
    }


    lastScrollY.current = currentScrollY;
    lastScrollTime.current = currentTime;

    scrollTimeoutRef.current = setTimeout(() => {
      if (!player.paused) {
        player.pause();
      }
    }, PAUSE_TIMEOUT_MS);

  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return (
    <section
      id="services"
      ref={sectionRef}
      className={cn(
        "relative w-full py-16 md:py-20 lg:py-24 overflow-hidden",
        "initial-fade-in",
        isVisible && "is-visible"
      )}
    >
      <div 
        ref={videoContainerRef}
        // Video container is taller and positioned to allow parallax
        className="absolute top-[-20%] left-0 w-full h-[140%] z-[-10] pointer-events-none" 
      >
        <MuxPlayer
          ref={videoPlayerRef}
          playbackId={MUX_PLAYBACK_ID}
          muted
          loop
          autoPlay={false} // Controlled by scroll
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      {/* Overlay for text readability */}
      <div className="absolute inset-0 w-full h-full bg-black/70 z-[-5]"></div>

      <div className="container relative px-4 md:px-6 z-10">
        <div 
            className={cn("text-center mb-10 md:mb-12 initial-fade-in-up", isVisible && "is-visible")} 
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
                "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20", // Frosted glass effect
                "initial-fade-in-up",
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
              {/* Description removed as per request */}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
