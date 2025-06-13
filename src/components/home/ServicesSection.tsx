
// src/components/home/ServicesSection.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import type { MuxPlayerRefAttributes, MuxPlayerProps } from '@mux/mux-player-react';

const services = [
  { icon: <Zap className="h-10 w-10" />, title: 'General Dentistry' },
  { icon: <Gem className="h-10 w-10" />, title: 'Cosmetic Dentistry' },
  { icon: <Settings className="h-10 w-10" />, title: 'Orthodontics' },
  { icon: <Users className="h-10 w-10" />, title: 'Pediatric Dentistry' },
  { icon: <CheckCircle className="h-10 w-10" />, title: 'Dental Implants' },
  { icon: <Zap className="h-10 w-10" />, title: 'Emergency Care' },
];

const MUX_PLAYBACK_ID = "1BDuplVB02AJgtBfToI1kc3S4ITsqCI4b2H3uuTvpz00I";
const IDLE_PLAYBACK_RATE = 0.2; // Play at 20% speed when idle

export function ServicesSection() {
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // IntersectionObserver for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSectionVisible(entry.isIntersecting);
          console.log(`Services MuxPlayer: Section isIntersecting: ${entry.isIntersecting}`);
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
    };
  }, []);

  const handlePlayerReady = useCallback(() => {
    console.log('Services MuxPlayer: Player is ready (onLoadedData fired).');
    setIsPlayerReady(true);
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      console.log('Services MuxPlayer: Player ref not available yet.');
      return;
    }

    if (isSectionVisible && isPlayerReady) {
      console.log(`Services MuxPlayer: Section visible and player ready. Setting rate to ${IDLE_PLAYBACK_RATE} and playing.`);
      player.playbackRate = IDLE_PLAYBACK_RATE;
      player.play()?.catch(e => console.warn("Services MuxPlayer: Play error on visibility change:", e));
    } else if (!isSectionVisible && isPlayerReady) {
      console.log('Services MuxPlayer: Section not visible. Pausing video.');
      player.pause();
    } else {
      console.log(`Services MuxPlayer: Conditions not met for play/pause. Visible: ${isSectionVisible}, Ready: ${isPlayerReady}`);
    }
  }, [isSectionVisible, isPlayerReady]);

  const muxPlayerProps: MuxPlayerProps = {
    ref: playerRef,
    playbackId: MUX_PLAYBACK_ID,
    muted: true,
    autoPlay: false, // Important: We control play programmatically
    loop: true,
    playsInline: true,
    noControls: true,
    className: "w-full h-full object-cover",
    onLoadedData: handlePlayerReady, // Use onLoadedData for readiness
    onPlay: () => console.log('Services MuxPlayer: Play event triggered.'),
    onPause: () => console.log('Services MuxPlayer: Pause event triggered.'),
    onError: (e) => console.error('Services MuxPlayer: Error event:', e.detail),
    onEnded: () => console.log('Services MuxPlayer: Ended event triggered (should loop).'),
    onRateChange: () => playerRef.current && console.log('Services MuxPlayer: RateChange event, new rate:', playerRef.current.playbackRate),
    onTimeUpdate: () => playerRef.current && console.log('Services MuxPlayer: TimeUpdate - ', playerRef.current.currentTime),
    onDurationChange: () => playerRef.current && console.log('Services MuxPlayer: DurationChange - ', playerRef.current.duration),
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[90vh] md:min-h-[100vh]"
    >
      <div
        className="absolute top-0 left-0 w-full h-full z-[-10] pointer-events-none"
      >
        <MuxPlayer {...muxPlayerProps} />
      </div>
      <div className="absolute inset-0 w-full h-full bg-black/70 z-[-5]"></div> {/* Overlay */}

      <div className="container relative px-4 md:px-6 z-10">
        <div
          className={cn(
            "text-center mb-10 md:mb-12",
            "initial-fade-in-up",
            isSectionVisible && "is-visible" // Animation for text content
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
                isSectionVisible && "is-visible" // Animation for cards
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
