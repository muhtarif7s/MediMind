"use client";

import { useEffect, useState } from 'react';
import {
  Patient,
  Appointment,
  AppointmentStatus,
  Medication,
  DoseLog,
  DoseStatus,
  UserProfile,
  PatientRecord
} from './types';
import {
  useUser,
  useFirestore,
  useCollection,
  useDoc,
  useMemoFirebase,
  updateDocumentNonBlocking,
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import {
  collection,
  doc,
  query,
  orderBy,
  where,
  collectionGroup,
  limit,
} from 'firebase/firestore';
import { translations } from './translations';
import { errorEmitter } from '@/firebase/error-emitter';
import { AppError } from '@/firebase/errors';
import { logger } from './logger';

/**
 * Main clinical store hook.
 * Optimized for performance and offline support.
 */
export function useClinic() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor network status
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const shouldFetch = !!user && !isUserLoading;

  // 1. Data Subscriptions (Memoized & Limited for Performance)
  const userProfileRef = useMemoFirebase(() => shouldFetch ? doc(db, 'users', user.uid) : null, [db, user, shouldFetch]);
  const { data: userProfileData, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const patientsQuery = useMemoFirebase(() => 
    shouldFetch ? query(collection(db, 'users', user.uid, 'patients'), orderBy('createdAt', 'desc'), limit(100)) : null, 
  [db, user, shouldFetch]);
  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(patientsQuery);
  const patients = patientsData || [];

  const appointmentsQuery = useMemoFirebase(() => 
    shouldFetch ? query(collection(db, 'users', user.uid, 'appointments'), orderBy('dateTime', 'asc')) : null, 
  [db, user, shouldFetch]);
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
  const appointments = appointmentsData || [];

  const medicationsQuery = useMemoFirebase(() => 
    shouldFetch ? query(collection(db, 'users', user.uid, 'medicines'), orderBy('name')) : null, 
  [db, user, shouldFetch]);
  const { data: medicationsData, isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);
  const medications = medicationsData || [];

  const historyQuery = useMemoFirebase(() => 
    shouldFetch ? query(collectionGroup(db, 'doseLogs'), where('userId', '==', user.uid), orderBy('recordedAt', 'desc'), limit(50)) : null, 
  [db, user, shouldFetch]);
  const { data: historyData, isLoading: isHistoryLoading } = useCollection<DoseLog>(historyQuery);
  const history = historyData || [];

  const isLoaded = !isUserLoading && (!user || (!isUserProfileLoading && !isPatientsLoading && !isAppointmentsLoading && !isMedicationsLoading && !isHistoryLoading));

  const t = (key: string) => {
    const lang = userProfileData?.language || 'ar';
    const dict = (translations as any)[lang] || translations.ar;
    return dict[key] || key;
  };

  /**
   * Safe execution wrapper for mutations. 
   * Catches runtime errors and emits them globally.
   */
  const executeSafe = <T extends any[]>(fn: (...args: T) => void) => {
    return (...args: T) => {
      try {
        fn(...args);
      } catch (err: any) {
        logger.error('StoreAction', err.message);
        errorEmitter.emit('app-error', new AppError(err.message, 'store/action-failed', 'ClinicStore'));
      }
    };
  };

  // --- Clinical Actions (Offline-Safe Non-Blocking) ---
  const addPatient = executeSafe((patient: Omit<Patient, 'id' | 'clinicId' | 'createdAt'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'patients'), {
      ...patient,
      clinicId: user.uid,
      createdAt: new Date().toISOString()
    });
  });

  const addPatientRecord = executeSafe((patientId: string, record: Omit<PatientRecord, 'id' | 'createdAt'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'patients', patientId, 'records'), {
      ...record,
      createdAt: new Date().toISOString()
    });
  });

  const addAppointment = executeSafe((app: Omit<Appointment, 'id' | 'clinicId' | 'status'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'appointments'), {
      ...app,
      clinicId: user.uid,
      status: 'pending'
    });
  });

  const updateAppointmentStatus = executeSafe((id: string, status: AppointmentStatus) => {
    if (!shouldFetch) return;
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'appointments', id), { status });
  });

  const addMedication = executeSafe((med: Omit<Medication, 'id' | 'userId'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'medicines'), {
      ...med,
      userId: user.uid
    });
  });

  const logDose = executeSafe((medId: string, scheduledTime: string, status: DoseStatus) => {
    if (!shouldFetch) return;
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'medicines', medId, 'doseLogs'), {
      userId: user.uid,
      medicationId: medId,
      name: med.name,
      status,
      scheduledTime,
      recordedAt: new Date().toISOString(),
      takenAt: status === 'taken' ? new Date().toISOString() : null
    });

    if (status === 'taken') {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'medicines', medId), {
        remainingQuantity: Math.max(0, med.remainingQuantity - med.dosageAmount)
      });
    }
  });

  const setProfile = executeSafe((updates: Partial<UserProfile>) => {
    if (!userProfileRef) return;
    setDocumentNonBlocking(userProfileRef, {
      ...updates,
      userId: user?.uid,
      email: user?.email,
      createdAt: userProfileData?.createdAt || new Date().toISOString()
    }, { merge: true });
  });

  return {
    user,
    isUserLoading,
    isOnline,
    profile: userProfileData || { userId: user?.uid || '', name: 'طبيب', email: user?.email || '', language: 'ar', theme: 'light', notificationsEnabled: true, createdAt: new Date().toISOString() },
    patients,
    appointments,
    medications,
    history,
    isLoaded,
    t,
    addPatient,
    addPatientRecord,
    getPatientRecordsQuery: (patientId: string) => shouldFetch ? query(collection(db, 'users', user.uid, 'patients', patientId, 'records'), orderBy('createdAt', 'desc'), limit(20)) : null,
    addAppointment,
    updateAppointmentStatus,
    getTodayAppointments: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return appointments.filter(a => { const d = new Date(a.dateTime); return d >= start && d <= end; });
    },
    setProfile,
    addMedication,
    updateMedication: executeSafe((id: string, updates: Partial<Medication>) => {
      if (!shouldFetch) return;
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'medicines', id), updates);
    }),
    deleteMedication: executeSafe((id: string) => {
      if (!shouldFetch) return;
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'medicines', id));
    }),
    logDose,
    getTodayDoses: () => {
      const todayDoses: Array<{ med: Medication; time: string; status: DoseStatus }> = [];
      const todayStr = new Date().toISOString().split('T')[0];
      medications.forEach(med => {
        med.times.forEach(time => {
          const scheduledTime = `${todayStr}T${time}:00`;
          const log = history.find(h => h.medicationId === med.id && h.scheduledTime === scheduledTime);
          todayDoses.push({ med, time: scheduledTime, status: log ? log.status : 'pending' });
        });
      });
      return todayDoses.sort((a, b) => a.time.localeCompare(b.time));
    }
  };
}

export const useMediMind = useClinic;
