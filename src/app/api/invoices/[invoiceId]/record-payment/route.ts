// src/app/api/invoices/[invoiceId]/record-payment/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, authorize } from '@/lib/mockServerDb';

const recordPaymentSchema = z.object({
  amountPaidNow: z.number().positive("Payment amount must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required").optional().default("Card"), // Example
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date must be YYYY-MM-DD").optional().default(new Date().toISOString().split('T')[0]),
  notes: z.string().optional(),
});

interface RecordPaymentParams {
  params: {
    invoiceId: string;
  }
}

export async function POST(request: NextRequest, { params }: RecordPaymentParams) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  const { invoiceId } = params;
  const invoice = db.invoices.find(inv => inv.id === invoiceId);

  if (!invoice) {
    return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status === 'Paid') {
    return NextResponse.json({ message: "Invoice is already fully paid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = recordPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { amountPaidNow } = validation.data;

    invoice.amountPaid += amountPaidNow;

    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'Paid';
      invoice.amountPaid = invoice.totalAmount; // Ensure not overpaid in mock
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partial';
    }
    // Overdue logic would require checking dueDate

    // In a real app, you'd also create a transaction record.
    console.log(`Payment of ${amountPaidNow} recorded for invoice ${invoiceId}. New amount paid: ${invoice.amountPaid}, Status: ${invoice.status}`);

    return NextResponse.json(invoice, { status: 200 });

  } catch (error) {
    console.error(`Error recording payment for invoice ${invoiceId}:`, error);
    return NextResponse.json({ message: 'Error recording payment' }, { status: 500 });
  }
}
