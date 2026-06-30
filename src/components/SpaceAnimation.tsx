"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

const SpaceAnimation = () => {
  // Generate random stars for different layers
  const generateStars = (count: number) => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: Math.random() * 0.8 + 0.2,
      scale: Math.random() * 0.5 + 0.5,
    }));
  };

  const layer1 = useMemo(() => generateStars(100), []);
  const layer2 = useMemo(() => generateStars(70), []);
  const layer3 = useMemo(() => generateStars(40), []);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden pointer-events-none z-0">
      
      {/* Layer 1 - Slowest (Background - Distant White Stars) */}
      <motion.div 
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 h-[200%]"
      >
        {layer1.map((star, i) => (
          <div
            key={`l1-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: '1.5px',
              height: '1.5px',
              opacity: star.opacity,
              transform: `scale(${star.scale})`
            }}
          />
        ))}
        {/* Duplicate for seamless looping */}
        {layer1.map((star, i) => (
          <div
            key={`l1-dup-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y + 100}%`,
              width: '1.5px',
              height: '1.5px',
              opacity: star.opacity,
              transform: `scale(${star.scale})`
            }}
          />
        ))}
      </motion.div>

      {/* Layer 2 - Medium (Midground - Cyan Stars) */}
      <motion.div 
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 h-[200%]"
      >
        {layer2.map((star, i) => (
          <div
            key={`l2-${i}`}
            className="absolute bg-cyan-200 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: '2px',
              height: '2px',
              opacity: star.opacity,
              transform: `scale(${star.scale})`
            }}
          />
        ))}
        {/* Duplicate for seamless looping */}
        {layer2.map((star, i) => (
          <div
            key={`l2-dup-${i}`}
            className="absolute bg-cyan-200 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            style={{
              left: `${star.x}%`,
              top: `${star.y + 100}%`,
              width: '2px',
              height: '2px',
              opacity: star.opacity,
              transform: `scale(${star.scale})`
            }}
          />
        ))}
      </motion.div>

      {/* Layer 3 - Fastest (Foreground - Blue/Indigo Stars) */}
      <motion.div 
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 h-[200%]"
      >
        {layer3.map((star, i) => (
          <div
            key={`l3-${i}`}
            className={`absolute rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] ${i % 3 === 0 ? 'bg-blue-300 shadow-blue-400/80' : 'bg-indigo-200 shadow-indigo-300/80'}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: '3px',
              height: '3px',
              opacity: star.opacity,
              transform: `scale(${star.scale})`
            }}
          />
        ))}
        {/* Duplicate for seamless looping */}
        {layer3.map((star, i) => (
          <div
            key={`l3-dup-${i}`}
            className={`absolute rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] ${i % 3 === 0 ? 'bg-blue-300 shadow-blue-400/80' : 'bg-indigo-200 shadow-indigo-300/80'}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y + 100}%`,
              width: '3px',
              height: '3px',
              opacity: star.opacity,
              transform: `scale(${star.scale})`
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default SpaceAnimation;
