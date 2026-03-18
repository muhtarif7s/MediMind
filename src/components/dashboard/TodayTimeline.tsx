"use client";

import { Medication, DoseStatus } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ar, enUS, fr, es, de } from 'date-fns/locale';
import { CheckCircle2, Circle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMediMind } from '@/lib/store';

interface TimelineProps {
  doses: Array<{ med: Medication; time: string; status: DoseStatus }>;
  onAction: (medId: string, time: string, status: DoseStatus) => void;
}

export function TodayTimeline({ doses, onAction }: TimelineProps) {
  const { t, profile } = useMediMind();
  
  const localeMap = { ar, en: enUS, fr, es, de };
  const locale = (localeMap as any)[profile.language] || ar;
  const isRTL = profile.language === 'ar';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{t('todaysTimeline')}</h3>
        <span className="text-xs text-muted-foreground font-medium">
          {format(new Date(), 'EEEE, MMMM do', { locale })}
        </span>
      </div>

      <div className={cn(
        "relative space-y-8 before:absolute before:top-2 before:bottom-2 before:w-[2px] before:bg-border",
        isRTL ? "pr-8 before:right-[11px]" : "pl-8 before:left-[11px]"
      )}>
        {doses.map((dose, idx) => {
          const doseTime = parseISO(dose.time);
          
          return (
            <div key={`${dose.med.id}-${idx}`} className="relative">
              <span className={cn(
                "absolute top-1 z-10 p-1 rounded-full bg-background border-2",
                isRTL ? "right-[-30px]" : "left-[-30px]",
                dose.status === 'taken' ? "border-primary text-primary" : 
                dose.status === 'missed' ? "border-destructive text-destructive" :
                "border-muted-foreground text-muted-foreground"
              )}>
                {dose.status === 'taken' ? <CheckCircle2 className="h-4 w-4" /> :
                 dose.status === 'missed' ? <XCircle className="h-4 w-4" /> :
                 <Circle className="h-4 w-4" />}
              </span>

              <div className="flex flex-col gap-1 text-start">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted-foreground">
                    {format(doseTime, 'hh:mm a', { locale })}
                  </p>
                  {dose.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                        onClick={() => onAction(dose.med.id, dose.time, 'skipped')}
                      >
                        {t('skip')}
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-7 px-3 text-[10px]"
                        onClick={() => onAction(dose.med.id, dose.time, 'taken')}
                      >
                        {t('taken')}
                      </Button>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "p-3 rounded-lg border transition-all",
                  dose.status === 'taken' ? "bg-primary/5 border-primary/20" : "bg-card shadow-sm"
                )}>
                  <h4 className="font-bold text-sm">{dose.med.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{dose.med.dosageAmount} {t(dose.med.dosageUnit as any)}</p>
                </div>
              </div>
            </div>
          );
        })}

        {doses.length === 0 && (
          <div className="py-10 text-center">
            <Clock className="h-10 w-10 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('noDosesToday')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
