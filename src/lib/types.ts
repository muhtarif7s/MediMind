
export type AppointmentStatus = 'pending' | 'attended' | 'no-show' | 'cancelled';
export type DoseStatus = 'pending' | 'taken' | 'skipped' | 'missed';
export type DosageUnit = 'pill' | 'mg' | 'ml' | 'drop' | 'capsule' | 'injection';

export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  dateTime: string; // ISO string
  status: AppointmentStatus;
  treatment?: string;
}

export interface ClinicProfile {
  id: string;
  name: string;
  phone?: string;
  language?: 'ar' | 'en';
  theme?: 'light' | 'dark';
  notificationsEnabled?: boolean;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosageAmount: number;
  dosageUnit: DosageUnit;
  times: string[]; // ['08:00', '20:00']
  startDate: string;
  totalQuantity: number;
  remainingQuantity: number;
  refillThreshold: number;
  frequency: 'daily';
}

export interface DoseLog {
  id: string;
  userId: string;
  medicationId: string;
  scheduledTime: string;
  recordedAt: string;
  status: DoseStatus;
}
