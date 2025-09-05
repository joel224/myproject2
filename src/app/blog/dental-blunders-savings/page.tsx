
import { MainNavbar } from '@/components/layout/MainNavbar';
import { Footer } from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserCheck, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Unlock Savings: Dodging Costly Dental Blunders | Dr. Loji's Dental Hub",
  description: "Learn how to avoid common expensive dental mistakes and save money with proactive oral health care from Dr. Loji's Dental Clinic.",
  keywords: "dental savings, costly dental mistakes, prevent dental problems, oral health budget, Dr. Loji's Dental Clinic",
};

const blunders = [
    {
      title: "The \"Too Busy for a Check-Up\" Trap",
      blunder: "Skipping your annual dental check-ups because \"life gets hectic\" or \"my teeth feel fine.\"",
      story: "Rajesh was always on the go, putting off his dental visits for years. A tiny, unnoticed cavity festered, growing into a major infection that eventually demanded a painful and expensive root canal.",
      fix: "That simple check-up could have caught the cavity early, costing a fraction of the root canal and saving him immense discomfort. Early detection through regular check-ups is your cheapest insurance against major dental disasters, saving both discomfort and significant cost."
    },
    {
      title: "The \"Quick Brush\" Blunder",
      blunder: "Rushing through brushing or forgetting to floss entirely.",
      story: "Priya's brushing was a fleeting gesture, and flossing was a forgotten art. Soon, her gums bled, and cavities multiplied, leading to deep cleanings and multiple fillings.",
      fix: "A few dedicated minutes daily for proper brushing and flossing is all it takes to prevent gum disease and decay, saving you from costly treatments like deep cleanings and fillings."
    },
    {
      title: "The \"It'll Go Away\" Delusion",
      blunder: "Ignoring early warning signs like sensitivity or a minor twinge, hoping they'll disappear.",
      story: "Anand felt sensitivity to cold but dismissed it. It escalated into a throbbing toothache, forcing an urgent, expensive extraction.",
      fix: "Addressing minor sensitivities promptly can mean a simple, inexpensive fix like a small filling. Ignoring them often leads to severe pain and far more complex, costly procedures."
    },
    {
      title: "The Procrastinator's Pain",
      blunder: "Delaying recommended dental treatments, thinking you'll \"get to it later.\"",
      story: "Meera was advised to get a crown on a cracked tooth. She procrastinated for six months, by which time the crack had deepened, leading to an infection and extensive pre-crown treatment.",
      fix: "Timely action on your dentist's recommendations prevents problems from worsening, saving you from additional procedures and inflated bills. A small problem rarely stays small."
    },
    {
      title: "The Insurance Blind Spot",
      blunder: "Facing dental emergencies without any form of dental insurance.",
      story: "Without dental insurance, a broken tooth meant thousands in unexpected bills, a burden solely on their shoulders.",
      fix: "Dental insurance acts as a safety net, significantly reducing the financial blow of unforeseen dental issues. It's an investment that pays off when you need it most."
    },
    {
      title: "The Allure of Unnecessary Cosmetics",
      blunder: "Prioritizing extensive cosmetic procedures over essential health treatments or when they're not truly necessary.",
      story: "Opting for expensive veneers or extensive whitening when basic oral health issues are present can drain your budget without addressing foundational problems.",
      fix: "Focus on foundational oral health first. Once your teeth are healthy, then consider cosmetic enhancements if your budget allows. Prioritize need over want."
    },
    {
      title: "The \"Teeth as Tools\" Tendency",
      blunder: "Using your teeth to open packages, bite nails, or pry things.",
      story: "Kiran frequently used her teeth to rip open snack bags until one day she badly chipped a front tooth, requiring a costly repair.",
      fix: "Your teeth are for chewing food, not for opening bottles or packages. Protecting them from misuse prevents chips, cracks, and expensive emergency repairs."
    },
    {
      title: "The Sweet Tooth's Downfall",
      blunder: "Consistently consuming sugary drinks and acidic foods.",
      story: "A diet high in sugar creates a perfect breeding ground for cavity-causing bacteria, leading to frequent tooth decay.",
      fix: "Making smarter dietary choices and reducing sugar intake dramatically lowers your risk of cavities and the associated dental bills."
    },
    {
      title: "The Forgotten Fluoride Factor",
      blunder: "Overlooking the importance of fluoride in preventing decay.",
      story: "Using non-fluoride toothpaste or living in non-fluoridated areas without supplementing fluoride can increase cavity risk.",
      fix: "Incorporate fluoride toothpaste and consider fluoride rinses if your water isn't fluoridated. It's a simple, inexpensive way to strengthen your enamel against decay."
    },
    {
      title: "The Unheeded Advice",
      blunder: "Ignoring your dentist's expert guidance on oral care, techniques, or follow-up.",
      story: "Many recurring issues stem from patients not following through on their dentist's personalized advice for brushing, diet, or specific post-treatment care.",
      fix: "Your dentist is your best resource. Listen to their tailored advice to prevent recurring problems and avoid easily avoidable new issues."
    }
  ];

