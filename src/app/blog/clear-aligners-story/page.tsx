
import { MainNavbar } from '@/components/layout/MainNavbar';
import { Footer } from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, ShieldCheck, MessageSquare, CalendarCheck, Smile, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Ditch the Wires: Clear Aligners in Ernakulam at Dr. Loji's!",
  description: "Discover the benefits of clear aligners at Dr. Loji’s Dental Clinic in Ernakulam. Learn about their advantages, risks, and real patient stories to decide if they’re right for you.",
  keywords: "clear aligners, Dr. Loji’s dental clinic, orthodontic treatment, Invisalign alternatives, Ernakulam",
};

const patientStories = [
  {
    name: "Priya",
    role: "High School Teacher, Maradu",
    title: "The Disappearing Act: Priya's Secret Smile Makeover",
    challenge: "Yearned for a straighter smile but hesitant about traditional braces due to her public profession.",
    solution: "Chose clear aligners at Dr. Loji’s for their invisibility.",
    outcome: "Transformed her smile without students noticing, teaching and interacting with complete freedom.",
    quote: "They showed me how truly invisible they were. That was it—that was the game-changer. Not a single student ever asked about them!",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "teacher smiling",
  },
  {
    name: "Theena",
    role: "Software Engineer",
    title: "Life, Uninterrupted: Theena's Schedule-Friendly Smile",
    challenge: "Packed calendar made dietary restrictions and frequent dental visits of traditional braces seem impossible.",
    solution: "Opted for removable clear aligners.",
    outcome: "Corrected her smile without disrupting her busy life, appreciating the ease of maintenance.",
    quote: "Being able to pop them out for meals and brush my teeth just as normal? That was the deciding factor.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "professional woman",
  },
  {
    name: "Arjun",
    role: "Software Engineer",
    title: "More Than Just Straight Teeth: Arjun's Confidence Explosion",
    challenge: "Bothered by gaps between his front teeth since childhood, affecting his confidence.",
    solution: "Underwent clear aligner treatment, visualized with 3D imaging.",
    outcome: "Closed gaps in nine months, gaining not just an even smile but a significant boost in confidence and assertiveness.",
    quote: "Suddenly, I wasn’t self-conscious in meetings. I felt more assertive, more vocal, and genuinely happier. Now, I simply can't stop smiling!",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "confident man",
  }
];

const realTalkPoints = [
    {
        title: "Initial Adjustment is Normal",
        story: "Karthik, a lively college student, noticed a slight lisp at first. \"It felt a bit strange,\" Karthik admits, \"but Dr. Loji’s team reassured me it was temporary. After about a week of just talking normally, it completely disappeared!\"",
    },
    {
        title: "Consistency is Your Best Friend",
        story: "Clear aligners are incredibly effective, but they demand commitment. For best results, wear them 20-22 hours a day. Rahul, a dedicated fitness enthusiast, learned this quickly. \"I sometimes forgot to put them back in after a quick post-workout snack,\" he confessed. \"But the clinic gently reminded me, and once I got consistent, my progress just shot up. It actually taught me better habits!\"",
    }
];

