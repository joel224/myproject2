
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Instagram, MessageSquare, Phone, MapPin, Mail } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const locations = [
    {
      type: "Head Office",
      name: "Head Office",
      addressLines: [
        "Classic Bazar Complex, Athani (P.O),",
        "Nedumbassery, Ernakulam Dist."
      ],
      email: "drlojisdental@gmail.com",
      phones: ["0484 2474782", "+91-98 47 39 14 14"]
    },
    {
      type: "Branch",
      name: "KUNNUKARA",
      addressLines: [
        "Kallumadaparambil, Near Catholic Syrian Bank,",
        "Kunnukara, Ernakulam Dist."
      ],
      email: "drlojisdental@gmail.com",
      phones: ["+91-98 47 39 14 14", "90 72 86 81 11"]
    },
    {
      type: "Branch",
      name: "Vattapparambu",
      addressLines: [
        "Bharanikulangara Towers, Vattaparambu. P.O,",
        "Ernakulam Dist"
      ],
      email: "drlojisdental@gmail.com",
      phones: ["+91-98 47 39 14 14", "90 72 86 83 33"]
    },
    {
      type: "Branch",
      name: "Angamaly",
      addressLines: [
        "Near S M Press, Opp. Chungath Jewellery,",
        "Angamaly, Ernakulam Dist"
      ],
      email: "drlojisdental@gmail.com",
      phones: ["+91-98 47 39 14 14", "90 72 71 52 14"]
    }
  ];

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
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blogs</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-foreground">Our Locations</h4>
            
            {/* Head Office */}
            <div className="space-y-2 text-sm">
              <h5 className="font-medium text-foreground/90">{locations[0].name}</h5>
              <p className="flex items-start text-muted-foreground">
                <MapPin className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" />
                <span>
                  {locations[0].addressLines.map((line, index) => (
                    <span key={index} className="block">{line}</span>
                  ))}
                </span>
              </p>
              <p className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                <a href={`mailto:${locations[0].email}`} className="hover:text-primary">{locations[0].email}</a>
              </p>
              <div className="flex items-start text-muted-foreground">
                <Phone className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  {locations[0].phones.map((phone, index) => (
                    <a key={index} href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-primary block">{phone}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* Branches */}
            {locations.slice(1).length > 0 && (
              <div className="mt-4 space-y-3">
                <h5 className="font-semibold text-foreground/90">Our Branches</h5>
                {locations.slice(1).map((branch, idx) => (
                  <div key={idx} className="space-y-1.5 text-sm pt-2 border-t border-border/50 first:border-t-0 first:pt-0">
                     <p className="font-medium text-foreground/80">{idx + 1}. {branch.name}</p>
                     <p className="flex items-start text-muted-foreground">
                       <MapPin className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" />
                       <span>
                        {branch.addressLines.map((line, lineIdx) => (
                          <span key={lineIdx} className="block">{line}</span>
                        ))}
                       </span>
                     </p>
                     <p className="flex items-center text-muted-foreground">
                       <Mail className="mr-2 h-4 w-4 text-primary" />
                       <a href={`mailto:${branch.email}`} className="hover:text-primary">{branch.email}</a>
                     </p>
                     <div className="flex items-start text-muted-foreground">
                       <Phone className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" />
                       <div>
                        {branch.phones.map((phone, phoneIdx) => (
                          <a key={phoneIdx} href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-primary block">{phone}</a>
                        ))}
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
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
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12a4 4 0 1 0 4 4V8.5a4.5 4.5 0 1 0-9 0V16a4 4 0 1 0 4-4V4.5A4.5 4.5 0 1 0 7.5 9"></path></svg>
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-sm">
                <h5 className="font-medium text-foreground/90 mb-1">Working Hours:</h5>
                <p className="text-muted-foreground">Mon - Sat: 9:00 AM - 6:00 PM</p>
                <p className="text-muted-foreground">Sunday: Closed</p>
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
