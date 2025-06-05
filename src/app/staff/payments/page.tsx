
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
import { DollarSign, PlusCircle, Search, Receipt, Loader2, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Invoice, Patient } from '@/lib/types'; 
import { Separator } from "@/components/ui/separator"; // Added missing import

const PAYMENT_METHODS = ["Card", "Cash", "Bank Transfer", "Insurance", "Other"];

export default function StaffPaymentsPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invoices');
      }
      const data: Invoice[] = await response.json();
      const patientsToUse = currentPatients.length > 0 ? currentPatients : await fetchPatients();
      
      const dataWithPatientNames = data.map(inv => ({
        ...inv,
        patientName: patientsToUse.find(p => p.id === inv.patientId)?.name || 'Unknown Patient'
      }));
      setInvoices(dataWithPatientNames);
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
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Search by patient name or invoice ID..." 
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
                  <TableHead>Invoice ID</TableHead>
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
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.patientName || 'Unknown Patient'}</TableCell>
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
                            onSuccess={() => fetchInvoices(patients)}
                          />
                          <Button variant="ghost" size="icon" aria-label="View Receipt (Placeholder)"><Receipt className="h-4 w-4"/></Button>
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
    if (isOpen) {
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
          notes: paymentNotes 
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
              Patient: {patientName || 'N/A'}. Amount Due: ${amountDue}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-amount" className="text-right">Amount Paid</Label>
                <Input id="payment-amount" type="number" placeholder="0.00" className="col-span-3" value={amountPaidNowStr} onChange={e => setAmountPaidNowStr(e.target.value)} step="0.01" />
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
                <Input id="payment-notes" placeholder="Optional transaction notes" className="col-span-3" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} />
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
                  {patients.length > 0 ? patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.email})</SelectItem>) : <SelectItem value="loading" disabled>Loading patients...</SelectItem>}
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

