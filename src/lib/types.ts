
export type DosageUnit = 'pill' | 'mg' | 'ml' | 'drop' | 'capsule' | 'injection';

export type DoseStatus = 'taken' | 'skipped' | 'missed' | 'pending';

export interface Medication {
  id: string;
  name: string;
  dosageAmount: number;
  dosageUnit: DosageUnit;
  times: string[]; // HH:mm
  startDate: string; // ISO
  endDate?: string; // ISO
  totalQuantity: number;
  remainingQuantity: number;
  refillThreshold: number;
  frequency: 'daily' | 'weekdays' | 'interval';
  intervalHours?: number;
}

export interface DoseHistory {
  id: string;
  medicationId: string;
  scheduledTime: string; // ISO
  status: DoseStatus;
  recordedAt?: string; // ISO
}

export interface UserProfile {
  name: string;
  language: 'en' | 'ar';
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}
