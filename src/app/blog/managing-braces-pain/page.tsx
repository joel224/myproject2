
import { MainNavbar } from '@/components/layout/MainNavbar';
import { Footer } from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, AlertTriangle, Phone, Users, Smile, CalendarCheck, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Managing Braces Pain: Easy Tips & Real Stories from Dr. Loji’s Dental Clinic",
  description: "Learn how to manage braces pain with tips from Dr. Loji’s Dental Clinic in Ernakulam. Real patient stories and advice for a comfortable orthodontic journey.",
  keywords: "braces pain management Kerala, orthodontic discomfort Ernakulam, Dr. Loji’s Dental Clinic, how to relieve braces pain Kochi, braces adjustment pain relief, mouth sores from braces",
};

const patientStories = [
  {
    name: "Anjali",
    role: "College Student",
    storyIntro: "she's a bright college student who was really worried about pain before getting her braces.",
    challenge: "The first week was definitely tough, but Dr. Loji’s team gave me such practical, easy-to-follow tips that made all the difference.",
    experience: "The day they were put on, I was just waiting for the pain to hit. The first few days were definitely an adjustment – my teeth felt tender, and the brackets rubbed my cheeks a little.",
    solution: "I avoided hard foods, and I used that orthodontic wax religiously on any spots that felt rough. By day three, the initial soreness was gone, and within a week, I barely noticed my braces! Knowing what to do made all the difference.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "student smiling braces",
  },
  {
    name: "Rajesh",
    role: "Software Engineer",
    challenge: "Found that the initial discomfort and occasional mouth sores were disruptive.",
    experience: "I couldn't focus on my code when my mouth was bothering me.",
    solution: "They told me to use over-the-counter pain relievers, like the ones you'd take for a headache, and recommended holding a cold compress on my cheek. It was such simple advice, but it brought quick relief and let me get back to my work without distraction.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "professional man thinking",
  },
  {
    name: "Deepa",
    role: "High School Student",
    challenge: "Struggling with a wire that occasionally poked her cheek after an adjustment.",
    experience: "It was just a tiny poke, but it was really annoying and distracting, especially during classes.",
    solution: "Dr. Loji showed me how to use the back of a pencil eraser (or even my fingernail) to gently push the wire back into place. If that didn't work, I'd just pop a tiny bit of wax on it. It was such a simple solution, and it saved me so much irritation!",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "teenager student",
  }
];

const painManagementTips = {
  overTheCounter: [
    "Pain Relievers: Medicines like Ibuprofen (Advil, Motrin) or Acetaminophen (Tylenol) can really help ease the soreness and aches. Always follow the dosage instructions on the package.",
    "Saltwater Rinses: Mix half a teaspoon of salt into a glass of warm water and gently swish it around your mouth (don't swallow!). This is a fantastic natural way to soothe irritated gums and any small sores.",
  ],
  dietAdjustments: {
    avoid: "Hard, crunchy, or sticky foods like popcorn, nuts, hard candies, chewing gum, whole apples, or tough meats.",
    optFor: "Soft foods! Think soups, yogurt, smoothies, mashed potatoes, scrambled eggs, soft pasta, oatmeal, and cooked vegetables.",
  },
  orthoTools: [
    "Orthodontic Wax: This is a clear, soft wax that you can break off and press onto any bracket or wire that's irritating your cheeks, lips, or tongue. It creates a smooth surface and prevents rubbing. We’ll give you some at your first appointment!",
    "Mouthguards: If you play sports, a mouthguard is essential. It protects your teeth, lips, and braces from any accidental bumps or knocks during physical activity.",
  ],
  coldTherapy: [
    "Ice Packs: Holding an ice pack (wrapped in a thin cloth) on your cheek, over the sore area, can help reduce swelling and gently numb the pain. Use it for 15-20 minutes at a time.",
    "Cold Drinks/Ice Cream: Sometimes, a cold drink or a little ice cream can also provide temporary relief for tender teeth.",
  ]
};

