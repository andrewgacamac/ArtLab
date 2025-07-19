import { useState } from 'react';
import { imageAPI } from '../services/api';
import { ImageFile } from '../types';

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<ImageFile>;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<ImageFile> => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await imageAPI.upload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      
      return result;
    } catch (err) {
      setUploading(false);
      setUploadProgress(0);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    uploadImage,
    uploading,
    uploadProgress,
    error,
  };
};