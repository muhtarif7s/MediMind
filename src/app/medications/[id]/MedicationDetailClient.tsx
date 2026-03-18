
"use client";

import { useMediMind } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const med = medications?.find(m => m.id === id);

  if (!med) {
    return (
      <div className="p-6 text-center space-y-4 flex flex-col items-center justify-center h-screen bg-background" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
        <AlertCircle className="h-12 w-12 text-muted mx-auto" />
        <h2 className="text-xl font-bold">{t('medicationNotFound')}</h2>
        <Button onClick={() => router.push('/medications')}>{t('backToList')}</Button>
      </div>
    );
  }

  const stockPercent = (med.remainingQuantity / med.totalQuantity) * 100;
  const isRTL = profile.language === 'ar';

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
    <div className="flex flex-col h-screen overflow-hidden bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-card border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className={`h-6 w-6 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <h1 className="text-xl font-bold truncate max-w-[200px] text-foreground">{med.name}</h1>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2rem] bg-card border" dir={isRTL ? 'rtl' : 'ltr'}>
            <AlertDialogHeader className="text-start">
              <AlertDialogTitle className="text-foreground">{t('confirmClear')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmClear')} ({med.name})
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogCancel className="rounded-xl flex-1">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white rounded-xl flex-1">{t('save')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 pb-20">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-primary/5 rounded-3xl">
              <CardContent className="p-4 flex items-center gap-3 text-start">
                <div className="p-2 bg-primary/10 rounded-xl">
                  {med.dosageUnit === 'ml' || med.dosageUnit === 'drop' ? <Droplet className="h-5 w-5 text-primary" /> : <Pill className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('dosage')}</p>
                  <p className="text-sm font-bold text-foreground">{med.dosageAmount} {t(med.dosageUnit as any)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-accent/5 rounded-3xl">
              <CardContent className="p-4 flex items-center gap-3 text-start">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('frequency')}</p>
                  <p className="text-sm font-bold text-foreground">{med.times.length}x {t('dailySchedule')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm bg-card rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2 text-start">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Info className="h-4 w-4 text-primary" /> {t('stockInventory')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-start">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">{t('totalQuantity')}</span>
                  <span className={med.remainingQuantity <= med.refillThreshold ? "text-destructive" : "text-foreground"}>
                    {med.remainingQuantity} / {med.totalQuantity} {t(med.dosageUnit as any)}
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
                  className="h-11 text-sm rounded-xl bg-background border-input"
                />
                <Button onClick={handleRefill} className="rounded-xl h-11 px-4 font-bold">
                  <Plus className="h-4 w-4 mr-1" /> {t('refill')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-start px-1 text-foreground">
              <Calendar className="h-4 w-4 text-primary" /> {t('dailySchedule')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {med.times.map((time, i) => (
                <Card key={i} className="border shadow-sm bg-card rounded-2xl p-3 text-center">
                  <p className="text-sm font-bold text-foreground">{time}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('pending')}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
