import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export function HealthTipCard() {
  // In a real app, this tip would rotate or be fetched.
  const tip = "Did You Know? Flossing daily can remove plaque regular brushing misses, significantly improving gum health!";
  
  return (
    <section className="w-full py-8 md:py-12 bg-secondary/30">
      <div className="container px-4 md:px-6 flex justify-center">
        <Card className="shadow-lg w-full max-w-2xl">
          <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
            <Lightbulb className="h-6 w-6 text-accent" />
            <CardTitle className="text-lg font-semibold text-accent-foreground">Oral Health Tip of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {tip}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
