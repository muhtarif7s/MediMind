"use client";

import { useMediMind } from '@/lib/store';
import { Header } from '@/components/dashboard/Header';
import { NextDoseCountdown } from '@/components/dashboard/NextDoseCountdown';
import { TodayTimeline } from '@/components/dashboard/TodayTimeline';
import { MedicationList } from '@/components/medications/MedicationList';
import { InventoryAlert } from '@/components/dashboard/InventoryAlert';
import { NavBar } from '@/components/navigation/NavBar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const { medications, profile, logDose, getTodayDoses, isLoaded } = useMediMind();

  if (!isLoaded) return null;

  const todayDoses = getTodayDoses();
  const nextDose = todayDoses.find(d => d.status === 'pending');
  const lowStockMeds = medications.filter(m => m.remainingQuantity <= m.refillThreshold);

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
              <p className="text-sm font-bold text-muted-foreground">All doses for today completed!</p>
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
          <MedicationList medications={medications} />
        </div>
      </ScrollArea>

      <NavBar />
    </div>
  );
}
