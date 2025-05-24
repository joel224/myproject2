// src/app/api/treatment-plans/[planId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId, authorize } from '@/lib/mockServerDb';
import type { TreatmentPlan, Procedure } from '@/lib/types';

const procedureSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Procedure name is required"),
  cost: z.number().positive("Cost must be a positive number").optional(),
});

const updateTreatmentPlanSchema = z.object({
  doctorId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  procedures: z.array(procedureSchema).min(1, "At least one procedure is required").optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional().nullable(),
  status: z.enum(['Active', 'Completed', 'On Hold', 'Cancelled']).optional(),
  totalCost: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});


interface SpecificTreatmentPlanParams {
  params: {
    planId: string;
  }
}

export async function GET(request: NextRequest, { params }: SpecificTreatmentPlanParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { planId } = params;
  const plan = db.treatmentPlans.find(tp => tp.id === planId);

  if (!plan) {
    return NextResponse.json({ message: "Treatment plan not found" }, { status: 404 });
  }
  return NextResponse.json(plan, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: SpecificTreatmentPlanParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { planId } = params;
  const planIndex = db.treatmentPlans.findIndex(tp => tp.id === planId);

  if (planIndex === -1) {
    return NextResponse.json({ message: "Treatment plan not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const validation = updateTreatmentPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;
    const currentPlan = db.treatmentPlans[planIndex];
    
    // Simple merge for mock. In real app, handle nested objects like procedures more carefully.
    const updatedPlan = { ...currentPlan, ...updateData };

    if (updateData.procedures) {
      updatedPlan.procedures = updateData.procedures.map(p => ({ ...p, id: p.id || generateId('proc_') }));
    }
    
    // Recalculate totalCost if procedures changed and totalCost not explicitly set
    if (updateData.procedures && updateData.totalCost === undefined) {
      updatedPlan.totalCost = updatedPlan.procedures.reduce((sum, proc) => sum + (proc.cost || 0), 0);
    } else if (updateData.totalCost !== undefined) {
        updatedPlan.totalCost = updateData.totalCost === null ? undefined : updateData.totalCost;
    }


    db.treatmentPlans[planIndex] = updatedPlan;
    return NextResponse.json(updatedPlan, { status: 200 });

  } catch (error) {
    console.error(`Error updating treatment plan ${planId}:`, error);
    return NextResponse.json({ message: 'Error updating treatment plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: SpecificTreatmentPlanParams) {
  // const authResult = await authorize(request, 'doctor');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { planId } = params;
  const planIndex = db.treatmentPlans.findIndex(tp => tp.id === planId);

  if (planIndex === -1) {
    return NextResponse.json({ message: "Treatment plan not found" }, { status: 404 });
  }

  db.treatmentPlans.splice(planIndex, 1);
  return NextResponse.json({ message: "Treatment plan deleted successfully" }, { status: 200 });
}
