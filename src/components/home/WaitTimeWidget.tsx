import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export function WaitTimeWidget() {
  return (
    <section className="w-full py-8 md:py-12">
      <div className="container px-4 md:px-6 flex justify-center">
        <Card className="bg-primary text-primary-foreground shadow-lg w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Live Wait Time</CardTitle>
            <Clock className="h-6 w-6 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">&lt;10 mins</div>
            <p className="text-xs text-primary-foreground/70">
              Current estimated wait time for walk-ins.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
