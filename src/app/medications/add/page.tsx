
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediMind } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { DosageUnit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AddMedication() {
  const router = useRouter();
  const { addMedication } = useMediMind();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1');
  const [unit, setUnit] = useState<DosageUnit>('pill');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [totalQuantity, setTotalQuantity] = useState('30');
  const [refillThreshold, setRefillThreshold] = useState('5');

  const handleAddTime = () => setTimes([...times, '12:00']);
  const handleRemoveTime = (index: number) => setTimes(times.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

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
      title: "Medication Added",
      description: `${name} has been added to your schedule.`
    });
    router.push('/');
  };

  return (
    <div className="p-6 space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Add Medication</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Medication Name</Label>
          <Input id="name" placeholder="e.g. Paracetamol" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage Amount</Label>
            <Input id="dosage" type="number" value={dosage} onChange={e => setDosage(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={(v: DosageUnit) => setUnit(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pill">Pill</SelectItem>
                <SelectItem value="mg">mg</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="drop">Drop</SelectItem>
                <SelectItem value="capsule">Capsule</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daily Schedule</Label>
            <Button type="button" variant="ghost" size="sm" onClick={handleAddTime} className="h-8 text-primary font-bold">
              <Plus className="h-4 w-4 mr-1" /> Add Time
            </Button>
          </div>
          {times.map((time, idx) => (
            <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left duration-200">
              <Input type="time" value={time} onChange={e => {
                const newTimes = [...times];
                newTimes[idx] = e.target.value;
                setTimes(newTimes);
              }} />
              {times.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTime(idx)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total">Initial Stock</Label>
            <Input id="total" type="number" value={totalQuantity} onChange={e => setTotalQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Alert Threshold</Label>
            <Input id="threshold" type="number" value={refillThreshold} onChange={e => setRefillThreshold(e.target.value)} />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
           <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
           <Button type="submit" className="flex-1 bg-primary text-primary-foreground font-bold">Save Medication</Button>
        </div>
      </form>
    </div>
  );
}
