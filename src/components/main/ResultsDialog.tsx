// src/components/main/ResultsDialog.tsx
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '~/components/ui/alert-dialog';
import { themes } from '~/utils/assessmentThemes';

interface ResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personalityProfile: string;
  insights: string[];
}

export const ResultsDialog: React.FC<ResultsDialogProps> = ({ open, onOpenChange, personalityProfile, insights }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-gray-800 text-white max-w-4xl">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-2xl font-bold mb-4">Your Self-Discovery Insights</AlertDialogTitle>
        <AlertDialogDescription>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Personality Profile</h3>
              <p>{personalityProfile}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Theme Insights</h3>
              {themes.map((theme, index) => (
                <div key={theme.name} className="mb-4">
                  <h4 className="text-lg font-medium">{theme.name}</h4>
                  <p>{insights[index]}</p>
                </div>
              ))}
            </div>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction onClick={() => onOpenChange(false)}>Close</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);