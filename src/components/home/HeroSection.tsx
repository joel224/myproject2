
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null); // Stores the YT.Player instance

  const [textVisible, setTextVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [isPlayerApiReady, setIsPlayerApiReady] = useState(false);

  const videoId = "BABoDj2WF34";

  // Initialize YouTube Player
  const initializePlayer = useCallback(() => {
    if (!playerContainerRef.current || playerRef.current || !window.YT?.Player) return;

    playerRef.current = new window.YT.Player(playerContainerRef.current.id, {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        controls: 0,
        loop: 1,
        playlist: videoId, // Required for loop to work with a single video
        mute: 1,           // Autoplay usually requires mute
        playsinline: 1,    // Important for iOS and inline playback
        modestbranding: 1,
        showinfo: 0,
        rel: 0,
        iv_load_policy: 3, // Don't show video annotations
      },
      events: {
        onReady: (event: any) => {
          // The video will autoplay due to playerVars.
          // Set initial playback rate based on scroll.
          handleScrollPlayback();
        },
        onStateChange: (event: any) => {
          // Ensure looping
          if (event.data === window.YT.PlayerState.ENDED) {
            playerRef.current?.seekTo(0);
            playerRef.current?.playVideo();
          }
        },
      },
    });
  }, [videoId]); // Add videoId to dependencies

  // Load YouTube API Script
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsPlayerApiReady(true);
      return;
    }

    const scriptId = 'youtube-iframe-api';
    if (!document.getElementById(scriptId)) {
      const tag = document.createElement('script');
      tag.id = scriptId;
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    window.onYouTubeIframeAPIReady = () => {
      setIsPlayerApiReady(true);
    };

    // Cleanup: remove the global handler if the component unmounts
    // This is a simplified cleanup. A more robust solution might involve a counter
    // if multiple components could load the API.
    return () => {
      if ((window as any).onYouTubeIframeAPIReadyInternal === initializePlayer) {
        delete (window as any).onYouTubeIframeAPIReadyInternal;
      }
    };
  }, [initializePlayer]);


  useEffect(() => {
    if (isPlayerApiReady) {
      initializePlayer();
    }
  }, [isPlayerApiReady, initializePlayer]);


  // Scroll handler for playback rate
  const handleScrollPlayback = useCallback(() => {
    if (!playerRef.current || typeof playerRef.current.setPlaybackRate !== 'function' || !sectionRef.current) {
      return;
    }

    const sectionRect = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Determine if the section is "in focus"
    // In focus if its center is roughly in the middle 60% of the viewport
    const sectionCenterY = sectionRect.top + sectionRect.height / 2;
    const viewportCenterFocusMin = windowHeight * 0.2;
    const viewportCenterFocusMax = windowHeight * 0.8;

    const isInFocus = sectionCenterY > viewportCenterFocusMin && sectionCenterY < viewportCenterFocusMax && sectionRect.bottom > 0 && sectionRect.top < windowHeight;

    const targetRate = isInFocus ? 1 : 0.5;

    try {
      if (playerRef.current.getPlaybackRate() !== targetRate) {
        playerRef.current.setPlaybackRate(targetRate);
      }
      // Ensure video is playing, especially if it was paused for some reason (e.g. browser policies)
      if (playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING &&
          playerRef.current.getPlayerState() !== window.YT.PlayerState.BUFFERING) {
        playerRef.current.playVideo();
      }
    } catch (e) {
      // console.warn("Error interacting with YouTube player:", e);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollPlayback);
    return () => {
      window.removeEventListener('scroll', handleScrollPlayback);
    };
  }, [handleScrollPlayback]);

  // Intersection observers for content animations
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };

    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTextVisible(true);
          textObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageVisible(true);
          imageObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const currentTextRef = textRef.current;
    const currentImageRef = imageRef.current;

    if (currentTextRef) textObserver.observe(currentTextRef);
    if (currentImageRef) imageObserver.observe(currentImageRef);

    return () => {
      if (currentTextRef) textObserver.unobserve(currentTextRef);
      if (currentImageRef) imageObserver.unobserve(currentImageRef);
    };
  }, []);


  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex items-center"
    >
      {/* Background Video Player Container */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div id="hero-youtube-player" ref={playerContainerRef} className="w-full h-full" />
      </div>

      {/* Dark Overlay for text readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-[1]" />

      {/* Content Container */}
      <div className="container relative px-4 md:px-6 z-[2] py-12 md:py-24 lg:py-32">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
          <div
            ref={textRef}
            className={cn(
              "space-y-6",
              "initial-fade-in-left",
              textVisible && "is-visible",
              "text-neutral-100"
            )}
          >
            <h1 className="font-manrope text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your Smile, Our Passion!
            </h1>
            <p className="max-w-[600px] text-neutral-200 md:text-xl">
              Experience exceptional dental care at Dr. Loji's Dental Hub. We're dedicated to creating healthy, beautiful smiles for life.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/#appointment">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg shadow-lg bg-medicalAccent text-medicalAccent-foreground hover:bg-medicalAccent/90 transition-shadow"
                >
                  Book an Appointment in 30 Seconds
                </Button>
              </Link>
            </div>
          </div>
          <div
            ref={imageRef}
            className={cn(
              "flex justify-center lg:justify-end",
              "initial-fade-in-right",
              imageVisible && "is-visible"
            )}
          >
            <Image
              src="https://placehold.co/600x400.png"
              alt="Dental office or smiling patient"
              width={600}
              height={400}
              className="rounded-lg shadow-xl object-cover"
              priority // Consider adding priority if it's LCP
              data-ai-hint="dental team smile"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
