'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon, ChatBubbleLeftIcon, ChevronDownIcon, ChevronUpIcon, ArrowRightIcon, EnvelopeIcon, LockClosedIcon, MagnifyingGlassIcon, SparklesIcon, CalendarIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
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

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'distance'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

  const toggleMessage = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleCardClick = (messageId: string, event: React.MouseEvent) => {
    // Prevent the click from triggering if clicking on the chat button
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    toggleMessage(messageId);
  };

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
      } else {
        if (!userLocation) return 0;
        const distanceA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.location.lat,
          a.location.lng
        );
        const distanceB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.location.lat,
          b.location.lng
        );
        return sortOrder === 'desc' ? distanceB - distanceA : distanceA - distanceB;
      }
    });
  }, [messages, sortBy, sortOrder, userLocation]);

  const getSemanticMatches = (query: string, message: Message) => {
    const queryWords = query.toLowerCase().split(/\s+/);
    const messageText = message.message.toLowerCase();
    const userName = message.userName.toLowerCase();

    // Enhanced semantic patterns with synonyms and variations
    const semanticPatterns = {
      // Housing
      rent: {
        primary: ['rent', 'renting', 'lease', 'apartment', 'house', 'room', 'flat', 'studio'],
        synonyms: ['accommodation', 'lodging', 'dwelling', 'residence', 'place to stay', 'living space'],
        variations: ['looking for place', 'need place', 'want to rent', 'seeking accommodation', 'roommate wanted']
      },
      buy: {
        primary: ['buy', 'purchase', 'looking for', 'need', 'want', 'interested in', 'searching for'],
        synonyms: ['acquire', 'obtain', 'get', 'shop for', 'in the market for'],
        variations: ['willing to pay', 'ready to buy', 'looking to purchase', 'in search of']
      },
      sell: {
        primary: ['sell', 'sale', 'selling', 'for sale', 'available', 'offering', 'price'],
        synonyms: ['list', 'advertise', 'market', 'vend', 'trade'],
        variations: ['up for grabs', 'taking offers', 'on the market', 'available for purchase']
      },
      
      // Services
      service: {
        primary: ['service', 'help', 'assistance', 'looking for help', 'need help', 'can someone help'],
        synonyms: ['support', 'aid', 'assist', 'backup', 'reinforcement'],
        variations: ['seeking assistance', 'in need of help', 'could use some help', 'looking for support']
      },
      offer: {
        primary: ['offering', 'can help', 'available to help', 'willing to help'],
        synonyms: ['provide', 'supply', 'furnish', 'give', 'present'],
        variations: ['happy to help', 'available for hire', 'open for business', 'taking clients']
      },
      
      // Jobs
      job: {
        primary: ['job', 'work', 'employment', 'hire', 'hiring', 'position', 'vacancy', 'opportunity'],
        synonyms: ['occupation', 'career', 'profession', 'role', 'post'],
        variations: ['looking to hire', 'seeking employee', 'position available', 'job opening']
      },
      resume: {
        primary: ['resume', 'cv', 'experience', 'skills', 'qualifications'],
        synonyms: ['credentials', 'background', 'expertise', 'capabilities', 'competencies'],
        variations: ['work history', 'professional experience', 'skill set', 'qualifications']
      },
      
      // Events
      event: {
        primary: ['event', 'party', 'meeting', 'gathering', 'celebration', 'get together'],
        synonyms: ['function', 'occasion', 'affair', 'assembly', 'convention'],
        variations: ['social gathering', 'community event', 'group activity', 'organized meetup']
      },
      
      // Lost & Found
      lost: {
        primary: ['lost', 'missing', 'can\'t find', 'looking for', 'where is'],
        synonyms: ['misplaced', 'disappeared', 'gone', 'vanished', 'absent'],
        variations: ['can\'t locate', 'unable to find', 'searching for', 'trying to find']
      },
      found: {
        primary: ['found', 'picked up', 'discovered', 'have your'],
        synonyms: ['recovered', 'located', 'retrieved', 'identified', 'spotted'],
        variations: ['came across', 'stumbled upon', 'came into possession of', 'have in my possession']
      },
      
      // General
      question: {
        primary: ['question', 'inquiry', 'wondering', 'curious about', 'anyone know'],
        synonyms: ['query', 'doubt', 'uncertainty', 'enquiry', 'investigation'],
        variations: ['seeking information', 'looking for answers', 'need to know', 'trying to understand']
      },
      advice: {
        primary: ['advice', 'suggestion', 'recommendation', 'tips', 'help with'],
        synonyms: ['guidance', 'counsel', 'direction', 'input', 'feedback'],
        variations: ['looking for guidance', 'need suggestions', 'seeking recommendations', 'want advice']
      }
    };

    // Enhanced similarity calculation
    const calculateSimilarity = (text1: string, text2: string) => {
      const words1 = text1.split(/\s+/);
      const words2 = text2.split(/\s+/);
      
      // Check for exact matches
      const exactMatches = words1.filter(word => words2.includes(word));
      
      // Check for partial matches
      const partialMatches = words1.filter(word1 => 
        words2.some(word2 => 
          word1.includes(word2) || word2.includes(word1) ||
          (word1.length > 3 && word2.length > 3 && 
           (word1.startsWith(word2) || word2.startsWith(word1)))
        )
      );
      
      // Combine matches
      const totalMatches = new Set([...exactMatches, ...partialMatches]);
      
      return totalMatches.size / Math.max(words1.length, words2.length);
    };

    // Check for direct matches
    const directMatch = queryWords.some(word => 
      messageText.includes(word) || userName.includes(word)
    );

    // Enhanced semantic matching
    const semanticMatch = Object.entries(semanticPatterns).some(([intent, patterns]) => {
      const { primary, synonyms, variations } = patterns;
      
      // Check if query matches any pattern
      const queryHasIntent = 
        primary.some(keyword => query.includes(keyword)) ||
        synonyms.some(synonym => query.includes(synonym)) ||
        variations.some(variation => query.includes(variation));
      
      // Check if message matches any pattern
      const messageHasIntent = 
        primary.some(keyword => messageText.includes(keyword)) ||
        synonyms.some(synonym => messageText.includes(synonym)) ||
        variations.some(variation => messageText.includes(variation));
      
      return queryHasIntent && messageHasIntent;
    });

    // Enhanced location matching
    const locationWords = ['near', 'close', 'around', 'in', 'at', 'within', 'by', 'next to', 'beside', 'adjacent to'];
    const locationQuery = queryWords.some(word => locationWords.includes(word));
    const locationMatch = locationQuery && message.location;

    // Enhanced fuzzy matching
    const fuzzyMatch = queryWords.some(queryWord => {
      const messageWords = messageText.split(/\s+/);
      return messageWords.some(messageWord => 
        calculateSimilarity(queryWord, messageWord) > 0.6
      );
    });

    // Return true if any match is found
    return directMatch || semanticMatch || locationMatch || fuzzyMatch;
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return sortedMessages;

    return sortedMessages.filter(message => 
      getSemanticMatches(searchQuery, message)
    );
  }, [sortedMessages, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
        {/* AI Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              ) : (
                <SparklesIcon className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
                // Simulate AI processing delay
                setTimeout(() => setIsSearching(false), 500);
              }}
              placeholder="Search messages with AI... (e.g., 'Looking for a room to rent' or 'Need help with moving')"
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-2 left-0 right-0 text-center"
            >
              <span className="inline-block px-2 py-1 text-xs text-gray-500 bg-white rounded-full shadow-sm">
                Powered by AI
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Search Results Info */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <p className="text-gray-600">
              Found {filteredMessages.length} relevant messages
            </p>
          </motion.div>
        )}

        {/* Sorting Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4 mb-8"
        >
          <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
            <button
              onClick={() => {
                setSortBy('date');
                setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
              }}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                sortBy === 'date' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              <span>Date</span>
              <ArrowsUpDownIcon className={`h-4 w-4 ml-2 transition-transform ${
                sortOrder === 'asc' ? 'rotate-180' : ''
              }`} />
            </button>
            
            <div className="h-6 w-px bg-gray-200"></div>
            
            <button
              onClick={() => {
                setSortBy('distance');
                setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
              }}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                sortBy === 'distance' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>Distance</span>
              <ArrowsUpDownIcon className={`h-4 w-4 ml-2 transition-transform ${
                sortOrder === 'asc' ? 'rotate-180' : ''
              }`} />
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No messages found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMessages.map((message) => {
              const distance = userLocation 
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    message.location.lat,
                    message.location.lng
                  )
                : null;

              const isCurrentUser = user?.uid === message.userId;
              const isExpanded = expandedMessages.has(message.id);

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-[400px] w-full"
                  style={{ perspective: '1000px' }}
                >
                  <motion.div
                    className="relative w-full h-full"
                    animate={{
                      rotateY: isExpanded ? 180 : 0,
                      scale: isExpanded ? 1.05 : 1,
                      zIndex: isExpanded ? 10 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                    onClick={(e) => handleCardClick(message.id, e)}
                  >
                    {/* Front of Card - Sealed Envelope */}
                    <motion.div
                      className="absolute w-full h-full bg-gradient-to-br from-blue-50 to-white p-8 rounded-lg shadow-lg border-2 border-blue-200"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg)',
                      }}
                    >
                      <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <div className="relative">
                          <EnvelopeIcon className="h-16 w-16 text-blue-400" />
                          <LockClosedIcon className="h-6 w-6 text-blue-600 absolute -bottom-2 -right-2" />
                        </div>
                        
                        <div className="text-center space-y-2">
                          <h3 className="font-semibold text-gray-900 truncate max-w-[200px]">{message.userName}</h3>
                          <div className="flex items-center justify-center text-sm text-gray-500">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-[150px]">
                              {distance !== null 
                                ? formatDistance(distance)
                                : 'Location unavailable'}
                            </span>
                          </div>
                        </div>

                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          className="text-blue-600 text-sm font-medium cursor-pointer"
                        >
                          Click to reveal message
                        </motion.div>

                        {!isCurrentUser && user && (
                          <motion.button
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChat({
                                email: message.userEmail,
                                name: message.userName
                              });
                            }}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                          >
                            <span>Start Chat</span>
                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>

                    {/* Back of Card - Message Content */}
                    <motion.div
                      className="absolute w-full h-full bg-white p-6 rounded-lg shadow-lg border-2 border-blue-200"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {message.userPhotoURL ? (
                              <img
                                src={message.userPhotoURL}
                                alt={message.userName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-lg">
                                  {message.userName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate max-w-[150px]">{message.userName}</h3>
                              <div className="text-sm text-gray-500 truncate max-w-[150px]">
                                {message.createdAt?.toDate ? 
                                  new Date(message.createdAt.toDate()).toLocaleString() :
                                  'Time not available'
                                }
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMessage(message.id);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ChevronUpIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto bg-blue-50 p-4 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap break-words">
                            {message.message}
                          </p>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-[150px]">
                              {distance !== null 
                                ? formatDistance(distance)
                                : 'Location unavailable'}
                            </span>
                          </div>
                          
                          {!isCurrentUser && user && (
                            <motion.button
                              whileHover={{ scale: 1.05, x: 5 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedChat({
                                  email: message.userEmail,
                                  name: message.userName
                                });
                              }}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                            >
                              <span>Start Chat</span>
                              <ArrowRightIcon className="h-4 w-4 ml-2" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}
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
