import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Phone, Mail, Globe, MapPin, Star, Shield, Building, Package, Clock, Check, Menu, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import apiClient from '@/lib/apiClient';
import type { ChatRoom, ChatMessage, SupplierContact } from '@/lib/types';

interface ChatRoomProps {
  roomId: string;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, onBack }) => {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSubscription = useRef<any>(null);

  useEffect(() => {
    initializeChat();
    getCurrentUser();
    return () => {
      if (chatSubscription.current) {
        apiClient.unsubscribeFromChannel(chatSubscription.current);
      }
    };
    // eslint-disable-next-line
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    try {
      const user = await apiClient.getProfile();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const initializeChat = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomData, messagesData] = await Promise.all([
        apiClient.getChatRoom(roomId),
        apiClient.getChatMessages(roomId)
      ]);
      setRoom(roomData);
      setMessages(messagesData);
      await apiClient.markMessagesAsRead(roomId);
      chatSubscription.current = apiClient.subscribeToChatRoom(roomId, handleNewMessage);
    } catch (err: any) {
      setError(err.message || 'Failed to load chat room');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setMessages(prev => [...prev, payload.new]);
      if (payload.new.sender_id !== currentUser?.id) {
        apiClient.markMessagesAsRead(roomId);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await apiClient.sendMessage({
        chat_room_id: roomId,
        message_text: newMessage.trim(),
      });
      setNewMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const isCurrentUser = (senderId: string) => {
    return currentUser?.id === senderId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={initializeChat}>Retry</Button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Chat room not found</p>
      </div>
    );
  }

  const supplier = room.supplier;
  const listing = room.listing;

  return (
    <div className="flex h-[100vh] md:h-[600px] bg-white md:rounded-lg md:shadow-lg overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Supplier Details Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative z-50 md:z-auto
        w-80 md:w-80 bg-gray-50 border-r flex flex-col min-h-0
        transition-transform duration-300 ease-in-out
        h-full
      `}>
        <div className="p-4 bg-white border-b flex items-center gap-3 mb-3">
          <Button variant="ghost" size="sm" onClick={onBack} aria-label="Back to chat list">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">Supplier Details</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden ml-auto"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {supplier?.name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{supplier?.name}</CardTitle>
                  <p className="text-sm text-gray-600">{supplier?.company_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {supplier?.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {supplier?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs">{supplier.rating}/5.0</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {supplier?.description && (
                <p className="text-sm text-gray-700">{supplier.description}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="break-all">{supplier?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{supplier?.phone}</span>
                </div>
                {supplier?.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {supplier.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="break-words">{supplier?.company_address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {listing && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Listing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h4 className="font-medium break-words">{listing.title}</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{listing.material_type}</Badge>
                  <Badge variant="outline">{listing.category}</Badge>
                </div>
                <div className="space-y-2">
                  {('price_per_unit' in listing) ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">₹{(listing as any).price_per_unit?.toLocaleString()}/{(listing as any).unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span>{(listing as any).available_quantity} {(listing as any).unit}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium">₹{(listing as any).budget_min?.toLocaleString()} - ₹{(listing as any).budget_max?.toLocaleString()}/{(listing as any).unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Required:</span>
                        <span>{(listing as any).required_quantity} {(listing as any).unit}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="break-words">{listing.location}</span>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  View Full Details
                </Button>
              </CardContent>
            </Card>
          )}
        </ScrollArea>
      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col min-h-0 w-full md:w-auto">
        <div className="p-3 md:p-4 bg-white border-b flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open supplier details"
            >
              <Info className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate text-sm md:text-base">{supplier?.company_name}</h3>
              <p className="text-xs md:text-sm text-gray-600 truncate">{listing?.title}</p>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2">
            <Button variant="outline" size="sm" asChild className="px-2 md:px-3">
              <a href={`mailto:${supplier?.email || ''}`}>
                <Mail className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Email</span>
              </a>
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-3 md:p-4 bg-gray-50">
          <div className="space-y-3 md:space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">No messages yet. Start the conversation!</div>
            )}
            {messages.map((message) => {
              const isUser = isCurrentUser(message.sender_id);
              // Determine the sender's name
              let senderName = 'You';
              if (!isUser) {
                if (supplier && message.sender_id === supplier.id) {
                  senderName = supplier.name || 'Supplier';
                } else if (room.buyer && message.sender_id === room.buyer.id) {
                  senderName = room.buyer.name || 'Buyer';
                } else {
                  senderName = 'User';
                }
              }
              return (
                <div
                  key={message.id}
                  className={`flex flex-col items-${isUser ? 'end' : 'start'}`}
                >
                  {/* Sender label and avatar */}
                  <div className={`flex items-center mb-1 ${isUser ? 'flex-row-reverse gap-2' : 'gap-2'}`}>
                    {!isUser && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className={`text-xs font-semibold ${isUser ? 'text-blue-600' : 'text-gray-600'}`}>
                      {senderName}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                    tabIndex={0}
                    aria-label={`Message from ${senderName}`}
                  >
                    <p className="text-sm break-words whitespace-pre-line">{message.message_text}</p>
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatMessageTime(message.created_at)}</span>
                      {isUser && (
                        <Check className={`h-3 w-3 ${message.is_read ? 'text-blue-200' : 'text-blue-300'}`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex gap-2 p-3 md:p-4 bg-white border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-sm md:text-base"
            disabled={sending}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSendMessage(e);
              }
            }}
            aria-label="Type your message"
            autoFocus
          />
          <Button type="submit" disabled={sending || !newMessage.trim()} aria-label="Send message" size="sm" className="px-3 md:px-4">
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default ChatRoom; 