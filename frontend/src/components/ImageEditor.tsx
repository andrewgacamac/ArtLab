import React, { useState } from 'react';
import { Wand2, Zap, Settings, Send } from 'lucide-react';
import { ImageFile, FluxEditRequest } from '../types';
import { useFluxTasks } from '../hooks/useFluxTasks';

interface ImageEditorProps {
  image: ImageFile;
  onBack: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ image, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<'kontext-pro' | 'kontext-max'>('kontext-pro');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState({
    promptUpsampling: false,
    seed: undefined as number | undefined,
    steps: undefined as number | undefined,
    guidance: undefined as number | undefined,
  });

  const { tasks, loading, error, submitEdit } = useFluxTasks(image.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    const request: FluxEditRequest = {
      imageId: image.id,
      prompt: prompt.trim(),
      model,
      options: showAdvanced ? options : undefined,
    };

    try {
      await submitEdit(request);
      setPrompt('');
    } catch (err) {
      console.error('Edit submission error:', err);
    }
  };

  const isSubmitting = tasks.some(task => task.status === 'pending' || task.status === 'processing');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="btn btn-secondary"
        >
          ← Back to Gallery
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Image Editor</h1>
        <div /> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Original Image</h2>
          <div className="card">
            <img
              src={`/uploads/${image.filename}`}
              alt={image.originalName}
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Name:</strong> {image.originalName}</p>
              <p><strong>Size:</strong> {(image.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Uploaded:</strong> {new Date(image.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Edit Controls & Results */}
        <div className="space-y-6">
          {/* Edit Form */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Instructions</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to change?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the changes you want to make to the image..."
                  className="input h-24 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModel('kontext-pro')}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      model === 'kontext-pro'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Pro</span>
                    </div>
                    <p className="text-xs text-gray-600">Fast, iterative editing</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setModel('kontext-max')}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      model === 'kontext-max'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Wand2 className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Max</span>
                    </div>
                    <p className="text-xs text-gray-600">High quality, precise</p>
                  </button>
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <Settings className="w-4 h-4" />
                  <span>Advanced Options</span>
                </button>
                
                {showAdvanced && (
                  <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.promptUpsampling}
                        onChange={(e) => setOptions(prev => ({
                          ...prev,
                          promptUpsampling: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm">Prompt upsampling</span>
                    </label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Seed</label>
                        <input
                          type="number"
                          value={options.seed || ''}
                          onChange={(e) => setOptions(prev => ({
                            ...prev,
                            seed: e.target.value ? parseInt(e.target.value) : undefined
                          }))}
                          className="input text-sm"
                          placeholder="Random"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Steps</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={options.steps || ''}
                          onChange={(e) => setOptions(prev => ({
                            ...prev,
                            steps: e.target.value ? parseInt(e.target.value) : undefined
                          }))}
                          className="input text-sm"
                          placeholder="Auto"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!prompt.trim() || isSubmitting}
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Processing...' : 'Edit Image'}</span>
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Edit History */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit History</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No edits yet. Start by describing what you'd like to change!</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.prompt}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {task.model} • {new Date(task.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {task.status === 'completed' && task.resultPath && (
                      <div className="mt-3">
                        <img
                          src={`/results/${task.id}_result.webp`}
                          alt={`Result for: ${task.prompt}`}
                          className="w-full rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    
                    {task.status === 'processing' && (
                      <div className="mt-3 flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}
                    
                    {task.status === 'failed' && task.error && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        {task.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};