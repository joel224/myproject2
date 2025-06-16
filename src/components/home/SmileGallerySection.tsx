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
  const firstSlideRef = useRef<HTMLDivElement>(null); // Ref for the first slide

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isFirstSlideVisible, setIsFirstSlideVisible] = useState(false); // For the first slide's content animation

  // Refs for individual slide content wrappers for staggered animation
  const slideContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleSlideContents, setVisibleSlideContents] = useState<boolean[]>(
    new Array(gallerySlidesContent.length).fill(false)
  );


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
      { threshold: 0.05 } // Trigger when 5% of the section is visible
    );

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      sectionObserver.observe(currentSectionRef);
    }

    // Observer for the first slide itself (the one with "Transform Your Smile")
    const firstSlideObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsFirstSlideVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 } // Adjust threshold as needed for when the "peeking" animation should start
    );

    const currentFirstSlideRef = firstSlideRef.current;
    if (currentFirstSlideRef) {
      firstSlideObserver.observe(currentFirstSlideRef);
    }

    // Observer for individual slide contents (images, CTA)
    const slideContentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = slideContentRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1 && entry.isIntersecting) {
            setVisibleSlideContents((prev) => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
            // Optionally unobserve after first intersection if animation is once-off
            // slideContentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the slide content is visible
    );

    slideContentRefs.current.forEach((slideEl) => {
      if (slideEl) {
        slideContentObserver.observe(slideEl);
      }
    });


    return () => {
      if (currentSectionRef) {
        sectionObserver.unobserve(currentSectionRef);
      }
      if (currentFirstSlideRef) {
        firstSlideObserver.unobserve(currentFirstSlideRef);
      }
      slideContentRefs.current.forEach((slideEl) => {
        if (slideEl) {
          slideContentObserver.unobserve(slideEl);
        }
      });
    };
  }, []); // Empty dependency array to run once on mount

  const numSlides = gallerySlidesContent.length;

  // CSS variable for the number of slides to control scroll container height
  const scrollContainerStyle = {
    '--num-slides': numSlides,
    height: `calc(var(--num-slides) * 100vh)`, // Dynamic height based on number of slides
  } as React.CSSProperties;

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className={cn(
        "relative w-full bg-background z-20", // Ensure it has a background to cover the sticky section
        "initial-fade-in-up", // General fade-in for the whole section
        isSectionVisible && "is-visible"
      )}
    >
      <div
        ref={scrollContainerRef}
        className="relative snap-y snap-mandatory overflow-y-scroll"
        style={scrollContainerStyle} // Use the dynamic style here
      >
        {gallerySlidesContent.map((slide, index) => (
          <div
            key={index}
            ref={index === 0 ? firstSlideRef : null} // Attach ref to the first slide
            className={cn(
              "h-screen w-full snap-start flex flex-col items-center relative text-center"
            )}
          >
            {/* This inner div is for the content of each slide and its animation */}
            <div
              ref={(el) => (slideContentRefs.current[index] = el)}
              className={cn(
                "w-full h-full flex flex-col items-center",
                // Apply justify-between for the intro slide to push text up and arrow down
                slide.type === 'intro'
                  ? 'justify-between py-16 md:py-20'
                  : 'justify-center', // Center content for image/CTA slides
                // Animation for non-intro slides, or intro slide if it's not the *very first* content (though here it is)
                (slide.type !== 'intro' || index !== 0) && "initial-fade-in-up",
                visibleSlideContents[index] && (slide.type !== 'intro' || index !== 0) && "is-visible"
              )}
              style={(slide.type !== 'intro' || index !== 0) ? { transitionDelay: visibleSlideContents[index] ? `150ms` : '0ms' } : {}}
            >
              {slide.type === 'intro' && (
                <>
                  {/* Text block for intro: title and description */}
                  <div className="max-w-2xl">
                    <h2
                      className={cn(
                        "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-primary transition-all duration-700 ease-out",
                        isFirstSlideVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0" // Slide down and fade in
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
                  {/* Arrow icon, pushed to the bottom by justify-between */}
                  <ArrowDownCircle
                    className={cn(
                      "h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto animate-bounce transition-opacity duration-700 ease-out",
                      isFirstSlideVisible ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: isFirstSlideVisible ? `300ms` : '0ms' }}
                  />
                </>
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
                      priority={index <= 2} // Prioritize loading for early slides
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
