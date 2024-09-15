// src/components/main/ThemeIcons.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { themes } from '~/utils/assessmentThemes';

interface ThemeIconsProps {
  currentTheme: number;
}

export const ThemeIcons: React.FC<ThemeIconsProps> = ({ currentTheme }) => (
  <div className="flex justify-between mb-8">
    {themes.map((theme, index) => (
      <motion.div
        key={theme.name}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
          index <= currentTheme ? 'opacity-100' : 'opacity-50'
        }`}
        style={{ backgroundColor: theme.color }}
        animate={{ scale: index === currentTheme ? 1.1 : 1 }}
      >
        {theme.icon}
      </motion.div>
    ))}
  </div>
);