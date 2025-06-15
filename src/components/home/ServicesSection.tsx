// src/components/home/ServicesSection.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, Settings, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const services = [
  { icon: <Zap className="h-6 w-6" />, title: 'General Dentistry' },
  { icon: <Gem className="h-6 w-6" />, title: 'Cosmetic Dentistry' },
  { icon: <Settings className="h-6 w-6" />, title: 'Orthodontics' },
  { icon: <Users className="h-6 w-6" />, title: 'Pediatric Dentistry' },
  { icon: <CheckCircle className="h-6 w-6" />, title: 'Dental Implants' },
  { icon: <Zap className="h-6 w-6" />, title: 'Emergency Care' },
];

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsSectionVisible(true);
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
      id="services"
      ref={sectionRef}
      className={cn(
        "w-full py-16 md:py-20 lg:py-24 bg-secondary/20", // Using secondary color with opacity for background
        "initial-fade-in-up",
        isSectionVisible && "is-visible"
      )}
    >
      <div className="container relative px-4 md:px-6 z-10">
        <div
          className={cn(
            "text-center mb-10 md:mb-12",
            "initial-fade-in-up",
            isSectionVisible && "is-visible"
          )}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">Our Services</h2>
          <p className="mt-3 text-muted-foreground md:text-lg max-w-xl mx-auto">
            Comprehensive dental solutions tailored to your needs.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className={cn(
                "flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out group",
                "bg-card text-card-foreground hover:bg-card/90", // Standard card background and text
                "initial-fade-in-up",
                isSectionVisible && "is-visible"
              )}
              style={{ transitionDelay: isSectionVisible ? `${100 + index * 100}ms` : '0ms' }}
            >
              <CardHeader className="items-center pt-6 pb-3"> {/* Reduced padding */}
                {React.cloneElement(service.icon, {
                  className: cn(service.icon.props.className, "mb-2 group-hover:scale-110 transition-transform text-primary") // Ensure icon color is primary
                })}
                <CardTitle className="text-md font-semibold">{service.title}</CardTitle> {/* Reduced font size */}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
