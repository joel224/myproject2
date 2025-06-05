
// src/lib/mockServerDb.ts
import type { Patient, Appointment, TreatmentPlan, ProgressNote, Invoice, StaffMember, PaymentTransaction } from './types';
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
// This part will be removed based on previous user request to manage users via UI
// initialPatients.forEach(p => {
//     if (!users.some(u => u.id === p.id || u.email === p.email)) { 
//         users.push({
//             id: p.id, 
//             name: p.name,
//             email: p.email,
//             passwordHash: `$2a$10$mockPasswordFor${p.id.replace(/[^a-zA-Z0-9]/g, '')}`,
//             role: 'patient',
//             phone: p.phone,
//             dateOfBirth: p.dateOfBirth,
//             age: p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : undefined,
//             medicalRecords: p.medicalRecords,
//             xrayImageUrls: p.xrayImageUrls || [],
//             hasDiabetes: p.hasDiabetes,
//             hasHighBloodPressure: p.hasHighBloodPressure,
//             hasStrokeOrHeartAttackHistory: p.hasStrokeOrHeartAttackHistory,
//             hasBleedingDisorders: p.hasBleedingDisorders,
//             hasAllergy: p.hasAllergy,
//             allergySpecifics: p.allergySpecifics,
//             hasAsthma: p.hasAsthma,
//         });
//     }
// });

// Populate staff into users array
// This part will also be removed based on previous user request to manage staff via UI.
// initialStaff.forEach(s => {
//   if (!users.some(u => u.id === s.id || u.email === s.email)) {
//     let userAuthRole: UserAuth['role'] = 'staff';
//     if (s.role === 'Dentist') userAuthRole = 'doctor';
//     else if (s.role === 'Hygienist') userAuthRole = 'hygienist';
//     else if (s.role === 'Assistant') userAuthRole = 'assistant';
//     else if (s.role === 'Admin') userAuthRole = 'admin';

//     users.push({
//       id: s.id,
//       name: s.name,
//       email: s.email,
//       passwordHash: `$2a$10$mockPasswordFor${s.id.replace(/[^a-zA-Z0-9]/g, '')}`,
//       role: userAuthRole,
//     });
//   }
// });


// Make copies of imported arrays so we can mutate them
let patients: Patient[] = JSON.parse(JSON.stringify(initialPatients.map(p => ({
  ...p,
  userId: users.find(u => u.email === p.email)?.id || p.id,
  age: p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : undefined,
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
let staff: StaffMember[] = JSON.parse(JSON.stringify(initialStaff));
let paymentTransactions: PaymentTransaction[] = []; // New array for payment transactions


let clinicWaitTime = { text: "<10 mins", updatedAt: new Date().toISOString() };

export const db = {
  users,
  patients,
  appointments,
  treatmentPlans,
  progressNotes,
  invoices,
  clinicWaitTime,
  staff,
  paymentTransactions, // Include paymentTransactions in the mutable db object
};

// Helper to generate unique IDs (very basic for mock)
export function generateId(prefix: string = 'id_') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Mock middleware for authorization (conceptual)
export async function authorize(req: NextRequest, requiredRole?: UserAuth['role'] | UserAuth['role'][]) {
  const mockSessionToken = req.cookies.get('sessionToken')?.value;
  if (!mockSessionToken) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: No session token' }, { status: 401 }) };
  }

  const [userId, userRoleFromToken] = mockSessionToken.split(':');

  const user = db.users.find(u => u.id === userId && u.role === (userRoleFromToken as UserAuth['role']));

  if (!user) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Invalid session' }, { status: 401 }) };
  }

  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : []);

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user.role)) {
    // Special case: allow 'doctor' to access 'staff' routes for broader clinic management
    // and 'admin' to access all routes for full oversight.
    const isAdmin = user.role === 'admin';
    const isDoctorAccessingStaffRoute = user.role === 'doctor' && rolesToCheck.includes('staff');
    
    if (!isAdmin && !isDoctorAccessingStaffRoute) {
       return { authorized: false, user: null, error: NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
    }
  }

  return { authorized: true, user: user, error: null };
}
