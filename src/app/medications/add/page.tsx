
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediMind } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { DosageUnit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export default function AddMedication() {
  const router = useRouter();
  const { addMedication, t, profile } = useMediMind();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1');
  const [unit, setUnit] = useState<DosageUnit>('pill');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [totalQuantity, setTotalQuantity] = useState('30');
  const [refillThreshold, setRefillThreshold] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = profile.language === 'ar';

  const handleAddTime = () => setTimes([...times, '12:00']);
  const handleRemoveTime = (index: number) => setTimes(times.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({ variant: "destructive", title: t('authError'), description: t('medicationName') });
      return;
    }

    setIsSubmitting(true);
    addMedication({
      name,
      dosageAmount: parseFloat(dosage),
      dosageUnit: unit,
      times,
      startDate: new Date().toISOString(),
      totalQuantity: parseFloat(totalQuantity),
      remainingQuantity: parseFloat(totalQuantity),
      refillThreshold: parseFloat(refillThreshold),
      frequency: 'daily',
    });

    toast({
      title: t('profileUpdated'),
      description: `${name} ${t('profileUpdateSuccess')}`,
    });
    
    setTimeout(() => {
      router.push('/medications');
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-card border-b flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className={`h-6 w-6 ${isRTL ? 'rotate-180' : ''}`} />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('newMedication')}</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8 pb-32">
            <div className="space-y-4">
              <div className="space-y-2 text-start">
                <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">{t('medicationName')}</Label>
                <Input 
                  id="name" 
                  placeholder={t('medicationName')} 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  className="h-12 text-lg font-bold rounded-2xl bg-card border-input shadow-sm text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-start">
                  <Label htmlFor="dosage" className="text-xs font-bold uppercase text-muted-foreground">{t('dosageAmount')}</Label>
                  <Input 
                    id="dosage" 
                    type="number" 
                    value={dosage} 
                    onChange={e => setDosage(e.target.value)} 
                    className="h-12 rounded-2xl bg-card border-input shadow-sm text-foreground"
                  />
                </div>
                <div className="space-y-2 text-start">
                  <Label htmlFor="unit" className="text-xs font-bold uppercase text-muted-foreground">{t('unit')}</Label>
                  <Select value={unit} onValueChange={(v: DosageUnit) => setUnit(v)}>
                    <SelectTrigger className="h-12 rounded-2xl bg-card border-input shadow-sm text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      <SelectItem value="pill">{t('pill')}</SelectItem>
                      <SelectItem value="mg">{t('mg')}</SelectItem>
                      <SelectItem value="ml">{t('ml')}</SelectItem>
                      <SelectItem value="drop">{t('drop')}</SelectItem>
                      <SelectItem value="capsule">{t('capsule')}</SelectItem>
                      <SelectItem value="injection">{t('injection')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Card className="border-none shadow-sm bg-primary/5 rounded-[2rem]">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <Label className="font-bold text-foreground">{t('reminderTimes')}</Label>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddTime} className="h-8 text-primary font-bold">
                    <Plus className="h-4 w-4 mr-1" /> {t('add')}
                  </Button>
                </div>
                <div className="space-y-3">
                  {times.map((time, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        value={time} 
                        onChange={e => {
                          const newTimes = [...times];
                          newTimes[idx] = e.target.value;
                          setTimes(newTimes);
                        }} 
                        className="h-11 rounded-xl bg-background border-input shadow-sm flex-1 text-foreground"
                      />
                      {times.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTime(idx)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-start px-1">
                <Calendar className="h-4 w-4 text-primary" />
                <Label className="font-bold text-sm text-foreground">{t('inventoryTracking')}</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-start">
                  <Label htmlFor="total" className="text-[10px] uppercase font-bold text-muted-foreground">{t('initialStock')}</Label>
                  <Input 
                    id="total" 
                    type="number" 
                    value={totalQuantity} 
                    onChange={e => setTotalQuantity(e.target.value)} 
                    className="h-11 rounded-xl bg-card border-input shadow-sm text-foreground"
                  />
                </div>
                <div className="space-y-2 text-start">
                  <Label htmlFor="threshold" className="text-[10px] uppercase font-bold text-muted-foreground">{t('alertThreshold')}</Label>
                  <Input 
                    id="threshold" 
                    type="number" 
                    value={refillThreshold} 
                    onChange={e => setRefillThreshold(e.target.value)} 
                    className="h-11 rounded-xl bg-card border-input shadow-sm text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-20">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-14 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl active:scale-[0.98] transition-transform"
          >
            {isSubmitting ? t('saving') : t('createSchedule')}
          </Button>
        </div>
      </form>
    </div>
  );
}
