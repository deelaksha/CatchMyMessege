'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import ChatWindow from '@/components/ChatWindow';

interface Message {
  id: string;
  message: string;
  location: { lat: number; lng: number };
  userName: string;
  userPhotoURL: string;
  createdAt: any;
  userId: string;
  userEmail: string;
}

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<{
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

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

  // Function to format distance
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} meters`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  };

  return (
    <div className="min-h-screen">
      <main className="bg-gradient-to-b from-blue-50 to-white">
        
        {/* Messages Section */}
        <section className="container mx-auto px-4 py-16">
          
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-4 h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No messages found. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {messages.map((message) => {
                const distance = userLocation 
                  ? calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      message.location.lat,
                      message.location.lng
                    )
                  : null;

                const isCurrentUser = user?.uid === message.userId;

                return (
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
                            {distance !== null 
                              ? formatDistance(distance)
                              : 'Location unavailable'}
                          </div>
                        </div>
                        
                        <p className="mt-2 text-gray-600">{message.message}</p>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {message.createdAt?.toDate ? 
                              new Date(message.createdAt.toDate()).toLocaleString() :
                              'Time not available'
                            }
                          </div>
                          
                          {!isCurrentUser && user && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedChat({
                                email: message.userEmail,
                                name: message.userName
                              })}
                              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                              Chat
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Chat Window */}
      <AnimatePresence>
        {selectedChat && (
          <ChatWindow
            recipientEmail={selectedChat.email}
            recipientName={selectedChat.name}
            onClose={() => setSelectedChat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
