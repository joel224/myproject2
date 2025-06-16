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
  const firstSlideParentRef = useRef<HTMLDivElement>(null); // Ref for the first slide's container

  const [isSectionVisible, setIsSectionVisible] = useState(false); // For overall section fade-in
  const [isFirstSlideIntersecting, setIsFirstSlideIntersecting] = useState(false); // For heading animation

  // Refs for individual slide content fade-in (excluding the special first slide heading)
  const slideContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleSlideContents, setVisibleSlideContents] = useState<boolean[]>(new Array(gallerySlidesContent.length).fill(false));

  useEffect(() => {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { setIsSectionVisible(true); sectionObserver.unobserve(entry.target); } });
    }, { threshold: 0.05 }); // Trigger when a tiny bit is visible

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) sectionObserver.observe(currentSectionRef);

    // Observer for the first slide parent to trigger heading animation
    const firstSlideObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsFirstSlideIntersecting(entry.isIntersecting);
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the first slide is visible
    );

    const currentFirstSlideParentRef = firstSlideParentRef.current;
    if (currentFirstSlideParentRef) {
      firstSlideObserver.observe(currentFirstSlideParentRef);
    }

    // Observer for individual slide contents (images, CTA)
    const slideContentObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = slideContentRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index !== -1 && entry.isIntersecting) {
          setVisibleSlideContents((prev) => { const newVisible = [...prev]; newVisible[index] = true; return newVisible; });
          // Optionally unobserve if you want the fade-in to happen only once per slide content
          // slideContentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 }); // Trigger when 50% of the slide content area is visible

    slideContentRefs.current.forEach((slideEl) => { if (slideEl) slideContentObserver.observe(slideEl); });

    return () => {
      if (currentSectionRef) sectionObserver.unobserve(currentSectionRef);
      if (currentFirstSlideParentRef) firstSlideObserver.unobserve(currentFirstSlideParentRef);
      slideContentRefs.current.forEach((slideEl) => { if (slideEl) slideContentObserver.unobserve(slideEl); });
    };
  }, []);

  const numSlides = gallerySlidesContent.length;

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className={cn(
        "relative w-full bg-background z-20", // Ensures it scrolls over the sticky dentist card
        "initial-fade-in-up", // For the whole section container
        isSectionVisible && "is-visible"
      )}
    >
      <div
        ref={scrollContainerRef}
        className="relative snap-y snap-mandatory overflow-y-scroll"
        style={{ height: `${numSlides * 100}vh` }}
      >
        {gallerySlidesContent.map((slide, index) => (
          <div
            key={index}
            ref={index === 0 ? firstSlideParentRef : null} // Only the first slide gets this special ref
            className={cn(
              "h-screen w-full snap-start flex flex-col items-center justify-center p-4 md:p-8 relative text-center"
              // Fade-in for the slide's *overall container* if needed, but content fade is more granular
            )}
          >
            {/* Div to observe for content fade-in (excluding special heading animation) */}
            <div
              ref={(el) => (slideContentRefs.current[index] = el)}
              className={cn(
                "w-full h-full flex flex-col items-center justify-center",
                // Apply fade-in to content wrapper, not the snapping slide div itself
                slide.type !== 'intro' && "initial-fade-in-up", // Don't apply to intro's wrapper as heading has its own
                slide.type !== 'intro' && visibleSlideContents[index] && "is-visible"
              )}
              style={slide.type !== 'intro' ? { transitionDelay: visibleSlideContents[index] ? `150ms` : '0ms' } : {}}
            >
              {slide.type === 'intro' && (
                <div className="max-w-2xl">
                  <h2
                    className={cn(
                      "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-primary transition-all duration-700 ease-out",
                      isFirstSlideIntersecting ? "translate-y-0 opacity-100" : "-translate-y-[80px] opacity-0"
                    )}
                  >
                    {slide.title}
                  </h2>
                  <p className={cn(
                      "text-muted-foreground md:text-xl lg:text-2xl mb-8 transition-opacity duration-700 ease-out",
                      isFirstSlideIntersecting ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: isFirstSlideIntersecting ? `150ms` : '0ms' }}
                  >
                    {slide.description}
                  </p>
                  <ArrowDownCircle
                    className={cn(
                      "h-12 w-12 text-primary mx-auto animate-bounce transition-opacity duration-700 ease-out",
                      isFirstSlideIntersecting ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: isFirstSlideIntersecting ? `300ms` : '0ms' }}
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
                      priority={index <= 2} // Prioritize loading for the first few images
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
