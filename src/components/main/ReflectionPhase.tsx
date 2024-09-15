// src/components/main/ReflectionPhase.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Theme } from '~/types/assessment';
import { BreathingExercise } from './BreathingExercise';

interface ReflectionPhaseProps {
  theme: Theme;
  onComplete: () => void;
}

export const ReflectionPhase: React.FC<ReflectionPhaseProps> = ({ theme, onComplete }) => {
  const [showBreathing, setShowBreathing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="text-center py-8"
    >
      <div className="text-4xl mb-4">{theme.icon}</div>
      <p className="text-xl font-semibold mb-4">Reflecting on your journey...</p>
      {!showBreathing ? (
        <>
          <p className="mt-4 mb-6">Take a moment to center yourself before we continue.</p>
          <button
            onClick={() => setShowBreathing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Start Breathing Exercise
          </button>
        </>
      ) : (
        <BreathingExercise duration={10000} onComplete={onComplete} />
      )}
    </motion.div>
  );
};