
// src/app/api/patient-profile/messages/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { authorize } from '@/lib/mockServerDb';
import { z } from 'zod';
import { generateId } from '@/lib/mockServerDb';

// Helper to find or create a conversation
async function findOrCreateConversation(patientId: string, patientName?: string, userId?: string) {
  const db = await getDb();
  // Find conversation by patientId OR userId (if they don't have a clinical record yet)
  let conversation = await db.get('SELECT * FROM conversations WHERE patientId = ?', patientId);
  if (!conversation && userId) {
      conversation = await db.get('SELECT * FROM conversations WHERE patientId = ?', userId);
  }

  if (!conversation) {
    const newConversation = {
      id: generateId('convo_'),
      patientId: patientId, // Always use the clinical patientId
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
  const authResult = await authorize(request, 'patient');
  if (!authResult.authorized || !authResult.user) {
    return authResult.error || NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = authResult.user.id;
  const userName = authResult.user.name;

  try {
    const db = await getDb();
    
    const patientResult = await db.get('SELECT id, name FROM patients WHERE userId = ?', userId);
    if (!patientResult) {
        // No clinical record yet, but they have a login. Create a shell conversation linked to their user ID.
        const conversation = await findOrCreateConversation(userId, userName, userId);
        return NextResponse.json({ conversation, messages: [] }, { status: 200 });
    }
    
    const patientId = patientResult.id;
    const patientName = patientResult.name;

    const conversation = await findOrCreateConversation(patientId, patientName, userId);
    const messages = await db.all('SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC', conversation.id);

    return NextResponse.json({ conversation, messages }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching patient messages:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

const messageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().min(1, "Message text cannot be empty"),
});

export async function POST(request: NextRequest) {
  const authResult = await authorize(request, 'patient');
  if (!authResult.authorized || !authResult.user) {
    return authResult.error || NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = authResult.user.id;

  try {
    const db = await getDb();
    
    const patientResult = await db.get('SELECT id FROM patients WHERE userId = ?', userId);
    const patientId = patientResult?.id || userId; // Use clinical ID if exists, otherwise fall back to user ID

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
      senderId: patientId, // Always use the patient's clinical/user ID as sender
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
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
