'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { UserCircle, LogIn } from 'lucide-react';

export function MainNavbar() {
  const handleNavClickAndAnimate = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.substring(2); // Extract 'services' from '/#services'
      
      // Allow native scroll to happen, then animate
      setTimeout(() => {
        const sectionElement = document.getElementById(targetId);
        if (sectionElement) {
          const headingElement = sectionElement.querySelector('h2');

          if (headingElement) {
            headingElement.classList.add('animate-marquee-bg');
            
            // Animation duration is 1s. Remove class after animation finishes.
            setTimeout(() => {
              headingElement.classList.remove('animate-marquee-bg');
            }, 1000); 
          }
        }
      }, 100); // Delay to allow for scrolling
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/#services" onClick={(e) => handleNavClickAndAnimate(e, '/#services')}>
            <Button variant="ghost">Services</Button>
          </Link>
          <Link href="/#team" onClick={(e) => handleNavClickAndAnimate(e, '/#team')}>
            <Button variant="ghost">Our Team</Button>
          </Link>
          <Link href="/#appointment" onClick={(e) => handleNavClickAndAnimate(e, '/#appointment')}>
            <Button variant="ghost">Contact</Button>
          </Link>
          <Link href="/login">
            <Button>
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </Link>
           {/* Example for User/Staff/Doctor specific areas - replace with actual auth logic */}
          {/* <Link href="/patient/dashboard">
            <Button variant="outline" size="icon" aria-label="Patient Portal">
              <UserCircle className="h-5 w-5" />
            </Button>
          </Link> */}
        </nav>
      </div>
    </header>
  );
}
