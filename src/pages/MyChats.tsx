import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Loader from '@/components/ui/loader';

interface ChatRoomListItem {
  id: string;
  listing: any;
  supplier: any;
  buyer: any;
  last_message?: any;
}

const MyChats = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await apiClient.getProfile();
      setCurrentUser(user);
      const rooms = await apiClient.getChatRooms();
      // Optionally, sort by last message date
      rooms.sort((a: any, b: any) => {
        const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
        const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
        return bTime - aTime;
      });
      setChatRooms(rooms);
    } catch (err: any) {
      setError(err.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParty = (room: ChatRoomListItem) => {
    if (!currentUser) return null;
    // If current user is supplier, other party is buyer, and vice versa
    if (room.supplier?.id === currentUser.id) return room.buyer;
    return room.supplier;
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">My Chats</h2>
      {loading ? (
        <Loader className="py-12" />
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : chatRooms.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No chats found.</div>
      ) : (
        <div className="space-y-4">
          {chatRooms.map((room) => {
            const other = getOtherParty(room);
            return (
              <Card key={room.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/chat/${room.id}`)}>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {other?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate text-base">{other?.name || 'Unknown'}</CardTitle>
                    <div className="text-xs text-gray-500 truncate">{room.listing?.title || 'No listing title'}</div>
                  </div>
                  {room.last_message && (
                    <div className="text-xs text-gray-400 min-w-fit">
                      {new Date(room.last_message.created_at).toLocaleString()}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex items-center gap-2 pt-0 pb-3">
                  {room.last_message ? (
                    <>
                      <span className="truncate flex-1 text-sm text-gray-700">{room.last_message.message_text}</span>
                      {room.last_message.is_read === false && (
                        <Badge variant="destructive">Unread</Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">No messages yet</span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyChats; 