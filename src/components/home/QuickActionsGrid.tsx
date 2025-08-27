
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

  // For dynamic pop-up positioning of "Book Appointment" card
  const bookCardRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState<'top' | 'bottom'>('top');

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
      if (currentSectionRef) observer.unobserve(currentSectionRef);
    };
  }, []);

  const handleBookCardMouseEnter = () => {
    if (bookCardRef.current) {
      const cardRect = bookCardRef.current.getBoundingClientRect();
      const POPUP_HEIGHT_ESTIMATE = 270; // Estimated height of the pop-up in pixels
      const VIEWPORT_PADDING = 20; // Minimum space from viewport edge

      const spaceAbove = cardRect.top - VIEWPORT_PADDING;
      const spaceBelow = window.innerHeight - cardRect.bottom - VIEWPORT_PADDING;

      if (spaceAbove >= POPUP_HEIGHT_ESTIMATE) {
        setPopupPosition('top');
      } else if (spaceBelow >= POPUP_HEIGHT_ESTIMATE) {
        setPopupPosition('bottom');
      } else {
        // Default to the side with more space if neither fits perfectly
        setPopupPosition(spaceAbove > spaceBelow ? 'top' : 'bottom');
      }
    }
  };

  return (
    <section
      id="quick-actions"
      ref={sectionRef}
      className={cn(
        "w-full py-12 md:py-16 lg:py-20 bg-background relative z-20",
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
                  <CardTitle className={cn(
                    "mt-4",
                    action.title === 'Book Appointment' && "text-shine"
                  )}>
                    {action.title}
                  </CardTitle>
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
                <div 
                  className="relative group" 
                  key={action.title} 
                  style={cardDynamicStyle}
                  ref={bookCardRef}
                  onMouseEnter={handleBookCardMouseEnter}
                >
                  <Card
                    className={cn(
                      commonCardClasses,
                      isVisible && "is-visible",
                      "group-hover:shadow-2xl"
                    )}
                  >
                    {actionCardContent}
                  </Card>
                  <div className={cn(
                    "absolute left-1/2 -translate-x-1/2 w-96 p-6", // Increased width and padding
                    popupPosition === 'top' ? 'bottom-full mb-3' : 'top-full mt-3',
                    "bg-card border border-border shadow-2xl rounded-xl",
                    "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                    "transition-all duration-300 ease-out origin-bottom",
                    "pointer-events-none group-hover:pointer-events-auto",
                    "z-40 text-left space-y-3.5 text-card-foreground"
                  )}>
                    <div className="text-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary mb-0.5">Trusted Dental Experts</p>
                      <div className="flex items-baseline justify-center gap-x-1.5">
                        <span className="text-5xl font-bold text-primary">100K+</span>
                        <span className="text-sm text-muted-foreground relative top-1">Teeth Restored</span>
                      </div>
                    </div>
                    <div className="h-px bg-border/60"></div>
                    <div className="text-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">Your Comfort, Our Priority</p>
                      <p className="text-2xl font-semibold text-primary">
                        PAIN-LESS
                      </p>
                      <p className="text-sm text-muted-foreground">Injection &amp; Surgery</p>
                    </div>
                    <div className="h-px bg-border/60"></div>
                    <div className="text-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">Smiles For Everyone</p>
                      <p className="text-xl font-semibold text-primary">Flexible Financing</p>
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
                    "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03]"
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
