
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import {
  mockAppointments,
  mockPatients,
  mockStaff,
  mockTreatmentPlans,
  mockProgressNotes,
  mockInvoices,
} from './mockData';
import type { UserAuth } from './mockServerDb';

let db = null;

export async function getDb() {
    if (!db) {
        const dbPath = path.join(process.cwd(), 'dev.db');
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        await setupDb(db);
    }
    return db;
}

async function setupDb(db) {
  const userTableExists = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`);

  if (!userTableExists) {
    console.log("Creating database schema...");
    await db.exec(`
      CREATE TABLE users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          passwordHash TEXT,
          role TEXT NOT NULL CHECK(role IN ('patient', 'doctor', 'staff', 'hygienist', 'admin', 'assistant')),
          dateOfBirth TEXT,
          phone TEXT,
          age INTEGER,
          medicalRecords TEXT,
          xrayImageUrls TEXT,
          hasDiabetes BOOLEAN,
          hasHighBloodPressure BOOLEAN,
          hasStrokeOrHeartAttackHistory BOOLEAN,
          hasBleedingDisorders BOOLEAN,
          hasAllergy BOOLEAN,
          allergySpecifics TEXT,
          hasAsthma BOOLEAN,
          createdAt TEXT,
          updatedAt TEXT,
          resetToken TEXT,
          resetTokenExpiry TEXT
      );

      CREATE TABLE appointments (
          id TEXT PRIMARY KEY,
          patientId TEXT NOT NULL,
          patientName TEXT,
          doctorId TEXT NOT NULL,
          doctorName TEXT,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT NOT NULL,
          notes TEXT,
          FOREIGN KEY (patientId) REFERENCES users(id),
          FOREIGN KEY (doctorId) REFERENCES users(id)
      );
      
      -- Add more table creation statements here as needed
    `);
    console.log("Schema created. Seeding database...");
    await seedDb(db);
    console.log("Database seeded.");
  }
}

async function seedDb(db) {
    const userInsert = await db.prepare('INSERT INTO users (id, name, email, role, passwordHash, phone, dateOfBirth, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const staff of mockStaff) {
        let userAuthRole: UserAuth['role'] = 'staff';
        if (staff.role === 'Dentist') userAuthRole = 'doctor';
        else if (staff.role === 'Hygienist') userAuthRole = 'hygienist';
        await userInsert.run(staff.id, staff.name, staff.email, userAuthRole, `$2a$10$mockPasswordFor${staff.id}`, null, null, new Date().toISOString(), new Date().toISOString());
    }
    for (const patient of mockPatients) {
        await userInsert.run(patient.id, patient.name, patient.email, 'patient', null, patient.phone, patient.dateOfBirth, new Date().toISOString(), new Date().toISOString());
    }
    await userInsert.finalize();

    const apptInsert = await db.prepare('INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const appt of mockAppointments) {
        await apptInsert.run(appt.id, appt.patientId, appt.patientName, appt.doctorId, appt.doctorName, appt.date, appt.time, appt.type, appt.status);
    }
    await apptInsert.finalize();
}

export const dbClient = {
  getDb,
  generateId: (prefix = 'id_') => {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }
}
