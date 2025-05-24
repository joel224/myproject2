// src/app/api/invoices/[invoiceId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, authorize } from '@/lib/mockServerDb';
// No Zod schema for update yet, as it's complex (partial updates, item changes)

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

// PUT for updating an invoice would be complex (e.g., adding/removing items, changing amounts)
// For a mock, it's often simplified or not fully implemented.
// DELETE for an invoice might also be restricted (e.g., only if unpaid).
