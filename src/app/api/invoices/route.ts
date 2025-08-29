
// src/app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateId } from '@/lib/mockServerDb';
import { getDb } from '@/lib/db';
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
  
  // As there is no invoices table, we return an empty array to prevent crashes.
  // This should be implemented when the feature is fully built.
  return NextResponse.json([], { status: 200 });
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  
  try {
    const body = await request.json();
    const validation = invoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const data = validation.data;

    const patientExists = await db.get('SELECT id FROM patients WHERE id = ?', data.patientId);
    if (!patientExists) {
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

    // This part is commented out because there's no `invoices` table yet.
    // When the table is added, this logic can be uncommented.
    /*
    const newInvoice: Invoice = {
      id: generateId('inv_'),
      ...data,
    };
    await db.run('INSERT INTO invoices ...', ...);
    return NextResponse.json(newInvoice, { status: 201 });
    */

    // For now, return a success-like message without writing to DB.
    return NextResponse.json({ message: "Invoice creation endpoint hit, but no DB table exists.", invoiceData: data }, { status: 200 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ message: 'Error creating invoice' }, { status: 500 });
  }
}
