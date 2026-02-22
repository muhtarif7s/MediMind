
"use client";

import { useState, useEffect } from 'react';
import { Medication, DoseHistory, UserProfile } from './types';
import { addDays, format, parseISO, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';

const MEDS_KEY = 'medimind_medications';
const HISTORY_KEY = 'medimind_history';
const PROFILE_KEY = 'medimind_profile';

export function useMediMind() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] = useState<DoseHistory[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Mohamad',
    language: 'en',
    notificationsEnabled: true,
    theme: 'light',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedMeds = localStorage.getItem(MEDS_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    const savedProfile = localStorage.getItem(PROFILE_KEY);

    if (savedMeds) setMedications(JSON.parse(savedMeds));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(MEDS_KEY, JSON.stringify(medications));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
  }, [medications, history, profile, isLoaded]);

  const addMedication = (med: Omit<Medication, 'id'>) => {
    const newMed = { ...med, id: Math.random().toString(36).substr(2, 9) };
    setMedications([...medications, newMed]);
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications(meds => meds.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMedication = (id: string) => {
    setMedications(meds => meds.filter(m => m.id !== id));
    setHistory(hist => hist.filter(h => h.medicationId !== id));
  };

  const logDose = (medicationId: string, scheduledTime: string, status: DoseStatus) => {
    const newLog: DoseHistory = {
      id: Math.random().toString(36).substr(2, 9),
      medicationId,
      scheduledTime,
      status,
      recordedAt: new Date().toISOString(),
    };
    setHistory(prev => [...prev, newLog]);

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
    
    let scheduled: Array<{ med: Medication; time: string; status: DoseStatus }> = [];

    medications.forEach(med => {
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
