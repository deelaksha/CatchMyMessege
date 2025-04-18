'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import ChatWindow from '@/components/ChatWindow';

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderEmail: string;
    createdAt: any;
  };
  otherUser: {
    email: string;
    name: string;
  };
}

export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchChats = async () => {
      try {
        // Get all chat documents where the current user is a participant
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          where('participants', 'array-contains', user.email)
        );

        const querySnapshot = await getDocs(q);
        const chatsData: Chat[] = [];

        for (const doc of querySnapshot.docs) {
          const participants = doc.data().participants as string[];
          const otherUserEmail = participants.find(p => p !== user.email);
          
          if (otherUserEmail) {
            // Get the last message in this chat
            const messagesRef = collection(db, 'chats', doc.id, 'messages');
            const messagesQuery = query(
              messagesRef,
              orderBy('createdAt', 'desc'),
              // Remove the where clause to get all messages
            );
            
            const messagesSnapshot = await getDocs(messagesQuery);
            const lastMessage = messagesSnapshot.docs[0]?.data();

            chatsData.push({
              id: doc.id,
              participants,
              lastMessage: lastMessage ? {
                text: lastMessage.text,
                senderEmail: lastMessage.senderEmail,
                createdAt: lastMessage.createdAt
              } : undefined,
              otherUser: {
                email: otherUserEmail,
                name: otherUserEmail.split('@')[0] // Simple way to get name from email
              }
            });
          }
        }

        // Sort chats by last message time
        chatsData.sort((a, b) => {
          if (!a.lastMessage?.createdAt) return 1;
          if (!b.lastMessage?.createdAt) return -1;
          return b.lastMessage.createdAt.toDate().getTime() - a.lastMessage.createdAt.toDate().getTime();
        });

        setChats(chatsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    };

    fetchChats();
  }, [user, router]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat => 
        chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.otherUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Chats</h1>
              <p className="text-gray-600 mt-1">Connect with people around you</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Chats List */}
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="mt-4 h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white rounded-lg shadow-md"
              >
                <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {searchQuery ? 'No chats found matching your search' : 'No chats yet. Start a conversation!'}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
                    onClick={() => setSelectedChat(chat.otherUser)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {chat.otherUser.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {chat.otherUser.name}
                          </h3>
                          {chat.lastMessage?.createdAt && (
                            <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                              {new Date(chat.lastMessage.createdAt.toDate()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            <span className={chat.lastMessage.senderEmail === user.email ? 'text-blue-600 font-medium' : ''}>
                              {chat.lastMessage.senderEmail === user.email ? 'You: ' : ''}
                            </span>
                            {chat.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat && (
        <ChatWindow
          recipientEmail={selectedChat.email}
          recipientName={selectedChat.name}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
} 