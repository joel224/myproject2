
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PhoneCall, CalendarPlus, Video, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const actions = [
  {
    icon: <PhoneCall className="h-8 w-8 text-destructive" />,
    title: 'Emergency',
    description: 'Toothache? Tap Here!',
    href: 'tel:+1234567890', 
    buttonText: 'Call Now',
    variant: 'destructive' as const,
  },
  {
    icon: <CalendarPlus className="h-8 w-8 text-primary" />,
    title: 'Book Appointment',
    description: 'Schedule your visit easily.',
    href: '/#appointment', 
    buttonText: 'Book Now',
    variant: 'default' as const,
  },
  {
    icon: <Video className="h-8 w-8 text-primary" />,
    title: 'Virtual Consultation',
    description: 'Meet our dentists online.',
    href: '/virtual-consultation', 
    buttonText: 'Start Video Call',
    variant: 'outline' as const,
  },
  {
    icon: <LogIn className="h-8 w-8 text-primary" />,
    title: 'Patient Login',
    description: 'Access records & payments.',
    href: '/login', 
    buttonText: 'Login',
    variant: 'outline' as const,
  },
];

export function QuickActionsGrid() {
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      id="quick-actions"
      ref={sectionRef}
      className={cn(
        "w-full py-12 md:py-16 lg:py-20 bg-background",
        "initial-fade-in-up",
        isVisible && "is-visible"
      )}
    >
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action, index) => {
            const commonCardClasses = "flex flex-col items-center text-center shadow-lg transition-all duration-200 ease-in-out initial-fade-in-up";
            const cardDynamicStyle = { transitionDelay: isVisible ? `${index * 100}ms` : '0ms' };

            const actionCardContent = (
              <>
                <CardHeader className="items-center">
                  {action.icon}
                  <CardTitle className="mt-4">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow items-center">
                  <CardDescription className="mb-4 flex-grow">{action.description}</CardDescription>
                  <Link href={action.href} className="w-full mt-auto">
                    <Button variant={action.variant} className="w-full">
                      {action.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </>
            );

            if (action.title === 'Book Appointment') {
              return (
                <div className="relative group" key={action.title} style={cardDynamicStyle}>
                  <Card
                    className={cn(
                      commonCardClasses,
                      isVisible && "is-visible",
                      "group-hover:shadow-2xl" // Enhanced shadow on group hover
                    )}
                    // Removed individual hover scale/translate for this card
                  >
                    {actionCardContent}
                  </Card>
                  {/* Pop-up content */}
                  <div className={cn(
                    "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-5",
                    "bg-card border border-border shadow-2xl rounded-xl",
                    "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                    "transition-all duration-300 ease-out origin-bottom", // Origin for scale animation
                    "pointer-events-none group-hover:pointer-events-auto", // Make it interactive on hover
                    "z-30 text-left space-y-3.5 text-card-foreground" // Increased z-index and spacing
                  )}>
                    {/* Section 1: Trusted Experts */}
                    <div className="text-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary mb-0.5">Trusted Dental Experts</p>
                      <div className="flex items-baseline justify-center gap-x-1.5">
                        <span className="text-5xl font-bold text-accent">100K+</span>
                        <span className="text-sm text-muted-foreground relative top-1">Teeth Restored</span>
                      </div>
                    </div>

                    <div className="h-px bg-border/60"></div>

                    {/* Section 2: Painless Procedures */}
                    <div className="text-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">Your Comfort, Our Priority</p>
                      <p className="text-2xl font-semibold text-accent">
                        PAIN-FREE
                      </p>
                      <p className="text-sm text-muted-foreground">Injections &amp; Surgery</p>
                    </div>
                    
                    <div className="h-px bg-border/60"></div>

                    {/* Section 3: Financial Accessibility */}
                    <div className="text-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">Smiles For Everyone</p>
                      <p className="text-xl font-semibold text-accent">Flexible Financing</p>
                      <p className="text-sm text-muted-foreground">Plans To Fit Your Budget</p>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <Card
                  key={action.title}
                  className={cn(
                    commonCardClasses,
                    isVisible && "is-visible",
                    "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03]" // Original hover for other cards
                  )}
                  style={cardDynamicStyle}
                >
                  {actionCardContent}
                </Card>
              );
            }
          })}
        </div>
      </div>
    </section>
  );
}
