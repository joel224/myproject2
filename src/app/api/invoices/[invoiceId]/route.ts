
// src/app/api/invoices/[invoiceId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, authorize } from '@/lib/mockServerDb';
import type { Invoice } from '@/lib/types';

const updateInvoiceSchema = z.object({
  // Add other updatable fields here if needed in the future
  // For now, only status is explicitly updatable through this example.
  // patientId: z.string().min(1).optional(),
  // date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  // dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  // items: z.array(z.any()).optional(), // Item updates would be complex
  // totalAmount: z.number().positive().optional(),
  // amountPaid: z.number().min(0).optional(),
  status: z.enum(['Pending', 'Paid', 'Overdue', 'Partial', 'Cancelled']).optional(),
});


interface SpecificInvoiceParams {
  params: {
    invoiceId: string;
  }
}

export async function GET(request: NextRequest, { params }: SpecificInvoiceParams) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { invoiceId } = params;
  const invoice = db.invoices.find(inv => inv.id === invoiceId);

  if (!invoice) {
    return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
  }
  return NextResponse.json(invoice, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: SpecificInvoiceParams) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  
  const { invoiceId } = params;
  const invoiceIndex = db.invoices.findIndex(inv => inv.id === invoiceId);

  if (invoiceIndex === -1) {
    return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const validation = updateInvoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData = validation.data;
    const currentInvoice = db.invoices[invoiceIndex];
    
    // Update only fields that are present in updateData
    const updatedInvoice: Invoice = { ...currentInvoice };

    if (updateData.status) {
      updatedInvoice.status = updateData.status;
    }
    // Extend this logic if other fields become updatable (e.g., items, dates)
    // For now, mainly for status change like cancelling.

    db.invoices[invoiceIndex] = updatedInvoice;
    console.log(`Invoice ${invoiceId} updated. New status: ${updatedInvoice.status}`);
    return NextResponse.json(updatedInvoice, { status: 200 });

  } catch (error) {
    console.error(`Error updating invoice ${invoiceId}:`, error);
    return NextResponse.json({ message: 'Error updating invoice' }, { status: 500 });
  }
}

// DELETE for an invoice might also be restricted (e.g., only if unpaid or after archiving).
// For now, we are focusing on updating status to 'Cancelled' instead of hard delete.
// export async function DELETE(request: NextRequest, { params }: SpecificInvoiceParams) {
//   // ... authorization ...
//   const { invoiceId } = params;
//   const invoiceIndex = db.invoices.findIndex(inv => inv.id === invoiceId);
//   if (invoiceIndex === -1) {
//     return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
//   }
//   // Consider implications: what happens to related payment transactions?
//   db.invoices.splice(invoiceIndex, 1);
//   return NextResponse.json({ message: "Invoice deleted successfully (mock)" }, { status: 200 });
// }
