
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
// User data for signup/login will now be handled by the database,
// so we remove the mock users array or significantly reduce its role here.
// We can keep some initial users for other functionalities that are still mocked.
const users: UserAuth[] = [
  // { id: 'doc1', name: 'Dr. Loji', email: 'dr.loji@dentalhub.com', passwordHash: '$2a$10$fakedoclojiHash.abc123', role: 'doctor' },
  // { id: 'staff1', name: 'Sarah ClinicStaff', email: 'sarah.staff@dentalhub.com', passwordHash: '$2a$10$fakestaffsarahHash.def456', role: 'staff' },
  // The above users would now come from your actual database after they sign up/are created.
  // For routes NOT YET migrated to the real DB, we might need some way to look up names.
  // This 'users' array will become less important as more features move to the real DB.
];

// Make copies of imported arrays so we can mutate them for other entities
let patients: Patient[] = JSON.parse(JSON.stringify(initialPatients.map(p => ({...p, userId: users.find(u => u.email === p.email)?.id || p.id }))));
let appointments: Appointment[] = JSON.parse(JSON.stringify(initialAppointments));
let treatmentPlans: TreatmentPlan[] = JSON.parse(JSON.stringify(initialTreatmentPlans));
let progressNotes: ProgressNote[] = JSON.parse(JSON.stringify(initialProgressNotes));
let invoices: Invoice[] = JSON.parse(JSON.stringify(initialInvoices));

let clinicWaitTime = { text: "<10 mins", updatedAt: new Date().toISOString() };

export const db = {
  // users array is now less central for auth, but might be used for other mocks
  // until those features are also migrated to a real DB.
  users, 
  patients,
  appointments,
  treatmentPlans,
  progressNotes,
  invoices,
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
  const [userId, userRoleFromToken, ..._] = mockSessionToken.split(':'); // e.g., "uuid_or_id:patient:mockToken..."
  
  // Fetch user details from the database (or mock for now if DB is not fully integrated for this part)
  // This part will eventually need to query your actual 'users' table based on userId
  // For now, let's assume the token itself is somewhat trustworthy for its role part FOR MOCKING.
  // In a real system, you'd validate the token against a session store or re-fetch user from DB.
  const user = { id: userId, role: userRoleFromToken as UserAuth['role'], email: 'user@example.com', name: 'Mock User' }; // Simplified mock

  if (!user || !user.id || !user.role) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Invalid session structure' }, { status: 401 }) };
  }


  if (requiredRole && user.role !== requiredRole) {
    const doctorSpecificRoles: UserAuth['role'][] = ['doctor'];
    if (requiredRole === 'staff' && doctorSpecificRoles.includes(user.role as UserAuth['role'])) {
      // Allow doctors to access staff routes
    } else {
       return { authorized: false, user: null, error: NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
    }
  }
  
  return { authorized: true, user: user, error: null };
}
