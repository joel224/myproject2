
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

const DESKTOP_VIDEO_ID = "Svcb6Pf8PL4";
const MOBILE_VIDEO_ID = "U6oZFT5Omdk";


export function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const parallaxVideoWrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const [textVisible, setTextVisible] = useState(false);
  const [isPlayerApiReady, setIsPlayerApiReady] = useState(false);
  const isMobile = useIsMobile();

  const handleScrollPlayback = useCallback(() => {
    if (!playerRef.current || typeof playerRef.current.setPlaybackRate !== 'function' || !sectionRef.current || !window.YT || !parallaxVideoWrapperRef.current) {
      return;
    }

    const PARALLAX_FACTOR = 0.4; 
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const scrollPosition = window.scrollY;
    const sectionTop = sectionRect.top + scrollPosition;
    // const sectionHeight = sectionRect.height; // Not directly used for parallax transform here
    const translateY = (scrollPosition - sectionTop) * PARALLAX_FACTOR;
    parallaxVideoWrapperRef.current.style.transform = `translateY(${translateY}px)`;

    const windowHeight = window.innerHeight;
    const sectionCenterY = sectionRect.top + sectionRect.height / 2;
    const viewportCenterFocusMin = windowHeight * 0.2;
    const viewportCenterFocusMax = windowHeight * 0.8;

    const isInFocus = sectionCenterY > viewportCenterFocusMin && sectionCenterY < viewportCenterFocusMax &&
                      sectionRect.bottom > 0 && sectionRect.top < windowHeight;

    const targetRate = isInFocus ? 1 : 0.5;

    try {
      if (playerRef.current.getPlaybackRate() !== targetRate) {
        playerRef.current.setPlaybackRate(targetRate);
      }
      if (playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING &&
          playerRef.current.getPlayerState() !== window.YT.PlayerState.BUFFERING) {
        playerRef.current.playVideo();
      }
    } catch (e) {
      // console.warn("Error interacting with YouTube player:", e);
    }
  }, []);


  const initializePlayer = useCallback(() => {
    if (!playerContainerRef.current || playerRef.current || !window.YT?.Player) return;

    const videoIdToUse = isMobile ? MOBILE_VIDEO_ID : DESKTOP_VIDEO_ID;

    playerRef.current = new window.YT.Player(playerContainerRef.current.id, {
      videoId: videoIdToUse,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        controls: 0,
        loop: 1,
        playlist: videoIdToUse,
        mute: 1,
        playsinline: 1,
        modestbranding: 1,
        showinfo: 0,
        rel: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: (event: any) => {
          handleScrollPlayback();
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            playerRef.current?.seekTo(0);
            playerRef.current?.playVideo();
          }
        },
      },
    });
  }, [isMobile, handleScrollPlayback]);

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
    
    const existingApiReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if(existingApiReady) existingApiReady();
      setIsPlayerApiReady(true);
    };

    return () => {
      if (window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady.toString().includes("setIsPlayerApiReady(true)")) {
        window.onYouTubeIframeAPIReady = existingApiReady;
      }
    };
  }, []);

  useEffect(() => {
    if (isPlayerApiReady) {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      initializePlayer();
    }
  }, [isPlayerApiReady, initializePlayer, isMobile]);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollPlayback);
    return () => {
      window.removeEventListener('scroll', handleScrollPlayback);
    };
  }, [handleScrollPlayback]);

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


    const currentTextRef = textRef.current;

    if (currentTextRef) textObserver.observe(currentTextRef);

    return () => {
      if (currentTextRef) textObserver.unobserve(currentTextRef);
    };
  }, []);


  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center"
    >
      {/* Video background */}
      <div className={cn("absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none")}>
        <div ref={parallaxVideoWrapperRef} className="relative w-full h-[150%] top-[-25%]"> 
          <div
            id="hero-youtube-player"
            ref={playerContainerRef}
            className="w-full h-full scale-[2.5] sm:scale-[2.0] md:scale-[1.8] lg:scale-150"
          />
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 via-black/30 to-[hsl(var(--background))] z-[1]" />

      <div
        className="absolute w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw] lg:w-[80vw] lg:h-[80vw]
                   top-[-75vw] left-[-75vw] md:top-[-50vw] md:left-[-50vw] lg:top-[-40vw] lg:left-[-40vw]
                   bg-accent/20 pointer-events-none z-[2] rounded-full"
      />
      <div
        className="absolute w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw] lg:w-[80vw] lg:h-[80vw]
                   top-[-75vw] right-[-75vw] md:top-[-50vw] md:right-[-50vw] lg:top-[-40vw] lg:right-[-40vw]
                   border-2 border-accent/40 pointer-events-none z-[2] rounded-full"
      />


      <div className="container relative px-4 md:px-6 z-[3] py-12 md:py-24 lg:py-32">
        <div className="flex flex-col items-center justify-center">
          <div
            ref={textRef}
            className={cn(
              "space-y-6 text-center",
              "initial-fade-in-up", 
              textVisible && "is-visible",
              "text-neutral-100",
              "max-w-2xl" 
            )}
          >
            <h1 className="font-manrope text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your Smile, Our Passion!
            </h1>
            <p className="max-w-[600px] text-neutral-200 md:text-xl mx-auto"> 
              Experience exceptional dental care at Dr. Loji's Dental Hub. We're dedicated to creating healthy, beautiful smiles for life.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center"> 
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
        </div>
      </div>
    </section>
  );
}

