"use client";

import { useMediMind } from '@/lib/store';
import { Header } from '@/components/dashboard/Header';
import { NextDoseCountdown } from '@/components/dashboard/NextDoseCountdown';
import { TodayTimeline } from '@/components/dashboard/TodayTimeline';
import { MedicationList } from '@/components/medications/MedicationList';
import { InventoryAlert } from '@/components/dashboard/InventoryAlert';
import { NavBar } from '@/components/navigation/NavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, isUserLoading, medications = [], profile, logDose, getTodayDoses, isLoaded, t } = useMediMind();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">Initializing User...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <p className="text-sm font-bold text-muted-foreground">Please log in to continue</p>
        <Button onClick={() => router.push('/login')}>
          <LogIn className="h-4 w-4 mr-2" /> Sign In
        </Button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">{t('syncing')}</p>
      </div>
    );
  }

  const todayDoses = getTodayDoses() || [];
  const nextDose = todayDoses.find(d => d.status === 'pending');
  const lowStockMeds = (medications || []).filter(m => m.remainingQuantity <= m.refillThreshold);

  return (
    <div className="flex flex-col h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <div className="pt-[env(safe-area-inset-top)] bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Header userName={profile.name} />
      </div>
      
      <ScrollArea className="flex-1 px-6 pb-6">
        <div className="space-y-8 py-4">
          {/* Next Dose Highlight */}
          {nextDose ? (
            <NextDoseCountdown 
              medication={nextDose.med} 
              scheduledTime={nextDose.time} 
            />
          ) : (
            <div className="p-6 bg-secondary rounded-2xl text-center">
              <p className="text-sm font-bold text-muted-foreground">{t('allDosesCompleted')}</p>
            </div>
          )}

          {/* AI Refill Alerts */}
          {lowStockMeds.length > 0 && (
            <div className="space-y-2">
              {lowStockMeds.slice(0, 1).map(med => (
                <InventoryAlert key={med.id} medication={med} />
              ))}
            </div>
          )}

          {/* Today's Timeline */}
          <TodayTimeline 
            doses={todayDoses} 
            onAction={(id, time, status) => logDose(id, time, status)} 
          />

          {/* Active Medications List */}
          <MedicationList medications={medications || []} />
        </div>
      </ScrollArea>

      <NavBar />
    </div>
  );
}