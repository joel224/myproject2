
import { MainNavbar } from '@/components/layout/MainNavbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BookOpenText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dental Insights Blog | Dr. Loji's Dental Hub",
  description: "Explore insightful articles on dental health, treatments, and tips from the experts at Dr. Loji's Dental Clinic in Ernakulam.",
  keywords: "dental blog, oral health articles, Dr. Loji's Dental Clinic, Ernakulam dentist blog, dental tips",
};

const blogPosts = [
  {
    title: "Unlock Savings: Dodging Costly Dental Blunders",
    slug: "/blog/dental-blunders-savings",
    description: "Tired of unexpected, sky-high dental bills? The secret isn't luck; it's making smart choices about your oral health. Learn how to avoid common expensive dental mistakes."
  },
  {
    title: "Ditch the Wires: Why Everyone in Ernakulam is Choosing Clear Aligners at Dr. Loji's!",
    slug: "/blog/clear-aligners-story",
    description: "Discover how teeth aligners work at Dr. Loji’s Dental Clinic in Ernakulam. Learn the science, benefits, and real patient stories to achieve a straighter smile discreetly."
  },
  {
    title: "Managing Braces Pain: Easy Tips & Real Stories from Dr. Loji’s Dental Clinic",
    slug: "/blog/managing-braces-pain",
    description: "Learn how to manage braces pain with tips from Dr. Loji’s Dental Clinic in Ernakulam. Real patient stories and advice for a comfortable orthodontic journey."
  },
  {
    title: "Tooth Extraction in Ernakulam: Your Easy Guide to a Comfortable Experience",
    slug: "/blog/tooth-extraction-guide",
    description: "Need a tooth extraction in Ernakulam? Dr. Loji’s Dental Clinic offers a comfortable experience. Learn about the process, why it's needed, and our gentle approach."
  },
  {
    title: "Why Do Teeth Turn Yellow? Causes & Solutions from Dr. Loji’s Dental Clinic",
    slug: "/blog/yellow-teeth-causes-solutions",
    description: "Discover the causes of yellow teeth and how Dr. Loji’s Dental Clinic in Ernakulam offers effective whitening solutions. Learn prevention tips and real patient stories to achieve a brighter smile."
  }
];


export default function BlogIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainNavbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <header className="mb-10 text-center">
          <BookOpenText className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-manrope">
            Dental Insights from Dr. Loji's Hub
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your source for expert advice, patient stories, and the latest in dental care.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Link href={post.slug} className="group">
                  <CardTitle className="text-xl font-semibold text-accent group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-muted-foreground line-clamp-3">
                  {post.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link href={post.slug} className="w-full">
                  <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10">
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

    