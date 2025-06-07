
'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { UserCircle, LogIn, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import type { MouseEvent } from 'react';
import { cn } from '@/lib/utils';

export function MainNavbar() {
  const handleNavClickAndAnimate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      event.preventDefault(); // Prevent default anchor behavior only for hash links
      const targetId = href.substring(2); // Extract 'services' from '/#services'
      
      const sectionElement = document.getElementById(targetId);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth' });

        // Allow native scroll to happen, then animate
        setTimeout(() => {
          const headingElement = sectionElement.querySelector('h2');

          if (headingElement) {
            headingElement.classList.add('animate-marquee-bg');
            
            // Animation duration is 1s. Remove class after animation finishes.
            setTimeout(() => {
              headingElement.classList.remove('animate-marquee-bg');
            }, 1000); 
          }
        }, 300); // Delay to allow for scrolling, increased slightly
      }
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-opacity-60",
      "bg-navbar-background-main/95 text-navbar-foreground-main", // Apply new background and text colors
      "[&_svg]:text-navbar-foreground-main" // Ensure SVGs directly inside also get the color
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-8 w-auto" /> {/* Logo text color updated internally */}
        </Link>
        <nav className="flex items-center space-x-1 sm:space-x-2"> {/* Adjusted spacing */}
          <Link href="/#services" onClick={(e) => handleNavClickAndAnimate(e, '/#services')}>
            <Button 
              variant="ghost" 
              className="text-navbar-foreground-main hover:bg-navbar-foreground-main/10 hover:text-navbar-foreground-main"
            >
              Services
            </Button>
          </Link>
          <Link href="/#team" onClick={(e) => handleNavClickAndAnimate(e, '/#team')}>
            <Button 
              variant="ghost" 
              className="text-navbar-foreground-main hover:bg-navbar-foreground-main/10 hover:text-navbar-foreground-main"
            >
              Our Team
            </Button>
          </Link>
          <Link href="/#appointment" onClick={(e) => handleNavClickAndAnimate(e, '/#appointment')}>
            <Button 
              variant="ghost" 
              className="text-navbar-foreground-main hover:bg-navbar-foreground-main/10 hover:text-navbar-foreground-main"
            >
              Contact
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90"> {/* Default variant, should contrast well */}
              <LogIn className="mr-2 h-4 w-4 text-primary-foreground" /> Login
            </Button>
          </Link>
          {/* Temporary links for development */}
          <Link href="/staff/dashboard">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-navbar-foreground-main/70 text-navbar-foreground-main hover:bg-navbar-foreground-main/10 hover:text-navbar-foreground-main"
            >
              <LayoutDashboard className="mr-1 h-4 w-4 sm:mr-2" /> 
              <span className="hidden sm:inline">Staff</span>
            </Button>
          </Link>
          <Link href="/doctor/dashboard">
            <Button 
              variant="outline" 
              size="sm"
              className="border-navbar-foreground-main/70 text-navbar-foreground-main hover:bg-navbar-foreground-main/10 hover:text-navbar-foreground-main"
            >
              <LayoutDashboard className="mr-1 h-4 w-4 sm:mr-2" /> 
              <span className="hidden sm:inline">Doctor</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
