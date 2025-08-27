
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

// This authorize function is now simplified and only checks for a mock cookie.
// A real implementation should use a proper session management strategy.
export async function authorize(req: NextRequest, requiredRole?: UserAuth['role'] | UserAuth['role'][]) {
  const mockSessionToken = req.cookies.get('sessionToken')?.value;
  if (!mockSessionToken) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: No session token' }, { status: 401 }) };
  }

  const [userIdFromToken, userRoleFromToken] = mockSessionToken.split(':');
  if (!userIdFromToken || !userRoleFromToken) {
      return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Invalid session token format' }, { status: 401 }) };
  }

  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE id = ?', userIdFromToken);

  if (!user) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Invalid session' }, { status: 401 }) };
  }

  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : []);

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user.role)) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
  }

  return { authorized: true, user: user as UserAuth, error: null };
}

// The old in-memory 'db' object is removed.
// All API routes must now import and use `getDb` from `./db`.
export const db = {
    // This is now a placeholder.
    // API routes should be updated to use the SQLite database.
};
