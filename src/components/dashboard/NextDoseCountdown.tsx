"use client";

import { useState, useEffect } from 'react';
import { Medication } from '@/lib/types';
import { parseISO, differenceInSeconds, format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Pill, Clock, AlertCircle } from "lucide-react";
import { useMediMind } from '@/lib/store';

interface NextDoseProps {
  medication: Medication;
  scheduledTime: string;
}

export function NextDoseCountdown({ medication, scheduledTime }: NextDoseProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { t } = useMediMind();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = parseISO(scheduledTime);
      const diff = differenceInSeconds(target, now);
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [scheduledTime]);

  const isDue = timeLeft <= 0;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className={`${isDue ? 'bg-destructive/20' : 'bg-primary/20'} border-none shadow-lg overflow-hidden relative transition-colors duration-500`}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Pill className="h-24 w-24 rotate-45" />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          {isDue ? <AlertCircle className="h-4 w-4 text-destructive animate-pulse" /> : <Clock className="h-4 w-4 text-accent font-bold" />}
          <span className={`text-xs font-bold uppercase tracking-wider ${isDue ? 'text-destructive' : 'text-accent'}`}>
            {isDue ? 'Dose Due Now' : t('nextDose')}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-1">{medication.name}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {medication.dosageAmount} {medication.dosageUnit} at {format(parseISO(scheduledTime), 'hh:mm a')}
        </p>
        
        {!isDue ? (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold font-mono">{String(hours).padStart(2, '0')}</span>
              <span className="text-[10px] uppercase text-muted-foreground">Hrs</span>
            </div>
            <span className="text-3xl font-bold">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold font-mono">{String(minutes).padStart(2, '0')}</span>
              <span className="text-[10px] uppercase text-muted-foreground">Min</span>
            </div>
            <span className="text-3xl font-bold">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold font-mono">{String(seconds).padStart(2, '0')}</span>
              <span className="text-[10px] uppercase text-muted-foreground">Sec</span>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-lg font-bold text-destructive animate-bounce">Please take your medication</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
