
// src/lib/mockServerDb.ts
import type { Appointment, TreatmentPlan, ProgressNote, Invoice, StaffMember, PaymentTransaction } from './types';
import {
  mockAppointments as initialAppointments,
  mockTreatmentPlans as initialTreatmentPlans,
  mockProgressNotes as initialProgressNotes,
  mockInvoices as initialInvoices,
  mockStaff as initialStaff
} from './mockData'; // Patient data will now come from Firestore
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define a more complete User type for authentication purposes
// This UserAuth interface is also used by Firestore documents in the 'users' collection.
export interface UserAuth {
  id: string; // This will be the Firestore Document ID
  name: string;
  email: string;
  passwordHash?: string; // For users managed outside Firebase Auth, if any. Optional.
  role: 'patient' | 'doctor' | 'staff' | 'hygienist' | 'admin' | 'assistant';
  resetToken?: string;
  resetTokenExpiry?: Date;
  // Patient specific details will be part of the document if role is 'patient'
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
  // Timestamps for Firestore
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

// In-memory 'users' and 'patients' arrays are removed. Data is now in Firestore.

// Make copies of imported arrays so we can mutate them (for non-patient data)
let appointments: Appointment[] = JSON.parse(JSON.stringify(initialAppointments));
let treatmentPlans: TreatmentPlan[] = JSON.parse(JSON.stringify(initialTreatmentPlans));
let progressNotes: ProgressNote[] = JSON.parse(JSON.stringify(initialProgressNotes));
let invoices: Invoice[] = JSON.parse(JSON.stringify(initialInvoices));
let staff: StaffMember[] = JSON.parse(JSON.stringify(initialStaff)); // Staff data might also be migrated to Firestore 'users' later.
let paymentTransactions: PaymentTransaction[] = [];


let clinicWaitTime = { text: "<10 mins", updatedAt: new Date().toISOString() };

// db object will no longer contain 'users' or 'patients' for direct manipulation here.
// API routes will use Firestore SDK directly for those.
export const db = {
  appointments,
  treatmentPlans,
  progressNotes,
  invoices,
  clinicWaitTime,
  staff, // Staff data is still mock for now
  paymentTransactions,
};

// Helper to generate unique IDs (very basic for mock, less needed for Firestore which has auto-IDs)
export function generateId(prefix: string = 'id_') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Mock middleware for authorization (conceptual)
// This authorize function would need to be updated if it was relying on the in-memory db.users.
// For now, it's a placeholder and real authorization would integrate with Firebase Auth context.
export async function authorize(req: NextRequest, requiredRole?: UserAuth['role'] | UserAuth['role'][]) {
  const mockSessionToken = req.cookies.get('sessionToken')?.value;
  // This is highly simplified and would need to check actual Firebase Auth session in a real app.
  if (!mockSessionToken) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: No session token' }, { status: 401 }) };
  }

  // Placeholder for user lookup. In a real app, you'd verify the token and fetch user from Firebase Auth/Firestore.
  // const [userId, userRoleFromToken] = mockSessionToken.split(':');
  // const user = await getDoc(doc(firestoreDb, "users", userId)); // Example Firestore lookup

  // For this mock, assume token is valid if present and role allows access based on a simplified check.
  // This part needs to be replaced with actual Firebase Auth token verification.
  const userFromTokenPlaceholder = { id: "mockUser", role: "admin" } as UserAuth; // SIMULATED

  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : []);

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(userFromTokenPlaceholder.role)) {
    // Further role checks as before
    const isAdmin = userFromTokenPlaceholder.role === 'admin';
    // ... (rest of the complex role logic)

    if (!isAdmin /* && other conditions */) {
       return { authorized: false, user: null, error: NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
    }
  }
  return { authorized: true, user: userFromTokenPlaceholder, error: null };
}
