
"use client";

import { useEffect, useRef } from 'react';
import { useMediMind } from '@/lib/store';
import { parseISO, isSameMinute, format, differenceInMinutes } from 'date-fns';

export function NotificationManager() {
  const { getTodayDoses, appointments, profile, isLoaded, t } = useMediMind();
  const lastNotifiedMinute = useRef<string | null>(null);
  const notifiedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission on mount if supported and enabled
    if (typeof window !== 'undefined' && 'Notification' in window && isLoaded) {
      if (Notification.permission === 'default' && profile.notificationsEnabled) {
        Notification.requestPermission();
      }
    }
  }, [profile.notificationsEnabled, isLoaded]);

  useEffect(() => {
    if (!profile.notificationsEnabled || !isLoaded) return;

    const checkReminders = () => {
      const now = new Date();
      const currentMinute = format(now, 'yyyy-MM-dd HH:mm');
      
      // Don't notify multiple times for the exact same event in the same minute
      if (lastNotifiedMinute.current === currentMinute) return;

      // 1. Check Medications
      const doses = getTodayDoses();
      const dueNow = doses.find(dose => 
        dose.status === 'pending' && 
        isSameMinute(parseISO(dose.time), now)
      );

      if (dueNow && !notifiedEvents.current.has(`dose-${dueNow.med.id}-${currentMinute}`)) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t('appTitle'), {
            body: `${t('pleaseTakeMedication')}: ${dueNow.med.dosageAmount} ${t(dueNow.med.dosageUnit as any)} ${dueNow.med.name}.`,
            icon: 'https://picsum.photos/seed/med-icon/192/192',
            badge: 'https://picsum.photos/seed/med-icon/192/192',
            tag: `dose-${dueNow.med.id}-${currentMinute}`
          });
          notifiedEvents.current.add(`dose-${dueNow.med.id}-${currentMinute}`);
        }
      }

      // 2. Check Appointments (1 hour before)
      (appointments || []).forEach(app => {
        if (app.status !== 'pending') return;
        
        const appTime = parseISO(app.dateTime);
        const minutesDiff = differenceInMinutes(appTime, now);

        // Notify if exactly 60 minutes before
        if (minutesDiff === 60 && !notifiedEvents.current.has(`app-${app.id}`)) {
          if ('Notification' in window && Notification.permission === 'granted') {
            const body = t('appointmentInOneHour').replace('{name}', app.patientName);
            new Notification(t('appointmentReminder'), {
              body,
              icon: 'https://picsum.photos/seed/app-icon/192/192',
              badge: 'https://picsum.photos/seed/app-icon/192/192',
              tag: `app-${app.id}`
            });
            notifiedEvents.current.add(`app-${app.id}`);
          }
        }
      });

      lastNotifiedMinute.current = currentMinute;
    };

    // Check on interval
    const interval = setInterval(checkReminders, 15000); // Check every 15 seconds
    checkReminders(); // Immediate check

    return () => clearInterval(interval);
  }, [getTodayDoses, appointments, profile.notificationsEnabled, isLoaded, t]);

  return null; // Invisible manager component
}
