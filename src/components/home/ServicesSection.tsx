
// src/components/home/ServicesSection.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

const services = [
  { icon: <Zap className="h-10 w-10" />, title: 'General Dentistry' },
  { icon: <Gem className="h-10 w-10" />, title: 'Cosmetic Dentistry' },
  { icon: <Settings className="h-10 w-10" />, title: 'Orthodontics' },
  { icon: <Users className="h-10 w-10" />, title: 'Pediatric Dentistry' },
  { icon: <CheckCircle className="h-10 w-10" />, title: 'Dental Implants' },
  { icon: <Zap className="h-10 w-10" />, title: 'Emergency Care' },
];

const MUX_PLAYBACK_ID = "1BDuplVB02AJgtBfToI1kc3S4ITsqCI4b2H3uuTvpz00I";

export function ServicesSection() {
  const playerRef = React.useRef<MuxPlayerRefAttributes>(null);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  // All state related to scroll, visibility, player readiness for custom control is removed for this diagnostic step.

  // All useEffects related to scroll handling and intersection observer are removed for this diagnostic step.

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[70vh] md:min-h-[80vh]"
    >
      <div
        className="absolute top-0 left-0 w-full h-full z-[-10] pointer-events-none"
      >
        <MuxPlayer
          ref={playerRef}
          playbackId={MUX_PLAYBACK_ID}
          muted={true}
          loop={true}
          autoPlay={true} // Basic autoplay
          playsInline={true}
          noControls={true} // Hide default controls
          className="w-full h-full object-cover"
          // Extensive logging for diagnostics
          onPlayerReady={() => console.log('Services MuxPlayer: Player is ready.')}
          onLoadedData={() => console.log('Services MuxPlayer: Video data has been loaded.')}
          onLoadedMetadata={() => console.log('Services MuxPlayer: Video metadata has been loaded.')}
          onCanPlay={() => console.log('Services MuxPlayer: Browser reports it can play the video.')}
          onPlay={() => console.log('Services MuxPlayer: Play event triggered.')}
          onPlaying={() => console.log('Services MuxPlayer: Playing event triggered (playback has started).')}
          onPause={() => console.log('Services MuxPlayer: Pause event triggered.')}
          onSeeking={() => console.log('Services MuxPlayer: Seeking event.')}
          onSeeked={() => console.log('Services MuxPlayer: Seeked event.')}
          onTimeUpdate={(evt) => {
            if (evt.target.currentTime > 0 && evt.target.currentTime < 2) { // Log for first 2 seconds
              console.log('Services MuxPlayer: TimeUpdate - ', evt.target.currentTime);
            }
          }}
          onRateChange={() => console.log('Services MuxPlayer: RateChange event - new rate:', playerRef.current?.playbackRate)}
          onError={(e) => console.error('Services MuxPlayer: Error event:', e.detail)}
          onEnded={() => console.log('Services MuxPlayer: Ended event.')}
        />
      </div>
      <div className="absolute inset-0 w-full h-full bg-black/70 z-[-5]"></div>

      <div className="container relative px-4 md:px-6 z-10">
        <div
          className={cn(
            "text-center mb-10 md:mb-12",
            "initial-fade-in-up is-visible" // Assume visible for this basic test
          )}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Our Services</h2>
          <p className="mt-3 text-neutral-300 md:text-lg max-w-xl mx-auto">
            Comprehensive dental solutions tailored to your needs.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className={cn(
                "flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out group",
                "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
                "initial-fade-in-up is-visible" // Assume visible for this basic test
              )}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <CardHeader className="items-center pt-8 pb-4">
                {React.cloneElement(service.icon, {
                  className: cn(service.icon.props.className, "mb-3 group-hover:scale-110 transition-transform text-white")
                })}
                <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
