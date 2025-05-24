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
  role: 'patient' | 'doctor' | 'staff';
  resetToken?: string;
  resetTokenExpiry?: Date;
  // Patient specific details can be linked via ID or stored directly if simple
  dateOfBirth?: string;
  phone?: string;
}

// Simulating a "database" in memory
// Deep copy initial mock data to allow mutation without affecting original mockData.ts
const users: UserAuth[] = [
  { id: 'doc1', name: 'Dr. Loji', email: 'dr.loji@dentalhub.com', passwordHash: '$2a$10$fakedoclojiHash.abc123', role: 'doctor' }, // Simulated bcrypt hash
  { id: 'staff1', name: 'Sarah ClinicStaff', email: 'sarah.staff@dentalhub.com', passwordHash: '$2a$10$fakestaffsarahHash.def456', role: 'staff' },
  { id: 'pat1', name: 'Alice Wonderland', email: 'alice@example.com', passwordHash: '$2a$10$fakepatientaliceHash.ghi789', role: 'patient', dateOfBirth: '1990-05-15', phone: '555-0101' },
  { id: 'pat2', name: 'Bob The Builder', email: 'bob@example.com', passwordHash: '$2a$10$fakepatientbobHash.jkl012', role: 'patient', dateOfBirth: '1985-11-20', phone: '555-0102' },
];

// Make copies of imported arrays so we can mutate them for other entities
// We use the UserAuth[] for patient data if it's simple enough, or link via ID for more complex Patient profiles
let patients: Patient[] = JSON.parse(JSON.stringify(initialPatients.map(p => ({...p, userId: users.find(u => u.email === p.email)?.id || p.id }))));
let appointments: Appointment[] = JSON.parse(JSON.stringify(initialAppointments));
let treatmentPlans: TreatmentPlan[] = JSON.parse(JSON.stringify(initialTreatmentPlans));
let progressNotes: ProgressNote[] = JSON.parse(JSON.stringify(initialProgressNotes));
let invoices: Invoice[] = JSON.parse(JSON.stringify(initialInvoices));
// StaffMember data can also be primarily drawn from UserAuth with role 'staff' or 'doctor'
// let staff: StaffMember[] = JSON.parse(JSON.stringify(initialStaff)); 

let clinicWaitTime = { text: "<10 mins", updatedAt: new Date().toISOString() };

export const db = {
  users,
  patients, // This might be redundant if UserAuth contains all patient info
  appointments,
  treatmentPlans,
  progressNotes,
  invoices,
  // staff, // This might be redundant
  clinicWaitTime,
};

// Helper to generate unique IDs (very basic for mock)
export function generateId(prefix: string = 'id_') {
  return prefix + Math.random().toString(36).substr(2, 9);
}

// Mock middleware for authorization (conceptual)
export async function authorize(req: NextRequest, requiredRole?: 'patient' | 'doctor' | 'staff') {
  // In a real app, you'd verify a JWT from cookies or Authorization header
  const mockSessionToken = req.cookies.get('sessionToken')?.value;
  if (!mockSessionToken) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: No session token' }, { status: 401 }) };
  }

  // Simulate token verification
  const [userId, userRole] = mockSessionToken.split(':'); // e.g., "pat1:patient"
  const user = db.users.find(u => u.id === userId && u.role === userRole);

  if (!user) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Invalid session' }, { status: 401 }) };
  }

  if (requiredRole && user.role !== requiredRole) {
    // If a specific role is required and user doesn't have it
     const doctorSpecificRoles: UserAuth['role'][] = ['doctor']; // Example: doctor role can access staff things
    if (requiredRole === 'staff' && doctorSpecificRoles.includes(user.role as UserAuth['role'])) {
      // Allow doctors to access staff routes
    } else {
       return { authorized: false, user: null, error: NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
    }
  }
  
  return { authorized: true, user: user, error: null };
}
