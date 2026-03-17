
"use client";

import {
  Patient,
  Appointment,
  AppointmentStatus,
  Medication,
  DoseLog,
  DoseStatus,
  UserProfile
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
} from 'firebase/firestore';
import { translations } from './translations';

/**
 * Main store hook for the Smart Dentist & MediMind features.
 * Operates purely on live Firestore data.
 * No automated data bootstrapping is performed.
 */
export function useClinic() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const shouldFetch = !!user && !isUserLoading;

  // 1. User Profile & Settings
  const userProfileRef = useMemoFirebase(() => {
    return shouldFetch ? doc(db, 'users', user.uid) : null;
  }, [db, user, shouldFetch]);

  const { data: userProfileData, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // 2. Clinic Patients (User Subcollection)
  const patientsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'users', user.uid, 'patients'), orderBy('createdAt', 'desc'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(patientsQuery);
  const patients = patientsData || [];

  // 3. Clinic Appointments (User Subcollection)
  const appointmentsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'users', user.uid, 'appointments'), orderBy('dateTime', 'asc'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
  const appointments = appointmentsData || [];

  // 4. Personal Medications (MediMind)
  const medicationsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'users', user.uid, 'medicines'), orderBy('name'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: medicationsData, isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);
  const medications = medicationsData || [];

  // 5. Medication Dose History (Global Collection Group)
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

  // Readiness check
  const isLoaded =
    !isUserLoading &&
    (!user ||
      (!isUserProfileLoading &&
        !isPatientsLoading &&
        !isAppointmentsLoading &&
        !isMedicationsLoading &&
        !isHistoryLoading));

  // Translation helper
  const t = (key: string) => {
    const lang = userProfileData?.language || 'ar';
    const dict = (translations as any)[lang] || translations.ar;
    return dict[key] || key;
  };

  // --- Clinical Actions ---
  const addPatient = (patient: Omit<Patient, 'id' | 'clinicId' | 'createdAt'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'patients'), {
      ...patient,
      clinicId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const addAppointment = (app: Omit<Appointment, 'id' | 'clinicId' | 'status'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'appointments'), {
      ...app,
      clinicId: user.uid,
      status: 'pending'
    });
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    if (!shouldFetch) return;
    const docRef = doc(db, 'users', user.uid, 'appointments', id);
    updateDocumentNonBlocking(docRef, { status });
  };

  const clearPatients = () => {
    if (!shouldFetch) return;
    patients.forEach(p => {
      const docRef = doc(db, 'users', user.uid, 'patients', p.id);
      deleteDocumentNonBlocking(docRef);
    });
  };

  const clearAppointments = () => {
    if (!shouldFetch) return;
    appointments.forEach(a => {
      const docRef = doc(db, 'users', user.uid, 'appointments', a.id);
      deleteDocumentNonBlocking(docRef);
    });
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

  // --- Medication Actions ---
  const addMedication = (med: Omit<Medication, 'id' | 'userId'>) => {
    if (!shouldFetch) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'medicines'), {
      ...med,
      userId: user.uid
    });
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    if (!shouldFetch) return;
    const docRef = doc(db, 'users', user.uid, 'medicines', id);
    updateDocumentNonBlocking(docRef, updates);
  };

  const deleteMedication = (id: string) => {
    if (!shouldFetch) return;
    const docRef = doc(db, 'users', user.uid, 'medicines', id);
    deleteDocumentNonBlocking(docRef);
  };

  const logDose = (medId: string, scheduledTime: string, status: DoseStatus) => {
    if (!shouldFetch) return;
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    const logsCol = collection(db, 'users', user.uid, 'medicines', medId, 'doseLogs');
    addDocumentNonBlocking(logsCol, {
      userId: user.uid,
      medicationId: medId,
      name: med.name,
      status,
      scheduledTime,
      recordedAt: new Date().toISOString(),
      takenAt: status === 'taken' ? new Date().toISOString() : null
    });

    if (status === 'taken') {
      const docRef = doc(db, 'users', user.uid, 'medicines', medId);
      updateDocumentNonBlocking(docRef, {
        remainingQuantity: Math.max(0, med.remainingQuantity - med.dosageAmount)
      });
    }
  };

  const getTodayDoses = () => {
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
  };

  return {
    user,
    isUserLoading,
    profile: userProfileData || {
      userId: user?.uid || '',
      name: user?.displayName || 'طبيب',
      email: user?.email || '',
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
    addAppointment,
    updateAppointmentStatus,
    clearPatients,
    clearAppointments,
    getTodayAppointments,
    setProfile: (updates: Partial<UserProfile>) => {
      if (!userProfileRef) return;
      setDocumentNonBlocking(userProfileRef, updates, { merge: true });
    },
    addMedication,
    updateMedication,
    deleteMedication,
    logDose,
    getTodayDoses
  };
}

export const useMediMind = useClinic;
