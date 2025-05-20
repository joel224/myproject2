'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { UserCircle, LogIn } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function MainNavbar() {
  const [highlightedLink, setHighlightedLink] = useState<string | null>(null);

  const handleNavLinkClick = (path: string) => {
    setHighlightedLink(path);
    setTimeout(() => {
      setHighlightedLink(null);
    }, 1500); // Highlight for 1.5 seconds
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/#services" onClick={() => handleNavLinkClick('/#services')}>
            <Button
              variant="ghost"
              className={cn(
                highlightedLink === '/#services' && 'bg-accent/20'
              )}
            >
              Services
            </Button>
          </Link>
          <Link href="/#team" onClick={() => handleNavLinkClick('/#team')}>
            <Button
              variant="ghost"
              className={cn(
                highlightedLink === '/#team' && 'bg-accent/20'
              )}
            >
              Our Team
            </Button>
          </Link>
          <Link href="/#contact" onClick={() => handleNavLinkClick('/#contact')}>
            <Button
              variant="ghost"
              className={cn(
                highlightedLink === '/#contact' && 'bg-accent/20'
              )}
            >
              Contact
            </Button>
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
