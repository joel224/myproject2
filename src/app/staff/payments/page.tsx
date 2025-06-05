
// src/app/staff/payments/page.tsx
'use client';

import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, PlusCircle, Search, Receipt, Loader2, AlertTriangle, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Invoice, Patient, PaymentTransaction, InvoiceItem as InvoiceItemType } from '@/lib/types'; 
import { Separator } from "@/components/ui/separator";

const PAYMENT_METHODS = ["Card", "Cash", "Bank Transfer", "Insurance", "Other"];

interface EnhancedInvoice extends Invoice {
  patientName?: string;
  patientPhone?: string;
}

export default function StaffPaymentsPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<EnhancedInvoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [viewingInvoice, setViewingInvoice] = useState<EnhancedInvoice | null>(null);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);


  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data: Patient[] = await response.json();
      setPatients(data);
      return data; 
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not load patients list." });
      setPatients([]); 
      return []; 
    }
  }, [toast]);

  const fetchInvoices = useCallback(async (currentPatients: Patient[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices?_cb=${new Date().getTime()}`); // Added cache buster
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invoices');
      }
      const data: Invoice[] = await response.json();
      const patientsToUse = currentPatients.length > 0 ? currentPatients : await fetchPatients();
      
      const dataWithPatientDetails = data.map(inv => {
        const patientDetails = patientsToUse.find(p => p.id === inv.patientId);
        return {
          ...inv,
          patientName: patientDetails?.name || 'Unknown Patient',
          patientPhone: patientDetails?.phone || undefined
        };
      });
      setInvoices(dataWithPatientDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Error fetching invoices", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchPatients]); 

  useEffect(() => {
    const loadInitialData = async () => {
        const fetchedPatients = await fetchPatients();
        await fetchInvoices(fetchedPatients);
    };
    loadInitialData();
  }, [fetchPatients, fetchInvoices]);


  const filteredInvoices = invoices.filter(invoice =>
    (invoice.patientName && invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (invoice.patientPhone && invoice.patientPhone.includes(searchTerm)) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewInvoiceDetails = (invoice: EnhancedInvoice) => {
    setViewingInvoice(invoice);
    setIsViewInvoiceModalOpen(true);
  };
  
  const handlePaymentActionSuccess = () => {
    fetchInvoices(patients); // Re-fetch all invoices
    if (viewingInvoice) { // If the detailed view dialog is open, refresh its content too
        // This will be handled by the DialogViewInvoicePayments itself by re-fetching transactions
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Payment Management</h1>
        <DialogCreateInvoice patients={patients} onSuccess={() => fetchInvoices(patients)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>View and manage patient invoices.</CardDescription>
           <div className="flex w-full max-w-md items-center space-x-2 mt-2">
            <Input 
              type="text" 
              placeholder="Search by patient name, phone, or invoice ID..." 
              className="flex-1" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="button"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading invoices...</p>
            </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center py-10 text-destructive">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? filteredInvoices.map(invoice => {
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.patientPhone || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button variant="link" className="p-0 h-auto text-left" onClick={() => handleViewInvoiceDetails(invoice)}>
                            {invoice.patientName || 'Unknown Patient'}
                        </Button>
                      </TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>${invoice.amountPaid.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            invoice.status === 'Paid' ? 'default' : 
                            invoice.status === 'Pending' ? 'secondary' : 
                            invoice.status === 'Overdue' ? 'destructive' : 'outline'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                          <DialogRecordPayment
                            invoice={invoice}
                            patientName={invoice.patientName}
                            onSuccess={handlePaymentActionSuccess}
                          />
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-4">
                      No invoices found{searchTerm ? ' matching your search' : ''}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {viewingInvoice && (
        <DialogViewInvoicePayments
          invoice={viewingInvoice}
          isOpen={isViewInvoiceModalOpen}
          onOpenChange={setIsViewInvoiceModalOpen}
          onPaymentActionSuccess={handlePaymentActionSuccess} // Pass the callback here
        />
      )}
    </div>
  );
}

// Dialog for Recording Payment
interface DialogRecordPaymentProps {
  invoice: Invoice;
  patientName?: string;
  onSuccess: () => void;
}

function DialogRecordPayment({ invoice, patientName, onSuccess }: DialogRecordPaymentProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [amountPaidNowStr, setAmountPaidNowStr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Card');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    if (isOpen && invoice) { 
      setAmountPaidNowStr(''); 
      setPaymentMethod('Card'); 
      setPaymentDate(new Date().toISOString().split('T')[0]); 
      setPaymentNotes(''); 
    }
  }, [isOpen, invoice]);


  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setIsSaving(true);

    const parsedAmount = parseFloat(amountPaidNowStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid positive amount." });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/record-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amountPaidNow: parsedAmount, 
          paymentMethod, 
          paymentDate, 
          notes: paymentNotes.trim() === '' ? undefined : paymentNotes.trim()
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || (result.errors ? JSON.stringify(result.errors) : 'Failed to record payment'));
      }
      toast({ title: "Payment Recorded", description: `Payment of $${parsedAmount.toFixed(2)} for invoice ${invoice.id} recorded.` });
      setIsOpen(false); 
      if (onSuccess) onSuccess(); 
    } catch (err: any) {
      toast({ variant: "destructive", title: "Payment Error", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  const amountDue = invoice ? (invoice.totalAmount - invoice.amountPaid).toFixed(2) : '0.00';
  const totalInvoiceAmount = invoice ? invoice.totalAmount.toFixed(2) : '0.00';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={invoice.status === 'Paid'}>
          <DollarSign className="mr-1 h-4 w-4"/> Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handlePaymentSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment For Invoice {invoice.id}</DialogTitle>
            <DialogDescription>
              Patient: {patientName || 'N/A'}. Invoice Total: ${totalInvoiceAmount}. Amount Due: ${amountDue}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-amount" className="text-right">Amount Paid</Label>
                <Input 
                  id="payment-amount" 
                  type="number" 
                  placeholder="0.00" 
                  className="col-span-3" 
                  value={amountPaidNowStr} 
                  onChange={e => setAmountPaidNowStr(e.target.value)} 
                  step="1" 
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-method" className="text-right">Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="payment-method" className="col-span-3">
                        <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                        {PAYMENT_METHODS.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
           <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-date" className="text-right">Payment Date</Label>
                <Input id="payment-date" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-notes" className="text-right">Notes</Label>
                <Textarea id="payment-notes" placeholder="Optional transaction notes (e.g., check #, partial payment for X)" className="col-span-3" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} rows={2}/>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Dialog for Creating a New Invoice
interface DialogCreateInvoiceProps {
  patients: Patient[];
  onSuccess: () => void;
}
interface InvoiceLineItem {
  id: string; 
  description: string;
  quantity: number;
  unitPrice: number;
}

function DialogCreateInvoice({ patients, onSuccess }: DialogCreateInvoiceProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); 
    return date.toISOString().split('T')[0];
  });
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
  
  const handleLineItemChange = (index: number, field: keyof Omit<InvoiceLineItem, 'id'>, value: string | number) => {
    const updatedItems = [...lineItems];
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index][field] = Number(value) || 0;
    } else {
      updatedItems[index][field] = value as string;
    }
    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    } else {
      toast({ variant: "destructive", title: "Cannot Remove", description: "An invoice must have at least one line item."})
    }
  };
  
  const calculateTotalAmount = () => {
    return lineItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const resetForm = () => {
    setSelectedPatientId('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    setDueDate(futureDate.toISOString().split('T')[0]);
    setLineItems([{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);


  const handleCreateInvoiceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!selectedPatientId) {
      toast({ variant: "destructive", title: "Missing Patient", description: "Please select a patient." });
      setIsSaving(false);
      return;
    }
    if (lineItems.some(item => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      toast({ variant: "destructive", title: "Invalid Line Item", description: "Please ensure all line items have a description, positive quantity, and non-negative unit price." });
      setIsSaving(false);
      return;
    }

    const totalAmount = calculateTotalAmount();
    if (totalAmount <= 0) {
        toast({ variant: "destructive", title: "Invalid Total", description: "Invoice total amount must be positive." });
        setIsSaving(false);
        return;
    }

    const invoiceData = {
      patientId: selectedPatientId,
      date: issueDate,
      dueDate: dueDate || undefined, 
      items: lineItems.map(item => ({ 
        description: item.description, 
        quantity: item.quantity, 
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice 
      })),
      totalAmount, 
      amountPaid: 0, 
      status: 'Pending' as Invoice['status'],
    };

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      const result = await response.json();
      if (!response.ok) {
         throw new Error(result.message || (result.errors ? JSON.stringify(result.errors) : 'Failed to create invoice'));
      }
      toast({ title: "Invoice Created", description: `New invoice ${result.id} for patient ${patients.find(p=>p.id === selectedPatientId)?.name} created.` });
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Invoice Creation Error", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Invoice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl"> 
        <form onSubmit={handleCreateInvoiceSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Fill in the details to generate a new invoice.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoice-patient" className="text-right">Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger id="invoice-patient" className="col-span-3">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.length > 0 ? patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.email}) {p.phone ? `- ${p.phone}` : ''}
                    </SelectItem>
                  )) : <SelectItem value="loading" disabled>Loading patients...</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoice-issue-date" className="text-right">Issue Date</Label>
              <Input id="invoice-issue-date" type="date" className="col-span-3" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoice-due-date" className="text-right">Due Date</Label>
              <Input id="invoice-due-date" type="date" className="col-span-3" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            
            <Separator className="my-2" />
            <Label className="font-semibold col-span-4">Invoice Items</Label>
            {lineItems.map((item, index) => (
              <div key={item.id} className="space-y-2 p-3 border rounded-md relative">
                {lineItems.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => removeLineItem(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor={`item-desc-${index}`}>Description</Label>
                  <Input id={`item-desc-${index}`} placeholder="Service or Product Description" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                    <Input id={`item-qty-${index}`} type="number" placeholder="1" value={item.quantity.toString()} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} min="1" />
                  </div>
                  <div>
                    <Label htmlFor={`item-price-${index}`}>Unit Price ($)</Label>
                    <Input id={`item-price-${index}`} type="number" placeholder="0.00" value={item.unitPrice.toString()} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} step="0.01" min="0"/>
                  </div>
                </div>
                 <p className="text-sm text-right font-medium">Item Total: ${(item.quantity * item.unitPrice).toFixed(2)}</p>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addLineItem} className="mt-1 w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
            </Button>
             <Separator className="my-2" />
             <div className="text-right font-bold text-lg">
                Total Amount: ${calculateTotalAmount().toFixed(2)}
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


// Dialog for Viewing Invoice Details and Payment History
interface DialogViewInvoicePaymentsProps {
  invoice: EnhancedInvoice; 
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentActionSuccess: () => void; // Callback for when a payment is deleted
}

function DialogViewInvoicePayments({ invoice, isOpen, onOpenChange, onPaymentActionSuccess }: DialogViewInvoicePaymentsProps) {
  const { toast } = useToast();
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentTransaction | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);


  const fetchPaymentHistory = useCallback(async () => {
    if (!invoice?.id) return;
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/transactions?_cb=${new Date().getTime()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payment history');
      }
      const data: PaymentTransaction[] = await response.json();
      setPaymentHistory(data);
    } catch (err: any) {
      setHistoryError(err.message);
      // toast({ variant: "destructive", title: "Error", description: "Could not load payment history." });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [invoice]);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentHistory();
    }
  }, [isOpen, fetchPaymentHistory]);

  const handleDeletePaymentClick = (payment: PaymentTransaction) => {
    setPaymentToDelete(payment);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete || !invoice) return;
    setIsDeletingPayment(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/transactions/${paymentToDelete.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete payment transaction');
      }
      toast({ title: "Payment Deleted", description: `Payment of $${paymentToDelete.amountPaid.toFixed(2)} has been deleted.` });
      fetchPaymentHistory(); // Refresh payment history in the dialog
      if (onPaymentActionSuccess) onPaymentActionSuccess(); // Trigger refresh of main invoice list
    } catch (err: any) {
      toast({ variant: "destructive", title: "Deletion Error", description: err.message });
    } finally {
      setIsDeletingPayment(false);
      setIsConfirmDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };


  if (!invoice) return null;

  const amountDue = (invoice.totalAmount - invoice.amountPaid).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details: {invoice.id}</DialogTitle>
          <DialogDescription>
            Patient: {invoice.patientName || 'N/A'} | Total: ${invoice.totalAmount.toFixed(2)} | Paid: ${invoice.amountPaid.toFixed(2)} | Due: ${amountDue}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <section>
                <h4 className="font-semibold mb-2 text-md">Invoice Items:</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-center">Qty</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
            
            <Separator />

            <section>
                <h4 className="font-semibold mb-2 text-md">Payment History:</h4>
                {isLoadingHistory ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="ml-2 text-muted-foreground">Loading payment history...</p>
                    </div>
                ) : historyError ? (
                    <div className="flex flex-col items-center justify-center p-4 text-destructive">
                        <AlertTriangle className="h-6 w-6 mb-1" />
                        <p>{historyError}</p>
                         <Button variant="outline" size="sm" onClick={fetchPaymentHistory} className="mt-2">Try Again</Button>
                    </div>
                ) : paymentHistory.length > 0 ? (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount Paid</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentHistory.map(pt => (
                        <TableRow key={pt.id}>
                            <TableCell>{new Date(pt.paymentDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">${pt.amountPaid.toFixed(2)}</TableCell>
                            <TableCell>{pt.paymentMethod}</TableCell>
                            <TableCell className="text-xs">{pt.notes || '-'}</TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive/80"
                                    onClick={() => handleDeletePaymentClick(pt)}
                                    disabled={isDeletingPayment && paymentToDelete?.id === pt.id}
                                    aria-label="Delete Payment"
                                >
                                    {isDeletingPayment && paymentToDelete?.id === pt.id 
                                        ? <Loader2 className="h-4 w-4 animate-spin" /> 
                                        : <Trash2 className="h-4 w-4"/>
                                    }
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground text-sm">No payment transactions found for this invoice.</p>
                )}
            </section>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment of ${paymentToDelete?.amountPaid.toFixed(2)} made on {paymentToDelete ? new Date(paymentToDelete.paymentDate).toLocaleDateString() : ''}? This action cannot be undone and will update the invoice balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPaymentToDelete(null)} disabled={isDeletingPayment}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePayment} disabled={isDeletingPayment} className="bg-destructive hover:bg-destructive/90">
              {isDeletingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

