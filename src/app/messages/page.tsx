'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  message: string;
  location: { lat: number; lng: number };
  userName: string;
  userPhotoURL: string;
  createdAt: any;
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        const messagesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];

        setMessages(messagesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-4 h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No messages found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  {message.userPhotoURL ? (
                    <img
                      src={message.userPhotoURL}
                      alt={message.userName}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">
                        {message.userName.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{message.userName}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {message.location.lat.toFixed(4)}, {message.location.lng.toFixed(4)}
                      </div>
                    </div>
                    
                    <p className="mt-2 text-gray-600">{message.message}</p>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      {message.createdAt?.toDate ? 
                        new Date(message.createdAt.toDate()).toLocaleString() :
                        'Time not available'
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 