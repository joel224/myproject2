
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const galleryImages = [
  { src: 'https://placehold.co/600x400.png', alt: 'Before and After Smile 1', dataAiHint: "smile dental" },
  { src: 'https://placehold.co/600x400.png', alt: 'Before and After Smile 2', dataAiHint: "dental transformation" },
  { src: 'https://placehold.co/600x400.png', alt: 'Before and After Smile 3', dataAiHint: "teeth whitening" },
];

export function SmileGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
    };
  }, []);

  return (
    <section id="gallery" ref={sectionRef} className="w-full py-12 md:py-16 lg:py-20 bg-background">
      <div className="container px-4 md:px-6 text-center">
        <div className={cn("initial-fade-in-up", isVisible && "is-visible")} style={{ transitionDelay: isVisible ? `0ms` : '0ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-primary">Transform Your Smile</h2>
          <p className="text-muted-foreground md:text-lg mb-10 max-w-xl mx-auto">
            See the stunning results we've achieved for our happy patients.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {galleryImages.map((image, index) => (
            <Card
              key={index}
              className={cn(
                "overflow-hidden shadow-lg hover:shadow-xl transition-shadow",
                "initial-fade-in-up",
                isVisible && "is-visible"
              )}
              style={{ transitionDelay: isVisible ? `${100 + index * 100}ms` : '0ms' }}
            >
              <CardContent className="p-0">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={400}
                  className="object-cover w-full h-64"
                  data-ai-hint={image.dataAiHint}
                />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className={cn("initial-fade-in-up", isVisible && "is-visible")} style={{ transitionDelay: isVisible ? `${100 + galleryImages.length * 100}ms` : '0ms' }}>
          <Link href="/#appointment">
            <Button className="px-6 py-3 text-base sm:px-8 sm:text-lg">
              Want a smile like this? Book now!
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
