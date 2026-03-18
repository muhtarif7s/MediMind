
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
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-foreground">{t('yourMedications')}</h3>
        <Link href="/medications/add">
          <Button size="sm" variant="ghost" className="h-8 px-2 text-primary font-bold hover:bg-primary/10 rounded-xl">
            <Plus className="h-4 w-4 mr-1" /> {t('add')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {medications.map(med => {
          const progress = (med.remainingQuantity / med.totalQuantity) * 100;
          
          return (
            <Link key={med.id} href={`/medications/${med.id}`}>
              <Card className="border shadow-sm overflow-hidden group hover:shadow-md transition-all active:scale-[0.98] bg-card rounded-[1.5rem]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 w-fit shrink-0 group-hover:bg-primary/20 transition-colors">
                    {med.dosageUnit === 'ml' || med.dosageUnit === 'drop' ? 
                      <Droplet className="h-5 w-5 text-primary" /> : 
                      <Pill className="h-5 w-5 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0 text-start">
                    <h4 className="font-bold text-sm mb-1 truncate text-foreground">{med.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {med.dosageAmount} {t(med.dosageUnit as any)} • {med.times.length}x {t('dailySchedule')}
                    </p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-muted-foreground uppercase">{t('supply')}</span>
                        <span className={progress < 20 ? "text-destructive" : "text-foreground"}>{med.remainingQuantity} {t('left')}</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted shrink-0 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {medications.length === 0 && (
        <Card className="border-dashed border-2 bg-muted/5 rounded-[2rem] border-muted/30">
          <CardContent className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <div className="p-4 bg-muted/20 rounded-full mb-4">
              <Pill className="h-12 w-12 opacity-20" />
            </div>
            <p className="text-sm font-medium mb-6">{t('noMedicationsAdded')}</p>
            <Link href="/medications/add">
              <Button size="sm" className="rounded-xl px-6 h-11 font-bold shadow-lg shadow-primary/20">
                {t('addFirstMedicine')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
