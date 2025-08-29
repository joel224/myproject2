
// src/lib/mockServerDb.ts
import type { Appointment, TreatmentPlan, ProgressNote, Invoice, StaffMember, PaymentTransaction, Conversation, Message, Patient as PatientType } from './types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDb } from './db';

export interface UserAuth {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

// All data arrays are now deprecated and data will be fetched from SQLite.
// The file is kept for the UserAuth type and the authorize function.

export function generateId(prefix: string = 'id_') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// This authorize function checks for the httpOnly session cookie.
export async function authorize(req: NextRequest, requiredRole?: UserAuth['role'] | UserAuth['role'][]) {
  const sessionToken = req.cookies.get('sessionToken')?.value;

  // --- Start Enhanced Debug Logging ---
  console.log('--- Authorize Function Called ---');
  console.log('Request URL:', req.url);
  // Log all cookies to see what the server is receiving
  const allCookies = req.cookies.getAll();
  if (allCookies.length > 0) {
    console.log('All Cookies Received:', allCookies);
  } else {
    console.log('No cookies received by the server.');
  }
  console.log('Attempting to find "sessionToken":', sessionToken ? `FOUND (value: ${sessionToken.substring(0, 15)}...)` : 'NOT FOUND');
  // --- End Enhanced Debug Logging ---


  if (!sessionToken) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: No session token provided in request.' }, { status: 401 }) };
  }

  const [userIdFromToken, userRoleFromToken] = sessionToken.split(':');
  if (!userIdFromToken || !userRoleFromToken) {
      return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Invalid session token format.' }, { status: 401 }) };
  }

  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE id = ?', userIdFromToken);

  if (!user) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Session user not found in database.' }, { status: 401 }) };
  }

  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : []);

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user.role)) {
    return { authorized: false, user: null, error: NextResponse.json({ message: `Forbidden: Your role ('${user.role}') does not have permission.` }, { status: 403 }) };
  }

  // Type assertion to match UserAuth interface
  return { authorized: true, user: user as UserAuth, error: null };
}

// The old in-memory 'db' object is removed.
// All API routes must now import and use `getDb` from `./db`.
export const db = {
    // This is now a placeholder.
    // API routes should be updated to use the SQLite database.
};
