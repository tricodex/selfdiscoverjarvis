// src/components/AIShaderController.tsx
import React, { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import type { ShaderConfig } from '~/server/together-ai/shaderAI';

interface AIShaderControllerProps {
  mood: string;
  currentTheme: number;
  onConfigUpdate: (config: ShaderConfig) => void;
}

const defaultShaderConfig: ShaderConfig = {
  colors: {
    primary: [1, 0, 0],    // Red
    secondary: [0, 1, 0],  // Green
    accent: [0, 0, 1],     // Blue
  },
  physics: {
    speed: 0.5,
    complexity: 0.5,
    turbulence: 0.5,
  },
};

export const AIShaderController: React.FC<AIShaderControllerProps> = ({ mood, currentTheme, onConfigUpdate }) => {
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const { data: shaderConfig, isLoading, error: apiError } = api.aiShader.getShaderConfig.useQuery(
    { mood, currentTheme },
    {
      refetchInterval: 30000,
      retry: 1,
      retryDelay: 1000,
    }
  );

  useEffect(() => {
    console.log('AIShaderController useEffect triggered');
    console.log('shaderConfig:', shaderConfig);
    console.log('isLoading:', isLoading);
    console.log('apiError:', apiError);

    if (!isLoading) {
      if (shaderConfig && !apiError) {
        console.log('Updating shader config:', shaderConfig);
        onConfigUpdate(shaderConfig);
        setError(null);
        setDebugInfo(JSON.stringify(shaderConfig, null, 2));
      } else if (apiError) {
        console.error("Error fetching shader config:", apiError);
        setError("Unable to generate custom shader. Using fallback configuration.");
        setDebugInfo(JSON.stringify(apiError, null, 2));
        onConfigUpdate(defaultShaderConfig);
      } else {
        console.log("No shader config received. Using default config.");
        onConfigUpdate(defaultShaderConfig);
        setDebugInfo(JSON.stringify(defaultShaderConfig, null, 2));
      }
    }
  }, [shaderConfig, isLoading, apiError, onConfigUpdate]);

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Shader Controller Debug</h3>
      {isLoading && <div className="text-sm text-gray-500">Generating custom shader...</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}
      {!isLoading && !error && <div className="text-sm text-green-500">Shader config generated successfully!</div>}
      <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto max-h-40">
        {debugInfo || 'No debug info available'}
      </pre>
    </div>
  );
};
