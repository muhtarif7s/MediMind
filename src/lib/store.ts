"use client";

import { useEffect, useState, useCallback } from 'react';
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
  useFirebase,
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
} from 'firebase/firestore';
import { translations } from './translations';
import { errorEmitter } from '@/firebase/error-emitter';
import { AppError } from '@/firebase/errors';
import { logger } from './logger';

/**
 * Main clinical store hook.
 * Enhanced with RBAC awareness and error protection.
 * Scopes all data strictly under users/{userId} for security.
 */
export function useClinic() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const shouldFetch = !!user && !isUserLoading;

  // --- Firestore Data Subscriptions ---
  
  // 1. User Profile
  const userProfileRef = useMemoFirebase(() => shouldFetch ? doc(db, 'users', user.uid) : null, [db, user, shouldFetch]);
  const { data: userProfileData, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // 2. Patients (Scoped to Doctor UID)
  const patientsQuery = useMemoFirebase(() => 
    shouldFetch ? query(collection(db, 'users', user.uid, 'patients'), orderBy('createdAt', 'desc'), limit(100)) : null, 
  [db, user, shouldFetch]);
  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(patientsQuery);
  const patients = patientsData || [];

  // 3. Appointments (Scoped to Doctor UID)
  const appointmentsQuery = useMemoFirebase(() => 
    shouldFetch ? query(collection(db, 'users', user.uid, 'appointments'), orderBy('dateTime', 'asc')) : null, 
  [db, user, shouldFetch]);
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
  const appointments = appointmentsData || [];

  // 4. Medications (Scoped to User UID)
  const medicationsQuery = useMemoFirebase(() => 
    shouldFetch ? query(collection(db, 'users', user.uid, 'medicines'), orderBy('name')) : null, 
  [db, user, shouldFetch]);
  const { data: medicationsData, isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);
  const medications = medicationsData || [];

  // 5. Dose History
  const historyQuery = useMemoFirebase(() => 
    shouldFetch ? query(collection(db, 'users', user.uid, 'doseLogs'), orderBy('recordedAt', 'desc'), limit(50)) : null, 
  [db, user, shouldFetch]);
  const { data: historyData, isLoading: isHistoryLoading } = useCollection<DoseLog>(historyQuery);
  const history = historyData || [];

  const isLoaded = !isUserLoading && (!user || (!isUserProfileLoading && !isPatientsLoading && !isAppointmentsLoading && !isMedicationsLoading && !isHistoryLoading));

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
    (patient: Omit<Patient, 'id' | 'clinicId' | 'createdAt'>) => {
      if (!user) return;
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'patients'), {
        ...patient,
        clinicId: user.uid,
        createdAt: new Date().toISOString()
      });
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

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'doseLogs'), {
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
    getTodayDoses: () => {
      const todayDoses: Array<{ med: Medication; time: string; status: DoseStatus }> = [];
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      medications.forEach(med => {
        med.times.forEach(time => {
          const scheduledTime = `${todayStr}T${time}:00`;
          const log = history.find(h => h.medicationId === med.id && h.scheduledTime === scheduledTime);
          todayDoses.push({ med, time: scheduledTime, status: log ? log.status : 'pending' });
        });
      });
      return todayDoses.sort((a, b) => a.time.localeCompare(b.time));
    },
    clearPatients: () => {
      if (!user) return;
      patients.forEach(p => deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'patients', p.id)));
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
