
"use client";

import { useEffect, useState } from 'react';
import { Medication } from '@/lib/types';
import { generateRefillAlert, GenerateRefillAlertOutput } from '@/ai/flows/generate-refill-alert';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InventoryAlert({ medication }: { medication: Medication }) {
  const [alertData, setAlertData] = useState<GenerateRefillAlertOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAlert() {
      if (medication.remainingQuantity <= medication.refillThreshold) {
        setLoading(true);
        try {
          // Calculate average doses per day
          const dosesPerDay = medication.times.length;
          const result = await generateRefillAlert({
            medicineName: medication.name,
            currentQuantity: medication.remainingQuantity,
            dosageAmount: medication.dosageAmount,
            dosageUnit: medication.dosageUnit,
            dosesPerDay: dosesPerDay,
            refillThreshold: medication.refillThreshold,
          });
          setAlertData(result);
        } catch (error) {
          console.error("Failed to generate AI alert", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchAlert();
  }, [medication]);

  if (!alertData || !alertData.needsRefill) return null;

  return (
    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground animate-in slide-in-from-top duration-500">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-xs font-bold">Refill Required</AlertTitle>
      <AlertDescription className="text-[11px] leading-relaxed">
        {alertData.alertMessage} 
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold">{alertData.daysRemaining} days remaining</span>
          <Button size="sm" variant="outline" className="h-6 text-[9px] px-2 py-0 border-destructive/30 hover:bg-destructive/20">
            Order Refill
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
