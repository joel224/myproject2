
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string; // Consider changing to 'age' if DOB is not primary, or calculate age from DOB
  age?: number;
  medicalRecords?: string;
  xrayImageUrls?: string[];
  hasDiabetes?: boolean;
  hasHighBloodPressure?: boolean;
  hasStrokeOrHeartAttackHistory?: boolean;
  hasBleedingDisorders?: boolean;
  hasAllergy?: boolean;
  allergySpecifics?: string;
  hasAsthma?: boolean;
  // Add other patient-specific fields
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string; // Denormalized for easy display
  doctorId: string;
  doctorName?: string; // Denormalized
  date: string; // ISO date string
  time: string; // e.g., "10:00 AM"
  type: string; // e.g., "Check-up", "Cleaning", "Consultation"
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes?: string;
}

export interface Procedure {
  id: string;
  name: string;
  code?: string; // Optional dental code
  cost?: number;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  description?: string;
  procedures: Procedure[];
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  totalCost?: number;
  notes?: string;
}

export interface ProgressNoteImage {
  id: string;
  url: string;
  caption?: string;
}

export interface ProgressNote {
  id: string;
  patientId: string;
  treatmentPlanId?: string; // Optional link to a specific plan
  doctorId: string;
  date: string; // ISO date string
  time: string;
  note: string;
  images?: ProgressNoteImage[]; // For X-rays, scans, etc.
  progressStage?: string; // e.g., "Initial Assessment", "Post-Op Day 3"
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Dentist' | 'Hygienist' | 'Assistant' | 'Receptionist' | 'Admin';
  email: string;
  // other staff details
}

export interface Invoice {
  id: string;
  patientId: string;
  date: string;
  dueDate?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; totalPrice: number }>;
  totalAmount: number;
  amountPaid: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Partial';
}
