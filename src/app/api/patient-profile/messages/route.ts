
// src/app/api/patient-profile/messages/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
// import { getFirebaseAdminApp } from '@/lib/firebase-admin';
// import * as admin from 'firebase-admin';
import { z } from 'zod';
import { generateId } from '@/lib/mockServerDb';

// getFirebaseAdminApp(); // Commented out

// Helper to find or create a conversation
async function findOrCreateConversation(patientId: string, patientName?: string) {
  const db = await getDb();
  let conversation = await db.get('SELECT * FROM conversations WHERE patientId = ?', patientId);
  if (!conversation) {
    const newConversation = {
      id: generateId('convo_'),
      patientId,
      patientName: patientName || 'New Patient',
      lastMessageText: "Conversation started.",
      lastMessageTimestamp: new Date().toISOString(),
      unreadCountForStaff: 1, // First message from patient
    };
    await db.run(
        'INSERT INTO conversations (id, patientId, patientName, lastMessageText, lastMessageTimestamp, unreadCountForStaff) VALUES (?, ?, ?, ?, ?, ?)',
        newConversation.id, newConversation.patientId, newConversation.patientName, newConversation.lastMessageText, newConversation.lastMessageTimestamp, newConversation.unreadCountForStaff
    );
    conversation = newConversation;
  }
  return conversation;
}


export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const db = await getDb();
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // const userEmail = decodedToken.email;
    const userEmail = idToken; // MOCK

    if (!userEmail) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    
    const userResult = await db.get('SELECT id, name FROM users WHERE email = ? AND role = ?', [userEmail, 'patient']);
    if (!userResult) return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    
    const patientId = userResult.id;
    const patientName = userResult.name;

    const conversation = await findOrCreateConversation(patientId, patientName);
    const messages = await db.all('SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC', conversation.id);

    return NextResponse.json({ conversation, messages }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient messages:', error);
    // if (error.code?.startsWith('auth/')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

const messageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().min(1, "Message text cannot be empty"),
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const db = await getDb();
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // const userEmail = decodedToken.email;
    const userEmail = idToken; // MOCK

    if (!userEmail) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    
    const userResult = await db.get('SELECT id FROM users WHERE email = ? AND role = ?', [userEmail, 'patient']);
    if (!userResult) return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    const patientId = userResult.id;

    const body = await request.json();
    const validation = messageSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });

    const { conversationId, text } = validation.data;
    const conversation = await db.get('SELECT * FROM conversations WHERE id = ? AND patientId = ?', [conversationId, patientId]);
    if (!conversation) return NextResponse.json({ message: "Conversation not found or access denied" }, { status: 404 });
    
    const now = new Date().toISOString();
    const newMessage = {
      id: generateId('msg_'),
      conversationId,
      senderId: patientId,
      senderRole: 'patient' as 'patient',
      text,
      timestamp: now,
    };
    
    await db.run(
        'INSERT INTO messages (id, conversationId, senderId, senderRole, text, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        newMessage.id, newMessage.conversationId, newMessage.senderId, newMessage.senderRole, newMessage.text, newMessage.timestamp
    );

    await db.run(
        'UPDATE conversations SET lastMessageText = ?, lastMessageTimestamp = ?, unreadCountForStaff = unreadCountForStaff + 1 WHERE id = ?',
        text, now, conversationId
    );

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error: any) {
    console.error('Error sending message:', error);
    // if (error.code?.startsWith('auth/')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
