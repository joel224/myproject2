
// src/app/api/invoices/[invoiceId]/transactions/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, authorize } from '@/lib/mockServerDb';

interface InvoiceTransactionsParams {
  params: {
    invoiceId: string;
  }
}

export async function GET(request: NextRequest, { params }: InvoiceTransactionsParams) {
  // const authResult = await authorize(request, 'staff'); 
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }

  const { invoiceId } = params;

  if (!db.invoices.some(inv => inv.id === invoiceId)) {
    return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
  }

  const transactions = db.paymentTransactions.filter(pt => pt.invoiceId === invoiceId);
  
  // Sort by recordedAt or paymentDate for consistency
  transactions.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  return NextResponse.json(transactions, { status: 200 });
}
