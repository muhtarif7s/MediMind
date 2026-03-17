"use client";

import { useEffect } from 'react';
import {
  Patient,
  Appointment,
  ClinicProfile,
  AppointmentStatus,
  Medication,
  DoseLog,
  DoseStatus
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
  deleteDocumentNonBlocking
} from '@/firebase';
import {
  collection,
  doc,
  query,
  orderBy,
  where,
  collectionGroup
} from 'firebase/firestore';
import { translations } from './translations';

export function useClinic() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const shouldFetch = !!user && !isUserLoading;

  // 1. Clinic Profile
  const clinicRef = useMemoFirebase(() => {
    return shouldFetch ? doc(db, 'clinics', user.uid) : null;
  }, [db, user, shouldFetch]);

  const { data: clinicData, isLoading: isClinicLoading } = useDoc<ClinicProfile>(clinicRef);

  // Auto-bootstrap clinic profile
  useEffect(() => {
    if (shouldFetch && clinicRef && !isClinicLoading && !clinicData) {
      setDocumentNonBlocking(
        clinicRef,
        {
          id: user.uid,
          name: user.displayName || 'عيادة الأسنان الذكية',
          language: 'ar',
          theme: 'light',
          notificationsEnabled: true
        },
        { merge: true }
      );
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

  // 4. User Medications (Used for prescriptions or dentist's own tracking)
  const medicationsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'users', user.uid, 'medicines'), orderBy('name'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: medicationsData, isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);
  const medications = medicationsData || [];

  // 5. Medication Dose History
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

  // Bootstrapping sample data for new accounts
  useEffect(() => {
    if (shouldFetch && !isMedicationsLoading && medications.length === 0) {
      const medRef = collection(db, 'users', user.uid, 'medicines');
      addDocumentNonBlocking(medRef, {
        userId: user.uid,
        name: 'Sample Medication',
        dosageAmount: 1,
        dosageUnit: 'pill',
        times: ['08:00', '20:00'],
        startDate: new Date().toISOString(),
        totalQuantity: 30,
        remainingQuantity: 30,
        refillThreshold: 5,
        frequency: 'daily'
      }).then(docRef => {
        if (docRef) {
          const logRef = collection(db, 'users', user.uid, 'medicines', docRef.id, 'doseLogs');
          addDocumentNonBlocking(logRef, {
            userId: user.uid,
            medicationId: docRef.id,
            name: 'Sample Medication',
            status: 'taken',
            scheduledTime: new Date().toISOString(),
            recordedAt: new Date().toISOString(),
            takenAt: new Date().toISOString()
          });
        }
      });
    }
  }, [shouldFetch, isMedicationsLoading, medications, db, user]);

  const t = (key: string) => {
    const arTranslations = translations.ar as Record<string, string>;
    return arTranslations[key] || key;
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

    return (appointments || []).filter(a => {
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
        updateMedication(medId, {
          remainingQuantity: Math.max(0, med.remainingQuantity - med.dosageAmount)
        });
      }
    }
  };

  const isLoaded =
    !isUserLoading &&
    (!user ||
      (!isClinicLoading &&
        !isPatientsLoading &&
        !isAppointmentsLoading &&
        !isMedicationsLoading &&
        !isHistoryLoading));

  return {
    user,
    isUserLoading,
    profile: clinicData || {
      name: 'دكتور',
      language: 'ar',
      theme: 'light',
      notificationsEnabled: true
    },
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
      const todayDoses: Array<{ med: Medication; time: string; status: DoseStatus }> = [];
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      (medications || []).forEach(med => {
        (med.times || []).forEach(time => {
          const scheduledTime = `${todayStr}T${time}:00`;
          const log = (history || []).find(
            h => h.medicationId === med.id && h.scheduledTime === scheduledTime
          );

          todayDoses.push({
            med,
            time: scheduledTime,
            status: log ? log.status : 'pending'
          });
        });
      });

      return todayDoses.sort((a, b) => a.time.localeCompare(b.time));
    }
  };
}

export const useMediMind = useClinic;