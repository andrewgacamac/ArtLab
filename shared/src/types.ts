export interface ImageFile {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface FluxEditRequest {
  imageId: string;
  prompt: string;
  model: 'kontext-pro' | 'kontext-max';
  options?: {
    promptUpsampling?: boolean;
    seed?: number;
    steps?: number;
    guidance?: number;
  };
}

export interface FluxTask {
  id: string;
  imageId: string;
  prompt: string;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  resultUrl?: string;
  resultPath?: string;
  error?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FluxAPIResponse {
  id: string;
  status: 'Request Accepted' | 'Ready' | 'Error';
  result?: {
    sample: string; // URL to the generated image
  };
  error?: string;
}

export interface EditHistory {
  id: string;
  originalImageId: string;
  prompt: string;
  model: string;
  resultImageId: string;
  createdAt: Date;
}