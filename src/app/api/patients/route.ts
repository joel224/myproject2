
// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateId } from '@/lib/mockServerDb'; 
import bcrypt from 'bcryptjs';
import type { Patient } from '@/lib/types';
import type { UserAuth } from '@/lib/mockServerDb';
import { getDb } from '@/lib/db';

const createPatientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  age: z.number().int().min(0).optional(),
  medicalRecords: z.string().optional(),
  xrayImageUrls: z.array(z.string().url()).optional().default([]),
  hasDiabetes: z.boolean().optional().default(false),
  hasHighBloodPressure: z.boolean().optional().default(false),
  hasStrokeOrHeartAttackHistory: z.boolean().optional().default(false),
  hasBleedingDisorders: z.boolean().optional().default(false),
  hasAllergy: z.boolean().optional().default(false),
  allergySpecifics: z.string().optional(),
  hasAsthma: z.boolean().optional().default(false),
  password: z.string().min(6).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const patientUsers = await db.all("SELECT * FROM users WHERE role = 'patient'");
    
    const patientsList: Patient[] = patientUsers.map(user => {
      const { passwordHash, ...patientData } = user;
      return patientData as Patient;
    });

    return NextResponse.json(patientsList, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ message: 'Error fetching patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const patientData = validation.data;
    
    let passwordHash: string | undefined;
    if (patientData.password) {
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(patientData.password, saltRounds);
    }

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', patientData.email);

    if (existingUser) {
      // User exists, update their record with patient details
      const updateUserStmt = `
        UPDATE users SET
          name = ?, role = ?, phone = ?, dateOfBirth = ?, age = ?, medicalRecords = ?, 
          xrayImageUrls = ?, hasDiabetes = ?, hasHighBloodPressure = ?, 
          hasStrokeOrHeartAttackHistory = ?, hasBleedingDisorders = ?, hasAllergy = ?, 
          allergySpecifics = ?, hasAsthma = ?, passwordHash = ?, updatedAt = ?
        WHERE id = ?
      `;
      await db.run(
        updateUserStmt,
        patientData.name,
        'patient', // Ensure role is patient
        patientData.phone,
        patientData.dateOfBirth,
        patientData.age,
        patientData.medicalRecords,
        JSON.stringify(patientData.xrayImageUrls || []),
        patientData.hasDiabetes,
        patientData.hasHighBloodPressure,
        patientData.hasStrokeOrHeartAttackHistory,
        patientData.hasBleedingDisorders,
        patientData.hasAllergy,
        patientData.allergySpecifics,
        patientData.hasAsthma,
        passwordHash || existingUser.passwordHash,
        new Date().toISOString(),
        existingUser.id
      );

      const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', existingUser.id);
      const { passwordHash: _, ...userToReturn } = updatedUser;
      return NextResponse.json({ message: "Existing user updated to patient", user: userToReturn }, { status: 200 });

    } else {
      // User does not exist, create a new record
      const newUser: UserAuth = {
          id: generateId('user_'),
          role: 'patient',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...patientData,
          passwordHash,
          xrayImageUrls: patientData.xrayImageUrls || [],
      };
      
      const insertUserStmt = `
        INSERT INTO users (
          id, name, email, phone, dateOfBirth, age, medicalRecords, xrayImageUrls,
          hasDiabetes, hasHighBloodPressure, hasStrokeOrHeartAttackHistory, hasBleedingDisorders,
          hasAllergy, allergySpecifics, hasAsthma, passwordHash, role, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await db.run(
        insertUserStmt,
        newUser.id, newUser.name, newUser.email, newUser.phone, newUser.dateOfBirth, newUser.age,
        newUser.medicalRecords, JSON.stringify(newUser.xrayImageUrls), newUser.hasDiabetes,
        newUser.hasHighBloodPressure, newUser.hasStrokeOrHeartAttackHistory, newUser.hasBleedingDisorders,
        newUser.hasAllergy, newUser.allergySpecifics, newUser.hasAsthma, newUser.passwordHash,
        newUser.role, newUser.createdAt, newUser.updatedAt
      );

      const { passwordHash: _, ...newPatientResponse } = newUser;
      return NextResponse.json(newPatientResponse, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating/updating patient:', error);
    return NextResponse.json({ message: 'Error creating patient' }, { status: 500 });
  }
}
