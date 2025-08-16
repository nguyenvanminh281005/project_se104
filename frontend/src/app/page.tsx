'use client';

import React from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { Container, Button } from '@/components/ui';
import Link from 'next/link';
import { Music, MessageCircle, Video, Users } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950">
        <Container className="text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-6">
              Music<span className="text-blue-400">Chat</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              The ultimate platform combining music streaming with real-time chat and video calls. 
              Connect with friends while enjoying your favorite tunes.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
                <Music className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Music Streaming</h3>
                <p className="text-gray-400 text-sm">Enjoy unlimited music with high-quality streaming</p>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
                <MessageCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Real-time Chat</h3>
                <p className="text-gray-400 text-sm">Chat with friends instantly with AI moderation</p>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
                <Video className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Video Calls</h3>
                <p className="text-gray-400 text-sm">High-quality video and audio calls with WebRTC</p>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
                <Users className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Social Features</h3>
                <p className="text-gray-400 text-sm">See who&apos;s online and share music with friends</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Demo Mode Banner */}
      <div className="bg-yellow-900/50 border-b border-yellow-700 p-3 text-center">
        <p className="text-yellow-200 text-sm">
          🔧 <strong>Demo Mode:</strong> Backend not connected - using mock data for demonstration
        </p>
      </div>
      
      <Container className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-xl text-gray-400">
            What would you like to do today?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Link href="/music" className="group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-xl hover:scale-105 transition-transform">
              <Music className="w-16 h-16 text-white mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Music</h3>
              <p className="text-blue-100">Listen to your favorite songs and discover new music</p>
            </div>
          </Link>

          <Link href="/chat" className="group">
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-xl hover:scale-105 transition-transform">
              <MessageCircle className="w-16 h-16 text-white mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Chat</h3>
              <p className="text-green-100">Connect with friends and start conversations</p>
            </div>
          </Link>

          <Link href="/friends" className="group">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-xl hover:scale-105 transition-transform">
              <Users className="w-16 h-16 text-white mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Friends</h3>
              <p className="text-purple-100">Manage your friend list and see who&apos;s online</p>
            </div>
          </Link>
        </div>
      </Container>
    </div>
  );
}
