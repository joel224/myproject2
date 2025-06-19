
// src/components/home/SmileGallerySection.tsx
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { MuxPlayerProps } from '@mux/mux-player-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MuxPlayer = dynamic<MuxPlayerProps>(
  () => import('@mux/mux-player-react').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="absolute inset-0 w-full h-full bg-black/50" /> }
);

const MOBILE_GALLERY_VIDEO_PLAYBACK_ID = "d6029nUGS7fZ00W027QSUwzd01GtdUAyLC01qd02CaPX2t00Cc";

interface SlideContent {
  type: 'intro' | 'image' | 'cta' | 'image-gallery';
  title?: string;
  description?: string;
  src?: string;
  alt?: string;
  caption?: string;
  dataAiHint?: string;
  buttonText?: string;
  href?: string;
  images?: Array<Extract<typeof gallerySlidesContent[0], { type: 'image' }>>; // For image-gallery
}

const gallerySlidesContent: Array<Extract<SlideContent, { type: 'intro' | 'image' | 'cta' }>> = [
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

  const renderableSections = useMemo(() => {
    const processedSections: SlideContent[] = [];
    const imageItems: Array<Extract<typeof gallerySlidesContent[0], { type: 'image' }>> = [];

    gallerySlidesContent.forEach(slide => {
      if (slide.type === 'image') {
        imageItems.push(slide);
      } else {
        if (slide.type === 'intro') {
          processedSections.push(slide);
        }
      }
    });

    if (imageItems.length > 0) {
      processedSections.push({
        type: 'image-gallery',
        title: 'Patient Transformations', // Title for the gallery
        images: imageItems,
      });
    }
    
    const ctaSlide = gallerySlidesContent.find(slide => slide.type === 'cta');
    if (ctaSlide) {
        processedSections.push(ctaSlide);
    }


    return processedSections;
  }, []);


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


  const numSlides = renderableSections.length;
  const scrollContainerStyle = {
    '--num-slides': numSlides,
    height: `calc(var(--num-slides) * 100vh)`,
  } as React.CSSProperties;

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className={cn(
        "relative w-full bg-background z-20",
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
           <div className="absolute inset-0 bg-black/30"></div> {/* Dimming overlay for video */}
        </div>
      )}
      <div
        ref={scrollContainerRef}
        className="relative snap-y snap-mandatory overflow-y-scroll z-10"
        style={scrollContainerStyle}
      >
        {renderableSections.map((section, index) => (
          <div
            key={index} // Use index for key as section structure might change
            className="h-screen w-full snap-start flex flex-col items-center relative"
          >
            <div
              className={cn(
                "w-full h-full flex flex-col items-center",
                section.type === 'intro' ? 'justify-start py-10 sm:py-12 md:pt-16 lg:pt-20' :
                section.type === 'image-gallery' ? 'justify-center p-4' : // CTA or other types
                'justify-center p-4 sm:p-6 md:p-10'
              )}
            >
              {section.type === 'intro' && (
                <div ref={firstSlideIntroContentRef} className="w-full h-full flex flex-col justify-start items-center pt-10 sm:pt-12 md:pt-16 lg:pt-20">
                  <div className="max-w-2xl bg-background/70 dark:bg-neutral-900/70 backdrop-blur-sm p-6 rounded-lg shadow-md text-center">
                    <h2
                      className={cn(
                        "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-black dark:text-white transition-all duration-700 ease-out",
                        "[text-shadow:0_0_10px_hsl(var(--accent)/0.5)] dark:[text-shadow:0_0_12px_hsl(var(--accent)/0.6)]",
                        isFirstSlideIntroVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
                      )}
                    >
                      {section.title}
                    </h2>
                    <p
                      className={cn(
                        "text-muted-foreground md:text-xl lg:text-2xl transition-opacity duration-700 ease-out",
                        isFirstSlideIntroVisible ? "opacity-100" : "opacity-0"
                      )}
                      style={{ transitionDelay: isFirstSlideIntroVisible ? `150ms` : '0ms' }}
                    >
                      {section.description}
                    </p>
                  </div>
                </div>
              )}

              {section.type === 'image-gallery' && section.images && (
                <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center h-full p-4">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 md:mb-8 text-center text-foreground bg-background/70 dark:bg-neutral-900/70 backdrop-blur-sm px-4 py-2 rounded-md shadow">
                    {section.title || 'Patient Smiles'}
                  </h2>
                  {/* Mobile: Horizontal Scroll */}
                  <div className="md:hidden flex flex-row overflow-x-auto space-x-4 p-2 w-full items-center scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
                    {section.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="flex-shrink-0 w-64 h-auto sm:w-72 bg-background/70 dark:bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-xl p-3">
                        <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-muted">
                          <Image
                            src={image.src!}
                            alt={image.alt!}
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint={image.dataAiHint}
                            priority={imgIndex < 2}
                          />
                        </div>
                        {image.caption && <p className="mt-2 text-xs sm:text-sm text-center text-foreground">{image.caption}</p>}
                      </div>
                    ))}
                  </div>
                  {/* Desktop: Grid */}
                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
                    {section.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="w-full bg-background/70 dark:bg-neutral-900/80 backdrop-blur-sm rounded-lg shadow-xl p-3">
                        <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-muted">
                           <Image
                            src={image.src!}
                            alt={image.alt!}
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint={image.dataAiHint}
                            priority={imgIndex < 2}
                          />
                        </div>
                        {image.caption && <p className="mt-2 text-sm text-center text-foreground">{image.caption}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section.type === 'cta' && (
                <div className="bg-background/70 dark:bg-neutral-900/70 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-md">
                  <Link href={section.href!}>
                    <Button size="lg" className="px-6 py-5 text-lg sm:px-8 sm:py-6 sm:text-xl">
                      {section.buttonText}
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
    
