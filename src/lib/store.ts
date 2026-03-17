
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

  // 0. User Profile (users collection)
  const userProfileRef = useMemoFirebase(() => {
    return shouldFetch ? doc(db, 'users', user.uid) : null;
  }, [db, user, shouldFetch]);

  const { data: userProfileData, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // Auto-bootstrap user profile
  useEffect(() => {
    if (shouldFetch && userProfileRef && !isUserProfileLoading && !userProfileData) {
      setDocumentNonBlocking(
        userProfileRef,
        {
          userId: user.uid,
          name: user.displayName || 'مستخدم جديد',
          email: user.email || '',
          createdAt: new Date().toISOString()
        },
        { merge: true }
      );
    }
  }, [shouldFetch, userProfileRef, isUserProfileLoading, userProfileData, user]);

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
          clinicId: user.uid,
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

  // Auto-bootstrap sample patient and appointment
  useEffect(() => {
    if (shouldFetch && !isPatientsLoading && patients.length === 0) {
      const patientsCol = collection(db, 'clinics', user.uid, 'patients');
      const now = new Date().toISOString();
      
      const samplePatient = {
        name: 'مريض تجريبي',
        clinicId: user.uid,
        phone: '0000000000',
        createdAt: now
      };

      addDocumentNonBlocking(patientsCol, samplePatient).then((docRef) => {
        if (docRef && appointments.length === 0) {
          const appointmentsCol = collection(db, 'clinics', user.uid, 'appointments');
          addDocumentNonBlocking(appointmentsCol, {
            clinicId: user.uid,
            patientId: docRef.id,
            patientName: samplePatient.name,
            dateTime: now,
            status: 'pending',
            treatment: 'فحص عام'
          });
        }
      });
    }
  }, [shouldFetch, isPatientsLoading, patients.length, appointments.length, user, db]);

  // 4. User Medications
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
      name: 'دكتور',
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
