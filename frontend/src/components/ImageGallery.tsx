import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Calendar, FileImage } from 'lucide-react';
import { imageAPI } from '../services/api';
import { ImageFile } from '../types';

interface ImageGalleryProps {
  onSelectImage: (image: ImageFile) => void;
  refreshTrigger?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ onSelectImage, refreshTrigger }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await imageAPI.list();
      setImages(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load images';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (image: ImageFile, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${image.originalName}"?`)) return;
    
    try {
      await imageAPI.delete(image.id);
      setImages(prev => prev.filter(img => img.id !== image.id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    loadImages();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadImages}
            className="btn btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
        <p className="text-gray-600">Upload your first image to get started with AI editing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Your Images</h2>
        <span className="text-sm text-gray-600">{images.length} images</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectImage(image)}
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={`/uploads/${image.filename}`}
                alt={image.originalName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectImage(image);
                  }}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  title="Edit Image"
                >
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </button>
                <button
                  onClick={(e) => handleDelete(image, e)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  title="Delete Image"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate" title={image.originalName}>
                {image.originalName}
              </h3>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>{(image.size / 1024 / 1024).toFixed(1)} MB</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};