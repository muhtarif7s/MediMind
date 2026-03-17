
"use client";

import { useMemo, useEffect } from 'react';
import { Patient, Appointment, ClinicProfile, AppointmentStatus } from './types';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc,
  useMemoFirebase, 
  updateDocumentNonBlocking, 
  addDocumentNonBlocking, 
  setDocumentNonBlocking 
} from '@/firebase';
import { collection, doc, query, orderBy, where } from 'firebase/firestore';
import { translations } from './translations';
import { format, startOfDay, endOfDay } from 'date-fns';

export function useClinic() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const shouldFetch = !!user && !isUserLoading;

  // 1. Clinic Profile
  const clinicRef = useMemoFirebase(() => {
    return shouldFetch ? doc(db, 'clinics', user.uid) : null;
  }, [db, user, shouldFetch]);

  const { data: clinicData, isLoading: isClinicLoading } = useDoc<ClinicProfile>(clinicRef);

  useEffect(() => {
    if (shouldFetch && clinicRef && !isClinicLoading && !clinicData) {
      setDocumentNonBlocking(clinicRef, {
        id: user.uid,
        name: user.displayName || 'عيادة الأسنان',
      }, { merge: true });
    }
  }, [shouldFetch, clinicRef, isClinicLoading, clinicData, user]);

  // 2. Patients
  const patientsQuery = useMemoFirebase(() => {
    return shouldFetch 
      ? query(collection(db, 'clinics', user.uid, 'patients'), orderBy('name'))
      : null;
  }, [db, user, shouldFetch]);
  
  const { data: patients = [], isLoading: isPatientsLoading } = useCollection<Patient>(patientsQuery);

  // 3. Appointments
  const appointmentsQuery = useMemoFirebase(() => {
    return shouldFetch 
      ? query(collection(db, 'clinics', user.uid, 'appointments'), orderBy('dateTime'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: appointments = [], isLoading: isAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);

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
    const today = startOfDay(new Date());
    const tonight = endOfDay(new Date());
    return (appointments || []).filter(a => {
      const d = new Date(a.dateTime);
      return d >= today && d <= tonight;
    });
  };

  const isLoaded = !isUserLoading && (!user || (!isClinicLoading && !isPatientsLoading && !isAppointmentsLoading));

  return {
    user,
    isUserLoading,
    clinic: clinicData,
    patients: patients || [],
    appointments: appointments || [],
    isLoaded,
    t,
    addPatient,
    addAppointment,
    updateAppointmentStatus,
    getTodayAppointments
  };
}
