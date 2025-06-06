
// src/lib/mockServerDb.ts
import type { Appointment, TreatmentPlan, ProgressNote, Invoice, StaffMember, PaymentTransaction } from './types';
import {
  mockAppointments as initialAppointments,
  mockTreatmentPlans as initialTreatmentPlans,
  mockProgressNotes as initialProgressNotes,
  mockInvoices as initialInvoices,
  mockStaff as initialStaff,
  mockPatients as initialPatients // Import initialPatients
} from './mockData';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface UserAuth {
  id: string;
  name: string;
  email: string;
  passwordHash?: string; // For users managed outside Firebase Auth, if any. Optional.
  role: 'patient' | 'doctor' | 'staff' | 'hygienist' | 'admin' | 'assistant';
  resetToken?: string;
  resetTokenExpiry?: Date;
  dateOfBirth?: string;
  phone?: string;
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
  createdAt?: string; // Using string for mock ISO date
  updatedAt?: string; // Using string for mock ISO date
}

// Helper to generate unique IDs
export function generateId(prefix: string = 'id_') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Initialize users array
let users: UserAuth[] = [];

// Populate users from initialStaff
initialStaff.forEach(staffMember => {
  let userAuthRole: UserAuth['role'] = 'staff'; // default
  if (staffMember.role === 'Dentist') userAuthRole = 'doctor';
  else if (staffMember.role === 'Hygienist') userAuthRole = 'hygienist';
  else if (staffMember.role === 'Assistant') userAuthRole = 'assistant';
  else if (staffMember.role === 'Admin') userAuthRole = 'admin';

  users.push({
    id: staffMember.id,
    name: staffMember.name,
    email: staffMember.email,
    role: userAuthRole,
    passwordHash: `$2a$10$mockPasswordFor${staffMember.id}`, // Example mock hash
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});

// Populate users from initialPatients
initialPatients.forEach(patient => {
  users.push({
    id: patient.id,
    name: patient.name,
    email: patient.email,
    role: 'patient',
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    // other patient fields from Patient type can be added here if they exist in UserAuth
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});


let appointments: Appointment[] = JSON.parse(JSON.stringify(initialAppointments));
let treatmentPlans: TreatmentPlan[] = JSON.parse(JSON.stringify(initialTreatmentPlans));
let progressNotes: ProgressNote[] = JSON.parse(JSON.stringify(initialProgressNotes));
let invoices: Invoice[] = JSON.parse(JSON.stringify(initialInvoices));
let staff: StaffMember[] = JSON.parse(JSON.stringify(initialStaff));
let paymentTransactions: PaymentTransaction[] = [];
let clinicWaitTime = { text: "<10 mins", updatedAt: new Date().toISOString() };


export const db = {
  users, // Use the populated users array
  appointments,
  treatmentPlans,
  progressNotes,
  invoices,
  clinicWaitTime,
  staff, // Kept for existing logic that might specifically use db.staff
  paymentTransactions,
};


export async function authorize(req: NextRequest, requiredRole?: UserAuth['role'] | UserAuth['role'][]) {
  const mockSessionToken = req.cookies.get('sessionToken')?.value;
  if (!mockSessionToken) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: No session token' }, { status: 401 }) };
  }
  const [userIdFromToken, userRoleFromToken] = mockSessionToken.split(':');
  const user = db.users.find(u => u.id === userIdFromToken);

  if (!user) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Invalid session' }, { status: 401 }) };
  }

  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : []);

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user.role)) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
  }
  return { authorized: true, user: user, error: null };
}
