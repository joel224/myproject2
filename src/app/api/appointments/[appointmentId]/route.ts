// src/app/api/appointments/[appointmentId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, authorize } from '@/lib/mockServerDb';
import type { Appointment } from '@/lib/types';

const updateAppointmentSchema = z.object({
  patientId: z.string().min(1).optional(),
  doctorId: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, "Time must be in HH:MM AM/PM format").optional(),
  type: z.string().min(1).optional(),
  status: z.enum(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled']).optional(),
  notes: z.string().optional().nullable(),
});


interface AppointmentRouteParams {
  params: {
    appointmentId: string;
  }
}

export async function GET(request: NextRequest, { params }: AppointmentRouteParams) {
  // const authResult = await authorize(request, 'staff'); // or 'doctor'
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }
  const { appointmentId } = params;
  const appointment = db.appointments.find(apt => apt.id === appointmentId);

  if (!appointment) {
    return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
  }
  
  const patient = db.users.find(u => u.id === appointment.patientId);
  const doctor = db.users.find(u => u.id === appointment.doctorId);

  const populatedAppointment = {
      ...appointment,
      patientName: patient?.name || appointment.patientName || 'Unknown Patient',
      doctorName: doctor?.name || appointment.doctorName || 'Unknown Doctor',
  };

  return NextResponse.json(populatedAppointment, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: AppointmentRouteParams) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }
  const { appointmentId } = params;
  const appointmentIndex = db.appointments.findIndex(apt => apt.id === appointmentId);

  if (appointmentIndex === -1) {
    return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const validation = updateAppointmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const updateData = validation.data;

    // Update only provided fields
    const currentAppointment = db.appointments[appointmentIndex];
    const updatedAppointment = { ...currentAppointment };

    if (updateData.patientId) {
        if (!db.users.some(u => u.id === updateData.patientId && u.role === 'patient')) {
            return NextResponse.json({ message: `Patient with ID ${updateData.patientId} not found.` }, { status: 404 });
        }
        updatedAppointment.patientId = updateData.patientId;
        updatedAppointment.patientName = db.users.find(u => u.id === updateData.patientId)?.name;
    }
    if (updateData.doctorId) {
        if (!db.users.some(u => u.id === updateData.doctorId && (u.role === 'doctor' || u.role === 'staff'))) {
            return NextResponse.json({ message: `Doctor/Staff with ID ${updateData.doctorId} not found.` }, { status: 404 });
        }
        updatedAppointment.doctorId = updateData.doctorId;
        updatedAppointment.doctorName = db.users.find(u => u.id === updateData.doctorId)?.name;
    }
    if (updateData.date) updatedAppointment.date = updateData.date;
    if (updateData.time) updatedAppointment.time = updateData.time;
    if (updateData.type) updatedAppointment.type = updateData.type;
    if (updateData.status) updatedAppointment.status = updateData.status;
    if (updateData.notes !== undefined) updatedAppointment.notes = updateData.notes ?? undefined;


    db.appointments[appointmentIndex] = updatedAppointment;
    return NextResponse.json(updatedAppointment, { status: 200 });

  } catch (error) {
    console.error(`Error updating appointment ${appointmentId}:`, error);
    return NextResponse.json({ message: 'Error updating appointment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: AppointmentRouteParams) {
  // const authResult = await authorize(request, 'staff');
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }
  const { appointmentId } = params;
  const appointmentIndex = db.appointments.findIndex(apt => apt.id === appointmentId);

  if (appointmentIndex === -1) {
    return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
  }

  db.appointments.splice(appointmentIndex, 1);
  return NextResponse.json({ message: "Appointment deleted successfully" }, { status: 200 });
}
