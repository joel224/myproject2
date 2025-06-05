
// src/app/api/invoices/[invoiceId]/transactions/[transactionId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, authorize } from '@/lib/mockServerDb';

interface DeletePaymentTransactionParams {
  params: {
    invoiceId: string;
    transactionId: string;
  }
}

export async function DELETE(request: NextRequest, { params }: DeletePaymentTransactionParams) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }

  const { invoiceId, transactionId } = params;

  const invoiceIndex = db.invoices.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex === -1) {
    return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
  }

  const transactionIndex = db.paymentTransactions.findIndex(pt => pt.id === transactionId && pt.invoiceId === invoiceId);
  if (transactionIndex === -1) {
    return NextResponse.json({ message: "Payment transaction not found for this invoice" }, { status: 404 });
  }

  // Remove the transaction
  const deletedTransaction = db.paymentTransactions.splice(transactionIndex, 1)[0];

  // Update the parent invoice
  const invoice = db.invoices[invoiceIndex];
  invoice.amountPaid -= deletedTransaction.amountPaid;

  // Ensure amountPaid doesn't go below zero
  if (invoice.amountPaid < 0) invoice.amountPaid = 0;

  // Update invoice status
  if (invoice.amountPaid >= invoice.totalAmount) {
    invoice.status = 'Paid';
  } else if (invoice.amountPaid > 0) {
    invoice.status = 'Partial';
  } else {
    // Check due date for Overdue status if amountPaid is 0
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    if (dueDate && dueDate < today) {
        invoice.status = 'Overdue';
    } else {
        invoice.status = 'Pending';
    }
  }
  
  db.invoices[invoiceIndex] = invoice;

  console.log(`Payment transaction ${transactionId} deleted for invoice ${invoiceId}. Invoice updated.`);

  return NextResponse.json({ message: "Payment transaction deleted successfully", updatedInvoice: invoice }, { status: 200 });
}
