
"use client";

import { useEffect, useRef } from 'react';
import { useMediMind } from '@/lib/store';
import { parseISO, isSameMinute, format } from 'date-fns';

export function NotificationManager() {
  const { getTodayDoses, profile, isLoaded } = useMediMind();
  const lastNotifiedMinute = useRef<string | null>(null);

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

    const checkDoses = () => {
      const now = new Date();
      const currentMinute = format(now, 'yyyy-MM-dd HH:mm');
      
      // Don't notify multiple times in the same minute
      if (lastNotifiedMinute.current === currentMinute) return;

      const doses = getTodayDoses();
      const dueNow = doses.find(dose => 
        dose.status === 'pending' && 
        isSameMinute(parseISO(dose.time), now)
      );

      if (dueNow) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('طبيب الأسنان الذكي', {
            body: `حان موعد تناول ${dueNow.med.dosageAmount} ${dueNow.med.dosageUnit} من ${dueNow.med.name}.`,
            icon: 'https://picsum.photos/seed/icon/192/192',
            badge: 'https://picsum.photos/seed/icon/192/192',
            tag: `dose-${dueNow.med.id}-${currentMinute}`
          });
          lastNotifiedMinute.current = currentMinute;
        }
      }
    };

    // Check on interval but also trigger when doses data updates
    const interval = setInterval(checkDoses, 10000); // Check every 10 seconds
    checkDoses(); // Immediate check

    return () => clearInterval(interval);
  }, [getTodayDoses, profile.notificationsEnabled, isLoaded]);

  return null; // Invisible manager component
}
