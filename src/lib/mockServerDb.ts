
// src/lib/mockServerDb.ts
import type { Patient, Appointment, TreatmentPlan, ProgressNote, Invoice, StaffMember } from './types';
import {
  mockPatients as initialPatients,
  mockAppointments as initialAppointments,
  mockTreatmentPlans as initialTreatmentPlans,
  mockProgressNotes as initialProgressNotes,
  mockInvoices as initialInvoices,
  mockStaff as initialStaff
} from './mockData';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define a more complete User type for authentication purposes
export interface UserAuth {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Store "hashed" passwords (simulated)
  role: 'patient' | 'doctor' | 'staff' | 'hygienist' | 'admin' | 'assistant'; // Expanded roles
  resetToken?: string;
  resetTokenExpiry?: Date;
  // Patient specific details can be linked via ID or stored directly if simple
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
}

// Simulating a "database" in memory
const users: UserAuth[] = [];

// Populate users from initialPatients (simulating registered patients)
initialPatients.forEach(p => {
    if (!users.some(u => u.id === p.id || u.email === p.email)) { // Check by ID or email
        users.push({
            id: p.id, // Assuming patient ID can be used as user ID for simplicity
            name: p.name,
            email: p.email,
            passwordHash: `$2a$10$mockPasswordFor${p.id.replace(/[^a-zA-Z0-9]/g, '')}`,
            role: 'patient',
            phone: p.phone,
            dateOfBirth: p.dateOfBirth,
            age: p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : undefined,
            // Add other relevant patient fields from Patient type if needed directly in UserAuth
            medicalRecords: p.medicalRecords,
            xrayImageUrls: p.xrayImageUrls || [],
            hasDiabetes: p.hasDiabetes,
            hasHighBloodPressure: p.hasHighBloodPressure,
            hasStrokeOrHeartAttackHistory: p.hasStrokeOrHeartAttackHistory,
            hasBleedingDisorders: p.hasBleedingDisorders,
            hasAllergy: p.hasAllergy,
            allergySpecifics: p.allergySpecifics,
            hasAsthma: p.hasAsthma,
        });
    }
});


// Make copies of imported arrays so we can mutate them
// Update patients to include new fields, ensuring they can be undefined initially
let patients: Patient[] = JSON.parse(JSON.stringify(initialPatients.map(p => ({
  ...p,
  userId: users.find(u => u.email === p.email)?.id || p.id,
  age: p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : undefined, // Example age calculation
  medicalRecords: p.medicalRecords || undefined,
  xrayImageUrls: p.xrayImageUrls || [],
  hasDiabetes: p.hasDiabetes || false,
  hasHighBloodPressure: p.hasHighBloodPressure || false,
  hasStrokeOrHeartAttackHistory: p.hasStrokeOrHeartAttackHistory || false,
  hasBleedingDisorders: p.hasBleedingDisorders || false,
  hasAllergy: p.hasAllergy || false,
  allergySpecifics: p.allergySpecifics || undefined,
  hasAsthma: p.hasAsthma || false,
}))));

let appointments: Appointment[] = JSON.parse(JSON.stringify(initialAppointments));
let treatmentPlans: TreatmentPlan[] = JSON.parse(JSON.stringify(initialTreatmentPlans));
let progressNotes: ProgressNote[] = JSON.parse(JSON.stringify(initialProgressNotes));
let invoices: Invoice[] = JSON.parse(JSON.stringify(initialInvoices));
let staff: StaffMember[] = JSON.parse(JSON.stringify(initialStaff)); // Initialize staff array

let clinicWaitTime = { text: "<10 mins", updatedAt: new Date().toISOString() };

export const db = {
  users,
  patients,
  appointments,
  treatmentPlans,
  progressNotes,
  invoices,
  clinicWaitTime,
  staff, // Include staff in the mutable db object
};

// Helper to generate unique IDs (very basic for mock)
export function generateId(prefix: string = 'id_') {
  return prefix + Math.random().toString(36).substr(2, 9);
}

// Mock middleware for authorization (conceptual)
export async function authorize(req: NextRequest, requiredRole?: UserAuth['role'] | UserAuth['role'][]) {
  const mockSessionToken = req.cookies.get('sessionToken')?.value;
  if (!mockSessionToken) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: No session token' }, { status: 401 }) };
  }

  const [userId, userRoleFromToken] = mockSessionToken.split(':');

  const user = db.users.find(u => u.id === userId && u.role === (userRoleFromToken as UserAuth['role']));
  // In a real scenario, you'd fetch user from actual DB by session.

  if (!user) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Invalid session' }, { status: 401 }) };
  }

  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : []);

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user.role)) {
    // Allow doctors to access staff routes as a special case
    if (user.role === 'doctor' && rolesToCheck.includes('staff')) {
      // This is fine
    } else {
       return { authorized: false, user: null, error: NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
    }
  }

  return { authorized: true, user: user, error: null };
}
