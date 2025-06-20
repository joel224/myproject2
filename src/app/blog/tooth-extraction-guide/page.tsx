
import { MainNavbar } from '@/components/layout/MainNavbar';
import { Footer } from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, AlertTriangle, Phone, Users, Smile, CalendarCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Tooth Extraction in Ernakulam: Your Easy Guide to a Comfortable Experience",
  description: "Need a tooth extraction in Ernakulam? Dr. Loji’s Dental Clinic in Vattaparambu offers a comfortable experience. Learn about the process, why it's needed, and our gentle approach.",
  keywords: "tooth extraction Ernakulam, dental emergency Vattaparambu, tooth removal aftercare Kochi, wisdom tooth extraction Kerala, Dr. Loji's Dental Clinic",
};

const patientStories = [
  {
    name: "Ravi",
    role: "Construction Worker",
    story: "He's a hardworking construction worker who badly fractured one of his back teeth in an accident. The pain was unbearable, and he imagined a difficult, painful procedure. \"I was so stressed about getting it taken out,\" Ravi told us, \"but Dr. Loji’s team was incredibly understanding and gentle. Honestly, the procedure was much smoother than I thought, and I felt better so quickly!\" Ravi's fast recovery meant he could get back to his important work, showing how we focus on smooth, caring treatment.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "construction worker",
  },
  {
    name: "Ms. Kamala",
    role: "Grandmother, 68",
    story: "A lovely 68-year-old grandmother, had lived with a constantly infected tooth for years because she was scared of dental procedures. \"The pain was always there, and it made it hard for me to eat or sleep well,\" she shared. Finally, her family convinced her to visit Dr. Loji. \"The extraction itself was surprisingly gentle. But the best part? That constant throbbing pain disappeared almost immediately. Now I can actually enjoy my meals and sleep soundly.\" Ms. Kamala’s story truly shows how an extraction, though it might seem scary, can bring incredible relief and greatly improve your everyday life.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "elderly woman smiling",
  }
];

const aftercareDos = [
  "Stick to easy-to-chew foods like yogurt, mashed potatoes, lukewarm soups (not hot!), smoothies, and scrambled eggs for the first few days.",
  "Starting 24 hours after your extraction, gently rinse your mouth with warm saltwater (half a teaspoon of salt in a glass of warm water) or a special mouthwash Dr. Loji might give you. Don't swish too hard!",
  "Follow all instructions for any pain relievers or antibiotics we prescribe.",
  "Put an ice pack on your cheek (outside the mouth) for 15-20 minutes at a time (take a 20-minute break in between) for the first day or two. This helps reduce swelling.",
  "Keep your head slightly elevated with pillows when lying down. This also helps with swelling."
];

const aftercareDonts = [
  "This is really important! Avoid it for at least 3 days (72 hours) as it seriously increases the risk of dry socket and slows healing.",
  "The sucking motion can pull out the important blood clot in the empty socket, which leads to dry socket.",
  "Avoid heavy lifting, intense exercise, or bending over for at least 2 days (48 hours) to prevent bleeding or dislodging the clot.",
  "It’s important to keep your fingers and tongue away from the extraction site. Touching it can disrupt the healing blood clot and introduce germs, slowing down your recovery.",
  "Again, this can dislodge the blood clot."
];

const faqs = [
    {
        question: "How long will my mouth hurt after taking a tooth out?",
        answer: "The most noticeable pain usually calms down within 2-3 days. You can use pain medicine (prescribed or over-the-counter) as Dr. Loji suggests to manage it."
    },
    {
        question: "When can I eat my regular food again?",
        answer: "Start with soft foods for the first 2-3 days. Then, gradually try introducing more solid foods as you feel comfortable, usually after about a week. Just try to avoid chewing directly on the spot where the tooth was removed."
    },
    {
        question: "Will I get stitches after the tooth is out?",
        answer: "Sometimes, yes. Depending on the size of the area, Dr. Loji might place a few stitches that will dissolve on their own in a few days or a week."
    },
    {
        question: "What if I don't get the tooth taken out when the dentist says I should?",
        answer: "Delaying a needed extraction can make the pain worse, allow the infection to spread to other teeth or even affect your whole body, damage nearby healthy teeth, or make future treatments much more complicated."
    },
    {
        question: "What can I do to fill the gap after the tooth is gone?",
        answer: "We have excellent options! These include dental implants (which feel and look most like your natural teeth), dental bridges (which span the gap), or removable partial dentures. Dr. Loji will discuss the best solution for you once the area has healed."
    },
    {
        question: "Can I exercise right after a tooth extraction?",
        answer: "It's best to avoid heavy exercise, lifting, or bending over for at least 2-3 days (48-72 hours) after the extraction. This helps prevent bleeding or dislodging the important blood clot. Listen to your body and ease back into your normal activities slowly."
    },
    {
        question: "Is it normal for my face to swell or bruise a little?",
        answer: "Yes, some mild swelling and a little bruising around the extraction site or on your cheek are normal. This can last for a few days. Using ice packs on and off for the first 1-2 days can really help reduce it."
    }
];

