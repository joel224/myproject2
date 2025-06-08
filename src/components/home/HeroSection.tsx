
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null); // Changed from videoRef to imageRef
  const [textVisible, setTextVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false); // Changed from videoVisible to imageVisible

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTextVisible(true);
          textObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageVisible(true);
          imageObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (textRef.current) {
      textObserver.observe(textRef.current);
    }
    if (imageRef.current) { // Observe imageRef
      imageObserver.observe(imageRef.current);
    }

    return () => {
      if (textRef.current) textObserver.unobserve(textRef.current);
      if (imageRef.current) imageObserver.unobserve(imageRef.current); // Unobserve imageRef
    };
  }, []);

  const videoId = "BABoDj2WF34";
  const videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&fs=0&rel=0&vq=hd720`;

  return (
    <section className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex items-center"> {/* Assuming navbar is h-16 (4rem) */}
      {/* Background Video Iframe */}
      {/* Wrapper to help with cover effect for iframe */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <iframe
          src={videoSrc}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ objectFit: 'cover' }} // Not standard for iframe, but some browsers might interpret
                                        // The min-width/min-height with w-auto/h-auto should force cover for 16:9
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          title="Dr. Loji's Dental Hub Background Video"
          allowFullScreen={false}
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>

      {/* Dark Overlay for text readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-[1]" />

      {/* Content Container - positioned above video and overlay */}
      <div className="container relative px-4 md:px-6 z-[2] py-12 md:py-24 lg:py-32">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
          <div
            ref={textRef}
            className={cn(
              "space-y-6",
              "initial-fade-in-left",
              textVisible && "is-visible",
              "text-neutral-100" // Make text light for contrast
            )}
          >
            <h1 className="font-manrope text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your Smile, Our Passion!
            </h1>
            <p className="max-w-[600px] text-neutral-200 md:text-xl"> {/* Lighter text for paragraph */}
              Experience exceptional dental care at Dr. Loji's Dental Hub. We're dedicated to creating healthy, beautiful smiles for life.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/#appointment">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg shadow-lg bg-medicalAccent text-medicalAccent-foreground hover:bg-medicalAccent/90 transition-shadow"
                >
                  Book an Appointment in 30 Seconds
                </Button>
              </Link>
            </div>
          </div>
          <div
            ref={imageRef} // Use imageRef
            className={cn(
              "flex justify-center",
              "initial-fade-in-right",
              imageVisible && "is-visible" // Use imageVisible
            )}
          >
            <Image
              src="https://placehold.co/600x400.png"
              alt="Dental Clinic Highlight"
              width={600}
              height={400}
              className="mx-auto overflow-hidden rounded-xl sm:w-full lg:order-last shadow-xl"
              data-ai-hint="dental team smile" // Updated hint
            />
          </div>
        </div>
      </div>
    </section>
  );
}
