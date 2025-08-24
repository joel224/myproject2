// src/components/home/SmileGallerySection.tsx
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { MuxPlayerProps } from '@mux/mux-player-react';

const MuxPlayer = dynamic<MuxPlayerProps>(
  () => import('@mux/mux-player-react').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="w-full aspect-square bg-muted animate-pulse" /> }
);

// Placeholder playback IDs. Replace these with your actual video IDs.
const videoPlaybackIds = [
  "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU",
  "D3mIJKP4RyoacfufEKanS3gcEKo95gzWJjlzkfPMLUk",
  "cbfCGJ7UGeVzI3SLW4xt2fEgTANh7uHd8C3E00QuAnDU" 
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
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-red-600 dark:text-red-700 [text-shadow:0_1px_3px_rgb(255_182_193_/_50%)]">
            Book Your Smile
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg max-w-xl mx-auto">
            See the stunning results we've achieved for our happy patients.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 justify-center">
          {videoPlaybackIds.map((playbackId, index) => (
            <div 
              key={index} 
              className={cn(
                'initial-fade-in-up w-full aspect-square overflow-hidden rounded-lg shadow-lg',
                'md:block',
                isVisible && "is-visible"
              )}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <MuxPlayer
                playbackId={playbackId}
                autoPlay="muted"
                loop
                noControls
                className="w-full h-full object-cover"
              />
            </div>
          ))}
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
