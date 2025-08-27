
// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db'; 
import { generateId } from '@/lib/mockServerDb';
import * as admin from 'firebase-admin';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin
try {
    getFirebaseAdminApp();
} catch (e) {
    console.error("Firebase Admin SDK initialization error on signup route:", e);
}


const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }).optional(),
  // For social logins
  firebaseUid: z.string().optional(),
  provider: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, firebaseUid, provider } = validation.data;
    
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (existingUser) {
      // User already exists. This could be an existing staff or another patient.
      // A more robust system might merge accounts, but for now, we'll prevent duplicates.
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    let createdUserId: string;

    // Handle social signup vs. email/password
    if (firebaseUid) {
      // Social Signup: User already exists in Firebase Auth, we just need to create our DB record.
      createdUserId = firebaseUid;
    } else {
      // Email/Password Signup
      if (!password) {
          return NextResponse.json({ message: "Password is required for email signup" }, { status: 400 });
      }

      // 1. Create user in Firebase Auth
      const firebaseUserRecord = await admin.auth().createUser({
          email: email,
          password: password,
          displayName: name,
      });
      createdUserId = firebaseUserRecord.uid;
    }

    // 2. Create user in our SQLite DB users table
    const now = new Date().toISOString();
    await db.run(
        'INSERT INTO users (id, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        createdUserId, name, email, 'patient', now, now
    );
    
    // Also create a corresponding patient record
    const newPatientId = generateId('pat_');
    await db.run(
        'INSERT INTO patients (id, userId, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        newPatientId, createdUserId, name, email, now, now
    );

    const userToReturn = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', createdUserId);

    return NextResponse.json({ message: "User registered successfully", user: userToReturn }, { status: 201 });

  } catch (error: any) {
    console.error('Signup API error:', error);
    if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use') {
        return NextResponse.json({ message: "An account with this email address already exists." }, { status: 409 });
    }
    return NextResponse.json({ message: "An unexpected error occurred", details: error.message }, { status: 500 });
  }
}
