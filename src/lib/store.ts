
"use client";

import { useMemo, useEffect } from 'react';
import { Patient, Appointment, ClinicProfile, AppointmentStatus, Medication, DoseLog, DoseStatus } from './types';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc,
  useMemoFirebase, 
  updateDocumentNonBlocking, 
  addDocumentNonBlocking, 
  setDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase';
import { collection, doc, query, orderBy, where, collectionGroup } from 'firebase/firestore';
import { translations } from './translations';
import { startOfDay, endOfDay } from 'date-fns';

export function useClinic() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const shouldFetch = !!user && !isUserLoading;

  // 1. Clinic/User Profile
  const clinicRef = useMemoFirebase(() => {
    return shouldFetch ? doc(db, 'clinics', user.uid) : null;
  }, [db, user, shouldFetch]);

  const { data: clinicData, isLoading: isClinicLoading } = useDoc<ClinicProfile>(clinicRef);

  useEffect(() => {
    if (shouldFetch && clinicRef && !isClinicLoading && !clinicData) {
      setDocumentNonBlocking(clinicRef, {
        id: user.uid,
        name: user.displayName || 'عيادة الأسنان',
        language: 'ar',
        theme: 'light',
        notificationsEnabled: true
      }, { merge: true });
    }
  }, [shouldFetch, clinicRef, isClinicLoading, clinicData, user]);

  // 2. Clinic Patients
  const patientsQuery = useMemoFirebase(() => {
    return shouldFetch 
      ? query(collection(db, 'clinics', user.uid, 'patients'), orderBy('name'))
      : null;
  }, [db, user, shouldFetch]);
  
  const { data: patients = [], isLoading: isPatientsLoading } = useCollection<Patient>(patientsQuery);

  // 3. Clinic Appointments
  const appointmentsQuery = useMemoFirebase(() => {
    return shouldFetch 
      ? query(collection(db, 'clinics', user.uid, 'appointments'), orderBy('dateTime'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: appointments = [], isLoading: isAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);

  // 4. Personal Medications (MediMind features)
  const medicationsQuery = useMemoFirebase(() => {
    return shouldFetch 
      ? query(collection(db, 'users', user.uid, 'medicines'), orderBy('name'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: medications = [], isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);

  // 5. Medication Dose History
  const historyQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collectionGroup(db, 'doseLogs'), where('userId', '==', user.uid), orderBy('recordedAt', 'desc'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: history = [], isLoading: isHistoryLoading } = useCollection<DoseLog>(historyQuery);

  const t = (key: keyof typeof translations.ar) => {
    return translations.ar[key] || key;
  };

  // Helper actions
  const addPatient = (patient: Omit<Patient, 'id' | 'clinicId' | 'createdAt'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'clinics', user.uid, 'patients'), {
      ...patient,
      clinicId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const addAppointment = (app: Omit<Appointment, 'id' | 'clinicId' | 'status'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'clinics', user.uid, 'appointments'), {
      ...app,
      clinicId: user.uid,
      status: 'pending'
    });
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    if (!shouldFetch) return;
    const docRef = doc(db, 'clinics', user.uid, 'appointments', id);
    updateDocumentNonBlocking(docRef, { status });
  };

  const getTodayAppointments = () => {
    const today = startOfDay(new Date());
    const tonight = endOfDay(new Date());
    return (appointments || []).filter(a => {
      const d = new Date(a.dateTime);
      return d >= today && d <= tonight;
    });
  };

  // Medication Actions
  const addMedication = (med: Omit<Medication, 'id' | 'userId'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'medicines'), {
      ...med,
      userId: user.uid
    });
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    if (!shouldFetch) return;
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'medicines', id), updates);
  };

  const deleteMedication = (id: string) => {
    if (!shouldFetch) return;
    deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'medicines', id));
  };

  const logDose = (medId: string, scheduledTime: string, status: DoseStatus) => {
    if (!shouldFetch) return;
    const logRef = collection(db, 'users', user.uid, 'medicines', medId, 'doseLogs');
    addDocumentNonBlocking(logRef, {
      userId: user.uid,
      medicationId: medId,
      scheduledTime,
      recordedAt: new Date().toISOString(),
      status
    });

    if (status === 'taken') {
      const med = medications.find(m => m.id === medId);
      if (med) {
        updateMedication(medId, { remainingQuantity: Math.max(0, med.remainingQuantity - med.dosageAmount) });
      }
    }
  };

  const isLoaded = !isUserLoading && (!user || (!isClinicLoading && !isPatientsLoading && !isAppointmentsLoading && !isMedicationsLoading && !isHistoryLoading));

  return {
    user,
    isUserLoading,
    profile: clinicData || { name: 'دكتور', language: 'ar', theme: 'light', notificationsEnabled: true },
    clinic: clinicData,
    patients: patients || [],
    appointments: appointments || [],
    medications: medications || [],
    history: history || [],
    isLoaded,
    t,
    addPatient,
    addAppointment,
    updateAppointmentStatus,
    getTodayAppointments,
    addMedication,
    updateMedication,
    deleteMedication,
    logDose,
    setProfile: (updates: Partial<ClinicProfile>) => {
       if (clinicRef) updateDocumentNonBlocking(clinicRef, updates);
    },
    getTodayDoses: () => {
      // Logic for calculating today's doses based on medication schedules
      return [];
    }
  };
}

export const useMediMind = useClinic;
