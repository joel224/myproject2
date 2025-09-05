
import { MainNavbar } from '@/components/layout/MainNavbar';
import { Footer } from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, AlertTriangle, Smile, CalendarCheck, Users, HelpCircle, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { DentistSpotlightCard } from '@/components/home/DentistSpotlightCard';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';


export const metadata: Metadata = {
  title: "Why Do Teeth Turn Yellow? Causes & Solutions from Dr. Loji’s Dental Clinic",
  description: "Discover the causes of yellow teeth and how Dr. Loji’s Dental Clinic in Ernakulam offers effective whitening solutions. Learn prevention tips and real patient stories to achieve a brighter smile.",
  keywords: "teeth whitening Ernakulam, yellow teeth causes Kerala, dentist Vattaparambu, professional teeth whitening Kochi, at-home teeth whitening Ernakulam, Dr. Loji’s Dental Clinic",
};

const patientStories = [
  {
    name: "Meera",
    role: "Teacher",
    challenge: "Daily coffee consumption led to noticeable yellowing of her teeth, affecting her confidence.",
    solution: "Used Dr. Loji's Visible White Booster plan/treatment and made minor dietary adjustments.",
    outcome: "Achieved teeth brighter than she imagined, boosting her confidence in front of students and in photos.",
    quote: "My teeth are brighter than I ever imagined! I feel so much more confident smiling... It's truly amazing!",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "teacher smiling",
  },
  {
    name: "Rajesh",
    role: "Professional, 40s",
    challenge: "Lifelong grayish discoloration due to childhood tetracycline use, resistant to over-the-counter products.",
    solution: "Underwent a personalized in-office bleaching treatment at Dr. Loji’s clinic.",
    outcome: "Transformed his smile, allowing him to laugh openly and speak confidently for the first time.",
    quote: "I finally feel comfortable laughing openly... It's like a weight has been lifted!",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "man smiling confident",
  },
  {
    name: "Anu",
    role: "College Student",
    challenge: "Tried DIY whitening remedies (charcoal, lemon juice) which damaged her enamel and increased sensitivity.",
    solution: "Received gentle repair of enamel damage and safe, effective professional whitening at Dr. Loji’s.",
    outcome: "Achieved desired whitening results safely, regretting not seeking professional help sooner.",
    quote: "I learned my lesson the hard way... I wish I had come here first!",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "student happy",
  }
];

const commonCauses = [
    { title: "Not-So-Great Oral Hygiene", description: "Skipping regular brushing or flossing allows plaque and tartar to build up, trapping stains. A young professional shared, “I skipped flossing for years... My teeth looked so dull and dingy. Now I really regret not taking those extra two minutes!”" },
    { title: "Your Favorite Foods & Drinks", description: "Coffee, tea, red wine, and sodas contain strong color pigments and acids that can wear down enamel, revealing the yellowish dentin underneath." },
    { title: "Smoking or Tobacco Use", description: "Nicotine and tar penetrate enamel, creating stubborn yellow or brown stains. Dr. Loji notes, “Many smokers don’t realize how deeply these stains can penetrate... until they see the dramatic difference after quitting and getting professional cleaning.”" },
    { title: "Genetics & Natural Aging", description: "Some people naturally have thinner enamel. Plus, enamel naturally thins with age, making teeth appear more yellow." },
    { title: "Certain Medications (Like Tetracycline)", description: "Medications like tetracycline, if taken during tooth development, can cause intrinsic (internal) staining." },
    { title: "Trauma or Accidents", description: "A knock or crack to a tooth can cause internal changes leading to discoloration." }
];

const preventionTips = [
    { title: "Brush Twice Daily, Every Day", description: "Use a quality whitening toothpaste to tackle surface stains." },
    { title: "Don't Forget to Floss", description: "Removes plaque and food from between teeth, preventing stain buildup." },
    { title: "Rinse After Staining Foods/Drinks", description: "A quick water swish helps rinse away staining pigments." },
    { title: "Use a Straw", description: "Minimizes contact of dark or acidic drinks with front teeth." }
];

const professionalSolutions = [
    { title: "In-Office Whitening", description: "For quick, dramatic results on deep-set stains, we use powerful, safely applied bleaching gels." },
    { title: "Visible White Booster plan/treatment (Our At-Home Secret)", description: "A special at-home solution using active oxygen technology for gentle yet effective lightening. Meera, our teacher, shared, “I started using the Visible White Booster... and I saw results in just two weeks!”" }
];

const whenToSeeDentist = [
    "Discoloration affects most of your teeth.",
    "Stains are resistant to over-the-counter products.",
    "You suspect underlying issues like cavities or infection.",
    "You have sensitive teeth and need safe whitening guidance."
];

const faqs = [
    { question: "Does smoking really make teeth yellow?", answer: "Yes, absolutely. Nicotine and tar cause deep, stubborn surface stains. Quitting is best for your smile and health!" },
    { question: "Can a special whitening toothpaste fix very yellow teeth?", answer: "Whitening toothpastes help with surface stains but won't address deeper discoloration. Professional treatments are more effective for that." },
    { question: "Are home remedies (like charcoal or lemon juice) safe?", answer: "We strongly advise against DIY methods like charcoal or lemon juice. They can be abrasive and damage enamel. Always consult a dentist first." },
    { question: "How long do professional teeth whitening results usually last?", answer: "With good oral hygiene, results can last from six months to a couple of years. Touch-ups can help maintain brightness." },
    { question: "Is teeth whitening a painful procedure?", answer: "Most patients experience little to no pain. Some may have temporary sensitivity, which usually subsides quickly. We take steps to minimize discomfort." },
    { question: "What's the main difference between OTC kits and professional whitening?", answer: "Professional treatments are stronger, safer, customized, and yield faster, more dramatic results. OTC kits are less potent." },
    { question: "Can people with sensitive teeth still get their teeth whitened?", answer: "Often, yes! We assess sensitivity and recommend appropriate methods or adjust treatment for comfort, sometimes using desensitizing agents." }
];


