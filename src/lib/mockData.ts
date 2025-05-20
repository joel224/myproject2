import type { Patient, Appointment, TreatmentPlan, ProgressNote, StaffMember, Invoice } from './types';

export const mockPatients: Patient[] = [
  { id: 'pat1', name: 'Alice Wonderland', email: 'alice@example.com', dateOfBirth: '1990-05-15', phone: '555-0101' },
  { id: 'pat2', name: 'Bob The Builder', email: 'bob@example.com', dateOfBirth: '1985-11-20', phone: '555-0102' },
  { id: 'pat3', name: 'Charlie Brown', email: 'charlie@example.com', dateOfBirth: '2000-01-30', phone: '555-0103' },
];

export const mockStaff: StaffMember[] = [
  { id: 'doc1', name: 'Dr. Loji', role: 'Dentist', email: 'drloji@example.com' },
  { id: 'staff1', name: 'Sarah Miller', role: 'Receptionist', email: 'sarah@example.com' },
  { id: 'hyg1', name: 'Mike Ross', role: 'Hygienist', email: 'mike@example.com' },
];

export const mockAppointments: Appointment[] = [
  { id: 'apt1', patientId: 'pat1', patientName: 'Alice Wonderland', doctorId: 'doc1', doctorName: 'Dr. Loji', date: new Date().toISOString().split('T')[0], time: '10:00 AM', type: 'Check-up', status: 'Scheduled' },
  { id: 'apt2', patientId: 'pat2', patientName: 'Bob The Builder', doctorId: 'doc1', doctorName: 'Dr. Loji', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '02:30 PM', type: 'Cleaning', status: 'Confirmed' },
  { id: 'apt3', patientId: 'pat1', patientName: 'Alice Wonderland', doctorId: 'doc1', doctorName: 'Dr. Loji', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], time: '09:00 AM', type: 'Filling', status: 'Completed' },
];

export const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: 'tp1',
    patientId: 'pat1',
    doctorId: 'doc1',
    title: 'Comprehensive Oral Care Plan',
    procedures: [
      { id: 'proc1', name: 'Full Mouth X-Ray', cost: 150 },
      { id: 'proc2', name: 'Deep Cleaning (Scaling & Root Planing)', cost: 400 },
      { id: 'proc3', name: 'Fluoride Treatment', cost: 50 },
    ],
    startDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    status: 'Active',
    totalCost: 600,
  },
  {
    id: 'tp2',
    patientId: 'pat2',
    doctorId: 'doc1',
    title: 'Implant Placement - Phase 1',
    procedures: [{ id: 'proc4', name: 'Dental Implant Surgery (Single Tooth)', cost: 2000 }],
    startDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    totalCost: 2000,
  },
];

export const mockProgressNotes: ProgressNote[] = [
  {
    id: 'pn1',
    patientId: 'pat1',
    treatmentPlanId: 'tp1',
    doctorId: 'doc1',
    date: new Date(Date.now() - 86400000 * 9).toISOString().split('T')[0],
    time: '10:30 AM',
    note: 'Initial consultation. Discussed treatment plan. Patient agreeable. Full mouth X-rays taken.',
    images: [{ id: 'img1', url: 'https://placehold.co/300x200.png', caption: 'X-Ray Left Side' }],
    progressStage: 'Initial Assessment',
  },
  {
    id: 'pn2',
    patientId: 'pat1',
    treatmentPlanId: 'tp1',
    doctorId: 'doc1',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    time: '11:00 AM',
    note: 'Deep cleaning performed on upper quadrant. Patient tolerated well. Advised on post-op care.',
    progressStage: 'Procedure Day 1',
  },
];

export const mockInvoices: Invoice[] = [
    { 
        id: 'inv1', 
        patientId: 'pat1', 
        date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], 
        dueDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
        items: [
            { description: 'Full Mouth X-Ray', quantity: 1, unitPrice: 150, totalPrice: 150 },
            { description: 'Deep Cleaning (Scaling & Root Planing)', quantity: 1, unitPrice: 400, totalPrice: 400 },
        ], 
        totalAmount: 550, 
        amountPaid: 200, 
        status: 'Partial' 
    },
    { 
        id: 'inv2', 
        patientId: 'pat2', 
        date: new Date().toISOString().split('T')[0], 
        dueDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        items: [
            { description: 'Dental Implant Surgery (Single Tooth) - Deposit', quantity: 1, unitPrice: 1000, totalPrice: 1000 },
        ], 
        totalAmount: 1000, 
        amountPaid: 0, 
        status: 'Pending' 
    },
];
