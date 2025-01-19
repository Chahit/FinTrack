'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { PageContainer } from '@/components/ui/page-container';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { ChatService, ChatMessage, ChatGroup } from '@/lib/services/chat.service';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Plus, Send, Copy, Check, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchGroups();
      fetchMessages();
      const interval = setInterval(fetchNewMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup, session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchGroups = async () => {
    try {
      const chatService = new ChatService();
      const userGroups = await chatService.getUserGroups(session?.user?.id as string);
      setGroups(userGroups);
      if (userGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(userGroups[0]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async () => {
    if (!selectedGroup) return;
    
    try {
      const chatService = new ChatService();
      const groupMessages = await chatService.getGroupMessages(selectedGroup.id);
      setMessages(groupMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    }
  };

  const fetchNewMessages = async () => {
    if (!selectedGroup || messages.length === 0) return;
    
    try {
      const chatService = new ChatService();
      const lastMessageId = messages[messages.length - 1].id;
      const newMessages = await chatService.getNewMessages(selectedGroup.id, lastMessageId);
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || !session?.user) return;

    setLoading(true);
    try {
      const chatService = new ChatService();
      const message = await chatService.sendMessage({
        content: newMessage,
        groupId: selectedGroup.id,
        userId: session.user.id,
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !session?.user) return;

    try {
      const chatService = new ChatService();
      const group = await chatService.createGroup({
        name: newGroupName,
        createdBy: session.user.id,
      });
      setGroups(prev => [...prev, group]);
      setSelectedGroup(group);
      setNewGroupName('');
      setShowCreateGroup(false);
      toast({
        title: "Success",
        description: "Group created successfully",
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim() || !session?.user) return;

    try {
      const chatService = new ChatService();
      const group = await chatService.joinGroup(inviteCode, session.user.id);
      setGroups(prev => [...prev, group]);
      setSelectedGroup(group);
      setInviteCode('');
      setShowJoinGroup(false);
      toast({
        title: "Success",
        description: "Joined group successfully",
      });
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
    }
  };

  const handleCopyInviteCode = async () => {
    if (!selectedGroup) return;
    
    try {
      await navigator.clipboard.writeText(selectedGroup.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: "Success",
        description: "Invite code copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying invite code:', error);
      toast({
        title: "Error",
        description: "Failed to copy invite code",
        variant: "destructive",
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup || !session?.user) return;

    try {
      const chatService = new ChatService();
      await chatService.leaveGroup(selectedGroup.id, session.user.id);
      setGroups(prev => prev.filter(g => g.id !== selectedGroup.id));
      setSelectedGroup(null);
      toast({
        title: "Success",
        description: "Left group successfully",
      });
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return (
      <PageContainer>
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access chat</h2>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card className="p-6">
        <div className="flex h-[600px]">
          {/* Groups Sidebar */}
          <div className="w-64 border-r pr-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Groups</h2>
              <div className="flex gap-2">
                <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="groupName">Group Name</Label>
                        <Input
                          id="groupName"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="Enter group name"
                        />
                      </div>
                      <Button onClick={handleCreateGroup} className="w-full">
                        Create Group
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showJoinGroup} onOpenChange={setShowJoinGroup}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Users className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="inviteCode">Invite Code</Label>
                        <Input
                          id="inviteCode"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          placeholder="Enter invite code"
                        />
                      </div>
                      <Button onClick={handleJoinGroup} className="w-full">
                        Join Group
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-2">
                {groups.map((group) => (
                  <Button
                    key={group.id}
                    variant={selectedGroup?.id === group.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedGroup(group)}
                  >
                    {group.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 pl-4">
            {selectedGroup ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleCopyInviteCode}>
                        <div className="flex items-center">
                          {copiedCode ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                          Copy Invite Code
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLeaveGroup} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Leave Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <ScrollArea className="h-[calc(100%-8rem)]" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.userId === session.user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.userId === session.user.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm font-semibold mb-1">
                            {message.userId === session.user.id ? 'You' : message.user.name}
                          </p>
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="mt-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Select a group to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}