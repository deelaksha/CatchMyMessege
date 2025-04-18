'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import EmojiPicker from 'emoji-picker-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  createdAt: any;
}

interface ChatWindowProps {
  recipientEmail: string;
  recipientName: string;
  onClose: () => void;
}

export default function ChatWindow({ recipientEmail, recipientName, onClose }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const onlineStatusRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const initializeChat = async () => {
      try {
        const chatId = [user.email, recipientEmail].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);

        // Check if chat document exists
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
          await setDoc(chatRef, {
            participants: [user.email, recipientEmail],
            createdAt: serverTimestamp(),
            typing: {
              [user.email as string]: false,
              [recipientEmail as string]: false
            },
            onlineStatus: {
              [user.email as string]: true,
              [recipientEmail as string]: false
            },
            lastSeen: {
              [user.email as string]: serverTimestamp(),
              [recipientEmail as string]: null
            }
          });
        }

        // Set up messages listener
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const messagesUnsubscribe = onSnapshot(q, (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as ChatMessage[];
          setMessages(messagesData);
          setLoading(false);
        });

        // Set up typing status listener
        const typingUnsubscribe = onSnapshot(chatRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const typingStatus = data.typing || {};
            const onlineStatus = data.onlineStatus || {};
            const lastSeenData = data.lastSeen || {};
            
            setOtherUserTyping(typingStatus[recipientEmail] || false);
            setIsOnline(onlineStatus[recipientEmail] || false);
            setLastSeen(lastSeenData[recipientEmail]?.toDate() || null);
          }
        });

        // Update online status
        const updateOnlineStatus = async () => {
          if (chatDoc.exists()) {
            await updateDoc(chatRef, {
              'onlineStatus': {
                ...chatDoc.data().onlineStatus,
                [user.email as string]: true
              },
              'lastSeen': {
                ...chatDoc.data().lastSeen,
                [user.email as string]: serverTimestamp()
              }
            });
          }
        };

        // Set up online status interval
        updateOnlineStatus();
        onlineStatusRef.current = setInterval(updateOnlineStatus, 30000);

        return () => {
          messagesUnsubscribe();
          typingUnsubscribe();
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          if (onlineStatusRef.current) {
            clearInterval(onlineStatusRef.current);
          }
          // Set offline status when component unmounts
          if (chatDoc.exists()) {
            updateDoc(chatRef, {
              'onlineStatus': {
                ...chatDoc.data().onlineStatus,
                [user.email as string]: false
              },
              'lastSeen': {
                ...chatDoc.data().lastSeen,
                [user.email as string]: serverTimestamp()
              }
            });
          }
        };
      } catch (error) {
        console.error('Error initializing chat:', error);
        setLoading(false);
      }
    };

    initializeChat();
  }, [user, recipientEmail]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!user?.email) return;

    const chatId = [user.email, recipientEmail].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);

    try {
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        const currentTyping = chatDoc.data().typing || {};
        await updateDoc(chatRef, {
          typing: {
            ...currentTyping,
            [user.email as string]: isTyping,
            ...(recipientEmail ? { [recipientEmail]: false } : {})
          }
        });
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 1500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    try {
      const chatId = [user.email, recipientEmail].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      await addDoc(messagesRef, {
        text: message.trim(),
        senderId: user.uid,
        senderEmail: user.email,
        senderName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
      });

      // Reset typing status after sending message
      setIsTyping(false);
      updateTypingStatus(false);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col"
      style={{ height: '600px' }}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {recipientName.charAt(0)}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{recipientName}</h3>
            <p className="text-sm text-gray-500">
              {isOnline ? 'Online' : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderEmail === user?.email ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.senderEmail === user?.email
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {msg.createdAt?.toDate
                      ? new Date(msg.createdAt.toDate()).toLocaleTimeString()
                      : 'Sending...'}
                  </p>
                </div>
              </div>
            ))}
            {otherUserTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg shadow-sm"
              >
                <div className="relative w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {recipientName.charAt(0)}
                  </span>
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3],
                          y: [0, -4, 0]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-indigo-400 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3],
                          y: [0, -4, 0]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.2
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3],
                          y: [0, -4, 0]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.4
                        }}
                      />
                    </div>
                    <motion.span 
                      className="text-sm text-gray-600 font-medium"
                      animate={{
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {recipientName} is typing
                    </motion.span>
                  </div>
                  <motion.div
                    className="h-0.5 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 mt-1 rounded-full"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ 
                      scaleX: [0, 1, 0],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <FaceSmileIcon className="h-5 w-5 text-gray-500" />
            </button>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
} 