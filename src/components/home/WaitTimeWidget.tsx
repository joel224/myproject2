
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
      className="fixed bottom-4 right-4 z-30 shadow-2xl rounded-lg"
    >
      <Card className="bg-primary text-primary-foreground w-full max-w-[240px] sm:max-w-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-sm font-semibold">Live Wait Time</CardTitle>
          <Clock className="h-4 w-4 text-primary-foreground/80" />
        </CardHeader>
        <CardContent className="pt-1 pb-3 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary-foreground/70" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center text-center text-primary-foreground/80 py-1">
              <AlertTriangle className="h-5 w-5 mb-0.5" />
              <p className="text-xs">
                {error}
              </p>
            </div>
          ) : (
            <>
              {waitTime && waitTime.text ? (
                <>
                  <div className="text-xl sm:text-2xl font-bold">{waitTime.text.replace('<', 'Less than ')}</div>
                  <p className="text-[10px] sm:text-xs text-primary-foreground/70 mt-0.5">
                    Last updated: {waitTime.updatedAt ? new Date(waitTime.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </p>
                </>
              ) : (
                <div className="text-xl sm:text-2xl font-bold">-</div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
