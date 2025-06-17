
// src/components/home/SmileGallerySection.tsx
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDownCircle } from 'lucide-react';
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
  const firstSlideRef = useRef<HTMLDivElement>(null);
  const videoBackgroundLayerRef = useRef<HTMLDivElement>(null);


  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isFirstSlideVisible, setIsFirstSlideVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsSectionVisible(true);
          sectionObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.05 } // Trigger when 5% of the section is visible
    );
    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) sectionObserver.observe(currentSectionRef);
    return () => { if (currentSectionRef) sectionObserver.unobserve(currentSectionRef); };
  }, []);

  useEffect(() => {
    const firstSlideContentObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsFirstSlideVisible(true);
          firstSlideContentObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.1 } // Trigger when 10% of the first slide's content area is visible
    );
    const currentFirstSlideRef = firstSlideRef.current;
    if (currentFirstSlideRef) firstSlideContentObserver.observe(currentFirstSlideRef);
    return () => { if (currentFirstSlideRef) firstSlideContentObserver.unobserve(currentFirstSlideRef); };
  }, []);


  const numSlides = gallerySlidesContent.length;
  const scrollContainerStyle = {
    '--num-slides': numSlides,
    height: `calc(var(--num-slides) * 100vh)`, // Each slide takes 100% of viewport height
  } as React.CSSProperties;

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className={cn(
        "relative w-full bg-background z-20", // Main section, z-20 to be above dentist card
        "initial-fade-in-up",
        isSectionVisible && "is-visible"
      )}
    >
      {isMobile && (
        <div
          ref={videoBackgroundLayerRef}
          className="sticky top-0 left-0 w-full h-screen z-[-1] overflow-hidden" // Sticky video layer, behind slides
        >
          <MuxPlayer
            playbackId={MOBILE_GALLERY_VIDEO_PLAYBACK_ID}
            autoPlay
            loop
            muted
            playsInline
            noControls
            className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover" // Ensure cover and fill
          />
        </div>
      )}
      <div
        ref={scrollContainerRef}
        className="relative snap-y snap-mandatory overflow-y-scroll z-10" // Slides container, above sticky video
        style={scrollContainerStyle}
      >
        {gallerySlidesContent.map((slide, index) => (
          <div
            key={index}
            ref={index === 0 ? firstSlideRef : null}
            className="h-screen w-full snap-start flex flex-col items-center relative" // Each slide is full screen
          >
            <div
              className={cn(
                "w-full h-full flex flex-col items-center",
                // Adjust justification and padding for different slide types
                slide.type === 'intro' ? 'justify-between py-10 sm:py-12 md:py-16 lg:py-20' : 'justify-center p-4 sm:p-6 md:p-10',
              )}
            >
              {slide.type === 'intro' && (
                // This inner div is needed for justify-between to work correctly with padding on the parent
                <div className="w-full h-full flex flex-col justify-between items-center">
                  <div className="max-w-2xl bg-background/70 dark:bg-neutral-900/70 backdrop-blur-sm p-6 rounded-lg shadow-md">
                    <h2
                      className={cn(
                        "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-primary transition-all duration-700 ease-out",
                        isFirstSlideVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
                      )}
                    >
                      {slide.title}
                    </h2>
                    <p
                      className={cn(
                        "text-muted-foreground md:text-xl lg:text-2xl transition-opacity duration-700 ease-out",
                        isFirstSlideVisible ? "opacity-100" : "opacity-0"
                      )}
                      style={{ transitionDelay: isFirstSlideVisible ? `150ms` : '0ms' }}
                    >
                      {slide.description}
                    </p>
                  </div>
                  <ArrowDownCircle
                    className={cn(
                      "h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto animate-bounce transition-opacity duration-700 ease-out",
                      isFirstSlideVisible ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: isFirstSlideVisible ? `300ms` : '0ms' }}
                  />
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
                      priority={index <= 2} // Prioritize loading for early slides
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