const faqs = [
    { question: "Is braces pain worse for adults than for kids?", answer: "Adults might feel a bit more sensitivity because their bones are fully developed and remodel (change) a bit slower than in growing children. However, the discomfort is still totally manageable with proper care, and adults often adapt very well!" },
    { question: "How long does the pain usually last after getting braces or an adjustment?", answer: "Initial soreness typically fades within 3–7 days. After regular adjustments, the discomfort usually lasts for about 3–5 days. If you experience persistent pain that isn't getting better or is very severe, please call Dr. Loji’s clinic right away!" },
    { question: "Can braces cause ulcers or mouth sores?", answer: "Yes, it's possible for the brackets or wires to rub and cause small sores or ulcers inside your mouth, especially when you first get them. Using orthodontic wax and rinsing with warm saltwater or an antimicrobial mouthwash can help prevent and soothe these." },
    { question: "What should I do if a wire breaks or a bracket comes loose?", answer: "If a wire is poking or a bracket feels loose, don't try to fix it yourself! Gently push any poking wires with a pencil eraser or cover sharp parts with orthodontic wax, then call Dr. Loji’s clinic immediately to schedule an appointment to get it fixed." },
    { question: "Can I still play my musical instrument with braces?", answer: "Many patients successfully play wind or brass instruments with braces! It might take a little practice and adjustment, and sometimes using orthodontic wax on certain brackets can help make it more comfortable. Talk to us if you're concerned!" },
    { question: "Will the pain affect my speech?", answer: "You might notice a slight lisp or feel like your speech is a bit different when you first get braces, or right after an adjustment. This is usually temporary as your tongue and lips get used to the new additions in your mouth, and it should return to normal quickly." }
];

