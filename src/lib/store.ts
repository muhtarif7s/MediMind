
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Medication, DoseHistory, UserProfile, DoseStatus } from './types';
import { addDays, format, parseISO, isBefore, isAfter, startOfDay, endOfDay, addMinutes } from 'date-fns';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc,
  useMemoFirebase, 
  updateDocumentNonBlocking, 
  addDocumentNonBlocking, 
  setDocumentNonBlocking 
} from '@/firebase';
import { collection, doc, query, where, collectionGroup } from 'firebase/firestore';
import { translations } from './translations';

export function useMediMind() {
  const { user } = useUser();
  const db = useFirestore();

  // 1. Fetch User Profile from Firestore
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  // Initialize profile if it doesn't exist
  useEffect(() => {
    if (user && profileRef && !isProfileLoading && !profileData) {
      setDocumentNonBlocking(profileRef, {
        id: user.uid,
        name: user.displayName || 'User',
        language: 'en',
        theme: 'light',
        notificationsEnabled: true
      }, { merge: true });
    }
  }, [user, profileRef, isProfileLoading, profileData]);

  const profile = useMemo(() => ({
    name: profileData?.name || 'User',
    language: (profileData?.language as 'en' | 'ar') || 'en',
    notificationsEnabled: profileData?.notificationsEnabled ?? true,
    theme: profileData?.theme || 'light',
  }), [profileData]);

  // Translation helper
  const t = (key: keyof typeof translations.en) => {
    const lang = profile.language as keyof typeof translations;
    const dict = translations[lang] || translations.en;
    return (dict as any)[key] || (translations.en as any)[key] || key;
  };

  const setProfile = (updates: Partial<UserProfile>) => {
    if (!user || !db || !profileRef) return;
    setDocumentNonBlocking(profileRef, updates, { merge: true });
  };

  // 2. Fetch Medications
  const medsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'medicines'), where('isActive', '==', true));
  }, [db, user]);
  
  const { data: medicationsData, isLoading: isMedsLoading } = useCollection<Medication>(medsQuery);
  const medications = medicationsData || [];

  // 3. Fetch Dose History
  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    // Collection group query requires specific security rules and an index (managed by Studio)
    return query(collectionGroup(db, 'doseLogs'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: historyData, isLoading: isHistoryLoading } = useCollection<DoseHistory>(historyQuery);
  const history = historyData || [];

  const isLoaded = !isMedsLoading && !isProfileLoading && !isHistoryLoading && !!user;

  const addMedication = (med: Omit<Medication, 'id'>) => {
    if (!user || !db) return;
    const colRef = collection(db, 'users', user.uid, 'medicines');
    addDocumentNonBlocking(colRef, {
      ...med,
      userId: user.uid,
      isActive: true,
    });
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'medicines', id);
    updateDocumentNonBlocking(docRef, updates);
  };

  const deleteMedication = (id: string) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'medicines', id);
    updateDocumentNonBlocking(docRef, { isActive: false });
  };

  const logDose = (medicationId: string, scheduledTime: string, status: DoseStatus) => {
    if (!user || !db) return;
    const colRef = collection(db, 'users', user.uid, 'medicines', medicationId, 'doseLogs');
    const logData = {
      medicationId,
      scheduledTime,
      status,
      recordedAt: new Date().toISOString(),
      userId: user.uid,
    };
    
    addDocumentNonBlocking(colRef, logData);

    if (status === 'taken') {
      const med = medications.find(m => m.id === medicationId);
      if (med) {
        updateMedication(medicationId, {
          remainingQuantity: Math.max(0, med.remainingQuantity - med.dosageAmount)
        });
      }
    }
  };

  const getTodayDoses = () => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const todayStr = format(today, 'yyyy-MM-dd');
    
    let scheduled: Array<{ med: Medication; time: string; status: DoseStatus }> = [];

    medications.forEach(med => {
      const medStart = parseISO(med.startDate);
      const medEnd = med.endDate ? parseISO(med.endDate) : addDays(today, 1);
      
      if (isAfter(todayStart, medEnd) || isBefore(todayEnd, medStart)) return;

      med.times.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const doseTime = new Date(today);
        doseTime.setHours(hours, minutes, 0, 0);

        // Check if doseTime is after the medication start date
        if (isAfter(doseTime, medStart) && (!med.endDate || isBefore(doseTime, medEnd))) {
          const log = history.find(h => 
            h.medicationId === med.id && 
            format(parseISO(h.scheduledTime), 'HH:mm') === timeStr &&
            format(parseISO(h.scheduledTime), 'yyyy-MM-dd') === todayStr
          );

          const missedThreshold = addMinutes(doseTime, 30);
          const isPending = !log && isBefore(new Date(), missedThreshold);

          scheduled.push({
            med,
            time: doseTime.toISOString(),
            status: log ? log.status : (isPending ? 'pending' : 'missed')
          });
        }
      });
    });

    return scheduled.sort((a, b) => parseISO(a.time).getTime() - parseISO(b.time).getTime());
  };

  return {
    medications,
    history,
    profile,
    isLoaded,
    t,
    addMedication,
    updateMedication,
    deleteMedication,
    logDose,
    getTodayDoses,
    setProfile,
  };
}
