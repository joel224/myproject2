import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockPatients } from "@/lib/mockData";
import { Paperclip, Send, Search } from "lucide-react";

const mockConversations = [
  { id: 'convo1', patientId: 'pat1', patientName: 'Alice Wonderland', lastMessage: "Hi, can I reschedule my appointment?", timestamp: "10:30 AM", unread: true },
  { id: 'convo2', patientId: 'pat2', patientName: 'Bob The Builder', lastMessage: "Thank you for the reminder!", timestamp: "Yesterday", unread: false },
  { id: 'convo3', patientId: 'pat3', patientName: 'Charlie Brown', lastMessage: "Is parking available at the clinic?", timestamp: "2 days ago", unread: true },
];

export default function StaffCommunicationPage() {
  const selectedConversation = mockConversations[0]; // Mock selecting the first conversation

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]"> {/* Adjust height as needed */}
      {/* Conversation List */}
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-0">
          <ul className="divide-y">
            {mockConversations.map(convo => (
              <li key={convo.id} className={`p-4 hover:bg-muted/50 cursor-pointer ${selectedConversation.id === convo.id ? 'bg-muted/50' : ''}`}>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${convo.patientName.charAt(0)}`} alt={convo.patientName} data-ai-hint="avatar person"/>
                    <AvatarFallback>{convo.patientName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{convo.patientName}</p>
                    <p className={`text-sm text-muted-foreground truncate ${convo.unread ? 'font-semibold text-foreground' : ''}`}>{convo.lastMessage}</p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <p>{convo.timestamp}</p>
                    {convo.unread && <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary"></span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Message View */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${selectedConversation.patientName.charAt(0)}`} alt={selectedConversation.patientName} data-ai-hint="avatar person" />
                  <AvatarFallback>{selectedConversation.patientName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedConversation.patientName}</CardTitle>
                  <CardDescription>Online</CardDescription> {/* Placeholder status */}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-6 space-y-4">
              {/* Mock messages */}
              <div className="flex items-end space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://placehold.co/32x32.png?text=${selectedConversation.patientName.charAt(0)}`} alt={selectedConversation.patientName} data-ai-hint="avatar person"/>
                  <AvatarFallback>{selectedConversation.patientName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted max-w-xs">
                  <p className="text-sm">{selectedConversation.lastMessage}</p>
                  <p className="text-xs text-muted-foreground mt-1 text-right">{selectedConversation.timestamp}</p>
                </div>
              </div>
              <div className="flex items-end space-x-2 justify-end">
                <div className="p-3 rounded-lg bg-primary text-primary-foreground max-w-xs">
                  <p className="text-sm">Sure, Alice. When would you like to reschedule to?</p>
                  <p className="text-xs text-primary-foreground/80 mt-1 text-right">10:32 AM</p>
                </div>
                 <Avatar className="h-8 w-8"> {/* Staff Avatar */}
                  <AvatarImage src={`https://placehold.co/32x32.png?text=S`} alt="Staff" data-ai-hint="avatar person"/>
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
            <div className="border-t p-4">
              <div className="relative">
                <Textarea placeholder="Type your message..." className="pr-20 resize-none" rows={2}/>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <Button variant="ghost" size="icon" aria-label="Attach file"><Paperclip className="h-5 w-5"/></Button>
                    <Button size="icon" aria-label="Send message"><Send className="h-5 w-5"/></Button>
                </div>
              </div>
            </div>
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
