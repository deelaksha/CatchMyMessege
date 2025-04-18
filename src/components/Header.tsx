'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaComment, FaUser, FaHeadset, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';
import { auth } from '@/lib/firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [messageCount, setMessageCount] = useState(5);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Simulate message count update
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) {
    return (
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold flex items-center">
              <FaComment className="mr-2" />
              CatchMyMessage
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold flex items-center">
            <FaComment className="mr-2" />
            CatchMyMessage
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/create-message" className="flex items-center hover:text-blue-200 transition-colors">
              <FaComment className="mr-1" />
              Create Message
            </Link>
            <Link href="/chats" className="flex items-center hover:text-blue-200 transition-colors">
              <FaComment className="mr-1" />
              Chats
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {messageCount}
              </span>
            </Link>
            <Link href="/about" className="flex items-center hover:text-blue-200 transition-colors">
              <FaUser className="mr-1" />
              About Us
            </Link>
            <Link href="/contact" className="flex items-center hover:text-blue-200 transition-colors">
              <FaEnvelope className="mr-1" />
              Contact Us
            </Link>
            <Link href="/support" className="flex items-center hover:text-blue-200 transition-colors">
              <FaHeadset className="mr-1" />
              Support
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <FaUser className="mr-2" />
                  )}
                  {user.displayName}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaUser className="mr-1" />
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              {user && (
                <div className="flex items-center space-x-2 mb-4">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <FaUser />
                  )}
                  <span>{user.displayName}</span>
                </div>
              )}
              <Link
                href="/create"
                className="flex items-center hover:text-blue-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaComment className="mr-2" />
                Create Message
              </Link>
              <Link
                href="/chats"
                className="flex items-center hover:text-blue-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaComment className="mr-2" />
                Chats
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {messageCount}
                </span>
              </Link>
              <Link
                href="/about"
                className="flex items-center hover:text-blue-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser className="mr-2" />
                About Us
              </Link>
              <Link
                href="/contact"
                className="flex items-center hover:text-blue-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaEnvelope className="mr-2" />
                Contact Us
              </Link>
              <Link
                href="/support"
                className="flex items-center hover:text-blue-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaHeadset className="mr-2" />
                Support
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FaUser className="mr-2" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUser className="mr-2" />
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 