
import { Medication } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pill, Droplet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function MedicationList({ medications }: { medications: Medication[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Your Medications</h3>
        <Link href="/medications/add">
          <Button size="sm" variant="ghost" className="h-8 px-2 text-primary font-bold">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {medications.map(med => {
          const progress = (med.remainingQuantity / med.totalQuantity) * 100;
          
          return (
            <Card key={med.id} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-3">
                  {med.dosageUnit === 'ml' || med.dosageUnit === 'drop' ? 
                    <Droplet className="h-4 w-4 text-primary" /> : 
                    <Pill className="h-4 w-4 text-primary" />
                  }
                </div>
                <h4 className="font-bold text-sm mb-1 truncate">{med.name}</h4>
                <p className="text-[10px] text-muted-foreground mb-3">
                  {med.times.length} times / day
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span>Stock</span>
                    <span className={progress < 20 ? "text-destructive" : ""}>{med.remainingQuantity} left</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {medications.length === 0 && (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="p-10 flex flex-col items-center justify-center text-muted-foreground">
            <Plus className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">No medications added yet</p>
            <Link href="/medications/add" className="mt-4">
              <Button size="sm">Add First Medicine</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
