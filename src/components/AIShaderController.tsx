// src/components/AIShaderController.tsx
import { useEffect } from 'react';
import { api } from '~/trpc/react';

interface ShaderConfig {
  colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
  };
  physics: {
    speed: number;
    complexity: number;
    turbulence: number;
  };
}

interface AIShaderControllerProps {
  mood: string;
  currentTheme: number;
  onConfigUpdate: (config: ShaderConfig) => void;
}

export const AIShaderController: React.FC<AIShaderControllerProps> = ({ mood, currentTheme, onConfigUpdate }) => {
  const { data: shaderConfig, isLoading, error } = api.aiShader.getShaderConfig.useQuery(
    { mood, currentTheme },
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  useEffect(() => {
    if (shaderConfig && !isLoading && !error) {
      try {
        const parsedConfig = JSON.parse(shaderConfig) as ShaderConfig;
        onConfigUpdate(parsedConfig);
      } catch (e) {
        console.error("Failed to parse shader config:", e);
      }
    }
  }, [shaderConfig, isLoading, error, onConfigUpdate]);

  return null; // This component doesn't render anything
};