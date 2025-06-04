
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Loader2, AlertTriangle } from 'lucide-react'; // Added Loader2 and AlertTriangle

interface ClinicWaitTime {
  text: string;
  updatedAt?: string; // Optional, as we mainly use text
}

export function WaitTimeWidget() {
  const [waitTime, setWaitTime] = useState<ClinicWaitTime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWaitTime = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/clinic/wait-time');
        if (!response.ok) {
          throw new Error('Failed to load wait time data.');
        }
        const data: ClinicWaitTime = await response.json();
        setWaitTime(data);
      } catch (err: any) {
        setError(err.message || 'Could not fetch wait time.');
        console.error("Error fetching wait time:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitTime();
    // Optional: set an interval to refresh the wait time periodically
    // const intervalId = setInterval(fetchWaitTime, 60000); // Refresh every 60 seconds
    // return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="w-full py-8 md:py-12">
      <div className="container px-4 md:px-6 flex justify-center">
        <Card className="bg-primary text-primary-foreground shadow-lg w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Live Wait Time</CardTitle>
            <Clock className="h-6 w-6 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary-foreground/70" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center text-primary-foreground/80">
                <AlertTriangle className="h-8 w-8 mb-1" />
                <p className="text-sm">{error}</p>
              </div>
            ) : waitTime ? (
              <>
                <div className="text-3xl font-bold">{waitTime.text}</div>
                <p className="text-xs text-primary-foreground/70">
                  Current estimated wait time for walk-ins.
                  {/* {waitTime.updatedAt && ` Last updated: ${new Date(waitTime.updatedAt).toLocaleTimeString()}`} */}
                </p>
              </>
            ) : (
               <div className="text-3xl font-bold">-</div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
