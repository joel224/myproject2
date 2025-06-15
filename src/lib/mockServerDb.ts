
// src/lib/mockServerDb.ts
import type { Appointment, TreatmentPlan, ProgressNote, Invoice, StaffMember, PaymentTransaction, Conversation, Message, Patient as PatientType } from './types';
import {
  mockAppointments as initialAppointments,
  mockTreatmentPlans as initialTreatmentPlans,
  mockProgressNotes as initialProgressNotes,
  mockInvoices as initialInvoices,
  mockStaff as initialStaffCollection, // Renamed to avoid conflict
  mockPatients as initialPatients
} from './mockData';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface UserAuth {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'patient' | 'doctor' | 'staff' | 'hygienist' | 'admin' | 'assistant';
  resetToken?: string;
  resetTokenExpiry?: Date;
  dateOfBirth?: string;
  phone?: string;
  age?: number;
  medicalRecords?: string;
  xrayImageUrls?: string[];
  hasDiabetes?: boolean;
  hasHighBloodPressure?: boolean;
  hasStrokeOrHeartAttackHistory?: boolean;
  hasBleedingDisorders?: boolean;
  hasAllergy?: boolean;
  allergySpecifics?: string;
  hasAsthma?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function generateId(prefix: string = 'id_') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

let users: UserAuth[] = [];

initialStaffCollection.forEach(staffMember => {
  let userAuthRole: UserAuth['role'] = 'staff';
  if (staffMember.role === 'Dentist') userAuthRole = 'doctor';
  else if (staffMember.role === 'Hygienist') userAuthRole = 'hygienist';
  else if (staffMember.role === 'Assistant') userAuthRole = 'assistant';
  else if (staffMember.role === 'Admin') userAuthRole = 'admin';

  users.push({
    id: staffMember.id,
    name: staffMember.name,
    email: staffMember.email,
    role: userAuthRole,
    passwordHash: `$2a$10$mockPasswordFor${staffMember.id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});

initialPatients.forEach(patient => {
  users.push({
    id: patient.id,
    name: patient.name,
    email: patient.email,
    role: 'patient',
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});


let appointments: Appointment[] = JSON.parse(JSON.stringify(initialAppointments));
let treatmentPlans: TreatmentPlan[] = JSON.parse(JSON.stringify(initialTreatmentPlans));
let progressNotes: ProgressNote[] = JSON.parse(JSON.stringify(initialProgressNotes));
let invoices: Invoice[] = JSON.parse(JSON.stringify(initialInvoices));
// Removed: let staff: StaffMember[] = JSON.parse(JSON.stringify(initialStaff));
let paymentTransactions: PaymentTransaction[] = [];
let clinicWaitTime = { text: "<10 mins", updatedAt: new Date().toISOString() };

// Mock conversations and messages
let conversations: Conversation[] = [
  {
    id: 'convo1',
    patientId: 'pat1',
    staffId: 'staff1', 
    patientName: initialPatients.find(p => p.id === 'pat1')?.name,
    patientAvatarUrl: `https://placehold.co/40x40.png?text=${initialPatients.find(p => p.id === 'pat1')?.name?.charAt(0)}`,
    lastMessageText: "Hi, can I reschedule my appointment?",
    lastMessageTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(), 
    unreadCountForStaff: 1,
  },
  {
    id: 'convo2',
    patientId: 'pat2',
    staffId: 'staff1',
    patientName: initialPatients.find(p => p.id === 'pat2')?.name,
    patientAvatarUrl: `https://placehold.co/40x40.png?text=${initialPatients.find(p => p.id === 'pat2')?.name?.charAt(0)}`,
    lastMessageText: "Thank you for the reminder!",
    lastMessageTimestamp: new Date(Date.now() - 86400000).toISOString(), 
    unreadCountForStaff: 0,
  },
  {
    id: 'convo3',
    patientId: 'pat3',
    staffId: 'staff1',
    patientName: initialPatients.find(p => p.id === 'pat3')?.name,
    patientAvatarUrl: `https://placehold.co/40x40.png?text=${initialPatients.find(p => p.id === 'pat3')?.name?.charAt(0)}`,
    lastMessageText: "Is parking available at the clinic?",
    lastMessageTimestamp: new Date(Date.now() - 86400000 * 2).toISOString(), 
    unreadCountForStaff: 1,
  }
];

let messages: Message[] = [
  {
    id: generateId('msg_'),
    conversationId: 'convo1',
    senderId: 'pat1',
    senderRole: 'patient',
    text: "Hi, can I reschedule my appointment scheduled for tomorrow?",
    timestamp: new Date(Date.now() - 3600000 * 2 - 60000).toISOString(), 
  },
  {
    id: generateId('msg_'),
    conversationId: 'convo1',
    senderId: 'staff1', 
    senderRole: 'staff',
    text: "Hello Alice, certainly! Which day and time would work best for you?",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), 
  },
  {
    id: generateId('msg_'),
    conversationId: 'convo2',
    senderId: 'staff1',
    senderRole: 'staff',
    text: "Hi Bob, just a friendly reminder about your appointment tomorrow at 2:30 PM.",
    timestamp: new Date(Date.now() - 86400000 - 3600000).toISOString(), 
  },
  {
    id: generateId('msg_'),
    conversationId: 'convo2',
    senderId: 'pat2',
    senderRole: 'patient',
    text: "Thank you for the reminder!",
    timestamp: new Date(Date.now() - 86400000).toISOString(), 
  },
   {
    id: generateId('msg_'),
    conversationId: 'convo3',
    senderId: 'pat3',
    senderRole: 'patient',
    text: "Is parking available at the clinic?",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), 
  }
];


export const db = {
  users,
  appointments,
  treatmentPlans,
  progressNotes,
  invoices,
  clinicWaitTime,
  // staff, // Removed staff from here
  paymentTransactions,
  conversations,
  messages,
};


export async function authorize(req: NextRequest, requiredRole?: UserAuth['role'] | UserAuth['role'][]) {
  const mockSessionToken = req.cookies.get('sessionToken')?.value;
  if (!mockSessionToken) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: No session token' }, { status: 401 }) };
  }
  const [userIdFromToken, userRoleFromToken] = mockSessionToken.split(':');
  const user = db.users.find(u => u.id === userIdFromToken);

  if (!user) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Unauthorized: Invalid session' }, { status: 401 }) };
  }

  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : []);

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user.role)) {
    return { authorized: false, user: null, error: NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
  }
  return { authorized: true, user: user, error: null };
}
