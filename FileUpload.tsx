import React, { useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string;
  maxSize: number; // in MB
  label: string;
  icon: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes,
  maxSize,
  label,
  icon
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Please select a valid file type: ${acceptedTypes}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-purple-400 bg-purple-400/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="text-gray-400">
            {icon}
          </div>
          <div>
            <p className="text-white font-medium">{label}</p>
            <p className="text-gray-400 text-sm mt-1">
              or click to browse • Max {maxSize}MB
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Supported: {acceptedTypes.replace(/\./g, '').toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};