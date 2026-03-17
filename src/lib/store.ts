
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
import { collection, doc, query, orderBy, where, collectionGroup, addDoc, startOfDay, endOfDay } from 'firebase/firestore';
import { translations } from './translations';

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
  
  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(patientsQuery);
  const patients = patientsData || [];

  // 3. Clinic Appointments
  const appointmentsQuery = useMemoFirebase(() => {
    return shouldFetch 
      ? query(collection(db, 'clinics', user.uid, 'appointments'), orderBy('dateTime'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
  const appointments = appointmentsData || [];

  // 4. Personal Medications
  const medicationsQuery = useMemoFirebase(() => {
    return shouldFetch 
      ? query(collection(db, 'users', user.uid, 'medicines'), orderBy('name'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: medicationsData, isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);
  const medications = medicationsData || [];

  // 5. Medication Dose History (Collection Group)
  const historyQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(
          collectionGroup(db, 'doseLogs'), 
          where('userId', '==', user.uid), 
          orderBy('recordedAt', 'desc')
        )
      : null;
  }, [db, user, shouldFetch]);

  const { data: historyData, isLoading: isHistoryLoading } = useCollection<DoseLog>(historyQuery);
  const history = historyData || [];

  // Automated Data Bootstrapping
  useEffect(() => {
    const bootstrapData = async () => {
      if (!shouldFetch || isMedicationsLoading || isHistoryLoading) return;

      // Check if user already has data to avoid duplication
      if (medications.length === 0 && history.length === 0) {
        try {
          const medRef = collection(db, 'users', user.uid, 'medicines');
          const newMedDoc = await addDoc(medRef, {
            userId: user.uid,
            name: "Sample Medication",
            dosageAmount: 1,
            dosageUnit: "pill",
            times: ["08:00"],
            startDate: new Date().toISOString(),
            totalQuantity: 30,
            remainingQuantity: 30,
            refillThreshold: 5,
            frequency: "daily"
          });

          // Create Sample DoseLog in subcollection
          const logRef = collection(db, 'users', user.uid, 'medicines', newMedDoc.id, 'doseLogs');
          await addDoc(logRef, {
            userId: user.uid,
            medicationId: newMedDoc.id,
            name: "Sample Medication",
            status: "pending",
            takenAt: new Date().toISOString(),
            recordedAt: new Date().toISOString(),
            scheduledTime: new Date().toISOString()
          });
        } catch (error) {
          console.error("Failed to bootstrap sample data:", error);
        }
      }
    };

    bootstrapData();
  }, [shouldFetch, medications, history, isMedicationsLoading, isHistoryLoading, user?.uid, db]);

  const t = (key: keyof typeof translations.ar) => {
    return translations.ar[key] || key;
  };

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
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return appointments.filter(a => {
      const d = new Date(a.dateTime);
      return d >= start && d <= end;
    });
  };

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
      takenAt: new Date().toISOString(),
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
    patients,
    appointments,
    medications,
    history,
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
      return [];
    }
  };
}

export const useMediMind = useClinic;
