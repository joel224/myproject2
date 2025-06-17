// src/components/home/SmileGallerySection.tsx
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
// Removed: import { ArrowDownCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { MuxPlayerProps } from '@mux/mux-player-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MuxPlayer = dynamic<MuxPlayerProps>(
  () => import('@mux/mux-player-react').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="absolute inset-0 w-full h-full bg-black/50" /> }
);

const MOBILE_GALLERY_VIDEO_PLAYBACK_ID = "d6029nUGS7fZ00W027QSUwzd01GtdUAyLC01qd02CaPX2t00Cc";

const gallerySlidesContent = [
  {
    type: 'intro' as const,
    title: 'Transform Your Smile',
    description: "See the stunning results we've achieved for our happy patients.",
  },
  {
    type: 'image' as const,
    src: 'https://placehold.co/800x600.png',
    alt: 'Before and After Smile 1',
    caption: 'Subtle enhancements, big impact.',
    dataAiHint: "smile dental"
  },
  {
    type: 'image' as const,
    src: 'https://placehold.co/800x600.png',
    alt: 'Before and After Smile 2',
    caption: 'A complete smile makeover.',
    dataAiHint: "dental transformation"
  },
  {
    type: 'image' as const,
    src: 'https://placehold.co/800x600.png',
    alt: 'Before and After Smile 3',
    caption: 'Brightening for a youthful glow.',
    dataAiHint: "teeth whitening"
  },
  {
    type: 'cta' as const,
    buttonText: 'Want a smile like this? Book now!',
    href: '/#appointment',
  },
];


export function SmileGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const firstSlideIntroContentRef = useRef<HTMLDivElement>(null);
  const videoBackgroundLayerRef = useRef<HTMLDivElement>(null);

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isFirstSlideIntroVisible, setIsFirstSlideIntroVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;
    const sectionObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsSectionVisible(true);
          sectionObserver.unobserve(sectionEl);
        }
      }),
      { threshold: 0.05 }
    );
    sectionObserver.observe(sectionEl);
    return () => { if (sectionEl) sectionObserver.unobserve(sectionEl); };
  }, []);

  useEffect(() => {
    const introContentEl = firstSlideIntroContentRef.current;
    if (!introContentEl) return;
    const introObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsFirstSlideIntroVisible(true);
          introObserver.unobserve(introContentEl);
        }
      }),
      { threshold: 0.1 } 
    );
    introObserver.observe(introContentEl);
    return () => { if (introContentEl) introObserver.unobserve(introContentEl); };
  }, []);


  const numSlides = gallerySlidesContent.length;
  const scrollContainerStyle = {
    '--num-slides': numSlides,
    height: `calc(var(--num-slides) * 100vh)`,
  } as React.CSSProperties;

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className={cn(
        "relative w-full bg-background z-20", // Keep z-20 to be above dentist card
        "initial-fade-in",
        isSectionVisible && "is-visible"
      )}
    >
      {isMobile && (
        <div
          ref={videoBackgroundLayerRef}
          className="sticky top-0 left-0 w-full h-screen z-[-1] overflow-hidden bg-black"
        >
          <MuxPlayer
            playbackId={MOBILE_GALLERY_VIDEO_PLAYBACK_ID}
            autoPlay
            loop
            muted
            playsInline
            noControls
            className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover"
          />
        </div>
      )}
      <div
        ref={scrollContainerRef}
        className="relative snap-y snap-mandatory overflow-y-scroll z-10" // z-10 to be above background video if any, and below potential fixed headers
        style={scrollContainerStyle}
      >
        {gallerySlidesContent.map((slide, index) => (
          <div
            key={index}
            className="h-screen w-full snap-start flex flex-col items-center relative"
          >
            <div
              className={cn(
                "w-full h-full flex flex-col items-center",
                slide.type === 'intro' ? 'justify-between py-10 sm:py-12 md:py-16 lg:py-20' : 
                slide.type === 'image' ? 'justify-start pt-20 sm:pt-24 md:pt-28' : 
                'justify-center p-4 sm:p-6 md:p-10'
              )}
            >
              {slide.type === 'intro' && (
                <div ref={firstSlideIntroContentRef} className="w-full h-full flex flex-col justify-start items-center pt-10 sm:pt-12 md:pt-16 lg:pt-20"> {/* Changed to justify-start and applied padding here */}
                  <div className="max-w-2xl bg-background/70 dark:bg-neutral-900/70 backdrop-blur-sm p-6 rounded-lg shadow-md text-center">
                    <h2
                      className={cn(
                        "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-black dark:text-white transition-all duration-700 ease-out",
                        "[text-shadow:0_0_10px_hsl(var(--accent)/0.5)] dark:[text-shadow:0_0_12px_hsl(var(--accent)/0.6)]", // Subtle glow
                        isFirstSlideIntroVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
                      )}
                    >
                      {slide.title}
                    </h2>
                    <p
                      className={cn(
                        "text-muted-foreground md:text-xl lg:text-2xl transition-opacity duration-700 ease-out",
                        isFirstSlideIntroVisible ? "opacity-100" : "opacity-0"
                      )}
                      style={{ transitionDelay: isFirstSlideIntroVisible ? `150ms` : '0ms' }}
                    >
                      {slide.description}
                    </p>
                  </div>
                  {/* ArrowDownCircle removed */}
                </div>
              )}
              {slide.type === 'image' && (
                <div className="w-full max-w-md p-3 sm:p-4 bg-background/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-lg shadow-xl">
                  <div className="relative aspect-[4/3] shadow-lg rounded-md overflow-hidden bg-muted">
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      data-ai-hint={slide.dataAiHint}
                      priority={index <= 2}
                    />
                  </div>
                  {slide.caption && (
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg text-foreground text-center">
                      {slide.caption}
                    </p>
                  )}
                </div>
              )}
              {slide.type === 'cta' && (
                <div className="bg-background/70 dark:bg-neutral-900/70 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-md">
                  <Link href={slide.href}>
                    <Button size="lg" className="px-6 py-5 text-lg sm:px-8 sm:py-6 sm:text-xl">
                      {slide.buttonText}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
