"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddRocket() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Add animation delay for form appearance
    setTimeout(() => setFormVisible(true), 500);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setLocationLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (latitude === null || longitude === null) {
      alert("Location not available.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/addRocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, latitude, longitude }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess(true);
        // Reset form after animation completes
        setTimeout(() => {
          setTitle("");
          setMessage("");
          setSuccess(false);
        }, 2500);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      setLoading(false);
      alert("Failed to add rocket. Please try again.");
    }
  };

  // Generate a random color from our theme palette
  const getRandomColor = () => {
    const colors = ["red", "blue", "green", "yellow", "purple", "pink", "orange", "teal"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const formColor = getRandomColor();

  return (
    <div className="relative w-full min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full opacity-70"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 5 + 3}s infinite`
            }}
          />
        ))}
      </div>
      
      {/* Flying paper rockets in background */}
      {[...Array(5)].map((_, i) => {
        const rocketColor = getRandomColor();
        return (
          <motion.div
            key={i}
            className="absolute z-0"
            initial={{ 
              x: -100, 
              y: 100 + (i * 100),
              rotate: Math.random() * 20 - 10
            }}
            animate={{ 
              x: window.innerWidth + 100,
              y: Math.random() * window.innerHeight,
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 15 + (i * 2), 
              delay: i * 3,
              ease: "linear"
            }}
          >
            <div className={`w-12 h-16 relative`}>
              {/* Simple paper rocket silhouette */}
              <div className={`absolute w-8 h-12 bg-${rocketColor}-300 rounded-t-lg`}></div>
              <div className={`absolute w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-${rocketColor}-500 bottom-0 left-2`}></div>
              <div className={`absolute w-4 h-4 rounded-full bg-blue-200 top-3 left-2 border border-blue-300`}></div>
              
              {/* Trailing particles */}
              {[...Array(3)].map((_, j) => (
                <motion.div
                  key={j}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-50"
                  style={{ 
                    bottom: -j * 4, 
                    left: 3 + (j % 3)
                  }}
                  animate={{
                    opacity: [0.6, 0],
                    scale: [1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: j * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Main form container with paper craft styling */}
      <AnimatePresence>
        {formVisible && (
          <motion.div
            initial={{ scale: 0, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 5 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative max-w-md w-full z-10"
          >
            {/* Paper texture background */}
            <div 
              className="absolute inset-0 bg-white rounded-lg shadow-2xl"
              style={{ 
                backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.02) 75%, transparent 75%, transparent)',
                backgroundSize: '4px 4px',
                transform: 'rotate(-1deg)'
              }}
            >
              {/* Paper edges */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-white rounded-bl-lg shadow-inner transform rotate-90"></div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-white rounded-bl-lg shadow-inner transform rotate-180"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-bl-lg shadow-inner transform -rotate-90"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-white rounded-bl-lg shadow-inner"></div>
            </div>
            
            {/* Decorative paper elements */}
            <div className="absolute -top-3 -right-3 w-8 h-20 bg-red-100 transform rotate-45 origin-bottom-left rounded"></div>
            <div className="absolute -top-3 -left-3 w-8 h-20 bg-blue-100 transform -rotate-45 origin-bottom-right rounded"></div>
            
            {/* Success animation */}
            <AnimatePresence>
              {success && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center z-20 bg-white bg-opacity-90 rounded-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="flex flex-col items-center"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 2, times: [0, 0.6, 1] }}
                  >
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-green-600 font-bold text-xl" style={{ fontFamily: 'cursive' }}>Rocket Launched!</p>
                    <motion.div 
                      className="w-1 h-40 bg-gradient-to-b from-transparent via-orange-300 to-red-500 mt-4 rounded-full"
                      animate={{ 
                        height: [0, 40], 
                        opacity: [1, 0]
                      }}
                      transition={{ duration: 1, repeat: 2 }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Form content */}
            <form 
              onSubmit={handleSubmit} 
              className="relative p-8 space-y-6 z-10"
              style={{ fontFamily: 'cursive' }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create a Paper Rocket</h2>
                <p className="text-gray-500">Send your message into the digital cosmos</p>
              </div>
              
              {/* Form fields with paper styling */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Rocket Name</label>
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                   <input 
  type="text" 
  placeholder="Name your rocket..." 
  value={title} 
  onChange={(e) => setTitle(e.target.value)} 
  required 
  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg focus:border-blue-400 focus:ring-0 bg-blue-50 bg-opacity-30 text-gray-800"
/>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-100 rounded-full shadow"></div>
                  </motion.div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Message</label>
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <textarea 
  placeholder="Write your message here..." 
  value={message} 
  onChange={(e) => setMessage(e.target.value)} 
  required 
  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg focus:border-blue-400 focus:ring-0 bg-yellow-50 bg-opacity-30 min-h-24 text-gray-800"
/>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-100 rounded-full shadow"></div>
                  </motion.div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Launch Location</label>
                  <motion.div 
                    className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 flex items-center space-x-2"
                    animate={locationLoading ? { x: [0, 5, -5, 5, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <div className="text-xl">📍</div>
                    <div className="flex-1">
                      {locationLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span>Locating your coordinates...</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex space-x-1 text-sm text-gray-700">
                            <span>Lat: <b>{latitude?.toFixed(4)}</b></span>
                            <span>•</span>
                            <span>Lng: <b>{longitude?.toFixed(4)}</b></span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Your rocket will launch from this location</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Launch button with paper craft styling */}
              <motion.button 
                type="submit" 
                className={`w-full p-4 bg-${formColor}-500 text-white rounded-lg shadow-lg relative overflow-hidden flex items-center justify-center space-x-2`}
                disabled={loading || locationLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Button content */}
                <span className="relative z-10 font-bold tracking-wide">
                  {loading ? "Launching..." : "Launch Paper Rocket"}
                </span>
                
                {/* Button decoration */}
                <span className="text-xl relative z-10">🚀</span>
                
                {/* Paper texture for button */}
                <div className="absolute inset-0 opacity-20" style={{ 
                  backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
                  backgroundSize: '4px 4px'
                }}></div>
                
                {/* Animation for loading state */}
                {loading && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                )}
              </motion.button>
              
              {/* Paper clip decoration */}
              <div className="absolute -top-3 left-10 w-8 h-16 border-r-4 border-t-4 border-b-4 border-gray-300 rounded-r-full transform rotate-45 opacity-60"></div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating paper particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-white opacity-60 rounded-sm"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: Math.random() * 180
          }}
          animate={{ 
            y: [0, -20, 0],
            rotate: Math.random() * 360,
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ 
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
          style={{
            background: ['#fff', '#f0f4ff', '#ffe8e8', '#fff8e0'][Math.floor(Math.random() * 4)]
          }}
        />
      ))}
    </div>
  );
}