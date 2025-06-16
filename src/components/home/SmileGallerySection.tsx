// src/components/home/SmileGallerySection.tsx
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDownCircle } from 'lucide-react';

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
  const firstSlideIntroContentRef = useRef<HTMLDivElement>(null); // Ref for the content of the first slide

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isFirstSlideIntroVisible, setIsFirstSlideIntroVisible] = useState(false);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsSectionVisible(true);
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 } 
    );

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      sectionObserver.observe(currentSectionRef);
    }

    // Observer for the first slide's introductory content
    const firstSlideIntroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsFirstSlideIntroVisible(true);
            firstSlideIntroObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 } // Trigger when a bit of the intro content is visible
    );

    const currentFirstSlideIntroRef = firstSlideIntroContentRef.current;
    if (currentFirstSlideIntroRef) {
      firstSlideIntroObserver.observe(currentFirstSlideIntroRef);
    }

    return () => {
      if (currentSectionRef) sectionObserver.unobserve(currentSectionRef);
      if (currentFirstSlideIntroRef) firstSlideIntroObserver.unobserve(currentFirstSlideIntroRef);
    };
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
        "relative w-full bg-background z-20", 
        "initial-fade-in-up",
        isSectionVisible && "is-visible"
      )}
    >
      <div
        ref={scrollContainerRef}
        className="relative snap-y snap-mandatory overflow-y-scroll"
        style={scrollContainerStyle}
      >
        {gallerySlidesContent.map((slide, index) => (
          <div
            key={index}
            className="h-screen w-full snap-start flex flex-col items-center relative text-center"
          >
            {/* Content wrapper for each slide */}
            <div
              className={cn(
                "w-full h-full flex flex-col items-center",
                slide.type === 'intro' ? 'justify-between py-16 md:py-20' : 'justify-center p-6 md:p-10',
              )}
            >
              {slide.type === 'intro' && (
                <div ref={firstSlideIntroContentRef} className="w-full h-full flex flex-col justify-between items-center">
                  {/* Text block for intro: title and description */}
                  <div className="max-w-2xl">
                    <h2
                      className={cn(
                        "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-primary transition-all duration-700 ease-out",
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
                  {/* Arrow icon, pushed to the bottom by justify-between */}
                  <ArrowDownCircle
                    className={cn(
                      "h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto animate-bounce transition-opacity duration-700 ease-out",
                      isFirstSlideIntroVisible ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: isFirstSlideIntroVisible ? `300ms` : '0ms' }}
                  />
                </div>
              )}
              {slide.type === 'image' && (
                <>
                  <div className="relative w-full max-w-3xl aspect-[4/3] shadow-2xl rounded-lg overflow-hidden">
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
