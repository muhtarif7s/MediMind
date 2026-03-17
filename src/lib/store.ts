
"use client";

import { useEffect } from 'react';
import {
  Patient,
  Appointment,
  ClinicProfile,
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

  // 1. User Profile
  const userProfileRef = useMemoFirebase(() => {
    return shouldFetch ? doc(db, 'users', user.uid) : null;
  }, [db, user, shouldFetch]);

  const { data: userProfileData, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // 2. Clinic Profile
  const clinicRef = useMemoFirebase(() => {
    return shouldFetch ? doc(db, 'clinics', user.uid) : null;
  }, [db, user, shouldFetch]);

  const { data: clinicData, isLoading: isClinicLoading } = useDoc<ClinicProfile>(clinicRef);

  // 3. Clinic Patients
  const patientsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'clinics', user.uid, 'patients'), orderBy('name'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(patientsQuery);
  const patients = patientsData || [];

  // 4. Clinic Appointments
  const appointmentsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'clinics', user.uid, 'appointments'), orderBy('dateTime'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
  const appointments = appointmentsData || [];

  // 5. User Medications
  const medicationsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'users', user.uid, 'medicines'), orderBy('name'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: medicationsData, isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);
  const medications = medicationsData || [];

  // 6. Medication Dose History
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

  const t = (key: string) => {
    const lang = clinicData?.language || 'ar';
    const dict = (translations as any)[lang] || translations.ar;
    return dict[key] || key;
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

  const isLoaded =
    !isUserLoading &&
    (!user ||
      (!isUserProfileLoading &&
        !isClinicLoading &&
        !isPatientsLoading &&
        !isAppointmentsLoading &&
        !isMedicationsLoading &&
        !isHistoryLoading));

  return {
    user,
    isUserLoading,
    userProfile: userProfileData,
    profile: clinicData || {
      clinicId: user?.uid || '',
      name: user?.displayName || 'طبيب',
      language: 'ar',
      theme: 'light',
      notificationsEnabled: true
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
    getTodayAppointments,
    setProfile: (updates: Partial<ClinicProfile>) => {
      if (!clinicRef) return;
      setDocumentNonBlocking(clinicRef, updates, { merge: true });
    },
    addMedication: (med: Omit<Medication, 'id' | 'userId'>) => {
      if (!shouldFetch) return;
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'medicines'), {
        ...med,
        userId: user.uid
      });
    },
    updateMedication: (id: string, updates: Partial<Medication>) => {
      if (!shouldFetch) return;
      const docRef = doc(db, 'users', user.uid, 'medicines', id);
      updateDocumentNonBlocking(docRef, updates);
    },
    deleteMedication: (id: string) => {
      if (!shouldFetch) return;
      const docRef = doc(db, 'users', user.uid, 'medicines', id);
      // Note: In production you might want to delete doseLogs subcollection too
      updateDocumentNonBlocking(docRef, { deleted: true }); 
    },
    logDose: (medId: string, scheduledTime: string, status: DoseStatus) => {
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
