
// src/components/home/ServicesSection.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react'; // Keep CheckCircle
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
const IDLE_PLAYBACK_RATE = 0.05; // Very slow playback when idle
const ACTIVE_SCRUB_PLAYBACK_RATE = 1; // Normal speed when scrubbing (frames must advance)
const SCROLL_STOP_TIMEOUT = 200; // ms to wait after scroll stops before reverting to idle playback

export function ServicesSection() {
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSeekingRef = useRef(false); // To manage seeking state

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  // IntersectionObserver for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wasVisible = isSectionVisible;
          setIsSectionVisible(entry.isIntersecting);
          if (entry.isIntersecting && playerRef.current && isPlayerReady && !wasVisible) {
            console.log("Services MuxPlayer: Section became visible, attempting idle play.");
            playerRef.current.playbackRate = IDLE_PLAYBACK_RATE;
            playerRef.current.play()?.catch(e => console.warn("Mux player play error on visibility:", e));
          } else if (!entry.isIntersecting && playerRef.current && wasVisible) {
            console.log("Services MuxPlayer: Section not visible, pausing.");
            playerRef.current.pause();
          }
        });
      },
      { threshold: 0.01 } // Trigger even if a tiny part is visible
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerReady]); // Rerun when player becomes ready, isSectionVisible is managed by its own state

  const handlePlayerReady = useCallback(() => {
    console.log('Services MuxPlayer: Player is ready (onLoadedMetadata).');
    if (playerRef.current && playerRef.current.duration && playerRef.current.duration > 0) {
      setVideoDuration(playerRef.current.duration);
      setIsPlayerReady(true);
      // Initial play for idle state if section is already visible (IntersectionObserver handles this now)
    } else {
        console.warn("Services MuxPlayer: Player ready but duration is not available or zero.");
        setTimeout(() => { // Retry for duration
            if (playerRef.current && playerRef.current.duration && playerRef.current.duration > 0) {
                setVideoDuration(playerRef.current.duration);
                setIsPlayerReady(true);
            } else {
                console.error("Services MuxPlayer: Failed to get video duration even after retry.");
            }
        }, 500);
    }
  }, []);

  // Scroll handler for seeking
  const handleScroll = useCallback(() => {
    if (!isSectionVisible || !isPlayerReady || !playerRef.current || !sectionRef.current || videoDuration === 0) {
      return;
    }

    const player = playerRef.current;
    const section = sectionRef.current;
    const sectionRect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Determine the scrollable range for the video scrub effect
    // Let's say the video scrubs over the middle 50% of the viewport height as the section passes through it.
    // Or, more simply, map video duration to the section's height relative to the viewport.
    // A common pattern: video starts when section top enters viewport, ends when section bottom leaves.
    // For micro-seeking, we want a direct map of scroll position to video time.

    // Calculate scroll progress: 0 when section top is at viewport bottom, 1 when section bottom is at viewport top.
    // Effective scrollable distance is viewportHeight + section.offsetHeight.
    const totalScrollableDist = viewportHeight + section.offsetHeight;
    let scrollProgress = (viewportHeight - sectionRect.top) / totalScrollableDist;
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));

    const targetTime = scrollProgress * videoDuration;

    isSeekingRef.current = true;

    if (player.paused) {
      player.play()?.catch(e => console.warn("Mux player play error on scroll seek:", e));
    }
    player.playbackRate = ACTIVE_SCRUB_PLAYBACK_RATE;
    
    if (Math.abs(player.currentTime - targetTime) > 0.05) { // Threshold to avoid too frequent seeks for tiny changes
        // console.log(`Services MuxPlayer: Seeking to ${targetTime.toFixed(3)}s (ScrollProgress: ${scrollProgress.toFixed(3)})`);
        player.currentTime = targetTime;
    }
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isSeekingRef.current = false;
      if (playerRef.current && isSectionVisible) {
        console.log("Services MuxPlayer: Scroll stopped, reverting to idle playback rate.");
        playerRef.current.playbackRate = IDLE_PLAYBACK_RATE;
        if (playerRef.current.paused) {
             playerRef.current.play()?.catch(e => console.warn("Mux player play error on idle resume:", e));
        }
      }
    }, SCROLL_STOP_TIMEOUT);
  }, [isSectionVisible, isPlayerReady, videoDuration]);

  useEffect(() => {
    if (isSectionVisible && isPlayerReady) {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
    } else {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isSectionVisible, isPlayerReady, handleScroll]);


  const muxPlayerProps: MuxPlayerProps = {
    ref: playerRef,
    playbackId: MUX_PLAYBACK_ID,
    muted: true,
    autoPlay: false, 
    loop: false, 
    playsInline: true,
    noControls: true,
    className: "w-full h-full object-cover",
    onLoadedMetadata: handlePlayerReady,
    onPlayerReady: () => console.log('Services MuxPlayer: Player is ready (onPlayerReady event)'),
    onLoadedData: () => console.log('Services MuxPlayer: Video data has been loaded.'),
    onCanPlay: () => console.log('Services MuxPlayer: Browser reports it can play the video.'),
    onPlay: () => console.log('Services MuxPlayer: Play event triggered.'),
    onPlaying: () => console.log('Services MuxPlayer: Playing event triggered (playback has started).'),
    onPause: () => console.log('Services MuxPlayer: Pause event triggered.'),
    onSeeking: () => { if(isSeekingRef.current) console.log('Services MuxPlayer: Seeking event (manual scroll).'); },
    onSeeked: () => { if(isSeekingRef.current) console.log('Services MuxPlayer: Seeked event (manual scroll).'); },
    onDurationChange: () => {
        if(playerRef.current && playerRef.current.duration) {
            const newDuration = playerRef.current.duration;
            console.log('Services MuxPlayer: DurationChange - new duration:', newDuration);
            if (videoDuration !== newDuration && newDuration > 0) { // Ensure positive duration
                setVideoDuration(newDuration);
                setIsPlayerReady(true); // Re-affirm readiness if duration changes validly
            }
        }
    },
    onError: (e) => console.error('Services MuxPlayer: Error event:', e.detail),
    onEnded: () => {
      console.log('Services MuxPlayer: Ended event. Re-setting to idle if visible.');
      if (playerRef.current && isSectionVisible && isPlayerReady) {
        playerRef.current.currentTime = 0; 
        playerRef.current.playbackRate = IDLE_PLAYBACK_RATE;
        playerRef.current.play()?.catch(err => console.warn("Error re-playing on end:", err));
      }
    }
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[90vh] md:min-h-[100vh]" // Ensure section has enough height for scroll effect
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
              style={{ transitionDelay: `${200 + index * 100}ms` }}
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

    