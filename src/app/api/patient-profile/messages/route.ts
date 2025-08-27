// src/app/api/patient-profile/messages/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { dbClient } from '@/lib/db';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { z } from 'zod';

getFirebaseAdminApp();

// Helper to find or create a conversation
async function findOrCreateConversation(patientId: string, patientName?: string, patientAvatarUrl?: string) {
  const { db: mockDb, generateId } = await import('@/lib/mockServerDb');
  let conversation = mockDb.conversations.find(c => c.patientId === patientId);
  if (!conversation) {
    conversation = {
      id: generateId('convo_'),
      patientId,
      patientName: patientName || 'New Patient',
      patientAvatarUrl: patientAvatarUrl || `https://placehold.co/40x40.png?text=${patientName?.charAt(0) || 'P'}`,
      lastMessageText: "Conversation started.",
      lastMessageTimestamp: new Date().toISOString(),
      unreadCountForStaff: 1, // First message from patient
    };
    mockDb.conversations.push(conversation);
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
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userEmail = decodedToken.email;
    if (!userEmail) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    
    const userResult = await dbClient.query('SELECT id, name FROM users WHERE email = $1 AND role = $2', [userEmail, 'patient']);
    if (userResult.rows.length === 0) return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    
    const patientId = userResult.rows[0].id;
    const patientName = userResult.rows[0].name;

    const { db: mockDb } = await import('@/lib/mockServerDb');
    const conversation = await findOrCreateConversation(patientId, patientName);
    const messages = mockDb.messages
      .filter(msg => msg.conversationId === conversation.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({ conversation, messages }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient messages:', error);
    if (error.code?.startsWith('auth/')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
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
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userEmail = decodedToken.email;
    if (!userEmail) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    
    const userResult = await dbClient.query('SELECT id FROM users WHERE email = $1 AND role = $2', [userEmail, 'patient']);
    if (userResult.rows.length === 0) return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    const patientId = userResult.rows[0].id;

    const body = await request.json();
    const validation = messageSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });

    const { conversationId, text } = validation.data;
    const { db: mockDb, generateId } = await import('@/lib/mockServerDb');
    const conversation = mockDb.conversations.find(c => c.id === conversationId && c.patientId === patientId);
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
    mockDb.messages.push(newMessage);
    
    conversation.lastMessageText = text;
    conversation.lastMessageTimestamp = now;
    conversation.unreadCountForStaff = (conversation.unreadCountForStaff || 0) + 1;

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error: any) {
    console.error('Error sending message:', error);
    if (error.code?.startsWith('auth/')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
