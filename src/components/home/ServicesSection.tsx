// src/components/home/ServicesSection.tsx
'use client';

import React from 'react'; // Removed unused useEffect, useRef, useState, useCallback
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
// Removed: import type { MuxPlayerRefAttributes } from '@mux/mux-player-react'; // Not needed for simple autoplay

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
  // All custom hooks (useEffect, useState, useRef) and scroll/visibility logic are removed for this test.

  return (
    <section
      id="services"
      className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden min-h-[70vh] md:min-h-[80vh]"
    >
      <div
        className="absolute top-0 left-0 w-full h-full z-[-10] pointer-events-none" // Parallax effect styling (transform) removed
      >
        <MuxPlayer
          playbackId={MUX_PLAYBACK_ID}
          muted={true}       // Ensure muted for autoplay policies
          loop={true}        // Ensure loop
          playsInline={true}   // Good practice for mobile
          noControls={true}  // Hide default controls
          autoPlay={true}    // Attempt autoplay
          className="w-full h-full object-cover"
          // Removed onLoadedData as no custom logic depends on it now
        />
      </div>
      <div className="absolute inset-0 w-full h-full bg-black/70 z-[-5]"></div>

      <div className="container relative px-4 md:px-6 z-10">
        <div
          className={cn(
            "text-center mb-10 md:mb-12",
            // Forcing visibility for animation testing during this simplified state
            "initial-fade-in-up is-visible" 
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
                // Forcing visibility for animation testing
                "initial-fade-in-up is-visible" 
              )}
              style={{ transitionDelay: `_DONT_WRAP_${200 + index * 100}ms_DONT_WRAP_` }} // Stagger effect
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
