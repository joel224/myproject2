
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [textVisible, setTextVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);

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

    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVideoVisible(true);
          videoObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (textRef.current) {
      textObserver.observe(textRef.current);
    }
    if (videoRef.current) {
      videoObserver.observe(videoRef.current);
    }

    return () => {
      if (textRef.current) textObserver.unobserve(textRef.current);
      if (videoRef.current) videoObserver.unobserve(videoRef.current);
    };
  }, []);

  const videoId = "BABoDj2WF34"; // YouTube Video ID
  const videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&fs=0&rel=0&vq=hd720`;

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
          <div
            ref={textRef}
            className={cn(
              "space-y-6",
              "initial-fade-in-left",
              textVisible && "is-visible"
            )}
          >
            <h1 className="font-manrope text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground">
              Your Smile, Our Passion!
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
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
            className={cn(
              "flex justify-center",
              "initial-fade-in-right",
              videoVisible && "is-visible"
            )}
          >
            <iframe
              ref={videoRef}
              src={videoSrc}
              width="600"
              height="400"
              className="mx-auto overflow-hidden rounded-xl sm:w-full lg:order-last shadow-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              title="Dr. Loji's Dental Hub Video"
              allowFullScreen={false} // Explicitly false
              sandbox="allow-scripts allow-same-origin allow-presentation" // Allow presentation for YouTube embeds
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
