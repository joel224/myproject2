// src/components/home/SmileGallerySection.tsx
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Spline from '@splinetool/react-spline';

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
    <section
      id="smile-gallery"
      ref={sectionRef}
      className={cn(
        "w-full py-12 md:py-16 lg:py-20 bg-white dark:bg-black",
        "initial-fade-in",
        isVisible && "is-visible"
      )}
    >
      <div className="container px-4 md:px-6">
        <div
          className={cn(
            "text-center mb-10 md:mb-12",
            "initial-fade-in-up",
            isVisible && "is-visible"
          )}
          style={{ transitionDelay: '100ms' }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Our Smile Gallery
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg max-w-xl mx-auto">
            Explore our work in an interactive 3D experience.
          </p>
        </div>
        
        <div 
          className={cn(
            "relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden border shadow-2xl",
            "initial-fade-in-up",
            isVisible && "is-visible"
          )}
          style={{ transitionDelay: '200ms' }}
        >
          <Suspense fallback={<Skeleton className="w-full h-full" />}>
             <Spline
                scene="https://prod.spline.design/oFWtsc1gZoGGwDxB/scene.splinecode" 
              />
          </Suspense>
        </div>

        <div 
          className={cn(
            "mt-12 text-center",
            "initial-fade-in-up",
            isVisible && "is-visible"
          )}
          style={{ transitionDelay: '500ms' }}
        >
          <Link href="/#appointment">
            <Button size="lg" className="px-8 py-6 text-lg shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-shadow">
              Want a smile like this? Book now!
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
