
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
    // Set up an interval to refetch wait time periodically, e.g., every minute
    const intervalId = setInterval(fetchWaitTime, 60000); 

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-30 shadow-2xl rounded-lg"
    >
      <Card className="bg-primary text-primary-foreground w-full max-w-xs sm:max-w-sm"> {/* Adjusted max-width */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold">Live Wait Time</CardTitle> {/* Responsive text size */}
          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground/80" /> {/* Responsive icon size */}
        </CardHeader>
        <CardContent className="pt-1"> {/* Reduced top padding for content */}
          {isLoading && !waitTime ? ( // Show loader only on initial load if no data yet
            <div className="flex items-center justify-center h-10">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary-foreground/70" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center text-center text-primary-foreground/80 py-2">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 mb-1" />
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          ) : waitTime ? (
            <>
              <div className="text-2xl sm:text-3xl font-bold">{waitTime.text}</div>
              <p className="text-xs sm:text-sm text-primary-foreground/70 mt-0.5"> 
                Current estimate. Last updated: {waitTime.updatedAt ? new Date(waitTime.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </>
          ) : (
             <div className="text-2xl sm:text-3xl font-bold">-</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
