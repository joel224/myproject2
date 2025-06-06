
// src/app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, generateId, authorize } from '@/lib/mockServerDb';
import type { Conversation } from '@/lib/types';

// GET /api/conversations - Fetches a list of conversations for staff
export async function GET(request: NextRequest) {
  // TODO: Add authorization - ensure only staff can access
  // const authResult = await authorize(request, ['staff', 'admin', 'doctor']);
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }

  // Enrich conversation data with patient details
  const enrichedConversations = db.conversations.map(convo => {
    const patient = db.users.find(u => u.id === convo.patientId && u.role === 'patient');
    return {
      ...convo,
      patientName: patient?.name || convo.patientName || 'Unknown Patient',
      // Assuming a placeholder or logic to generate avatar URL if not stored directly
      patientAvatarUrl: convo.patientAvatarUrl || `https://placehold.co/40x40.png?text=${patient?.name?.charAt(0) || 'P'}`,
    };
  }).sort((a, b) => {
    // Sort by last message timestamp, newest first
    if (a.lastMessageTimestamp && b.lastMessageTimestamp) {
      return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
    }
    if (a.lastMessageTimestamp) return -1; // a comes first if b has no timestamp
    if (b.lastMessageTimestamp) return 1;  // b comes first if a has no timestamp
    return 0;
  });

  return NextResponse.json(enrichedConversations, { status: 200 });
}

// POST /api/conversations - (Optional) Allows staff to initiate a new conversation
// For now, this is a placeholder. In a real app, you'd ensure a conversation
// isn't duplicated if one already exists for the patient.
export async function POST(request: NextRequest) {
  // const authResult = await authorize(request, ['staff', 'admin', 'doctor']);
  // if (!authResult.authorized || !authResult.user) {
  //   return authResult.error;
  // }
  // const staffUserId = authResult.user.id;

  try {
    const body = await request.json();
    const { patientId, initialMessageText, staffId } = body; // staffId could be passed or taken from auth user

    if (!patientId) {
      return NextResponse.json({ message: "Patient ID is required to start a conversation" }, { status: 400 });
    }

    const patient = db.users.find(u => u.id === patientId && u.role === 'patient');
    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
    
    // Check if a conversation already exists for this patient
    const existingConversation = db.conversations.find(c => c.patientId === patientId);
    if (existingConversation) {
        return NextResponse.json(existingConversation, { status: 200 }); // Return existing conversation
    }


    const newConversationId = generateId('convo_');
    const newConversation: Conversation = {
      id: newConversationId,
      patientId,
      staffId: staffId || 'staff_generic', // Or logged-in staff user ID
      patientName: patient.name,
      patientAvatarUrl: `https://placehold.co/40x40.png?text=${patient.name.charAt(0)}`,
      lastMessageTimestamp: new Date().toISOString(),
      unreadCountForStaff: initialMessageText ? 1 : 0,
    };

    if (initialMessageText) {
      newConversation.lastMessageText = initialMessageText;
      const newMessage = {
        id: generateId('msg_'),
        conversationId: newConversationId,
        senderId: staffId || 'staff_generic', 
        senderRole: 'staff' as 'staff',
        text: initialMessageText,
        timestamp: newConversation.lastMessageTimestamp!,
      };
      db.messages.push(newMessage);
    }

    db.conversations.push(newConversation);
    return NextResponse.json(newConversation, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ message: 'Error creating conversation' }, { status: 500 });
  }
}
