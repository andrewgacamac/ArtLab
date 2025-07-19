import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';
import { ImageFile } from '../types';

interface ImageUploadProps {
  onImageUploaded: (image: ImageFile) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded }) => {
  const { uploadImage, uploading, uploadProgress, error } = useImageUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    try {
      const uploadedImage = await uploadImage(file);
      onImageUploaded(uploadedImage);
    } catch (err) {
      console.error('Upload error:', err);
    }
  }, [uploadImage, onImageUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.tiff']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin-slow mx-auto w-12 h-12 text-blue-500">
              <Upload className="w-full h-full" />
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Uploading image...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <ImageIcon className="w-full h-full" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop the image here' : 'Upload an image'}
              </p>
              <p className="text-gray-600">
                Drag & drop or click to select
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports JPEG, PNG, WebP, TIFF • Max 50MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};