export default function ClearAlignersBlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainNavbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-manrope mb-4">
              Ditch the Wires: Why Everyone in Ernakulam is Choosing Clear Aligners at Dr. Loji's!
            </h1>
            <p className="text-lg text-muted-foreground">
              Imagine transforming your smile without anyone even noticing. At Dr. Loji’s Chakkalakkal Dental Clinic, we're not just straightening teeth; we're helping people rediscover their confidence, one invisible aligner at a time.
            </p>
          </header>

          <section className="mb-10 space-y-4 text-foreground/90">
            <p>
              Forget the old notions of metal mouths and endless adjustments – clear aligners are here, and they've revolutionized orthodontics for teens and adults across Ernakulam.
            </p>
            <p>
              From the bustling streets of Maradu to the serene lanes of Vattaparambu, our patients are choosing a modern orthodontic treatment that fits seamlessly into their lives. Ready to hear their stories and see why Dr. Loji’s is the trusted choice for a smile that speaks volumes? Let’s dive in!
            </p>
          </section>

          <Separator className="my-8 md:my-12" />

          {patientStories.map((story, index) => (
            <section key={index} className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-3">
                {index + 1}. {story.title}
              </h2>
              <div className="p-6 rounded-lg shadow-md bg-card border border-border/50">
                <div className="md:flex md:space-x-6">
                  <div className="md:w-1/3 mb-4 md:mb-0">
                    <Image 
                      src={story.image} 
                      alt={story.name} 
                      width={600} 
                      height={400} 
                      className="rounded-md object-cover"
                      data-ai-hint={story.dataAiHint} 
                    />
                  </div>
                  <div className="md:w-2/3 space-y-3 text-card-foreground/90">
                    <p className="italic">&quot;{story.quote}&quot; - <span className="font-medium">{story.name}, {story.role}</span></p>
                    <p><strong className="font-medium text-card-foreground">The Challenge:</strong> {story.challenge}</p>
                    <p><strong className="font-medium text-card-foreground">The Solution at Dr. Loji&apos;s:</strong> {story.solution}</p>
                    <p className="p-3 bg-primary/10 rounded-md border-l-4 border-primary">
                      <strong className="font-medium text-primary">The Outcome:</strong> {story.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        
          <Separator className="my-8 md:my-12" />

          <section className="mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary font-manrope mb-6 text-center">
              The Real Talk: What to Expect on Your Aligner Journey
            </h2>
            <div className="space-y-8">
              {realTalkPoints.map((item, index) => (
                <div key={index} className="p-6 rounded-lg shadow-md bg-card border border-border/50">
                  <h3 className="text-xl font-semibold text-accent font-manrope mb-3">
                    {item.title}
                  </h3>
                  <p className="text-card-foreground/90">{item.story}</p>
                </div>
              ))}
               <p className="text-center text-foreground/90 mt-4">
                At Dr. Loji's, we believe in being fully transparent. We provide all the practical tips and continuous support you need to ensure your journey is smooth and successful. And yes, our clinic only uses BPA-free materials, putting your safety and well-being first.
               </p>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section className="mb-10 bg-primary/5 p-6 rounded-lg shadow-md">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary font-manrope mb-6 text-center">
              Why Choose Dr. Loji’s: Expertise Meets Empathy
            </h2>
            <div className="space-y-4 text-foreground/90">
                <p>What truly sets Dr. Loji’s Dental Clinic apart isn't just cutting-edge technology; it's our unwavering commitment to personalized, empathetic care. Every smile is unique, and we take the time to evaluate each case personally, ensuring clear aligners are the absolute best solution for you.</p>
                <p>For those rare, more complex situations, Dr. Loji collaborates with a network of specialists, including TMJ experts, prioritizing your complete oral health. We're constantly adopting the latest material innovations, offering aligners with enhanced elasticity and crystal clarity for maximum comfort and discretion.</p>
                <p>Our friendly team is always on hand to answer your questions—whether it’s about replacing your aligners (typically every 1-2 weeks as prescribed) or reminding you that, no, you definitely shouldn't chew gum with them in!</p>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary font-manrope mb-6">
              Conclusion: Your Smile, Your Story, Our Expertise
            </h2>
            <div className="space-y-4 text-foreground/90 max-w-3xl mx-auto">
              <p>
                Clear aligners are so much more than a fleeting trend; they represent a beautiful fusion of scientific advancement and the art of smile design. At Dr. Loji’s clinic in Ernakulam, we combine our expertise with genuine care to deliver smiles that don't just look amazing, but truly last a lifetime.
              </p>
              <p>
                Priya's discreet transformation, Theena's convenient journey, Arjun's confidence explosion, and countless other success stories are living proof. Your journey to a brighter, more confident you starts right here, with us.
              </p>
            </div>
          </section>

           <section className="my-12 text-center">
            <h3 className="text-2xl font-semibold text-accent mb-4">Ready to write your own amazing smile story?</h3>
            <p className="text-muted-foreground mb-6">
              Don't wait! Book your free consultation at Dr. Loji’s Dental Clinic in Vattaparambu or Maradu today. Let's make your dream smile a reality!
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <Link href="/#appointment" passHref>
                <Button size="lg" className="bg-medicalAccent text-medicalAccent-foreground hover:bg-medicalAccent/90">
                  <Smile className="mr-2 h-5 w-5" /> Book Free Consultation
                </Button>
              </Link>
              <Link href="/#appointment" passHref>
                 <Button variant="outline" size="lg">
                  <CalendarCheck className="mr-2 h-5 w-5" /> Book Now
                </Button>
              </Link>
              <Link href="https://instagram.com" passHref>
                <Button variant="ghost" size="lg" className="text-primary hover:text-primary/80">
                   <Users className="mr-2 h-5 w-5" /> Follow Us for Tips
                </Button>
              </Link>
            </div>
          </section>

        </article>
      </main>
      <Footer />
    </div>
  );
}