export default function ManagingBracesPainPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainNavbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-manrope mb-4">
              Managing Braces Pain: Easy Tips & Real Stories from Dr. Loji’s Dental Clinic
            </h1>
            <p className="text-lg text-muted-foreground">
              Getting braces is a big step towards a beautiful, confident smile – a truly life-changing investment! But let's be honest, the idea of initial discomfort or pain can be a bit daunting. At Dr. Loji’s Dental Clinic in Vattaparambu, Ernakulam, we’ve helped countless patients smoothly navigate the adjustment period. We want you to know exactly what to expect and how to feel comfortable.
            </p>
            <div className="my-6 p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                <p className="italic text-foreground/90">
                    Take Anjali’s story, for instance: {patientStories[0].storyIntro} “{patientStories[0].challenge}” she shares now with a confident smile.
                </p>
            </div>
            <p className="text-muted-foreground">
              In this friendly guide, we’ll break down exactly when braces might cause a bit of pain, why it happens, and most importantly, how you can manage it like a pro to make your orthodontic journey as comfortable as possible.
            </p>
          </header>

          <Separator className="my-8 md:my-12" />

          <section id="when-braces-hurt" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-4">
              1. When Do Braces Cause Discomfort? (And Why It Happens)
            </h2>
            <p className="text-foreground/90 mb-4">
              Braces work by gently pushing your teeth into new positions. This movement is what causes the temporary aches and pains. Here are the most common times you might feel something:
            </p>
            <div className="space-y-4 text-foreground/90">
              <div>
                <h3 className="text-xl font-medium text-accent mb-1">Right After They're Put On (Initial Placement):</h3>
                <p>Putting the braces on your teeth doesn't actually hurt. However, about 4–6 hours afterward, you'll likely start to feel some soreness. This is because your teeth are beginning to feel the gentle pressure of the braces for the very first time. Most people describe it as a dull ache or tenderness, rather than sharp pain, almost like your teeth are a little tired.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-accent mb-1">After Adjustments (Tightening Appointments):</h3>
                <p>You'll visit Dr. Loji regularly (usually every 4–6 weeks) for "adjustments." This is when we make small changes to your braces to keep your teeth moving. After these appointments, you might feel some mild discomfort for 3–5 days. This isn't a bad thing; it’s a positive sign that your braces are actively working to straighten your smile!</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-accent mb-1">Mouth Irritation (Rubbing & Sores):</h3>
                <p>Sometimes, the new brackets or wires can rub against the soft tissues inside your mouth – your cheeks, lips, or tongue. This can create small, annoying sores. Think of it like breaking in new shoes; your mouth just needs a little time to get used to its new "neighbors." Dr. Loji always recommends using orthodontic wax to cover any parts of your braces that are causing irritation. It creates a smooth barrier.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-accent mb-1">Eating Challenges (Tender Teeth):</h3>
                <p>When your teeth are sore, biting into hard or crunchy foods can make the discomfort worse. Imagine trying to bite an apple with a tender tooth – ouch! For the first few days after getting braces or after an adjustment, it's best to stick to soft foods.</p>
              </div>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section id="patient-stories" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-6 text-center">
              2. Real Stories, Real Solutions: How Our Patients Cope
            </h2>
            <p className="text-foreground/90 mb-6 text-center">Hearing how others manage their braces journey can be really helpful. Here are a few stories from our patients at Dr. Loji's:</p>
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
                      <CardTitle className="text-xl text-accent font-manrope mb-1">{story.name}’s Journey: {story.role}</CardTitle>
                      <p className="text-sm text-card-foreground/80 mb-2"><strong className="font-medium text-card-foreground">Initial Experience:</strong> {story.experience}</p>
                      <p className="text-sm text-card-foreground/80"><strong className="font-medium text-card-foreground">Solution & Outcome:</strong> {story.solution}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section id="management-tips" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-6">
              3. How to Manage Braces Pain: Your Go-To Guide
            </h2>
            <p className="text-foreground/90 mb-4">Here are Dr. Loji’s top tips for handling any discomfort during your braces journey:</p>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-accent mb-2">Over-the-Counter Helpers:</h3>
                <ul className="list-disc pl-5 space-y-1 text-foreground/90">
                  {painManagementTips.overTheCounter.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium text-accent mb-2">Diet Adjustments (Temporary!):</h3>
                <p className="text-foreground/90 mb-1">For the first few days after getting braces or an adjustment, be kind to your teeth.</p>
                <p className="text-foreground/90"><strong className="font-medium">Avoid:</strong> {painManagementTips.dietAdjustments.avoid}</p>
                <p className="text-foreground/90"><strong className="font-medium">Opt For:</strong> {painManagementTips.dietAdjustments.optFor}</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-accent mb-2">Orthodontic Tools (Your New Best Friends!):</h3>
                <ul className="list-disc pl-5 space-y-1 text-foreground/90">
                  {painManagementTips.orthoTools.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium text-accent mb-2">Cold Therapy:</h3>
                <ul className="list-disc pl-5 space-y-1 text-foreground/90">
                  {painManagementTips.coldTherapy.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />
          
          <section id="faq" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-6">
              4. FAQs About Braces Pain: Common Questions Answered
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
              Conclusion: Your Comfort, Our Priority – Straightening Smiles in Ernakulam
            </h2>
            <div className="space-y-4 text-foreground/90 max-w-3xl mx-auto">
              <p>
                Braces pain is a temporary part of the journey, but with the right strategies and support, it’s entirely manageable. At Dr. Loji’s Dental Clinic in Vattaparambu, Ernakulam, we combine expert orthodontic care with personalized advice to ensure your journey to a perfect smile is as smooth and stress-free as possible. Whether you’re a teen like Anjali, a professional like Rajesh, or anyone in between, our dedicated team is here to support you every step of the way.
              </p>
            </div>
          </section>

           <section className="my-12 text-center">
            <h3 className="text-2xl font-semibold text-accent mb-4">Ready for Expert Care?</h3>
            <p className="text-muted-foreground mb-6">
             Book a consultation today at Dr. Loji's Dental Clinic, and take the first step toward a straighter, healthier, and more comfortable smile.
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

