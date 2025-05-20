import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const galleryImages = [
  { src: 'https://placehold.co/600x400.png', alt: 'Before and After Smile 1', dataAiHint: "smile dental" },
  { src: 'https://placehold.co/600x400.png', alt: 'Before and After Smile 2', dataAiHint: "dental transformation" },
  { src: 'https://placehold.co/600x400.png', alt: 'Before and After Smile 3', dataAiHint: "teeth whitening" },
];

export function SmileGallerySection() {
  return (
    <section id="gallery" className="w-full py-12 md:py-16 lg:py-20 bg-background">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-primary">Transform Your Smile</h2>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
          See the stunning results we've achieved for our happy patients.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {galleryImages.map((image, index) => (
            <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={400}
                  className="object-cover w-full h-64"
                  data-ai-hint={image.dataAiHint}
                />
              </CardContent>
            </Card>
          ))}
        </div>
        <Link href="/#appointment">
          <Button size="lg" variant="default">
            Want a smile like this? Book now!
          </Button>
        </Link>
      </div>
    </section>
  );
}
