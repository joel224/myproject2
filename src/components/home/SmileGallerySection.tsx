
// src/components/home/SmileGallerySection.tsx
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const galleryImages = [
  {
    src: 'https://placehold.co/800x600.png',
    alt: 'Before and After Smile 1',
    caption: 'Subtle enhancements, big impact.',
    dataAiHint: "smile dental"
  },
  {
    src: 'https://placehold.co/800x600.png',
    alt: 'Before and After Smile 2',
    caption: 'A complete smile makeover.',
    dataAiHint: "dental transformation"
  },
  {
    src: 'https://placehold.co/800x600.png',
    alt: 'Before and After Smile 3',
    caption: 'Brightening for a youthful glow.',
    dataAiHint: "teeth whitening"
  },
];

export function SmileGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsSectionVisible(true);
          observer.unobserve(sectionEl);
        }
      }),
      { threshold: 0.1 }
    );
    observer.observe(sectionEl);
    return () => { if (sectionEl) observer.unobserve(sectionEl); };
  }, []);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className={cn(
        "w-full py-12 md:py-16 lg:py-20 bg-white dark:bg-neutral-900", // Changed background color
        "initial-fade-in-up",
        isSectionVisible && "is-visible"
      )}
    >
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div
          className={cn(
            "text-center mb-8 md:mb-12",
            "initial-fade-in-up transition-all duration-700 ease-out",
            isSectionVisible ? "is-visible" : ""
          )}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-red-600"> {/* Changed text color */}
            Transform Your Smile
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg max-w-xl mx-auto">
            See the stunning results we've achieved for our happy patients.
          </p>
        </div>

        {/* Image Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={cn(
                "group rounded-lg overflow-hidden shadow-lg border border-border/50",
                "initial-fade-in-up transition-all duration-700 ease-out",
                isSectionVisible ? "is-visible" : ""
              )}
              style={{ transitionDelay: `${100 + index * 100}ms` }}
            >
              <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={image.dataAiHint}
                  priority={index < 3}
                />
              </div>
              {image.caption && (
                <div className="p-3 bg-card text-center">
                  <p className="text-sm text-muted-foreground">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div
          className={cn(
            "text-center mt-10 md:mt-12",
            "initial-fade-in-up transition-all duration-700 ease-out",
            isSectionVisible ? "is-visible" : ""
          )}
          style={{ transitionDelay: `${100 + galleryImages.length * 100}ms` }}
        >
          <Link href="/#appointment">
            <Button size="lg" className="px-8 py-6 text-lg">
              Want a smile like this? Book now!
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
