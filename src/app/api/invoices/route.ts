// src/app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId, authorize } from '@/lib/mockServerDb';
import type { Invoice } from '@/lib/types';

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(), // Should be quantity * unitPrice
});

const invoiceSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD").optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  totalAmount: z.number().positive("Total amount must be positive"),
  amountPaid: z.number().min(0).default(0),
  status: z.enum(['Pending', 'Paid', 'Overdue', 'Partial']).default('Pending'),
});

export async function GET(request: NextRequest) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }

  // Add filtering later (e.g., by patientId, status)
  return NextResponse.json(db.invoices, { status: 200 });
}

export async function POST(request: NextRequest) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  
  try {
    const body = await request.json();
    const validation = invoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const data = validation.data;

    if (!db.users.some(u => u.id === data.patientId && u.role === 'patient')) {
        return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
    
    // Basic validation for items
    for (const item of data.items) {
        if (item.quantity * item.unitPrice !== item.totalPrice) {
            return NextResponse.json({ message: `Mismatch in total price for item: ${item.description}`}, { status: 400});
        }
    }
    const calculatedTotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    if (calculatedTotal !== data.totalAmount) {
        return NextResponse.json({ message: `Calculated total amount (${calculatedTotal}) does not match provided totalAmount (${data.totalAmount}).`}, { status: 400});
    }


    const newInvoice: Invoice = {
      id: generateId('inv_'),
      ...data,
    };

    db.invoices.push(newInvoice);
    return NextResponse.json(newInvoice, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ message: 'Error creating invoice' }, { status: 500 });
  }
}
