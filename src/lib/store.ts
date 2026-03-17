
"use client";

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
  deleteDocumentNonBlocking,
} from '@/firebase';
import {
  collection,
  doc,
  query,
  orderBy,
  where,
  collectionGroup,
  addDoc
} from 'firebase/firestore';
import { translations } from './translations';
import { useEffect } from 'react';

/**
 * Main store hook for the Smart Dentist & MediMind features.
 * Operates purely on live Firestore data with automated bootstrapping.
 */
export function useClinic() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const shouldFetch = !!user && !isUserLoading;

  // 1. User Profile
  const userProfileRef = useMemoFirebase(() => {
    return shouldFetch ? doc(db, 'users', user.uid) : null;
  }, [db, user, shouldFetch]);

  const { data: userProfileData, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // 2. Clinic Profile (Settings)
  const clinicRef = useMemoFirebase(() => {
    return shouldFetch ? doc(db, 'clinics', user.uid) : null;
  }, [db, user, shouldFetch]);

  const { data: clinicData, isLoading: isClinicLoading } = useDoc<ClinicProfile>(clinicRef);

  // 3. Clinic Patients (User Subcollection)
  const patientsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'users', user.uid, 'patients'), orderBy('createdAt', 'desc'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: patientsData, isLoading: isPatientsLoading } = useCollection<Patient>(patientsQuery);
  const patients = patientsData || [];

  // 4. Clinic Appointments (User Subcollection)
  const appointmentsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'users', user.uid, 'appointments'), orderBy('dateTime', 'asc'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
  const appointments = appointmentsData || [];

  // 5. Personal Medications (MediMind)
  const medicationsQuery = useMemoFirebase(() => {
    return shouldFetch
      ? query(collection(db, 'users', user.uid, 'medicines'), orderBy('name'))
      : null;
  }, [db, user, shouldFetch]);

  const { data: medicationsData, isLoading: isMedicationsLoading } = useCollection<Medication>(medicationsQuery);
  const medications = medicationsData || [];

  // 6. Medication Dose History (Global Collection Group)
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
        !isClinicLoading &&
        !isPatientsLoading &&
        !isAppointmentsLoading &&
        !isMedicationsLoading &&
        !isHistoryLoading));

  // Bootstrapping Logic
  useEffect(() => {
    if (shouldFetch && isLoaded && user) {
      // Bootstrap Profile
      if (!userProfileData) {
        setDocumentNonBlocking(doc(db, 'users', user.uid), {
          userId: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      // Bootstrap Clinic
      if (!clinicData) {
        setDocumentNonBlocking(doc(db, 'clinics', user.uid), {
          clinicId: user.uid,
          name: user.displayName ? `${user.displayName}'s Clinic` : 'My Clinic',
          language: 'ar',
          theme: 'light',
          notificationsEnabled: true
        }, { merge: true });
      }

      // Phase 2 & 3: Default Medicines and DoseLogs
      if (medications.length === 0 && !isMedicationsLoading) {
        const defaultMeds = [
          { name: "Paracetamol", dosageAmount: 1, dosageUnit: "pill", times: ["08:00"], totalQuantity: 30 },
          { name: "Vitamin C", dosageAmount: 1, dosageUnit: "pill", times: ["09:00"], totalQuantity: 30 },
          { name: "Ibuprofen", dosageAmount: 1, dosageUnit: "pill", times: ["20:00"], totalQuantity: 30 },
        ];
        defaultMeds.forEach(async (med) => {
          const medRef = await addDoc(collection(db, 'users', user.uid, 'medicines'), {
            ...med,
            userId: user.uid,
            remainingQuantity: med.totalQuantity,
            refillThreshold: 5,
            frequency: 'daily',
            startDate: new Date().toISOString()
          });

          // Add initial pending log
          addDoc(collection(db, 'users', user.uid, 'medicines', medRef.id, 'doseLogs'), {
            userId: user.uid,
            medicationId: medRef.id,
            name: med.name,
            status: "pending",
            scheduledTime: new Date().toISOString(),
            recordedAt: new Date().toISOString(),
            takenAt: new Date().toISOString()
          });
        });
      }

      // Phase 4: Sample Patient and Appointment
      if (patients.length === 0 && !isPatientsLoading) {
        addDoc(collection(db, 'users', user.uid, 'patients'), {
          name: "John Doe",
          age: 30,
          clinicId: user.uid,
          phone: "123-456-7890",
          createdAt: new Date().toISOString()
        }).then((pRef) => {
          const todayAtTen = new Date();
          todayAtTen.setHours(10, 0, 0, 0);
          
          addDoc(collection(db, 'users', user.uid, 'appointments'), {
            clinicId: user.uid,
            patientId: pRef.id,
            patientName: "John Doe",
            dateTime: todayAtTen.toISOString(),
            status: "pending",
            treatment: "General Checkup"
          });
        });
      }
    }
  }, [shouldFetch, isLoaded, userProfileData, clinicData, medications.length, patients.length, db, user]);

  // Translation helper
  const t = (key: string) => {
    const lang = clinicData?.language || 'ar';
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
    clearPatients,
    clearAppointments,
    getTodayAppointments,
    setProfile: (updates: Partial<ClinicProfile>) => {
      if (!clinicRef) return;
      setDocumentNonBlocking(clinicRef, updates, { merge: true });
    },
    addMedication,
    updateMedication,
    deleteMedication,
    logDose,
    getTodayDoses
  };
}

export const useMediMind = useClinic;
