
import { Medication } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pill, Droplet, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useMediMind } from '@/lib/store';

export function MedicationList({ medications }: { medications: Medication[] }) {
  const { t, profile } = useMediMind();
  const isRTL = profile.language === 'ar';

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{t('yourMedications')}</h3>
        <Link href="/medications/add">
          <Button size="sm" variant="ghost" className="h-8 px-2 text-primary font-bold">
            <Plus className="h-4 w-4 mr-1" /> {t('add')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {medications.map(med => {
          const progress = (med.remainingQuantity / med.totalQuantity) * 100;
          
          return (
            <Link key={med.id} href={`/medications/${med.id}`}>
              <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all active:scale-[0.98]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 w-fit shrink-0">
                    {med.dosageUnit === 'ml' || med.dosageUnit === 'drop' ? 
                      <Droplet className="h-5 w-5 text-primary" /> : 
                      <Pill className="h-5 w-5 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0 text-start">
                    <h4 className="font-bold text-sm mb-1 truncate">{med.name}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {med.dosageAmount} {t(med.dosageUnit as any)} • {med.times.length}x {t('dailySchedule')}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold">
                        <span>{t('supply')}</span>
                        <span className={progress < 20 ? "text-destructive" : ""}>{med.remainingQuantity} {t('left')}</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {medications.length === 0 && (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="p-10 flex flex-col items-center justify-center text-muted-foreground">
            <Plus className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">{t('noMedicationsAdded')}</p>
            <Link href="/medications/add" className="mt-4">
              <Button size="sm">{t('addFirstMedicine')}</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