export default function DentalBlundersSavingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainNavbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-manrope mb-4">
              Unlock Savings: Dodging Costly Dental Blunders
            </h1>
            <p className="text-lg text-muted-foreground">
              Tired of unexpected, sky-high dental bills? The secret isn't luck; it's making smart choices about your oral health.
            </p>
          </header>

          <section className="mb-10 space-y-4 text-foreground/90">
            <p>
              Beyond just a dazzling smile, great oral health is a crucial pillar of your overall well-being. And here's the money-saving truth: by simply avoiding a few common dental missteps, you can keep your wallet happy and your teeth healthy.
            </p>
            <p>
              Think of me as your personal guide, having observed countless dental journeys. I've noticed a clear pattern: those who keep their dental expenses low consistently sidestep these common pitfalls. Let's dive into some real-life scenarios to show you exactly what I mean.
            </p>
          </section>

          <Separator className="my-8 md:my-12" />

          <section className="mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary font-manrope mb-6 text-center">
              The Costly Mistakes: Real Stories, Real Savings
            </h2>
            <div className="space-y-8">
              {blunders.map((item, index) => (
                <div key={index} className="p-6 rounded-lg shadow-md bg-card border border-border/50">
                  <h3 className="text-2xl font-semibold text-accent font-manrope mb-3">
                    {index + 1}. {item.title}
                  </h3>
                  <div className="space-y-3 text-card-foreground/90">
                    <p>
                      <strong className="font-medium text-card-foreground">The Blunder:</strong> {item.blunder}
                    </p>
                    <p>
                      <strong className="font-medium text-card-foreground">The Story:</strong> {item.story}
                    </p>
                    <p className="p-3 bg-primary/10 rounded-md border-l-4 border-primary">
                      <strong className="font-medium text-primary">The Fix & Savings:</strong> {item.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary font-manrope mb-6">
              The Bottom Line: Prevention is Your Power Play!
            </h2>
            <div className="space-y-4 text-foreground/90 max-w-3xl mx-auto">
              <p>
                Here's the big takeaway: prevention is your most powerful tool in keeping dental costs down. By being proactive with your oral hygiene, not postponing check-ups or necessary treatments, being mindful of what you eat and how you use your teeth, and genuinely listening to your dentist, you can sidestep a lot of pain, hassle, and ultimately, significant financial burden.
              </p>
              <p>
                Small, consistent efforts today can prevent big, costly problems tomorrow. Ready to take action and safeguard your smile and your wallet? Start by scheduling your next dental check-up today, and commit to these smart choices for lasting oral health!
              </p>
            </div>
            <div className="mt-8">
              <Link href="/#appointment">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <UserCheck className="mr-2 h-5 w-5" /> Schedule Your Check-Up Now
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
