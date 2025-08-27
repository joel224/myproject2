
// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateId } from '@/lib/mockServerDb';
import { getDb } from '@/lib/db';
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
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  
  let query = "SELECT * FROM appointments";
  const params: any[] = [];
  const conditions: string[] = [];

  if (searchParams.has('date')) {
    conditions.push("date = ?");
    params.push(searchParams.get('date'));
  }
  if (searchParams.has('doctorId')) {
    conditions.push("doctorId = ?");
    params.push(searchParams.get('doctorId'));
  }
  if (searchParams.has('patientId')) {
    conditions.push("patientId = ?");
    params.push(searchParams.get('patientId'));
  }
  if (searchParams.has('status')) {
    conditions.push("status = ?");
    params.push(searchParams.get('status'));
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const appointments = await db.all(query, ...params);
  
  // NOTE: Populating patientName and doctorName from the users table would be ideal
  // but for now, we rely on the names stored at creation time to avoid complex joins.
  return NextResponse.json(appointments, { status: 200 });
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  try {
    const body = await request.json();
    const validation = appointmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { patientId, doctorId, date, time, type, status, notes } = validation.data;
    
    const patientExists = await db.get('SELECT id, name FROM patients WHERE id = ?', patientId);
    if (!patientExists) {
      return NextResponse.json({ message: `Patient with ID ${patientId} not found.` }, { status: 404 });
    }

    const doctorExists = await db.get('SELECT id, name FROM users WHERE id = ? AND role IN (?, ?, ?, ?, ?)', doctorId, 'doctor', 'staff', 'hygienist', 'assistant', 'admin');
    if (!doctorExists) {
      return NextResponse.json({ message: `Doctor/Staff with ID ${doctorId} not found.` }, { status: 404 });
    }

    const newAppointment: Appointment = {
      id: generateId('apt_'),
      patientId,
      patientName: patientExists.name,
      doctorId,
      doctorName: doctorExists.name,
      date,
      time,
      type,
      status: status || 'Scheduled',
      notes,
    };
    
    await db.run(
      'INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, type, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      newAppointment.id, newAppointment.patientId, newAppointment.patientName, newAppointment.doctorId, newAppointment.doctorName, newAppointment.date, newAppointment.time, newAppointment.type, newAppointment.status, newAppointment.notes
    );

    return NextResponse.json(newAppointment, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ message: 'Error creating appointment' }, { status: 500 });
  }
}
