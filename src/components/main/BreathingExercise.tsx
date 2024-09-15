// src/components/main/BreathingExercise.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BreathingExerciseProps {
  duration: number;
  onComplete: () => void;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ duration, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return prev + 100 / (duration / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-40">
      <motion.div
        className="w-20 h-20 bg-blue-500 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          easings: ['easeInOut'],
        }}
      />
      <p className="mt-4 text-lg font-semibold">
        {progress < 50 ? 'Breathe in...' : 'Breathe out...'}
      </p>
      <div className="w-full mt-4 bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-blue-500 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};