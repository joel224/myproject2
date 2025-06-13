'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { cn } from '@/lib/utils';

const MUX_PLAYBACK_ID = "1BDuplVB02AJgtBfToI1kc3S4ITsqCI4b2H3uuTvpz00I";
const SCROLL_SENSITIVITY_FACTOR = 30; // Lower is more sensitive for playback rate
const PARALLAX_FACTOR = 0.2; // 0.1 means video moves 10% of scroll distance
const PAUSE_TIMEOUT_MS = 150; // Time of no scroll before pausing

export function ScrollControlledVideoSection() {
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (!playerRef.current || !sectionRef.current || !videoContainerRef.current) return;

    const player = playerRef.current;
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY.current;

    // Parallax effect for the video container
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const scrollRelativeToSectionTop = window.scrollY - sectionRef.current.offsetTop;
    
    // Only apply parallax if section is somewhat in view
    if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
      const translateY = scrollRelativeToSectionTop * PARALLAX_FACTOR;
      videoContainerRef.current.style.transform = `translateY(${translateY}px)`;
    }


    // Playback control
    if (Math.abs(deltaY) > 1) { // Threshold to consider it a scroll action
      if (player.paused) {
        player.play().catch(e => console.warn("Mux player play error:", e));
      }
      const newRate = Math.min(2.5, Math.max(0.1, Math.abs(deltaY) / SCROLL_SENSITIVITY_FACTOR));
      if (player.playbackRate !== newRate) {
        player.playbackRate = newRate;
      }
    }

    lastScrollY.current = currentScrollY;

    if (scrollTimeoutId.current) {
      clearTimeout(scrollTimeoutId.current);
    }
    scrollTimeoutId.current = setTimeout(() => {
      if (playerRef.current && !playerRef.current.paused) {
        playerRef.current.pause().catch(e => console.warn("Mux player pause error:", e));
      }
    }, PAUSE_TIMEOUT_MS);
  }, []);

  const loopedScrollHandler = useCallback(() => {
    handleScroll();
    animationFrameId.current = requestAnimationFrame(loopedScrollHandler);
  }, [handleScroll]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    window.addEventListener('scroll', handleScroll); // Use the direct handler for immediate feedback
    
    // If you want continuous updates while scrolling for smoother rate changes, uncomment below:
    // animationFrameId.current = requestAnimationFrame(loopedScrollHandler);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutId.current) {
        clearTimeout(scrollTimeoutId.current);
      }
      // if (animationFrameId.current) {
      //   cancelAnimationFrame(animationFrameId.current);
      // }
    };
  }, [handleScroll]); // Removed loopedScrollHandler from deps if not used

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-background"
      aria-label="Scroll-controlled video background"
    >
      <div
        ref={videoContainerRef}
        className="absolute top-[-20%] left-0 w-full h-[140%]" // Video is taller for parallax
      >
        <MuxPlayer
          ref={playerRef}
          playbackId={MUX_PLAYBACK_ID}
          muted
          loop
          playsInline
          autoPlay={false} // Important: playback controlled by scroll
          className="w-full h-full object-cover"
          software="mux-player-react" // Optional: helps Mux with metrics if using React wrapper
        />
      </div>
      {/* You can add content on top of the video here if needed, e.g., a title */}
      {/* <div className="absolute inset-0 flex items-center justify-center z-10">
        <h2 className="text-4xl font-bold text-white">Our Process in Motion</h2>
      </div> */}
    </section>
  );
}
