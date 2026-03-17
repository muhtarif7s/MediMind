
export type AppointmentStatus = 'pending' | 'attended' | 'no-show' | 'cancelled';

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
}
