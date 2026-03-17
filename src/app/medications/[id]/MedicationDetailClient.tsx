
"use client";

import { useMediMind } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Pill, 
  Droplet, 
  Clock, 
  Calendar, 
  Info,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MedicationDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { medications, updateMedication, deleteMedication, isLoaded, profile, t } = useMediMind();
  const { toast } = useToast();
  
  const [refillAmount, setRefillAmount] = useState('');

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const med = medications?.find(m => m.id === id);

  if (!med) {
    return (
      <div className="p-6 text-center space-y-4 flex flex-col items-center justify-center h-screen" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
        <AlertCircle className="h-12 w-12 text-muted mx-auto" />
        <h2 className="text-xl font-bold">{t('medicationNotFound')}</h2>
        <Button onClick={() => router.push('/medications')}>{t('backToList')}</Button>
      </div>
    );
  }

  const stockPercent = (med.remainingQuantity / med.totalQuantity) * 100;

  const handleRefill = () => {
    const amount = parseFloat(refillAmount);
    if (isNaN(amount) || amount <= 0) return;

    updateMedication(med.id, {
      remainingQuantity: med.remainingQuantity + amount,
      totalQuantity: Math.max(med.totalQuantity, med.remainingQuantity + amount)
    });

    setRefillAmount('');
    toast({
      title: t('profileUpdated'),
      description: `${t('refill')} ${amount} ${med.dosageUnit} ${med.name}.`
    });
  };

  const handleDelete = () => {
    deleteMedication(med.id);
    toast({
      title: t('resetSuccess'),
      description: `${med.name} ${t('cancelled')}.`
    });
    router.push('/medications');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-background border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className={`h-6 w-6 ${profile.language === 'ar' ? 'rotate-180' : ''}`} />
          </Button>
          <h1 className="text-xl font-bold truncate max-w-[200px]">{med.name}</h1>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
            <AlertDialogHeader className="text-start">
              <AlertDialogTitle>{t('confirmClear')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmClear')} ({med.name})
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogCancel className="rounded-2xl">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground rounded-2xl">{t('save')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-10 no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3 text-start">
              <div className="p-2 bg-primary/10 rounded-xl">
                {med.dosageUnit === 'ml' || med.dosageUnit === 'drop' ? <Droplet className="h-5 w-5 text-primary" /> : <Pill className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('dosage')}</p>
                <p className="text-sm font-bold">{med.dosageAmount} {med.dosageUnit}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-accent/5">
            <CardContent className="p-4 flex items-center gap-3 text-start">
              <div className="p-2 bg-accent/10 rounded-xl">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('frequency')}</p>
                <p className="text-sm font-bold">{med.times.length}x {t('dailySchedule')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2 text-start">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Info className="h-4 w-4" /> {t('stockInventory')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-start">
              <div className="flex justify-between text-xs font-bold">
                <span>{t('totalQuantity')}</span>
                <span className={med.remainingQuantity <= med.refillThreshold ? "text-destructive" : ""}>
                  {med.remainingQuantity} / {med.totalQuantity} {med.dosageUnit}
                </span>
              </div>
              <Progress value={stockPercent} className="h-2" />
              {med.remainingQuantity <= med.refillThreshold && (
                <p className="text-[10px] text-destructive font-bold">{t('lowStockWarning')}</p>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <Input 
                type="number" 
                placeholder={t('refill')} 
                value={refillAmount}
                onChange={(e) => setRefillAmount(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
              <Button onClick={handleRefill} size="sm" className="rounded-xl h-9">
                <Plus className="h-4 w-4 mr-1" /> {t('refill')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-start">
            <Calendar className="h-4 w-4" /> {t('dailySchedule')}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {med.times.map((time, i) => (
              <div key={i} className="bg-card border rounded-xl p-3 text-center">
                <p className="text-sm font-bold">{time}</p>
                <p className="text-[10px] text-muted-foreground">{t('pending')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
