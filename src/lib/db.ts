

import { open, Database } from 'sqlite'; // <--- Import Database type from here
import sqlite3 from 'sqlite3';
import path from 'path';
import {
  mockAppointments,
  mockPatients,
  mockStaff,
} from './mockData';
import type { UserAuth } from './mockServerDb';
import type { Patient } from './types';

let db: Database | null = null;

// The file path for the wait time JSON file
const waitTimeFilePath = path.join(process.cwd(), 'wait-time.json');

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
  const patientTableExists = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='patients'`);

  if (!userTableExists || !patientTableExists) {
    console.log("Database schema not found or incomplete. Re-creating and seeding...");
    
    await db.exec(`DROP TABLE IF EXISTS appointments;`);
    await db.exec(`DROP TABLE IF EXISTS patients;`);
    await db.exec(`DROP TABLE IF EXISTS users;`);
    await db.exec(`DROP TABLE IF EXISTS conversations;`);
    await db.exec(`DROP TABLE IF EXISTS messages;`);


    console.log("Creating new database schema...");
    await db.exec(`
      CREATE TABLE users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          passwordHash TEXT,
          role TEXT NOT NULL CHECK(role IN ('patient', 'doctor', 'staff', 'hygienist', 'admin', 'assistant', 'user')),
          phone TEXT,
          createdAt TEXT,
          updatedAt TEXT
      );

      CREATE TABLE patients (
          id TEXT PRIMARY KEY,
          userId TEXT UNIQUE, 
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
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
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
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
          FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
          FOREIGN KEY (doctorId) REFERENCES users(id)
      );

      CREATE TABLE conversations (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        staffId TEXT,
        patientName TEXT,
        patientAvatarUrl TEXT,
        lastMessageText TEXT,
        lastMessageTimestamp TEXT,
        unreadCountForStaff INTEGER DEFAULT 0,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
      );

      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        senderRole TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      );
    `);
    console.log("Schema created. Seeding database...");
    await seedDb(db);
    console.log("Database seeded.");
  }
}

async function seedDb(db) {
    const userInsert = await db.prepare('INSERT INTO users (id, name, email, role, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const staff of mockStaff) {
        let userAuthRole: UserAuth['role'] = 'staff';
        if (staff.role === 'Dentist') userAuthRole = 'doctor';
        else if (staff.role === 'Hygienist') userAuthRole = 'hygienist';
        await userInsert.run(staff.id, staff.name, staff.email, userAuthRole, `$2a$10$mockPasswordFor${staff.id}`, new Date().toISOString(), new Date().toISOString());
    }
    
    const patientInsert = await db.prepare('INSERT INTO patients (id, userId, name, email, phone, dateOfBirth, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const patient of mockPatients) {
        const userForPatientId = `user_${patient.id}`;
        await userInsert.run(userForPatientId, patient.name, patient.email, 'patient', null, new Date().toISOString(), new Date().toISOString());
        await patientInsert.run(patient.id, userForPatientId, patient.name, patient.email, patient.phone, patient.dateOfBirth, new Date().toISOString(), new Date().toISOString());
    }
    await userInsert.finalize();
    await patientInsert.finalize();

    const apptInsert = await db.prepare('INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const appt of mockAppointments) {
        await apptInsert.run(appt.id, appt.patientId, appt.patientName, appt.doctorId, appt.doctorName, appt.date, appt.time, appt.type, appt.status);
    }
    await apptInsert.finalize();
}

export const dbClient = {
  getDb,
};
