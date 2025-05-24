// src/app/api/patients/[patientId]/treatment-plans/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId, authorize } from '@/lib/mockServerDb';
import type { TreatmentPlan, Procedure } from '@/lib/types';

const procedureSchema = z.object({
  id: z.string().optional(), // ID might be generated on create
  name: z.string().min(1, "Procedure name is required"),
  cost: z.number().positive("Cost must be a positive number").optional(),
});

const treatmentPlanSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  procedures: z.array(procedureSchema).min(1, "At least one procedure is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional(),
  status: z.enum(['Active', 'Completed', 'On Hold', 'Cancelled']).default('Active'),
  totalCost: z.number().optional(), // Can be calculated or provided
  notes: z.string().optional(),
});

interface TreatmentPlanRouteParams {
  params: {
    patientId: string;
  }
}

export async function GET(request: NextRequest, { params }: TreatmentPlanRouteParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }
  const { patientId } = params;

  if (!db.users.some(u => u.id === patientId && u.role === 'patient')) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  const plans = db.treatmentPlans.filter(tp => tp.patientId === patientId);
  return NextResponse.json(plans, { status: 200 });
}

export async function POST(request: NextRequest, { params }: TreatmentPlanRouteParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }
  const { patientId } = params;

  if (!db.users.some(u => u.id === patientId && u.role === 'patient')) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const validation = treatmentPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = validation.data;
    
    if (!db.users.some(u => u.id === data.doctorId && u.role === 'doctor')) {
         return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    const newPlan: TreatmentPlan = {
      id: generateId('tp_'),
      patientId,
      ...data,
      procedures: data.procedures.map(p => ({ ...p, id: p.id || generateId('proc_') })), // Assign IDs to procedures
    };

    // Calculate totalCost if not provided
    if (newPlan.totalCost === undefined) {
      newPlan.totalCost = newPlan.procedures.reduce((sum, proc) => sum + (proc.cost || 0), 0);
    }

    db.treatmentPlans.push(newPlan);
    return NextResponse.json(newPlan, { status: 201 });

  } catch (error) {
    console.error('Error creating treatment plan:', error);
    return NextResponse.json({ message: 'Error creating treatment plan' }, { status: 500 });
  }
}
