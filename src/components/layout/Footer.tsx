import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Instagram, MessageSquare, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" aria-label="Dr. Loji's Dental Hub Home">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Your Smile, Our Passion! Quality dental care for the whole family.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#services" className="text-muted-foreground hover:text-primary">Services</Link></li>
              <li><Link href="/#team" className="text-muted-foreground hover:text-primary">Meet The Team</Link></li>
              <li><Link href="/#appointment" className="text-muted-foreground hover:text-primary">Book Appointment</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <address className="not-italic text-sm space-y-2">
              <p className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4 text-primary" />
                123 Dental Street, Smileville, ST 12345
              </p>
              <Link href="https://maps.google.com/?q=123+Dental+Street,+Smileville,+ST+12345" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block">
                Get Directions
              </Link>
              <p className="flex items-center text-muted-foreground">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                <a href="tel:+1234567890" className="hover:text-primary">(123) 456-7890</a>
              </p>
               <p className="flex items-center text-muted-foreground">
                <MessageSquare className="mr-2 h-4 w-4 text-primary" /> {/* Using MessageSquare for generic contact/WhatsApp */}
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="hover:text-primary">WhatsApp Us</a>
              </p>
            </address>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Follow Us</h4>
            <div className="flex space-x-3">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                {/* Using MessageSquare as a placeholder for TikTok as it's not in Lucide directly */}
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12a4 4 0 1 0 4 4V8.5a4.5 4.5 0 1 0-9 0V16a4 4 0 1 0 4-4V4.5A4.5 4.5 0 1 0 7.5 9"></path></svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {currentYear} Dr. Loji's Dental Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
