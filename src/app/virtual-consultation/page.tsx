import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, CheckCircle, WifiOff } from "lucide-react";
import Link from "next/link";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { Footer } from "@/components/layout/Footer";


export default function VirtualConsultationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center text-center">
          <Video className="h-24 w-24 text-primary mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Virtual Consultation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Connect with our experienced dentists from the comfort of your home. Get professional advice, discuss treatment options, or get a second opinion.
          </p>

          <Card className="w-full max-w-lg shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Start?</CardTitle>
              <CardDescription>Ensure you have a stable internet connection and a quiet environment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Before you begin:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>Good lighting is important.</li>
                  <li>Use a device with a camera and microphone.</li>
                  <li>Have any relevant photos or X-rays ready if requested.</li>
                </ul>
              </div>
              <Button size="lg" className="w-full bg-medicalAccent text-medicalAccent-foreground hover:bg-medicalAccent/90">
                Join Waiting Room
              </Button>
              <p className="text-xs text-muted-foreground">
                If you have a scheduled appointment, please join 5 minutes prior.
              </p>
            </CardContent>
          </Card>

          <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl w-full">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                <CheckCircle className="h-6 w-6 text-medicalAccent"/>
                <CardTitle className="text-lg">Benefits</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Convenient and time-saving.</li>
                  <li>Accessible from anywhere.</li>
                  <li>Preliminary assessment for your dental needs.</li>
                  <li>Discuss concerns without an in-office visit.</li>
                </ul>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                <WifiOff className="h-6 w-6 text-destructive"/>
                <CardTitle className="text-lg">Limitations</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Not for emergencies requiring immediate physical intervention.</li>
                  <li>A physical examination may still be required.</li>
                  <li>Diagnostic limitations without in-person tools.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

           <div className="mt-12">
            <Link href="/#appointment">
              <Button variant="outline">Book an In-Office Appointment</Button>
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
