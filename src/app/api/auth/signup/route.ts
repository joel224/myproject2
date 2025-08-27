
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
    
    // Check if a user with this email already exists in our DB
    const existingUserInDb = await db.get('SELECT * FROM users WHERE email = ?', email);

    // This is the main logic change: handle existing users gracefully
    if (firebaseUid) {
        // This is a SOCIAL SIGNUP flow
        if (existingUserInDb) {
            // User exists in our DB, just ensure Firebase UID is linked if it's not already.
            // This is a case of "Log in with Google" for an existing email.
            // The Firebase UID should already match if they were created via our system.
        } else {
            // New social user. Create records in our DB.
            const now = new Date().toISOString();
            await db.run(
                'INSERT INTO users (id, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                firebaseUid, name, email, 'patient', now, now
            );
            const newPatientId = generateId('pat_');
            await db.run(
                'INSERT INTO patients (id, userId, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                newPatientId, firebaseUid, name, email, now, now
            );
        }

    } else {
        // This is an EMAIL/PASSWORD SIGNUP flow
        if (!password) {
            return NextResponse.json({ message: "Password is required for email signup" }, { status: 400 });
        }

        if (existingUserInDb) {
            // User already exists (e.g., created by staff). Update their Firebase account with the new password.
            try {
                await admin.auth().updateUser(existingUserInDb.id, {
                    password: password,
                    displayName: name,
                });
            } catch (error: any) {
                 if (error.code === 'auth/user-not-found') {
                    // This is a rare edge case where our DB has a user but Firebase doesn't.
                    // We can try to recover by creating the Firebase user now.
                    const firebaseUserRecord = await admin.auth().createUser({
                        uid: existingUserInDb.id, // Re-use our existing ID
                        email: email,
                        password: password,
                        displayName: name,
                    });
                 } else {
                    // Re-throw other Firebase errors
                    throw error;
                 }
            }
        } else {
            // This is a brand new user. Create them in Firebase Auth and our DB.
            const firebaseUserRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: name,
            });
            const createdUserId = firebaseUserRecord.uid;
            
            const now = new Date().toISOString();
            await db.run(
                'INSERT INTO users (id, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                createdUserId, name, email, 'patient', now, now
            );
            
            const newPatientId = generateId('pat_');
            await db.run(
                'INSERT INTO patients (id, userId, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                newPatientId, createdUserId, name, email, now, now
            );
        }
    }
    
    // By this point, the user should exist and be set up. Return success.
    // For email signups, we don't return the user object to enforce login.
    return NextResponse.json({ message: "User account is ready." }, { status: 200 });


  } catch (error: any) {
    console.error('Signup API error:', error);
    if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use') {
        return NextResponse.json({ message: "An account with this email address already exists in our system. Please try logging in or resetting your password." }, { status: 409 });
    }
    return NextResponse.json({ message: "An unexpected server error occurred.", details: error.message }, { status: 500 });
  }
}
