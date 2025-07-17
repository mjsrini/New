import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  progress: number;
  currentStep: string;
  isError?: boolean;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  progress,
  currentStep,
  isError = false
}) => {
  return (
    <div className="space-y-6">
      {!isError ? (
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
          <span className="text-white font-medium">Processing with Hugging Face RVC...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-3">
          <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">!</span>
          </div>
          <span className="text-red-300 font-medium">Processing failed</span>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isError ? 'text-red-300' : 'text-gray-300'}`}>{currentStep}</span>
          {!isError && <span className="text-purple-400 font-medium">{progress}%</span>}
        </div>
        
        {!isError && (
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      
      {!isError && (
        <div className="text-center text-gray-400 text-sm">
          Hugging Face RVC processing may take 1-3 minutes depending on model load time
        </div>
      )}
    </div>
  );
};