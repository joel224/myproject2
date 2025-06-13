
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
const IDLE_PLAYBACK_RATE = 0.2;
const SCROLL_SCRUB_PLAYBACK_RATE = 1.0; // Playback rate during active scrubbing
const SCROLL_STOP_DELAY = 150; // ms to wait before considering scroll stopped

export function ServicesSection() {
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // IntersectionObserver for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSectionVisible(entry.isIntersecting);
          console.log(`Services MuxPlayer: Section isIntersecting: ${entry.isIntersecting}`);
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
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayerReady = useCallback(() => {
    console.log('Services MuxPlayer: Player is ready (onLoadedData fired).');
    setIsPlayerReady(true);
  }, []);

  const handleDurationChange = useCallback(() => {
    if (playerRef.current?.duration && playerRef.current.duration > 0) {
      setVideoDuration(playerRef.current.duration);
      console.log(`Services MuxPlayer: DurationChange - ${playerRef.current.duration}`);
    }
  }, []);

  // Main playback logic: Idle play or pause
  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      console.log('Services MuxPlayer: Player ref not available for main logic.');
      return;
    }

    if (isSectionVisible && isPlayerReady && videoDuration > 0 && !isScrolling) {
      console.log('Services MuxPlayer: Section visible, player ready, not scrolling. Setting idle playback.');
      player.playbackRate = IDLE_PLAYBACK_RATE;
      player.play()?.catch(e => console.warn("Services MuxPlayer: Idle Play error:", e));
    } else if ((!isSectionVisible || !isPlayerReady) && !player.paused) {
      console.log('Services MuxPlayer: Section not visible or player not ready. Pausing video.');
      player.pause();
    } else if (isScrolling && !player.paused) {
      // If scrolling starts, and we were idle playing, ensure playbackRate is suitable for scrubbing
      // This is primarily handled by the scroll event, but as a fallback.
      if (player.playbackRate !== SCROLL_SCRUB_PLAYBACK_RATE) {
          player.playbackRate = SCROLL_SCRUB_PLAYBACK_RATE;
      }
    }
     console.log(`Services MuxPlayer: Main Logic Check - Visible: ${isSectionVisible}, Ready: ${isPlayerReady}, Duration: ${videoDuration}, Scrolling: ${isScrolling}, Paused: ${player.paused}, Rate: ${player.playbackRate}`);

  }, [isSectionVisible, isPlayerReady, videoDuration, isScrolling]);


  // Scroll handling for scrubbing
  useEffect(() => {
    const handleScroll = () => {
      const player = playerRef.current;
      const currentSectionRef = sectionRef.current;

      if (!isSectionVisible || !isPlayerReady || !player || !currentSectionRef || videoDuration === 0) {
        return;
      }

      if (!isScrolling) {
        console.log("Services MuxPlayer: Scroll started, setting isScrolling true.");
        setIsScrolling(true);
        if (player.paused) {
          player.play()?.catch(e => console.warn("Services MuxPlayer: Play error on scroll start:", e));
        }
        player.playbackRate = SCROLL_SCRUB_PLAYBACK_RATE;
      }

      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Calculate scroll progress
      const rect = currentSectionRef.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Progress calculation: 0 when top of section hits bottom of viewport, 1 when bottom of section hits top of viewport
      // This means the video scrubs as the section passes through the viewport.
      const scrollableViewportHeight = viewportHeight + rect.height;
      let progress = (viewportHeight - rect.top) / scrollableViewportHeight;
      progress = Math.max(0, Math.min(1, progress)); // Clamp progress between 0 and 1

      const targetTime = progress * videoDuration;

      if (Math.abs(player.currentTime - targetTime) > 0.05) { // Threshold to avoid excessive seeking
        console.log(`Services MuxPlayer: Scrubbing - Progress: ${progress.toFixed(2)}, TargetTime: ${targetTime.toFixed(2)}, CurrentTime: ${player.currentTime.toFixed(2)}`);
        player.currentTime = targetTime;
      }

      // Set a new timeout to detect scroll stop
      scrollTimeoutRef.current = setTimeout(() => {
        console.log("Services MuxPlayer: Scroll stopped, setting isScrolling false.");
        setIsScrolling(false);
        // The main useEffect will pick up isScrolling=false and resume idle playback if conditions are met.
      }, SCROLL_STOP_DELAY);
    };

    if (isSectionVisible && isPlayerReady && videoDuration > 0) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      console.log("Services MuxPlayer: Scroll listener ADDED.");
    } else {
      window.removeEventListener('scroll', handleScroll);
      console.log("Services MuxPlayer: Scroll listener REMOVED or not added.");
       // If section becomes not visible while scrolling, ensure isScrolling is reset
      if (isScrolling && !isSectionVisible) {
        setIsScrolling(false);
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      console.log("Services MuxPlayer: Scroll listener CLEANED UP.");
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isSectionVisible, isPlayerReady, videoDuration, isScrolling]); // Added isScrolling to dependencies


  const muxPlayerProps: MuxPlayerProps = {
    ref: playerRef,
    playbackId: MUX_PLAYBACK_ID,
    muted: true,
    autoPlay: false, 
    loop: true, // Loop is useful for idle playback
    playsInline: true,
    noControls: true,
    className: "w-full h-full object-cover",
    onLoadedData: handlePlayerReady,
    onDurationChange: handleDurationChange,
    onPlay: () => console.log('Services MuxPlayer: Play event triggered.'),
    onPause: () => console.log('Services MuxPlayer: Pause event triggered.'),
    onError: (e) => console.error('Services MuxPlayer: Error event:', e.detail),
    onRateChange: () => playerRef.current && console.log('Services MuxPlayer: RateChange event, new rate:', playerRef.current.playbackRate),
    // onTimeUpdate: () => playerRef.current && console.log('Services MuxPlayer: TimeUpdate - ', playerRef.current.currentTime.toFixed(3)),
    onSeeking: () => console.log('Services MuxPlayer: Seeking event.'),
    onSeeked: () => console.log('Services MuxPlayer: Seeked event.'),
    onCanPlay: () => console.log('Services MuxPlayer: Browser reports it can play the video.'),
    onPlaying: () => console.log('Services MuxPlayer: Playing event triggered (playback has started).'),
    onEnded: () => {
      console.log('Services MuxPlayer: Ended event triggered.');
      // For idle looping, ensure it restarts if conditions still met
      if (playerRef.current && isSectionVisible && isPlayerReady && !isScrolling) {
        console.log('Services MuxPlayer: Re-initiating idle play on Ended.');
        playerRef.current.currentTime = 0;
        playerRef.current.playbackRate = IDLE_PLAYBACK_RATE;
        playerRef.current.play()?.catch(e => console.warn("Services MuxPlayer: Idle Re-Play error:", e));
      }
    }
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[90vh] md:min-h-[100vh]" // Ensure enough height for scroll effects
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
