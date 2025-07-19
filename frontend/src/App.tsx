import React, { useState } from 'react';
import { Palette, Upload } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { ImageGallery } from './components/ImageGallery';
import { ImageEditor } from './components/ImageEditor';
import { ImageFile } from './types';

type View = 'gallery' | 'editor';

function App() {
  const [view, setView] = useState<View>('gallery');
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleImageUploaded = (image: ImageFile) => {
    setRefreshTrigger(prev => prev + 1);
    setSelectedImage(image);
    setView('editor');
  };

  const handleSelectImage = (image: ImageFile) => {
    setSelectedImage(image);
    setView('editor');
  };

  const handleBackToGallery = () => {
    setView('gallery');
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ArtLab</h1>
              <span className="text-sm text-gray-500">AI Image Editor</span>
            </div>
            
            {view === 'gallery' && (
              <div className="text-sm text-gray-600">
                Powered by Black Forest Labs Flux
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'gallery' ? (
          <div className="space-y-8">
            {/* Upload Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload New Image</span>
              </h2>
              <ImageUpload onImageUploaded={handleImageUploaded} />
            </section>

            {/* Gallery Section */}
            <section>
              <ImageGallery 
                onSelectImage={handleSelectImage}
                refreshTrigger={refreshTrigger}
              />
            </section>
          </div>
        ) : (
          selectedImage && (
            <ImageEditor 
              image={selectedImage}
              onBack={handleBackToGallery}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>ArtLab - Transform your images with AI • Built with React + Flux APIs</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;