export default function YellowTeethBlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainNavbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-manrope mb-4">
              Why Do Teeth Turn Yellow? Causes & Solutions from Dr. Loji’s Dental Clinic
            </h1>
          </header>

          <section className="mb-10 space-y-4 text-foreground/90">
            <p>
                Why do teeth lose their sparkle? It's often a combination of factors. Let’s break down the most common reasons:
            </p>
          </section>

          <Separator className="my-8 md:my-12" />
          
          <section id="common-causes" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-6 text-center">
              1. Common Causes of Yellow Teeth: The Usual Suspects
            </h2>
            <div className="space-y-6">
              {commonCauses.map((cause, index) => (
                <div key={index} className="p-4 bg-card border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-accent font-manrope mb-2">{cause.title}</h3>
                  <p className="text-card-foreground/90">{cause.description}</p>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section id="prevention-solutions" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-6 text-center">
              2. How to Prevent or Reduce Yellow Teeth: Simple Steps & Smart Solutions
            </h2>
            <p className="text-foreground/90 mb-4">The good news is, you're not powerless against yellowing teeth! Here’s what you can do:</p>
            
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-accent font-manrope mb-3">Daily Habits: Your First Line of Defense</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {preventionTips.map((tip, index) => (
                        <div key={index} className="p-4 bg-card border rounded-lg shadow-sm">
                            <h4 className="font-medium text-card-foreground mb-1">{tip.title}</h4>
                            <p className="text-sm text-card-foreground/80">{tip.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-accent font-manrope mb-3">Professional Solutions: For That Extra Sparkle</h3>
                 <p className="text-foreground/90 mb-3">When daily habits aren't enough, or if you have deeper, more stubborn stains, professional help makes a world of difference:</p>
                <div className="space-y-4">
                    {professionalSolutions.map((solution, index) => (
                         <div key={index} className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                            <h4 className="font-medium text-primary mb-1">{solution.title}</h4>
                            <p className="text-sm text-foreground/90">{solution.description}</p>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section id="when-to-see-dentist" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-6 text-center">
              3. When to See a Dentist About Yellow Teeth
            </h2>
            <p className="text-foreground/90 mb-4">While many people try over-the-counter whitening products, it's always best to consult a dentist if:</p>
            <div className="p-6 rounded-lg shadow-md bg-card border border-border/50">
                <ul className="list-disc pl-5 space-y-2 text-card-foreground/90">
                    {whenToSeeDentist.map((reason, index) => (
                        <li key={index} className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                        </li>
                    ))}
                </ul>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />
            
          <section id="patient-stories" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-8 text-center">
              4. Real Stories, Real Results: See the Difference
            </h2>
            <p className="text-foreground/90 mb-6 text-center">Hearing from others who’ve transformed their smiles can be truly inspiring:</p>
            <div className="space-y-8">
              {patientStories.map((story, index) => (
                <Card key={index} className="shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Image 
                        src={story.image} 
                        alt={story.name} 
                        width={600} 
                        height={400} 
                        className="object-cover w-full h-48 md:h-full"
                        data-ai-hint={story.dataAiHint} 
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <CardTitle className="text-xl text-accent font-manrope mb-1">{story.name}’s Transformation</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground mb-3">{story.role}</CardDescription>
                      <p className="italic text-card-foreground/90 mb-3">&quot;{story.quote}&quot;</p>
                      <p className="text-sm text-card-foreground/80"><strong className="font-medium text-card-foreground">Challenge:</strong> {story.challenge}</p>
                      <p className="text-sm text-card-foreground/80 mt-1"><strong className="font-medium text-card-foreground">Solution:</strong> {story.solution}</p>
                      <p className="text-sm text-primary/90 mt-2 p-2 bg-primary/5 rounded-md"><strong className="font-medium text-primary">Outcome:</strong> {story.outcome}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
          
          <Separator className="my-8 md:my-12" />

          <section id="faq" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-6 text-center">
              5. FAQs About Yellow Teeth: Your Questions Answered
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-card border rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-accent font-manrope mb-1 flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary"/> {faq.question}
                  </h3>
                  <p className="text-card-foreground/90">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

           <Separator className="my-8 md:my-12" />

          <section id="conclusion" className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary font-manrope mb-6">
              6. Brighten Your Smile with Dr. Loji’s Expertise
            </h2>
            <div className="space-y-4 text-foreground/90 max-w-3xl mx-auto">
              <p>
                Yellow teeth are a common concern, but they are certainly treatable. At Dr. Loji’s Dental Clinic, we combine personalized care with advanced, safe, and effective solutions like the Visible White Booster plan/treatment and our professional in-office whitening treatments to help you achieve a truly radiant smile. Whether your discoloration stems from genetics, diet, past medication, or simply years of living, our expert team is here to guide you toward safe, lasting, and beautiful results.
              </p>
            </div>
          </section>

           <section className="my-12 text-center">
            <h3 className="text-2xl font-semibold text-accent mb-4">Ready to Whiten Your Smile?</h3>
            <p className="text-muted-foreground mb-6">
             Book a consultation today at Dr. Loji's Dental Clinic in Vattaparambu, Ernakulam, and take the first step toward a brighter, healthier, and more confident you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <Link href="/#appointment" passHref>
                <Button size="lg" className="bg-medicalAccent text-medicalAccent-foreground hover:bg-medicalAccent/90">
                  <Smile className="mr-2 h-5 w-5" /> Book Consultation
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

    