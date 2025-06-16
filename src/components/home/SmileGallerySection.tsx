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

const NAVBAR_HEIGHT = 64; // Approx 4rem in pixels, adjust if your navbar height differs

export function SmileGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const firstSlideHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstSlideRef = useRef<HTMLDivElement>(null);

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleSlides, setVisibleSlides] = useState<boolean[]>(new Array(gallerySlidesContent.length).fill(false));

  useEffect(() => {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { setIsSectionVisible(true); sectionObserver.unobserve(entry.target); } });
    }, { threshold: 0.1 });

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) sectionObserver.observe(currentSectionRef);

    const slideObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = slideRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index !== -1 && entry.isIntersecting) {
          setVisibleSlides((prev) => { const newVisible = [...prev]; newVisible[index] = true; return newVisible; });
        }
      });
    }, { threshold: 0.5 });
    slideRefs.current.forEach((slideEl) => { if (slideEl) slideObserver.observe(slideEl); });

    const handleHeadingParallax = () => {
      if (!firstSlideHeadingRef.current || !firstSlideRef.current) return;

      const firstSlideRect = firstSlideRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const maxPeekAmount = 80; // How many pixels the heading is offset upwards from its natural position.

      // scrollProgress: 0 when first slide's top is at windowHeight (or below, just entering from bottom)
      // scrollProgress: 1 when first slide's top is at NAVBAR_HEIGHT (fully snapped into view)
      let scrollProgress = 1 - Math.max(0, Math.min(1,
        (firstSlideRect.top - NAVBAR_HEIGHT) / (windowHeight - NAVBAR_HEIGHT)
      ));
      
      // If the slide is above the fully snapped position (scrolled past), keep progress at 1.
      if (firstSlideRect.top < NAVBAR_HEIGHT) {
        scrollProgress = 1;
      }
      // If the slide is completely below the viewport, keep progress at 0.
      if (firstSlideRect.top >= windowHeight) {
        scrollProgress = 0;
      }
      
      // translateY: -maxPeekAmount when progress is 0 (slide at bottom, heading peeks up)
      // translateY: 0 when progress is 1 (slide snapped, heading in natural position)
      let translateY = -maxPeekAmount * (1 - scrollProgress);
      
      // Ensure translateY does not go positive (pushing heading down beyond its natural spot)
      translateY = Math.min(0, translateY);

      firstSlideHeadingRef.current.style.transform = `translateY(${translateY}px)`;
    };

    window.addEventListener('scroll', handleHeadingParallax, { passive: true });
    handleHeadingParallax(); // Initial call

    return () => {
      if (currentSectionRef) sectionObserver.unobserve(currentSectionRef);
      slideRefs.current.forEach((slideEl) => { if (slideEl) slideObserver.unobserve(slideEl); });
      window.removeEventListener('scroll', handleHeadingParallax);
      // Reset transform on unmount if needed
      if(firstSlideHeadingRef.current) firstSlideHeadingRef.current.style.transform = 'translateY(0px)';
    };
  }, []); // Empty dependency array, scroll listener handles updates

  const numSlides = gallerySlidesContent.length;

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative w-full bg-background z-20" // z-20 to be above sticky dentist card (z-10)
    >
      <div
        ref={scrollContainerRef}
        className="relative snap-y snap-mandatory overflow-y-scroll"
        style={{ height: `${numSlides * 100}vh` }}
      >
        {gallerySlidesContent.map((slide, index) => {
          const currentSlideRef = index === 0 ? firstSlideRef : null;
          const combinedRef = (el: HTMLDivElement | null) => {
            slideRefs.current[index] = el;
            if (index === 0 && currentSlideRef) {
              (currentSlideRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }
          };

          return (
            <div
              key={index}
              ref={combinedRef}
              className={cn(
                "h-screen w-full snap-start flex flex-col items-center justify-center p-4 md:p-8 relative text-center",
                "initial-fade-in-up",
                visibleSlides[index] && "is-visible" // Handles fade-in for the slide content
              )}
              style={{ 
                transitionProperty: 'opacity, transform', // Ensure transform transitions are smooth if coming from initial-fade-in-up
                transitionDuration: '0.6s',
                transitionTimingFunction: 'ease-out',
                transitionDelay: visibleSlides[index] ? `0ms` : '0ms' 
              }}
            >
              {slide.type === 'intro' && (
                <div className="max-w-2xl">
                  <h2 
                    ref={firstSlideHeadingRef}
                    className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-primary"
                    style={{ transition: 'transform 0.15s linear' }} // Added transition for smoother parallax
                  >
                    {slide.title}
                  </h2>
                  <p className="text-muted-foreground md:text-xl lg:text-2xl mb-8">
                    {slide.description}
                  </p>
                  <ArrowDownCircle className="h-12 w-12 text-primary animate-bounce mx-auto" />
                </div>
              )}
              {slide.type === 'image' && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-3xl aspect-[4/3] shadow-2xl rounded-lg overflow-hidden">
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill // Changed from layout="fill" and objectFit to Next 13+ fill prop
                      style={{ objectFit: 'cover' }} // objectFit is now a style prop
                      data-ai-hint={slide.dataAiHint}
                    />
                  </div>
                  {slide.caption && (
                    <p className="mt-4 text-lg text-foreground bg-background/70 backdrop-blur-sm px-4 py-2 rounded-md shadow">
                      {slide.caption}
                    </p>
                  )}
                </div>
              )}
              {slide.type === 'cta' && (
                <Link href={slide.href}>
                  <Button size="lg" className="px-8 py-6 text-xl sm:px-10 sm:text-2xl">
                    {slide.buttonText}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
