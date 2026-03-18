"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Patient,
  Appointment,
  AppointmentStatus,
  Medication,
  DoseLog,
  DoseStatus,
  UserProfile,
  PatientRecord,
  UserRole
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
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { translations } from './translations';
import { errorEmitter } from '@/firebase/error-emitter';
import { AppError } from '@/firebase/errors';
import { logger } from './logger';

const PAGE_SIZE = 15;

/**
 * Main clinical store hook.
 * Optimized with pagination and one-time fetching for large datasets.
 */
export function useClinic() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isOnline, setIsOnline] = useState(true);

  // --- Local Data States (for paginated/one-time data) ---
  const [patients, setPatients] = useState<Patient[]>([]);
  const [history, setHistory] = useState<DoseLog[]>([]);
  const [isPatientsLoadingOnce, setIsPatientsLoadingOnce] = useState(false);
  const [isHistoryLoadingOnce, setIsHistoryLoadingOnce] = useState(false);
  const [hasMorePatients, setHasMorePatients] = useState(true);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  
  const lastPatientDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const lastHistoryDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Network Status Tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(window.navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const shouldFetch = !!user && !isUserLoading;

  // --- Real-time Subscriptions (for data that needs immediate sync) ---
  
  // 1. User Profile (Real-time)
  const userProfileRef = useMemoFirebase(() => shouldFetch ? doc(db, 'users', user.uid) : null, [db, user, shouldFetch]);
  const { data: userProfileData, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // 2. Appointments (Real-time for clinical coordination)
  const appointmentsQuery = useMemoFirebase(() => 
    shouldFetch ? query(collection(db, 'users', user.uid, 'appointments'), orderBy('dateTime', 'asc')) : null, 
  [db, user, shouldFetch]);
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
  const appointments = appointmentsData || [];

  // 3. Medications (Real-time for inventory/dosing sync)
  const medicationsQuery = useMemoFirebase(() => 
    shouldFetch ? query(collection(db, 'users', user.uid, 'medicines'), orderBy('name')) : null, 
  [db, user, shouldFetch]);
  const { data: medicationsData, isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);
  const medications = medicationsData || [];

  // --- One-time Paginated Fetching (for performance optimization) ---

  const fetchPatients = useCallback(async (isLoadMore = false) => {
    if (!shouldFetch || isPatientsLoadingOnce) return;
    if (isLoadMore && !hasMorePatients) return;

    setIsPatientsLoadingOnce(true);
    try {
      let q = query(
        collection(db, 'users', user.uid, 'patients'), 
        orderBy('createdAt', 'desc'), 
        limit(PAGE_SIZE)
      );

      if (isLoadMore && lastPatientDoc.current) {
        q = query(q, startAfter(lastPatientDoc.current));
      }

      const snapshot = await getDocs(q);
      const newPatients = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Patient));
      
      lastPatientDoc.current = snapshot.docs[snapshot.docs.length - 1] || null;
      setHasMorePatients(snapshot.docs.length === PAGE_SIZE);
      
      setPatients(prev => isLoadMore ? [...prev, ...newPatients] : newPatients);
    } catch (err: any) {
      logger.error('Store', 'Failed to fetch patients', err);
    } finally {
      setIsPatientsLoadingOnce(false);
    }
  }, [db, user, shouldFetch, isPatientsLoadingOnce, hasMorePatients]);

  const fetchHistory = useCallback(async (isLoadMore = false) => {
    if (!shouldFetch || isHistoryLoadingOnce) return;
    if (isLoadMore && !hasMoreHistory) return;

    setIsHistoryLoadingOnce(true);
    try {
      let q = query(
        collection(db, 'users', user.uid, 'doseLogs'), 
        orderBy('recordedAt', 'desc'), 
        limit(PAGE_SIZE)
      );

      if (isLoadMore && lastHistoryDoc.current) {
        q = query(q, startAfter(lastHistoryDoc.current));
      }

      const snapshot = await getDocs(q);
      const newHistory = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DoseLog));
      
      lastHistoryDoc.current = snapshot.docs[snapshot.docs.length - 1] || null;
      setHasMoreHistory(snapshot.docs.length === PAGE_SIZE);
      
      setHistory(prev => isLoadMore ? [...prev, ...newHistory] : newHistory);
    } catch (err: any) {
      logger.error('Store', 'Failed to fetch history', err);
    } finally {
      setIsHistoryLoadingOnce(false);
    }
  }, [db, user, shouldFetch, isHistoryLoadingOnce, hasMoreHistory]);

  // Initial Data Load
  useEffect(() => {
    if (shouldFetch) {
      fetchPatients();
      fetchHistory();
    }
  }, [shouldFetch]);

  const isLoaded = !isUserLoading && (!user || (!isUserProfileLoading && !isAppointmentsLoading && !isMedicationsLoading));

  // --- Translation Helper ---
  const t = useCallback((key: string) => {
    const lang = userProfileData?.language || 'ar';
    const dict = (translations as any)[lang] || translations.en;
    return dict[key] || key;
  }, [userProfileData?.language]);

  // --- Defensive Action Wrapper ---
  const executeSafe = <T extends any[]>(fn: (...args: T) => void, validation?: (...args: T) => boolean) => {
    return (...args: T) => {
      try {
        if (!user) throw new Error('Unauthenticated action denied');
        if (validation && !validation(...args)) {
          throw new Error('Data validation failed');
        }
        fn(...args);
      } catch (err: any) {
        logger.error('StoreAction', err.message);
        errorEmitter.emit('app-error', new AppError(err.message, 'store/action-failed', 'ClinicStore'));
      }
    };
  };

  // --- Clinical Actions ---

  const addPatient = executeSafe(
    (patientData: Omit<Patient, 'id' | 'clinicId' | 'createdAt'>) => {
      if (!user) return;
      const newPatientRef = doc(collection(db, 'users', user.uid, 'patients'));
      const newPatient: Patient = {
        ...patientData,
        id: newPatientRef.id,
        clinicId: user.uid,
        createdAt: new Date().toISOString()
      };
      setDocumentNonBlocking(newPatientRef, newPatient, { merge: true });
      // Optimistic Update
      setPatients(prev => [newPatient, ...prev]);
    },
    (p) => !!p.name && p.name.length >= 2
  );

  const addPatientRecord = executeSafe((patientId: string, record: Omit<PatientRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'patients', patientId, 'records'), {
      ...record,
      createdAt: new Date().toISOString()
    });
  });

  const addAppointment = executeSafe(
    (app: Omit<Appointment, 'id' | 'clinicId' | 'status'>) => {
      if (!user) return;
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'appointments'), {
        ...app,
        clinicId: user.uid,
        status: 'pending'
      });
    },
    (app) => !!app.dateTime
  );

  const updateAppointmentStatus = executeSafe((id: string, status: AppointmentStatus) => {
    if (!user) return;
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'appointments', id), { status });
  });

  const addMedication = executeSafe((med: Omit<Medication, 'id' | 'userId'>) => {
    if (!user) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'medicines'), {
      ...med,
      userId: user.uid
    });
  });

  const logDose = executeSafe((medId: string, scheduledTime: string, status: DoseStatus) => {
    if (!user) return;
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    const newLogRef = doc(collection(db, 'users', user.uid, 'doseLogs'));
    const newLog: DoseLog = {
      id: newLogRef.id,
      userId: user.uid,
      medicationId: medId,
      name: med.name,
      status,
      scheduledTime,
      recordedAt: new Date().toISOString(),
      takenAt: status === 'taken' ? new Date().toISOString() : null
    };

    setDocumentNonBlocking(newLogRef, newLog, { merge: true });
    
    // Optimistic Update for History
    setHistory(prev => [newLog, ...prev]);

    if (status === 'taken') {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'medicines', medId), {
        remainingQuantity: Math.max(0, med.remainingQuantity - med.dosageAmount)
      });
    }
  });

  const setProfile = executeSafe((updates: Partial<UserProfile>) => {
    if (!userProfileRef || !user) return;
    setDocumentNonBlocking(userProfileRef, {
      ...updates,
      userId: user.uid,
      email: user.email,
      role: userProfileData?.role || 'doctor',
      createdAt: userProfileData?.createdAt || new Date().toISOString()
    }, { merge: true });
  });

  return {
    user,
    isUserLoading,
    isOnline,
    profile: userProfileData || { 
      userId: user?.uid || '', 
      name: 'طبيب', 
      email: user?.email || '', 
      role: 'doctor' as UserRole, 
      language: 'ar', 
      theme: 'light', 
      notificationsEnabled: true, 
      createdAt: new Date().toISOString() 
    },
    patients,
    appointments,
    medications,
    history,
    isLoaded,
    t,
    addPatient,
    fetchPatients: () => fetchPatients(false),
    loadMorePatients: () => fetchPatients(true),
    isPatientsLoading: isPatientsLoadingOnce,
    hasMorePatients,
    addPatientRecord,
    getPatientRecordsQuery: (patientId: string) => 
      shouldFetch ? query(collection(db, 'users', user.uid, 'patients', patientId, 'records'), orderBy('createdAt', 'desc'), limit(20)) : null,
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
    updateMedication: (id: string, updates: Partial<Medication>) => {
      if (!user) return;
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'medicines', id), updates);
    },
    deleteMedication: (id: string) => {
      if (!user) return;
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'medicines', id));
    },
    logDose,
    loadMoreHistory: () => fetchHistory(true),
    isHistoryLoading: isHistoryLoadingOnce,
    hasMoreHistory,
    getTodayDoses: () => {
      const todayDoses: Array<{ med: Medication; time: string; status: DoseStatus }> = [];
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      medications.forEach(med => {
        med.times.forEach(time => {
          const scheduledTime = `${todayStr}T${time}:00`;
          // Find log in history state
          const log = history.find(h => h.medicationId === med.id && h.scheduledTime === scheduledTime);
          todayDoses.push({ med, time: scheduledTime, status: log ? log.status : 'pending' });
        });
      });
      return todayDoses.sort((a, b) => a.time.localeCompare(b.time));
    },
    clearPatients: () => {
      if (!user) return;
      patients.forEach(p => deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'patients', p.id)));
      setPatients([]);
    },
    clearAppointments: () => {
      if (!user) return;
      appointments.forEach(a => deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'appointments', a.id)));
    },
    clearMedications: () => {
      if (!user) return;
      medications.forEach(m => deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'medicines', m.id)));
    },
  };
}

export const useMediMind = useClinic;
