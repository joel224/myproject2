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
  { ssr: false, loading: () => <div className="absolute inset-0 w-full h-full bg-black/30" /> }
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
  const firstSlideHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstSlideParagraphRef = useRef<HTMLParagraphElement>(null);
  const videoBackgroundLayerRef = useRef<HTMLDivElement>(null); 

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isFirstSlideVisible, setIsFirstSlideVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && (setIsSectionVisible(true), sectionObserver.unobserve(entry.target))),
      { threshold: 0.05 }
    );
    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) sectionObserver.observe(currentSectionRef);
    return () => { if (currentSectionRef) sectionObserver.unobserve(currentSectionRef) };
  }, []);

  useEffect(() => {
    const firstSlideContentObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && (setIsFirstSlideVisible(true), firstSlideContentObserver.unobserve(entry.target))),
      { threshold: 0.1 }
    );
    const currentFirstSlideRef = firstSlideRef.current;
    if (currentFirstSlideRef) firstSlideContentObserver.observe(currentFirstSlideRef);
    return () => { if (currentFirstSlideRef) firstSlideContentObserver.unobserve(currentFirstSlideRef) };
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const videoLayer = videoBackgroundLayerRef.current;

    if (!isMobile || !scrollContainer || !videoLayer) {
      if (videoLayer) videoLayer.style.transform = '';
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      videoLayer.style.transform = `translateY(${-scrollTop * 0.3}px)`;
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (videoLayer) videoLayer.style.transform = ''; 
    };
  }, [isMobile]); 

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
        "relative w-full bg-background z-20 overflow-hidden", 
        "initial-fade-in-up",
        isSectionVisible && "is-visible"
      )}
    >
      {isMobile && (
        <div 
          ref={videoBackgroundLayerRef} 
          className="absolute inset-0 w-full h-full z-[-1]" 
        >
          <MuxPlayer
            playbackId={MOBILE_GALLERY_VIDEO_PLAYBACK_ID}
            autoPlay
            loop
            muted
            playsInline
            noControls
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </div>
      )}
      <div
        ref={scrollContainerRef}
        className="relative snap-y snap-mandatory overflow-y-scroll z-10" 
        style={scrollContainerStyle}
      >
        {gallerySlidesContent.map((slide, index) => (
          <div
            key={index}
            ref={index === 0 ? firstSlideRef : null}
            className="h-screen w-full snap-start flex flex-col items-center relative text-center"
          >
            <div 
              className={cn(
                "w-full h-full flex flex-col items-center",
                slide.type === 'intro' ? 'justify-between py-16 md:py-20' : 'justify-center p-6 md:p-10',
              )}
            >
              {slide.type === 'intro' && (
                <div className="w-full h-full flex flex-col justify-between items-center">
                  <div className="max-w-2xl">
                    <h2
                      ref={firstSlideHeadingRef}
                      className={cn(
                        "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-primary transition-all duration-700 ease-out",
                        isFirstSlideVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
                      )}
                    >
                      {slide.title}
                    </h2>
                    <p
                      ref={firstSlideParagraphRef}
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
                <>
                  <div className="relative w-full max-w-3xl aspect-[4/3] shadow-2xl rounded-lg overflow-hidden bg-black/10">
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
                    <p className="mt-4 text-lg text-foreground bg-background/70 backdrop-blur-sm px-4 py-2 rounded-md shadow">
                      {slide.caption}
                    </p>
                  )}
                </>
              )}
              {slide.type === 'cta' && (
                <Link href={slide.href}>
                  <Button size="lg" className="px-8 py-6 text-xl sm:px-10 sm:text-2xl">
                    {slide.buttonText}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
