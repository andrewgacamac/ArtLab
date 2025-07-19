import axios from 'axios';
import { ImageFile, FluxEditRequest, FluxTask, APIResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const imageAPI = {
  upload: async (file: File): Promise<ImageFile> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post<APIResponse<ImageFile>>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Upload failed');
    }
    
    return response.data.data;
  },

  list: async (): Promise<ImageFile[]> => {
    const response = await api.get<APIResponse<ImageFile[]>>('/images');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch images');
    }
    
    return response.data.data;
  },

  get: async (id: string): Promise<ImageFile> => {
    const response = await api.get<APIResponse<ImageFile>>(`/images/${id}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch image');
    }
    
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete<APIResponse>(`/images/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete image');
    }
  },
};

export const fluxAPI = {
  edit: async (request: FluxEditRequest): Promise<FluxTask> => {
    const response = await api.post<APIResponse<FluxTask>>('/flux/edit', request);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Edit request failed');
    }
    
    return response.data.data;
  },

  getTaskStatus: async (taskId: string): Promise<FluxTask> => {
    const response = await api.get<APIResponse<FluxTask>>(`/flux/status/${taskId}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get task status');
    }
    
    return response.data.data;
  },

  getTasks: async (imageId?: string): Promise<FluxTask[]> => {
    const params = imageId ? { imageId } : {};
    const response = await api.get<APIResponse<FluxTask[]>>('/flux/tasks', { params });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch tasks');
    }
    
    return response.data.data;
  },

  getModels: async () => {
    const response = await api.get<APIResponse>('/flux/models');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch models');
    }
    
    return response.data.data;
  },
};