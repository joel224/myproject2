
// src/app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateId } from '@/lib/mockServerDb';
import { getDb } from '@/lib/db';
import type { Conversation, Message } from '@/lib/types';

// GET /api/conversations - Fetches a list of conversations for staff
export async function GET(request: NextRequest) {
  const db = await getDb();
  
  // This endpoint might be called before the conversations table is created.
  // Check for the table's existence to avoid a server crash.
  const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'");
  if (!tableExists) {
    return NextResponse.json([], { status: 200 }); // Return empty array if table doesn't exist
  }

  const conversations = await db.all('SELECT * FROM conversations ORDER BY lastMessageTimestamp DESC');

  return NextResponse.json(conversations, { status: 200 });
}

// POST /api/conversations - (Optional) Allows staff to initiate a new conversation
export async function POST(request: NextRequest) {
  const db = await getDb();

  try {
    const body = await request.json();
    const { patientId, initialMessageText, staffId } = body;

    if (!patientId) {
      return NextResponse.json({ message: "Patient ID is required to start a conversation" }, { status: 400 });
    }

    const patient = await db.get('SELECT id, name FROM patients WHERE id = ?', patientId);
    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
    
    let conversation = await db.get('SELECT * FROM conversations WHERE patientId = ?', patientId);
    if (conversation) {
        return NextResponse.json(conversation, { status: 200 });
    }

    // Ensure conversations table exists before trying to insert
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'");
    if (!tableExists) {
      await db.exec(`
        CREATE TABLE conversations (
          id TEXT PRIMARY KEY,
          patientId TEXT NOT NULL,
          staffId TEXT,
          patientName TEXT,
          patientAvatarUrl TEXT,
          lastMessageText TEXT,
          lastMessageTimestamp TEXT,
          unreadCountForStaff INTEGER,
          FOREIGN KEY (patientId) REFERENCES patients(id)
        );
      `);
      // Also create messages table if it doesn't exist, as it's related
       await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversationId TEXT NOT NULL,
          senderId TEXT NOT NULL,
          senderRole TEXT NOT NULL,
          text TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          FOREIGN KEY (conversationId) REFERENCES conversations(id)
        );
      `);
    }

    const newConversationId = generateId('convo_');
    const now = new Date().toISOString();

    const newConversation: Conversation = {
      id: newConversationId,
      patientId,
      staffId: staffId || 'staff_generic',
      patientName: patient.name,
      patientAvatarUrl: `https://placehold.co/40x40.png?text=${patient.name.charAt(0)}`,
      lastMessageTimestamp: now,
      unreadCountForStaff: initialMessageText ? 1 : 0,
      lastMessageText: initialMessageText || "Conversation started.",
    };

    if (initialMessageText) {
      const newMessage: Message = {
        id: generateId('msg_'),
        conversationId: newConversationId,
        senderId: staffId || 'staff_generic',
        senderRole: 'staff',
        text: initialMessageText,
        timestamp: now,
      };
      await db.run(
        'INSERT INTO messages (id, conversationId, senderId, senderRole, text, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        newMessage.id, newMessage.conversationId, newMessage.senderId, newMessage.senderRole, newMessage.text, newMessage.timestamp
      );
    }
    
    await db.run(
      'INSERT INTO conversations (id, patientId, staffId, patientName, patientAvatarUrl, lastMessageText, lastMessageTimestamp, unreadCountForStaff) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      newConversation.id, newConversation.patientId, newConversation.staffId, newConversation.patientName, newConversation.patientAvatarUrl, newConversation.lastMessageText, newConversation.lastMessageTimestamp, newConversation.unreadCountForStaff
    );

    return NextResponse.json(newConversation, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ message: 'Error creating conversation' }, { status: 500 });
  }
}
