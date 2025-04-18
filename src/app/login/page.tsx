'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { FaGoogle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Error during Google login:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Welcome to Catch My Message
        </h1>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Sign in to create and manage your messages
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaGoogle className="text-red-500" />
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="text-center text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
} 