const whenToCallPoints = [
    "A fever over 100.4°F (38°C).",
    "Heavy bleeding that doesn't stop even after you apply pressure.",
    "Pus or a bad smell coming from the extraction area.",
    "Severe pain that your medication isn't helping with, or pain that gets much worse.",
    "Swelling that increases after the first 2-3 days.",
    "Numbness that continues for many hours after the procedure."
];


export default function ToothExtractionBlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainNavbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-manrope mb-4">
              Tooth Extraction in Ernakulam: Your Easy-to-Understand Guide to a Comfortable Experience
            </h1>
            <p className="text-lg text-muted-foreground">
              At Dr. Loji’s Dental Clinic in Vattaparambu, Ernakulam, we know that hearing you might need a tooth removed can sound scary. It’s a natural worry! But sometimes, taking out a tooth that's badly damaged or infected is actually the best step to protect your smile and keep your mouth healthy in the long run.
            </p>
             <div className="my-6 p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                <p className="italic text-foreground/90">
                    Think about Ravi’s story: {patientStories[0].story}
                </p>
                <div className="mt-3">
                     <Image src={patientStories[0].image} alt={patientStories[0].name} width={300} height={200} className="rounded-md mx-auto shadow-md" data-ai-hint={patientStories[0].dataAiHint} />
                </div>
            </div>
            <p className="text-muted-foreground">
              In this simple guide, we’ll explain what a tooth extraction involves, why it might be needed, and how Dr. Loji’s team makes sure you’re comfortable every step of the way.
            </p>
          </header>

          <Separator className="my-8 md:my-12" />

          <section id="what-is-extraction" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-4">
              1. What Exactly is a Tooth Extraction? (And Why It's Sometimes Needed)
            </h2>
            <div className="space-y-4 text-foreground/90">
              <p>
                A tooth extraction is simply taking a tooth out of its spot in your jawbone. At Dr. Loji’s Dental Clinic, we always try our best to save your natural teeth with fillings, crowns, or other treatments. But there are times when removing a tooth is the wisest choice to keep your whole mouth healthy. These common situations include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Very Bad Decay or Infection: Imagine a cavity that’s gone too deep, or an infection that's spread too far to be fixed with a regular filling or root canal. Removing it stops the problem from getting worse.</li>
                <li>Serious Gum Disease: If gum disease has weakened the bone and tissues holding a tooth so much that it's very loose, it might need to come out.</li>
                <li>Crowded Teeth: Sometimes, teeth are too squished together. Taking one or more out creates space so other teeth can be straightened with braces or aligners.</li>
                <li>Damaged or Broken Teeth: If a tooth is severely cracked or broken beyond repair from an injury.</li>
                <li>Troublesome Wisdom Teeth: These are the very back teeth that often don't have enough room to grow in properly. They can cause pain, swelling, or even damage nearby teeth, so taking them out brings relief.</li>
              </ul>
              <p>
                Our caring team at Dr. Loji’s Clinic uses modern techniques and offers different ways to help you relax if you’re feeling nervous, making the process as easy as possible.
              </p>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section id="when-to-extract" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-4">
              2. When Does a Dentist Say "This Tooth Needs to Go"?
            </h2>
            <div className="space-y-4 text-foreground/90">
              <p>Your dentist might suggest a tooth extraction if:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Other Fixes Didn't Work: We've tried fillings, crowns, or root canals, but the tooth is just too damaged to save.</li>
                <li>For Straight Teeth: If your teeth are too crowded, removing one can create the necessary space for braces or clear aligners to work effectively.</li>
                <li>Risk of Spreading Infection: A very decayed or infected tooth is like a bad apple in a basket – it can cause problems for nearby healthy teeth and gums, or even your overall health. Removing it stops the spread.</li>
                <li>Problematic Wisdom Teeth: These often cause pain, swelling, or even cysts because they're stuck or growing in the wrong direction. Taking them out usually solves these problems.</li>
              </ul>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section id="extraction-journey" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-4">
              3. Your Tooth Extraction Journey: What Happens Step-by-Step
            </h2>
            <p className="text-muted-foreground mb-4">Knowing what to expect can really help calm your nerves. Here’s how we make the process gentle at Dr. Loji's:</p>
            
            <div className="space-y-6">
                <div className="p-4 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-accent font-manrope mb-2">Getting Ready: Making You Comfortable</h3>
                    <ul className="list-disc pl-5 space-y-1 text-card-foreground/90">
                        <li>First Chat: We’ll talk about your health history, any medications you take, and answer all your questions. We want you to feel totally at ease.</li>
                        <li>Taking Pictures: We use X-rays or special 3D scans to get a very clear picture of your tooth and its roots. This helps us plan exactly how to remove it safely.</li>
                        <li>Options to Relax: We offer different ways to make sure you're comfortable:
                            <ul className="list-circle pl-5 space-y-0.5 mt-1">
                                <li>Local Numbing: This makes the area around the tooth completely numb, so you won't feel pain during the procedure.</li>
                                <li>Relaxing Pills: If you're a bit anxious, we can give you a pill to take before your appointment to help you feel calm.</li>
                                <li>Deeper Relaxation (IV Sedation): For those who are very nervous or for more complex cases, a trained professional can give you medicine through an IV to help you feel completely calm and comfortably unaware during the procedure, almost like you're napping.</li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <div className="p-4 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-accent font-manrope mb-2">During the Procedure: Gentle and Quick</h3>
                    <ul className="list-disc pl-5 space-y-1 text-card-foreground/90">
                        <li>Numbing Up: We’ll make sure the area is completely numb with local anesthesia. You might feel some pressure, but no sharp pain.</li>
                        <li>Gentle Removal: Dr. Loji will use special, clean tools to carefully loosen the tooth from its spot and remove it. We always work gently to protect the tissues around it.</li>
                        <li>Caring for the Spot: After the tooth is out, we’ll make sure the empty spot (the socket) is clean. Sometimes, we might place a few stitches that will naturally dissolve and disappear on their own – so you won’t need to come back to have them removed. In some cases, we might suggest adding a bone graft – it's like a special filler that helps keep your jawbone strong, especially if you’re thinking about a dental implant later.</li>
                    </ul>
                    <p className="mt-2 text-sm text-card-foreground/80">The whole process usually takes about 30–60 minutes, though a more complex case, like a tricky wisdom tooth, might take a little longer.</p>
                </div>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section id="benefits-risks" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-4">
              4. Why Extracting is Worth It: Benefits vs. Small Risks
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-accent font-manrope mb-2 flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5"/>The Good Parts: Immediate Relief & Long-Term Health</h3>
                    <ul className="list-disc pl-5 space-y-1 text-card-foreground/90">
                        <li>Pain Gone: If your tooth is causing constant pain from infection or injury, taking it out often brings immediate, wonderful relief.</li>
                        <li>Stops Spread of Problems: Removing an infected tooth is like stopping a fire from spreading. It prevents harmful bacteria from affecting your other healthy teeth, gums, and even your overall body health.</li>
                        <li>Better Mouth Health: Taking out a tooth can create needed space for other teeth to be straightened. It also prepares the area for future replacements like dental implants or bridges, which can greatly improve how you bite, chew, and smile.</li>
                    </ul>
                </div>
                 <div className="p-4 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-accent font-manrope mb-2 flex items-center"><AlertTriangle className="text-orange-500 mr-2 h-5 w-5"/>Small Things to Know: Potential Minor Risks</h3>
                    <p className="text-sm text-card-foreground/90 mb-2">While generally very safe, like any medical procedure, there are a few minor things to be aware of:</p>
                    <ul className="list-disc pl-5 space-y-1 text-card-foreground/90">
                        <li>Dry Socket: This is rare, but it happens if the crucial blood clot that forms in the empty tooth spot gets dislodged too early. It can be painful, but following our aftercare tips carefully almost always prevents it. If you do experience it, please know we are here to help and can easily treat it.</li>
                        <li>Infection or Swelling: Following our instructions after the procedure helps keep these risks very low. We'll give you clear guidelines and might even prescribe antibiotics if needed.</li>
                        <li>Nerve Injury: This is incredibly rare, and we take every precaution to prevent it. Our detailed scans and careful planning help us avoid any nerve issues, especially in complex cases involving lower wisdom teeth.</li>
                    </ul>
                </div>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section id="aftercare" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-4">
              5. Getting Better & What to Do: Real Tips from Patients
            </h2>
            <p className="text-muted-foreground mb-4">Initial healing usually takes 3–7 days, but your jawbone will continue to heal fully over several weeks. Following our aftercare instructions closely is super important for a comfortable and speedy recovery.</p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 font-manrope mb-2">The "DOs" for a Smooth Recovery:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-green-800 dark:text-green-300">
                        {aftercareDos.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 font-manrope mb-2">The "DON'Ts" to Avoid Problems:</h3>
                     <ul className="list-disc pl-5 space-y-1 text-red-800 dark:text-red-300">
                        <li>No Smoking or Vaping: {aftercareDonts[0]}</li>
                        <li>No Straws: {aftercareDonts[1]}</li>
                        <li>No Heavy Workouts: {aftercareDonts[2]}</li>
                        <li>Don't Touch the Spot: {aftercareDonts[3]}</li>
                        <li>No Forceful Spitting: {aftercareDonts[4]}</li>
                    </ul>
                </div>
            </div>
            <div className="my-6 p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-primary mb-1">Ravi’s Recovery Story: Following the Rules Paid Off!</h4>
                <p className="italic text-foreground/90">
                    "After my emergency tooth removal, I was determined to get better quickly," Ravi told us. "I followed all of Dr. Loji’s aftercare advice strictly—no smoking, only soft foods for several days, and I used ice packs for swelling exactly as told. By day three, I felt almost completely normal and ready to slowly ease back into my routine." Ravi’s carefulness shows how much following instructions helps in healing!
                </p>
            </div>
             <div className="my-6 p-4 bg-accent/10 rounded-lg border-l-4 border-accent">
                <h4 className="font-semibold text-accent-foreground mb-1">Ms. Kamala's Journey: From Constant Pain to Peaceful Living</h4>
                <p className="italic text-foreground/90">
                    {patientStories[1].story}
                </p>
                 <div className="mt-3">
                     <Image src={patientStories[1].image} alt={patientStories[1].name} width={300} height={200} className="rounded-md mx-auto shadow-md" data-ai-hint={patientStories[1].dataAiHint} />
                </div>
            </div>
          </section>

          <Separator className="my-8 md:my-12" />
          
          <section id="faq" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-6">
              6. FAQs: Your Common Questions, Answered Simply
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-card border rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-accent font-manrope mb-1">{faq.question}</h3>
                  <p className="text-card-foreground/90">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-8 md:my-12" />

          <section id="when-to-call" className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary font-manrope mb-4">
              7. When to Give Dr. Loji’s Team a Call Right Away
            </h2>
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg shadow-sm">
                <p className="text-destructive-foreground/90 mb-3">Your comfort and safety are our highest priorities. Please call Dr. Loji’s Dental Clinic immediately if you experience any of these:</p>
                <ul className="list-disc pl-5 space-y-1 text-destructive-foreground/90">
                    {whenToCallPoints.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
          </section>
          
          <Separator className="my-8 md:my-12" />

          <section className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary font-manrope mb-6">
              Conclusion: Your Oral Health Starts Here with Our Compassionate Care
            </h2>
            <div className="space-y-4 text-foreground/90 max-w-3xl mx-auto">
              <p>
                At Dr. Loji’s Dental Clinic, we combine our dental expertise with a deep sense of care to make your tooth extraction experience as calm and comfortable as possible. Whether you're facing an unexpected dental emergency like Ravi, dealing with ongoing pain like Ms. Kamala, or simply preparing for future orthodontic treatment, our dedicated team is here to support you every step of the way, ensuring your long-term oral health.
              </p>
            </div>
          </section>

           <section className="my-12 text-center">
            <h3 className="text-2xl font-semibold text-accent mb-4">Ready for Expert Care?</h3>
            <p className="text-muted-foreground mb-6">
             Book a consultation today at Dr. Loji's Dental Clinic in Vattaparambu, Ernakulam, and take the first easy step toward a healthier, pain-free smile.
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

