
"use client";

import { useEffect, useRef } from 'react';
import { useMediMind } from '@/lib/store';
import { parseISO, isSameMinute, format, differenceInMinutes, addMinutes } from 'date-fns';

/**
 * Global Notification Manager component.
 * Monitors appointments and medications to trigger local push notifications.
 */
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
      
      // Don't notify multiple times for the exact same event type in the same minute
      if (lastNotifiedMinute.current === currentMinute) return;

      // 1. Check Medications
      const doses = getTodayDoses();
      
      doses.forEach(dose => {
        if (dose.status !== 'pending') return;

        const doseTime = parseISO(dose.time);
        
        // Reminder 1: 5 minutes before
        const fiveMinutesFromNow = addMinutes(now, 5);
        if (isSameMinute(doseTime, fiveMinutesFromNow) && !notifiedEvents.current.has(`dose-5min-${dose.med.id}-${dose.time}`)) {
          if ('Notification' in window && Notification.permission === 'granted') {
            const body = t('medicationInFiveMinutes').replace('{name}', dose.med.name);
            new Notification(t('upcomingMedication'), {
              body,
              icon: 'https://picsum.photos/seed/med-icon/192/192',
              tag: `dose-5min-${dose.med.id}-${dose.time}`
            });
            notifiedEvents.current.add(`dose-5min-${dose.med.id}-${dose.time}`);
          }
        }

        // Reminder 2: Exactly now
        if (isSameMinute(doseTime, now) && !notifiedEvents.current.has(`dose-now-${dose.med.id}-${dose.time}`)) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(t('appTitle'), {
              body: `${t('pleaseTakeMedication')}: ${dose.med.dosageAmount} ${t(dose.med.dosageUnit as any)} ${dose.med.name}.`,
              icon: 'https://picsum.photos/seed/med-icon/192/192',
              tag: `dose-now-${dose.med.id}-${dose.time}`
            });
            notifiedEvents.current.add(`dose-now-${dose.med.id}-${dose.time}`);
          }
        }
      });

      // 2. Check Appointments (1 hour before)
      (appointments || []).forEach(app => {
        if (app.status !== 'pending') return;
        
        const appTime = parseISO(app.dateTime);
        const minutesDiff = differenceInMinutes(appTime, now);

        // Notify if exactly 60 minutes before
        if (minutesDiff === 60 && !notifiedEvents.current.has(`app-1hr-${app.id}`)) {
          if ('Notification' in window && Notification.permission === 'granted') {
            const body = t('appointmentInOneHour').replace('{name}', app.patientName);
            new Notification(t('appointmentReminder'), {
              body,
              icon: 'https://picsum.photos/seed/app-icon/192/192',
              tag: `app-1hr-${app.id}`
            });
            notifiedEvents.current.add(`app-1hr-${app.id}`);
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
