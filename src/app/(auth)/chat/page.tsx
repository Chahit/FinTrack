'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { PageContainer } from '@/components/ui/page-container';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { ChatService, ChatMessage } from '@/lib/services/chat.service';
import { formatDistanceToNow } from 'date-fns';

export default function ChatPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchNewMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await ChatService.getMessages();
      setMessages(fetchedMessages.reverse());
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    }
  };

  const fetchNewMessages = async () => {
    if (messages.length === 0) return;
    try {
      const lastMessageId = messages[messages.length - 1].id;
      const newMessages = await ChatService.getMessages(lastMessageId);
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages.reverse()]);
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const message = await ChatService.sendMessage(newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Market Chat</h1>
          <p className="text-muted-foreground">
            Discuss market trends and share insights with other traders
          </p>
        </div>

        <Card className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div ref={scrollRef} className="p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.userId === user?.id ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.userId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">{msg.username}</span>
                        <span className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t flex items-center space-x-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !newMessage.trim()}>
              Send
            </Button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
} 