'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function CreateMessage() {
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
        setStep(2);
      },
      (error) => {
        setError('Error getting location: ' + error.message);
        toast.error('Error getting location: ' + error.message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!message.trim()) {
      setError('Please enter a message');
      toast.error('Please enter a message');
      return;
    }

    if (!location) {
      setError('Please select your location');
      toast.error('Please select your location');
      return;
    }

    try {
      setIsLoading(true);
      await addDoc(collection(db, 'messages'), {
        message: message.trim(),
        location,
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || 'Anonymous',
        userPhotoURL: user?.photoURL,
        createdAt: serverTimestamp(),
        isFound: false,
      });
      
      toast.success('Message created successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error creating message:', error);
      setError('Failed to create message');
      toast.error('Failed to create message');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SparklesIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl font-bold text-gray-900"
            >
              Create a Message
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-2 text-gray-600"
            >
              Leave your message for others to find
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Your Message
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-300 hover:shadow-md"
                  placeholder="Write your message here..."
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="mt-1">
                <motion.button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300"
                >
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  {isLoading ? 'Getting Location...' : location ? 'Location Selected' : 'Select Current Location'}
                </motion.button>
                {location && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-gray-500"
                  >
                    Latitude: {location.lat.toFixed(6)}, Longitude: {location.lng.toFixed(6)}
                  </motion.p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300"
              >
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                {isLoading ? 'Creating...' : 'Create Message'}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="mt-8 flex justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            {[1, 2].map((s) => (
              <motion.div
                key={s}
                className={`h-2 w-2 rounded-full ${
                  step >= s ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: step >= s ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
} 