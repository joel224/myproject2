
// src/app/staff/communication/page.tsx
'use client';

import { useEffect, useState, type FormEvent, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, Search, Loader2, AlertTriangle, MessageSquare } from "lucide-react";
import type { Conversation, Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';

// Mock current staff user ID - replace with actual auth context in a real app
const MOCK_STAFF_ID = "staff1"; 
const MOCK_STAFF_AVATAR_INITIAL = "S"; // For "Sarah ClinicStaff"

export default function StaffCommunicationPage() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setConversationsError(null);
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch conversations');
      }
      const data: Conversation[] = await response.json();
      setConversations(data);
    } catch (error: any) {
      setConversationsError(error.message);
      toast({ variant: "destructive", title: "Error loading conversations", description: error.message });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    setMessagesError(null);
    setMessages([]); // Clear previous messages

    // Optimistically mark as read on frontend for staff
    if (conversation.unreadCountForStaff && conversation.unreadCountForStaff > 0) {
        setConversations(prev => prev.map(c => c.id === conversation.id ? {...c, unreadCountForStaff: 0} : c));
        // TODO: In a real app, you might call a `PUT /api/conversations/[id]/mark-read` endpoint here
    }

    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
      }
      const data: Message[] = await response.json();
      setMessages(data);
    } catch (error: any) {
      setMessagesError(error.message);
      toast({ variant: "destructive", title: `Error loading messages for ${conversation.patientName}`, description: error.message });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedConversation || !newMessageText.trim()) return;

    setIsSendingMessage(true);
    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newMessageText.trim(),
          senderId: MOCK_STAFF_ID, // Use mock staff ID
          senderRole: 'staff',
        }),
      });
      const newMessage: Message = await response.json();
      if (!response.ok) {
        throw new Error(newMessage.text || 'Failed to send message');
      }
      setMessages(prev => [...prev, newMessage]);
      setNewMessageText('');
      
      // Update conversation in the list with new last message
      setConversations(prevConvos => prevConvos.map(convo => {
        if (convo.id === selectedConversation.id) {
          return {
            ...convo,
            lastMessageText: newMessage.text,
            lastMessageTimestamp: newMessage.timestamp,
            unreadCountForStaff: 0 // Staff sent it, so it's read by staff
          };
        }
        return convo;
      }).sort((a,b) => new Date(b.lastMessageTimestamp || 0).getTime() - new Date(a.lastMessageTimestamp || 0).getTime()) // Re-sort
      );


    } catch (error: any) {
      toast({ variant: "destructive", title: "Error sending message", description: error.message });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter(convo => 
    convo.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convo.lastMessageText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return formatDistanceToNowStrict(new Date(isoString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]"> {/* Adjusted height */}
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-0">
          {isLoadingConversations ? (
            <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
          ) : conversationsError ? (
            <div className="p-4 text-center text-destructive"><AlertTriangle className="h-6 w-6 mx-auto mb-1" />{conversationsError}</div>
          ) : filteredConversations.length > 0 ? (
            <ul className="divide-y">
              {filteredConversations.map(convo => (
                <li 
                  key={convo.id} 
                  className={`p-4 hover:bg-muted/50 cursor-pointer ${selectedConversation?.id === convo.id ? 'bg-muted/50' : ''}`}
                  onClick={() => handleSelectConversation(convo)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={convo.patientAvatarUrl || `https://placehold.co/40x40.png?text=${convo.patientName?.charAt(0)}`} alt={convo.patientName} data-ai-hint="avatar person"/>
                      <AvatarFallback>{convo.patientName?.charAt(0) || 'P'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{convo.patientName}</p>
                      <p className={`text-sm text-muted-foreground truncate ${(convo.unreadCountForStaff || 0) > 0 ? 'font-semibold text-foreground' : ''}`}>{convo.lastMessageText}</p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                      <p>{formatTimestamp(convo.lastMessageTimestamp)}</p>
                      {(convo.unreadCountForStaff || 0) > 0 && <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary"></span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-muted-foreground">No conversations found.</p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.patientAvatarUrl || `https://placehold.co/40x40.png?text=${selectedConversation.patientName?.charAt(0)}`} alt={selectedConversation.patientName} data-ai-hint="avatar person"/>
                  <AvatarFallback>{selectedConversation.patientName?.charAt(0) || 'P'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedConversation.patientName}</CardTitle>
                  {/* <CardDescription>Online</CardDescription> Placeholder status */}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : messagesError ? (
                <div className="flex flex-col justify-center items-center h-full text-destructive"><AlertTriangle className="h-8 w-8 mb-2" />{messagesError}</div>
              ) : messages.length > 0 ? (
                messages.map(msg => (
                  <div key={msg.id} className={`flex items-end space-x-2 ${msg.senderRole === 'staff' ? 'justify-end' : ''}`}>
                    {msg.senderRole === 'patient' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConversation.patientAvatarUrl || `https://placehold.co/32x32.png?text=${selectedConversation.patientName?.charAt(0)}`} alt={selectedConversation.patientName} data-ai-hint="avatar person"/>
                        <AvatarFallback>{selectedConversation.patientName?.charAt(0) || 'P'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`p-3 rounded-lg max-w-xs ${msg.senderRole === 'staff' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 text-right ${msg.senderRole === 'staff' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{formatTimestamp(msg.timestamp)}</p>
                    </div>
                    {msg.senderRole === 'staff' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://placehold.co/32x32.png?text=${MOCK_STAFF_AVATAR_INITIAL}`} alt="Staff" data-ai-hint="avatar person"/>
                        <AvatarFallback>{MOCK_STAFF_AVATAR_INITIAL}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No messages in this conversation yet.</p>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <form onSubmit={handleSendMessage} className="border-t p-4">
              <div className="relative">
                <Textarea 
                  placeholder="Type your message..." 
                  className="pr-20 resize-none" 
                  rows={2}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  disabled={isSendingMessage}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <Button variant="ghost" size="icon" aria-label="Attach file" type="button" disabled={isSendingMessage}><Paperclip className="h-5 w-5"/></Button>
                    <Button size="icon" aria-label="Send message" type="submit" disabled={isSendingMessage || !newMessageText.trim()}>
                        {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5"/>}
                    </Button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center h-full">
            <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Select a conversation to view messages.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
