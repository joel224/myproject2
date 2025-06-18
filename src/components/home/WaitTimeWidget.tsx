
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClinicWaitTime {
  text: string;
  updatedAt?: string;
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
    const intervalId = setInterval(fetchWaitTime, 60000); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 shadow-2xl rounded-lg"
    >
      <Card className="bg-primary text-primary-foreground w-full max-w-[280px] sm:max-w-xs lg:max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4 lg:pt-4 lg:pb-2 lg:px-5">
          <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold">Live Wait Time</CardTitle>
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary-foreground/80" />
        </CardHeader>
        <CardContent className="pt-1 pb-3 px-4 lg:pt-2 lg:pb-4 lg:px-5">
          {isLoading && !waitTime ? (
            <div className="flex items-center justify-center h-8 lg:h-10">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 animate-spin text-primary-foreground/70" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center text-center text-primary-foreground/80 py-1">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 mb-0.5" />
              <p className="text-[11px] sm:text-xs lg:text-sm">{error}</p>
            </div>
          ) : waitTime ? (
            <>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{waitTime.text}</div>
              <p className="text-[10px] sm:text-xs lg:text-sm text-primary-foreground/70 mt-0.5">
                Last updated: {waitTime.updatedAt ? new Date(waitTime.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </>
          ) : (
             <div className="text-xl sm:text-2xl lg:text-3xl font-bold">-</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
