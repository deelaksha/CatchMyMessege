"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Rocket = {
  id: string;
  title: string;
  message: string;
  latitude: number;
  longitude: number;
};

export default function RocketsPage() {
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRocket, setSelectedRocket] = useState<Rocket | null>(null);
  const [unfolding, setUnfolding] = useState(false);

  useEffect(() => {
    fetch("/api/getRockets")
      .then((res) => res.json())
      .then((data) => {
        setRockets(data.rockets);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching rockets:", error);
        setLoading(false);
      });
  }, []);

  const handleRocketClick = (rocket: Rocket) => {
    setSelectedRocket(rocket);
    setUnfolding(true);
    setTimeout(() => setUnfolding(false), 1500);
  };

  const closeRocket = () => {
    setSelectedRocket(null);
  };

  // Generate random color for each rocket
  const getRandomColor = (id: string) => {
    const colors = ["red", "blue", "green", "yellow", "purple", "pink", "orange", "teal"];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900 bg-opacity-90 flex items-center">
      {/* Stars background effect */}
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

      {loading && (
        <div className="text-white text-center w-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="mx-auto w-16 h-16 border-t-4 border-blue-500 rounded-full"
          />
          <p className="mt-4">Loading rockets...</p>
        </div>
      )}
      
      {rockets.length === 0 && !loading && <p className="text-white text-center w-full">No paper rockets found in this airspace.</p>}

      {/* Flying paper rockets */}
      <div className="absolute top-0 bottom-0 left-0 right-0">
        {rockets.map((rocket) => {
          const rocketColor = getRandomColor(rocket.id);
          const flightPath = [
            { x: "110vw", y: Math.random() * 60 - 30 + "vh" },
            { x: "-20vw", y: Math.random() * 60 - 30 + "vh" }
          ];
          
          return (
            <motion.div
              key={rocket.id}
              className="absolute"
              initial={flightPath[0]}
              animate={flightPath[1]}
              transition={{ 
                duration: 12 + Math.random() * 8,
                ease: "linear",
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              onClick={() => handleRocketClick(rocket)}
              style={{ zIndex: 10 }}
            >
              {/* Paper Rocket Design with folded paper effect */}
              <motion.div
                className="relative cursor-pointer w-32 h-48 perspective"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5 }
                }}
                animate={{ 
                  rotateY: [0, 5, 0, -5, 0],
                  rotateZ: [0, 2, 0, -2, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                {/* Rocket Body - with paper texture */}
                <div className={`absolute w-24 h-36 bg-${rocketColor}-100 transform rotate-0 rounded-lg shadow-lg`} 
                  style={{ 
                    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
                    backgroundSize: '4px 4px'
                  }}>
                  {/* Fold lines */}
                  <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-300 opacity-50"></div>
                  <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gray-300 opacity-50"></div>
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-gray-300 opacity-50"></div>
                </div>
                
                {/* Nose Cone - with folded paper effect */}
                <div className={`absolute top-0 left-0 right-0 mx-auto w-0 h-0 border-l-12 border-r-12 border-t-16 border-l-transparent border-r-transparent border-t-${rocketColor}-200`}></div>
                
                {/* Left Fin - with paper fold */}
                <div className={`absolute bottom-1/4 -left-2 w-6 h-12 bg-${rocketColor}-300 skew-y-12 origin-right`}>
                  <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-400 opacity-70"></div>
                </div>
                
                {/* Right Fin - with paper fold */}
                <div className={`absolute bottom-1/4 -right-2 w-6 h-12 bg-${rocketColor}-300 -skew-y-12 origin-left`}>
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-400 opacity-70"></div>
                </div>
                
                {/* Exhaust - folded paper effect */}
                <div className="absolute -bottom-6 left-0 right-0 mx-auto">
                  <div className={`w-8 h-10 bg-orange-100 transform rotate-180 origin-top`}
                    style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 opacity-50"></div>
                  </div>
                </div>
                
                {/* Small exhaust smoke particles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-gray-200 rounded-full opacity-60"
                    initial={{ y: 0, x: 0, scale: 0 }}
                    animate={{ 
                      y: [0, 30 + i * 10], 
                      x: [0, (i % 2 === 0 ? 1 : -1) * 15],
                      opacity: [0.7, 0],
                      scale: [0, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    style={{ bottom: -10, left: '50%', marginLeft: '-5px' }}
                  />
                ))}
                
                {/* Window - folded paper cutout */}
                <div className="absolute top-1/3 left-0 right-0 mx-auto w-8 h-8 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100"></div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Unfolding Paper Message Animation */}
      <AnimatePresence>
        {selectedRocket && (
          <motion.div
            key={selectedRocket.id}
            className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.2 } }}
            onClick={closeRocket}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {/* Paper unfolding animation container */}
              <motion.div
                className="relative w-80 h-64 bg-white rounded overflow-hidden shadow-2xl"
                initial={{ scale: 0.1, rotateX: 180, originY: 0 }}
                animate={{ 
                  scale: unfolding ? [0.1, 0.3, 0.4, 0.6, 0.8, 1] : 1, 
                  rotateX: unfolding ? [180, 150, 120, 90, 45, 0] : 0
                }}
                exit={{ scale: 0.1, rotateX: 180, originY: 0 }}
                transition={{ duration: unfolding ? 1.5 : 0.5 }}
              >
                {/* Folding lines that animate during open */}
                <motion.div 
                  className="absolute w-full h-px bg-gray-300 top-1/2 left-0 z-10" 
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: unfolding ? [1, 0] : 0 }}
                  transition={{ duration: 0.8 }}
                />
                
                <motion.div 
                  className="absolute w-px h-full bg-gray-300 left-1/2 top-0 z-10" 
                  initial={{ scaleY: 1 }}
                  animate={{ scaleY: unfolding ? [1, 0] : 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />

                {/* Paper texture background */}
                <div className="absolute inset-0 opacity-20" style={{ 
                  backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05) 75%, transparent 75%, transparent)',
                  backgroundSize: '4px 4px'
                }}></div>

                {/* Content container */}
                <motion.div 
                  className="w-full h-full p-6 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: unfolding ? 1 : 0 }}
                >
                  {/* Message content with paper styling */}
                  <h2 className="font-bold text-center text-xl mb-4 text-gray-800 border-b-2 border-gray-200 pb-2" style={{ fontFamily: 'cursive' }}>
                    {selectedRocket.title}
                  </h2>
                  
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-100 shadow-sm w-full mb-4">
                    <p className="text-center text-gray-700" style={{ fontFamily: 'cursive' }}>
                      {selectedRocket.message}
                    </p>
                  </div>
                  
                  <p className="text-center text-sm text-gray-500 mt-2 flex items-center">
                    <span className="mr-1">📍</span> 
                    <span className="text-xs">
                      {selectedRocket.latitude.toFixed(4)}, {selectedRocket.longitude.toFixed(4)}
                    </span>
                  </p>
                </motion.div>
              </motion.div>

              {/* Paper airplane decoration */}
              <motion.div
                className="absolute -top-12 -right-12 text-4xl transform rotate-45"
                animate={{ rotate: [45, 30, 60, 45], y: [0, -10, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                ✈️
              </motion.div>
              
              {/* Close button */}
              <motion.button
                onClick={closeRocket}
                className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full text-white flex items-center justify-center shadow-lg z-10"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}