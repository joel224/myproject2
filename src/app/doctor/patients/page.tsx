import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockPatients } from "@/lib/mockData";
import { PlusCircle, Search, Eye } from "lucide-react";
import Link from "next/link";

export default function DoctorPatientsListPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patient Records</h1>
        <Link href="/doctor/patients/new"> {/* Placeholder for new patient form */}
            <Button><PlusCircle className="mr-2 h-4 w-4"/>Add New Patient</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
          <div className="flex w-full max-w-md items-center space-x-2 mt-2">
            <Input type="text" placeholder="Search by name, email, or ID..." className="flex-1" />
            <Button type="submit"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPatients.map(patient => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone || 'N/A'}</TableCell>
                  <TableCell>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/doctor/patients/${patient.id}`}>
                        <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>View Record</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {mockPatients.length === 0 && <p className="text-center text-muted-foreground py-4">No patients found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
