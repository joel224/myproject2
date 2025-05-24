import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockInvoices, mockPatients } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { DollarSign, PlusCircle, Search, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function StaffPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Payment Management</h1>
        <DialogRecordPayment />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Invoices</CardTitle>
          <CardDescription>View and manage patient invoices.</CardDescription>
           <div className="flex w-full max-w-md items-center space-x-2 mt-2">
            <Input type="text" placeholder="Search by patient name or invoice ID..." className="flex-1" />
            <Button type="submit"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map(invoice => {
                const patient = mockPatients.find(p => p.id === invoice.patientId);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{patient?.name || 'Unknown Patient'}</TableCell>
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
                        <DialogRecordPayment invoice={invoice} patientName={patient?.name}/>
                        <Button variant="ghost" size="icon" aria-label="View Receipt"><Receipt className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {mockInvoices.length === 0 && <p className="text-center text-muted-foreground py-4">No invoices found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function DialogRecordPayment({ invoice, patientName }: { invoice?: any, patientName?: string }) {
  const isEditMode = !!invoice;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isEditMode ? "outline" : "default"} size={isEditMode ? "sm" : "default"}>
          {isEditMode ? <DollarSign className="mr-1 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4" />} 
          {isEditMode ? "Record Payment" : "New Payment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Record Payment For Invoice " + invoice.id : "Record New Payment"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Patient: ${patientName}` : "Select patient and enter payment details."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isEditMode && (
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-patient" className="text-right">Patient</Label>
                <Select>
                    <SelectTrigger id="payment-patient" className="col-span-3">
                    <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                    {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          )}
          {isEditMode && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Amount Due</Label>
                <p className="col-span-3 font-semibold">${(invoice.totalAmount - invoice.amountPaid).toFixed(2)}</p>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-amount" className="text-right">Amount Paid</Label>
            <Input id="payment-amount" type="number" placeholder="0.00" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-method" className="text-right">Method</Label>
            <Select defaultValue="Card">
                <SelectTrigger id="payment-method" className="col-span-3">
                    <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Card">Credit/Debit Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-date" className="text-right">Payment Date</Label>
            <Input id="payment-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-notes" className="text-right">Notes</Label>
            <Input id="payment-notes" placeholder="Optional transaction notes" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Record Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
