
// src/app/api/patients/[patientId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/mockServerDb'; 
import type { Patient } from '@/lib/types';
import type { UserAuth } from '@/lib/mockServerDb';


const updatePatientSchema = z.object({
  name: z.string().min(2, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of Birth must be YYYY-MM-DD").optional().nullable(),
  age: z.number().int().min(0).optional().nullable(),
  medicalRecords: z.string().optional().nullable(),
  xrayImageUrls: z.array(z.string().url()).optional(),
  hasDiabetes: z.boolean().optional(),
  hasHighBloodPressure: z.boolean().optional(),
  hasStrokeOrHeartAttackHistory: z.boolean().optional(),
  hasBleedingDisorders: z.boolean().optional(),
  hasAllergy: z.boolean().optional(),
  allergySpecifics: z.string().optional().nullable(),
  hasAsthma: z.boolean().optional(),
});

interface PatientRouteParams {
  params: {
    patientId: string;
  }
}

export async function GET(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;
  try {
    const patientUser = db.users.find(u => u.id === patientId && u.role === 'patient');

    if (!patientUser) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
    
    // Exclude passwordHash before sending
    const { passwordHash, ...patientResponse } = patientUser;

    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error fetching patient details' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;

  try {
    const body = await request.json();
    const validation = updatePatientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;
    
    const patientIndex = db.users.findIndex(u => u.id === patientId && u.role === 'patient');

    if (patientIndex === -1) {
        return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    if (updateData.email && updateData.email !== db.users[patientIndex].email) {
        const emailCollisionCheck = db.users.some(u => u.email === updateData.email && u.id !== patientId);
        if (emailCollisionCheck) {
          return NextResponse.json({ message: "Email already in use by another user." }, { status: 409 });
        }
    }
    
    const currentPatient = db.users[patientIndex];
    const updatedPatient: UserAuth = {
      ...currentPatient,
      ...updateData,
      age: updateData.age ?? currentPatient.age,
      updatedAt: new Date().toISOString(),
    };
    
    db.users[patientIndex] = updatedPatient;

    const { passwordHash, ...patientResponse } = updatedPatient;
    return NextResponse.json(patientResponse, { status: 200 });

  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error updating patient' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: PatientRouteParams) {
  const { patientId } = params;

  try {
    const patientUserIndex = db.users.findIndex(u => u.id === patientId);
    
    if (patientUserIndex === -1) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    // Instead of deleting the user, we downgrade them from a 'patient'.
    // This preserves their login (Firebase Auth) record but revokes access to patient data.
    // We remove clinical information.
    const userToModify = db.users[patientUserIndex];

    if (userToModify.role === 'patient') {
        const { 
            dateOfBirth, age, medicalRecords, xrayImageUrls, hasDiabetes, 
            hasHighBloodPressure, hasStrokeOrHeartAttackHistory, hasBleedingDisorders, 
            hasAllergy, allergySpecifics, hasAsthma, ...restOfUser 
        } = userToModify;

        const downgradedUser: UserAuth = {
            ...restOfUser,
            // You might want to change role to something else, or just leave as is
            // depending on business logic. For now, we just remove the data.
            // role: 'user' // or some other non-patient role
            updatedAt: new Date().toISOString(),
        };

        db.users[patientUserIndex] = downgradedUser;
        
        // Also remove their appointments, treatment plans etc.
        db.appointments = db.appointments.filter(a => a.patientId !== patientId);
        db.treatmentPlans = db.treatmentPlans.filter(tp => tp.patientId !== patientId);
        db.progressNotes = db.progressNotes.filter(pn => pn.patientId !== patientId);
        db.invoices = db.invoices.filter(i => i.patientId !== patientId);
        // Find and remove conversation
        const convoIndex = db.conversations.findIndex(c => c.patientId === patientId);
        if (convoIndex > -1) {
          const convoId = db.conversations[convoIndex].id;
          db.conversations.splice(convoIndex, 1);
          // Remove messages from that conversation
          db.messages = db.messages.filter(m => m.conversationId !== convoId);
        }

        return NextResponse.json({ message: "Patient clinical data deleted successfully. User login account remains." }, { status: 200 });

    } else {
        // If they are not a patient, just delete the user record entirely (e.g. staff)
        db.users.splice(patientUserIndex, 1);
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    }

  } catch (error) {
    console.error(`Error deleting patient ${patientId}:`, error);
    return NextResponse.json({ message: 'Error deleting patient' }, { status: 500 });
  }
}
