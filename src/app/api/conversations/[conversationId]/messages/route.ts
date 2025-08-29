
// src/app/api/conversations/[conversationId]/messages/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateId } from '@/lib/mockServerDb';
import { db, authorize } from '@/lib/mockServerDb';
import type { Message } from '@/lib/types';

interface ConversationMessagesParams {
  params: {
    conversationId: string;
  }
}

// GET /api/conversations/[conversationId]/messages - Fetches messages for a conversation
export async function GET(request: NextRequest, { params }: ConversationMessagesParams) {
  // const authResult = await authorize(request, ['staff', 'admin', 'doctor']); // Or patient if they can access
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }
  
  const { conversationId } = params;
  const conversation = db.conversations.find(c => c.id === conversationId);

  if (!conversation) {
    return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
  }

  // TODO: Add authorization to ensure the user (staff or patient) can access this conversation.
  // For example, if it's a patient, ensure authResult.user.id === conversation.patientId

  const messages = db.messages
    .filter(msg => msg.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Oldest first

  return NextResponse.json(messages, { status: 200 });
}

// POST /api/conversations/[conversationId]/messages - Sends a new message
const messageSchema = z.object({
  text: z.string().min(1, "Message text cannot be empty"),
  senderId: z.string().min(1), // ID of the actual sender (patient or staff)
  senderRole: z.enum(['patient', 'staff']),
});

export async function POST(request: NextRequest, { params }: ConversationMessagesParams) {
  // const authResult = await authorize(request, ['staff', 'admin', 'doctor', 'patient']);
  // if (!authResult.authorized || !authResult.user) { return authResult.error; }

  const { conversationId } = params;
  const conversation = db.conversations.find(c => c.id === conversationId);

  if (!conversation) {
    return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
  }

  // TODO: Authorization: Ensure authResult.user.id is either conversation.patientId or an authorized staff member.
  // And ensure senderId from body matches authResult.user.id if senderRole implies it.

  try {
    const body = await request.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { text, senderId, senderRole } = validation.data;
    const now = new Date().toISOString();

    const newMessage: Message = {
      id: generateId('msg_'),
      conversationId,
      senderId, // This should be the ID of the actual user sending
      senderRole,
      text,
      timestamp: now,
    };
    db.messages.push(newMessage);

    // Update conversation's last message details
    conversation.lastMessageText = text;
    conversation.lastMessageTimestamp = now;
    if (senderRole === 'patient') { // If patient sends, increment unread for staff
      conversation.unreadCountForStaff = (conversation.unreadCountForStaff || 0) + 1;
    } else if (senderRole === 'staff') {
      // If staff sends, potentially clear unread for staff (or handle unread for patient if tracking that)
      // For this simplified version, we assume staff reading the convo clears their unread count.
      // Sending a message implies they've seen prior messages from patient.
      conversation.unreadCountForStaff = 0;
    }
    
    // Update the conversation in the db array
    const convoIndex = db.conversations.findIndex(c => c.id === conversationId);
    if (convoIndex > -1) {
        db.conversations[convoIndex] = conversation;
    }


    return NextResponse.json(newMessage, { status: 201 });

  } catch (error) {
    console.error(`Error sending message to conversation ${conversationId}:`, error);
    return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
  }
}
