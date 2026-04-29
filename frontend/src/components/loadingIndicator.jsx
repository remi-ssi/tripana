// src/components/EarthLoader.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EarthSVG from "../assets/loading.svg";

const MESSAGES = [
  "Getting everything ready...",
  "Just a moment...",
  "Almost ready!",
];

// Simple revolving Earth loader with cycling messages
export default function EarthLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 bg-transparent">

      {/* Revolving Earth */}
      <motion.img
        src={EarthSVG}
        alt="Earth"
        className="bg-transparent"
        style={{
          width: 160,
          height: 160,
          backgroundColor: "transparent",
          mixBlendMode: "multiply",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }} 
      />

      {/* Cycling message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 1 }}
          className="text-sm font-medium text-blue-500 tracking-wide"
        >
          {MESSAGES[msgIndex]}
        </motion.p>
      </AnimatePresence>

    </div>
  );
}