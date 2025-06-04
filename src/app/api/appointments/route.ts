
// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, generateId, authorize } from '@/lib/mockServerDb';
import type { Appointment } from '@/lib/types';

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, "Time must be in HH:MM AM/PM format"),
  type: z.string().min(1, "Appointment type is required"),
  status: z.enum(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled']).optional().default('Scheduled'),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  // const authResult = await authorize(request, 'staff'); // or 'doctor'
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  // Implement filtering based on query params (e.g., ?date=YYYY-MM-DD&doctorId=doc1&patientId=pat1&status=Scheduled)
  const { searchParams } = new URL(request.url);
  let filteredAppointments = [...db.appointments];

  if (searchParams.has('date')) {
    filteredAppointments = filteredAppointments.filter(apt => apt.date === searchParams.get('date'));
  }
  if (searchParams.has('doctorId')) {
    filteredAppointments = filteredAppointments.filter(apt => apt.doctorId === searchParams.get('doctorId'));
  }
  if (searchParams.has('patientId')) {
    filteredAppointments = filteredAppointments.filter(apt => apt.patientId === searchParams.get('patientId'));
  }
  if (searchParams.has('status')) {
    filteredAppointments = filteredAppointments.filter(apt => apt.status === searchParams.get('status'));
  }
  
  // Add patientName and doctorName for convenience if not already present
  const populatedAppointments = filteredAppointments.map(apt => {
    const patient = db.users.find(u => u.id === apt.patientId && u.role === 'patient'); // Check role for patient
    const doctor = db.users.find(u => u.id === apt.doctorId && (u.role === 'doctor' || u.role === 'staff')); // doctor can be staff too
    return {
      ...apt,
      patientName: patient?.name || apt.patientName || 'Unknown Patient',
      doctorName: doctor?.name || apt.doctorName || 'Unknown Doctor',
    };
  });


  return NextResponse.json(populatedAppointments, { status: 200 });
}

export async function POST(request: NextRequest) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  try {
    const body = await request.json();
    const validation = appointmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { patientId, doctorId, date, time, type, status, notes } = validation.data;

    // Validate patient and doctor exist
    const patientExists = db.users.some(u => u.id === patientId && u.role === 'patient');
    const doctorExists = db.users.some(u => u.id === doctorId && (u.role === 'doctor' || u.role === 'staff')); // Allow staff (hygienist) too

    if (!patientExists) {
      return NextResponse.json({ message: `Patient with ID ${patientId} not found.` }, { status: 404 });
    }
    if (!doctorExists) {
      return NextResponse.json({ message: `Doctor/Staff with ID ${doctorId} not found.` }, { status: 404 });
    }
    
    const patientName = db.users.find(u => u.id === patientId)?.name;
    const doctorName = db.users.find(u => u.id === doctorId)?.name;


    const newAppointment: Appointment = {
      id: generateId('apt_'),
      patientId,
      patientName,
      doctorId,
      doctorName,
      date,
      time,
      type,
      status: status || 'Scheduled',
      notes,
    };

    db.appointments.push(newAppointment);
    return NextResponse.json(newAppointment, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ message: 'Error creating appointment' }, { status: 500 });
  }
}
