
"use client";

import { useMediMind } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Pill, 
  Droplet, 
  Clock, 
  Calendar, 
  Info,
  AlertCircle
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

// Required for static export with dynamic routes
export function generateStaticParams() {
  return [];
}

export default function MedicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { medications, updateMedication, deleteMedication, isLoaded } = useMediMind();
  const { toast } = useToast();
  
  const [refillAmount, setRefillAmount] = useState('');

  if (!isLoaded) return null;

  const med = medications?.find(m => m.id === id);

  if (!med) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-muted mx-auto" />
        <h2 className="text-xl font-bold">Medication not found</h2>
        <Button onClick={() => router.push('/medications')}>Back to list</Button>
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
      title: "Stock Updated",
      description: `Added ${amount} ${med.dosageUnit} to ${med.name}.`
    });
  };

  const handleDelete = () => {
    deleteMedication(med.id);
    toast({
      title: "Medication Removed",
      description: `${med.name} has been deleted.`
    });
    router.push('/medications');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="p-6 bg-background border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold truncate max-w-[200px]">{med.name}</h1>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove {med.name} and all its scheduled doses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground rounded-2xl">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-10 no-scrollbar">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                {med.dosageUnit === 'ml' || med.dosageUnit === 'drop' ? <Droplet className="h-5 w-5 text-primary" /> : <Pill className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Dosage</p>
                <p className="text-sm font-bold">{med.dosageAmount} {med.dosageUnit}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-accent/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Frequency</p>
                <p className="text-sm font-bold">{med.times.length}x daily</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Status */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Info className="h-4 w-4" /> Stock Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Current Supply</span>
                <span className={med.remainingQuantity <= med.refillThreshold ? "text-destructive" : ""}>
                  {med.remainingQuantity} / {med.totalQuantity} {med.dosageUnit}
                </span>
              </div>
              <Progress value={stockPercent} className="h-2" />
              {med.remainingQuantity <= med.refillThreshold && (
                <p className="text-[10px] text-destructive font-bold">Low stock! Refill recommended.</p>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <Input 
                type="number" 
                placeholder="Amount to add..." 
                value={refillAmount}
                onChange={(e) => setRefillAmount(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
              <Button onClick={handleRefill} size="sm" className="rounded-xl h-9">
                <Plus className="h-4 w-4 mr-1" /> Refill
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Daily Schedule
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {med.times.map((time, i) => (
              <div key={i} className="bg-card border rounded-xl p-3 text-center">
                <p className="text-sm font-bold">{time}</p>
                <p className="text-[10px] text-muted-foreground">Scheduled</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
