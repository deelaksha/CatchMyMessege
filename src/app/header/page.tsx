"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type HeaderProps = {
  currentPage: "home" | "add" | "search";
};

export default function RocketsHeader({ currentPage }: HeaderProps) {
  return (
    <header className="w-full bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-sm text-white py-4 px-4 relative z-20">
      <div className="max-w-screen-xl mx-auto flex flex-wrap items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <motion.div
            className="relative w-12 h-12"
            animate={{ 
              rotateY: [0, 10, 0, -10, 0],
              y: [0, -3, 0, -2, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            {/* Paper Rocket Icon */}
            <div className="absolute w-8 h-10 bg-blue-100 transform rotate-0 rounded-t-lg" 
              style={{ 
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
                backgroundSize: '4px 4px',
                top: '2px',
                left: '2px'
              }}>
              {/* Fold line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 opacity-50"></div>
            </div>

            {/* Nose */}
            <div className="absolute top-0 left-0 right-0 mx-auto w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-blue-200"></div>
            
            {/* Fins */}
            <div className="absolute bottom-2 -left-1 w-2 h-4 bg-blue-300 skew-y-12"></div>
            <div className="absolute bottom-2 -right-1 w-2 h-4 bg-blue-300 -skew-y-12"></div>
            
            {/* Exhaust */}
            <div className="absolute -bottom-2 left-0 right-0 mx-auto w-4 h-4 bg-orange-100"
              style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}>
            </div>
          </motion.div>
          
          <h1 className="text-xl font-bold" style={{ fontFamily: 'cursive' }}>Catch My Messege</h1>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-4">
          <Link href="/">
            <div className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center ${
              currentPage === "home" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}>
              <span className="mr-2">🏠</span>
              <span className="hidden sm:inline">Home</span>
            </div>
          </Link>
          
          <Link href="/add_rockets">
            <div className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center ${
              currentPage === "add" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}>
              <span className="mr-2">➕</span>
              <span className="hidden sm:inline">Add Messege</span>
            </div>
          </Link>
          
          <Link href="/Filter_Rockets">
            <div className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center ${
              currentPage === "search" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}>
              <span className="mr-2">🔍</span>
              <span className="hidden sm:inline">Search Nearby</span>
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}