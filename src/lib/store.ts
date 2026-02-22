"use client";

import { useState, useEffect, useMemo } from 'react';
import { Medication, DoseHistory, UserProfile, DoseStatus } from './types';
import { addDays, format, parseISO, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where, orderBy } from 'firebase/firestore';

export function useMediMind() {
  const { user } = useUser();
  const db = useFirestore();

  // 1. Fetch User Profile
  const profileDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  // Note: For simplicity, we'll keep profile local for now or use useDoc for real sync
  const [profile, setProfile] = useState<UserProfile>({
    name: 'User',
    language: 'en',
    notificationsEnabled: true,
    theme: 'light',
  });

  // 2. Fetch Medications
  const medsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'medicines'), where('isActive', '==', true));
  }, [db, user]);
  const { data: medications = [], isLoading: isMedsLoading } = useCollection<Medication>(medsQuery);

  // 3. Fetch History (Recent 100 logs)
  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    // We'd need to loop through meds to get subcollections, but rules/paths are complex.
    // For MVP released as a "mobile app", we might just flat map or query collection group if allowed.
    // However, let's keep it simple: we only show logs for the medicines currently loaded.
    return null; // Placeholder for logic below
  }, [db, user]);

  // For a robust releasing app, we'll handle history slightly differently
  // Since subcollections are nested under medicines, we'll maintain a local state for today's logs for immediate speed
  const [history, setHistory] = useState<DoseHistory[]>([]);

  const isLoaded = !isMedsLoading && !!user;

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
    // Soft delete
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
    setHistory(prev => [...prev, logData as any]); // Optimistic update for UI

    if (status === 'taken') {
      const med = medications?.find(m => m.id === medicationId);
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
    
    let scheduled: Array<{ med: Medication; time: string; status: DoseStatus }> = [];

    medications?.forEach(med => {
      const medStart = parseISO(med.startDate);
      const medEnd = med.endDate ? parseISO(med.endDate) : addDays(today, 1);
      
      if (isAfter(todayStart, medEnd) || isBefore(todayEnd, medStart)) return;

      med.times.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const doseTime = new Date(today);
        doseTime.setHours(hours, minutes, 0, 0);

        if (isAfter(doseTime, medStart) && (!med.endDate || isBefore(doseTime, medEnd))) {
          const log = history.find(h => 
            h.medicationId === med.id && 
            format(parseISO(h.scheduledTime), 'HH:mm') === timeStr &&
            format(parseISO(h.scheduledTime), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
          );

          scheduled.push({
            med,
            time: doseTime.toISOString(),
            status: log ? log.status : (isBefore(doseTime, new Date()) ? 'missed' : 'pending')
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
    addMedication,
    updateMedication,
    deleteMedication,
    logDose,
    getTodayDoses,
    setProfile,
  };
}
