'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
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
  const { user } = useUser();
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
    fetchGroups();
    fetchMessages();
    const interval = setInterval(fetchNewMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedGroup]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchGroups = async () => {
    try {
      const fetchedGroups = await ChatService.getGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch groups',
        variant: 'destructive',
      });
    }
  };

  const fetchMessages = async () => {
    if (!selectedGroup) return;
    
    try {
      const fetchedMessages = await ChatService.getMessages(selectedGroup.id);
      setMessages(fetchedMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    }
  };

  const fetchNewMessages = async () => {
    if (!selectedGroup) return;
    
    try {
      const lastMessageId = messages[messages.length - 1]?.id;
      const newMessages = await ChatService.getMessages(selectedGroup.id, lastMessageId);
      if (newMessages.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(msg => msg.id));
          const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
          return [...prev, ...uniqueNewMessages].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading || !user || !selectedGroup) return;

    try {
      setLoading(true);
      const message = await ChatService.sendMessage(newMessage, selectedGroup.id);
      setNewMessage('');
      setMessages(prev => [...prev, message].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
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

  const handleCreateGroup = async () => {
    try {
      if (!newGroupName.trim()) {
        toast({
          title: 'Error',
          description: 'Group name is required',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      const group = await ChatService.createGroup(newGroupName);
      setGroups(prev => [...prev, group]);
      setSelectedGroup(group);
      setShowCreateGroup(false);
      setNewGroupName('');
      
      toast({
        title: 'Group Created',
        description: (
          <div className="space-y-2">
            <p>Group created successfully!</p>
            <div className="p-2 bg-muted rounded-md flex items-center justify-between">
              <p className="font-mono text-sm">Invite Code: {group.inviteCode}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyInviteCode(group.inviteCode)}
                className="h-8 px-2"
              >
                {copiedCode ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this code with others to invite them to the group
            </p>
          </div>
        ),
        duration: 10000,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create group',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      if (!inviteCode.trim()) return;
      const group = await ChatService.joinGroup(inviteCode);
      setGroups(prev => [...prev, group]);
      setSelectedGroup(group);
      setShowJoinGroup(false);
      setInviteCode('');
      toast({
        title: 'Success',
        description: 'Successfully joined group!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join group',
        variant: 'destructive',
      });
    }
  };

  const handleCopyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: 'Success',
        description: 'Invite code copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy invite code',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await ChatService.deleteGroup(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
        setMessages([]);
      }
      toast({
        title: 'Success',
        description: 'Group deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageContainer>
      <div className="flex h-[calc(100vh-4rem)] gap-4">
        {/* Groups Sidebar */}
        <Card className="w-64 p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Groups</h2>
            <div className="flex gap-2">
              <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Group Name</Label>
                      <Input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name"
                      />
                    </div>
                    <Button onClick={handleCreateGroup}>Create Group</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showJoinGroup} onOpenChange={setShowJoinGroup}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Users className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Invite Code</Label>
                      <Input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Enter invite code"
                      />
                    </div>
                    <Button onClick={handleJoinGroup}>Join Group</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center gap-2">
                  <Button
                    variant={selectedGroup?.id === group.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedGroup(group)}
                  >
                    {group.name}
                  </Button>
                  {group.createdBy === user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              {selectedGroup ? selectedGroup.name : 'Select a group to start chatting'}
            </h2>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.username === (user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress)
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.username === (user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">{msg.username}</div>
                    <div>{msg.content}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedGroup ? "Type your message..." : "Select a group first"}
                disabled={!selectedGroup || loading}
              />
              <Button type="submit" disabled={!selectedGroup || loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
} 