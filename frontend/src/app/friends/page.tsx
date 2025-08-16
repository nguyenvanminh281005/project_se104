'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useCallStore } from '@/lib/store/call';
import { userAPI } from '@/lib/api';
import { Container, Avatar, Button } from '@/components/ui';
import { Phone, Video, MessageCircle, UserPlus } from 'lucide-react';
import { User } from '@/types';

export default function FriendsPage() {
  const { token } = useAuthStore();
  const { startCall } = useCallStore();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFriends() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await userAPI.getUsers(token);
        if (response.success && response.data) {
          setFriends(response.data as User[]);
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
  }, [token]);

  const handleAudioCall = (friend: User) => {
    startCall(friend, 'audio');
  };

  const handleVideoCall = (friend: User) => {
    startCall(friend, 'video');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading friends...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Friends</h1>
          <p className="text-gray-400">Connect with your friends and see who&apos;s online</p>
        </div>

        <div className="grid gap-4">
          {friends.map((friend) => (
            <div key={friend.id} className="bg-gray-900 rounded-lg p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={friend.avatar}
                  alt={friend.username}
                  size="lg"
                  online={friend.isOnline}
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">{friend.username}</h3>
                  <p className="text-gray-400">
                    {friend.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAudioCall(friend)}
                  title="Audio Call"
                >
                  <Phone size={16} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVideoCall(friend)}
                  title="Video Call"
                >
                  <Video size={16} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  title="Send Message"
                >
                  <MessageCircle size={16} />
                </Button>
              </div>
            </div>
          ))}

          {friends.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No friends yet</h3>
              <p className="text-gray-400">Start by adding some friends to connect with!</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
