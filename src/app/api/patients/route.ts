// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId, authorize, UserAuth } from '@/lib/mockServerDb';
import type { Patient } from '@/lib/types';

// Schema for creating a new patient
const createPatientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(), // Should be ISO date string e.g. "YYYY-MM-DD"
  // In a real scenario, password would be set via a separate user creation flow or an invite.
  // For this mock, if creating a patient also means creating a user account:
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

/**
 * Handles GET requests to /api/patients
 * @param request - The incoming NextRequest object
 * @returns A NextResponse object containing a list of patients or an error.
 */
export async function GET(request: NextRequest) {
  // In a real app, a doctor or staff member would need to be authenticated.
  // const authResult = await authorize(request, 'staff'); // or 'doctor'
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }
  // console.log(`User ${authResult.user.email} (role: ${authResult.user.role}) fetching patients.`);

  // For this mock, we'll return patients derived from the users list or the dedicated patients list
  // This aligns better if UserAuth holds patient details.
  const patientUsers = db.users.filter(u => u.role === 'patient').map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    dateOfBirth: u.dateOfBirth,
  }));
  
  return NextResponse.json(patientUsers, { status: 200 });
}

/**
 * Handles POST requests to /api/patients to create a new patient.
 * This often implies creating a user account for the patient as well.
 * @param request - The incoming NextRequest object
 * @returns A NextResponse object containing the new patient or an error.
 */
export async function POST(request: NextRequest) {
  // const authResult = await authorize(request, 'staff'); // Or 'admin'
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  try {
    const body = await request.json();
    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, phone, dateOfBirth, password } = validation.data;

    // Check if email already exists in the main users table
    if (db.users.find(u => u.email === email)) {
      return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 });
    }

    const newUserId = generateId('user_');
    // Simulate password hashing if provided
    const passwordHash = password ? `$2a$10$${generateId('fakeHash')}${password.substring(0,3)}` : undefined;

    const newUserForPatient: UserAuth = {
      id: newUserId,
      name,
      email,
      passwordHash: passwordHash || `$2a$10$defaultHash${generateId()}`, // Assign a default mock hash if no password given
      role: 'patient',
      phone,
      dateOfBirth,
    };
    db.users.push(newUserForPatient);

    // Create the entry in the 'patients' list if it's separate and detailed
    // For now, assuming UserAuth is sufficient or db.patients is mainly for legacy mockData structure
    const newPatientRecord: Patient = {
      id: newUserId,
      name,
      email,
      phone,
      dateOfBirth,
    };
    // db.patients.push(newPatientRecord); // Uncomment if db.patients is the primary store for patient details

    // Return the patient representation (without sensitive info like passwordHash)
    const patientToReturn = {
      id: newUserId,
      name,
      email,
      phone,
      dateOfBirth,
    };

    return NextResponse.json(patientToReturn, { status: 201 });

  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ message: 'Error creating patient' }, { status: 500 });
  }
}
