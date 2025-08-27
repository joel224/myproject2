
// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId } from '@/lib/mockServerDb'; 
import bcrypt from 'bcryptjs';
import type { Patient } from '@/lib/types';
import type { UserAuth } from '@/lib/mockServerDb';

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
    const patientUsers = db.users.filter(u => u.role === 'patient');
    
    const patientsList: Patient[] = patientUsers.map(user => {
      const { passwordHash, ...patientData } = user;
      return patientData as Patient; // Cast to Patient type after removing password hash
    });

    return NextResponse.json(patientsList, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ message: 'Error fetching patients' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const patientData = validation.data;

    const existingUser = db.users.find(u => u.email === patientData.email);
    if (existingUser) {
      return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 });
    }

    let passwordHash: string | undefined;
    if (patientData.password) {
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(patientData.password, saltRounds);
    }
    
    const newUser: UserAuth = {
        id: generateId('user_'),
        name: patientData.name,
        email: patientData.email,
        passwordHash,
        role: 'patient',
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        age: patientData.age,
        medicalRecords: patientData.medicalRecords,
        xrayImageUrls: patientData.xrayImageUrls,
        hasDiabetes: patientData.hasDiabetes,
        hasHighBloodPressure: patientData.hasHighBloodPressure,
        hasStrokeOrHeartAttackHistory: patientData.hasStrokeOrHeartAttackHistory,
        hasBleedingDisorders: patientData.hasBleedingDisorders,
        hasAllergy: patientData.hasAllergy,
        allergySpecifics: patientData.allergySpecifics,
        hasAsthma: patientData.hasAsthma,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    const { passwordHash: _, ...newPatientResponse } = newUser;

    return NextResponse.json(newPatientResponse, { status: 201 });

  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ message: 'Error creating patient' }, { status: 500 });
  }
}
