import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';
import { FluxAPIResponse, FluxEditRequest } from '../../../shared/src/types';

export class FluxClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FLUX_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('FLUX_API_KEY environment variable is required');
    }

    this.client = axios.create({
      baseURL: 'https://api.bfl.ai',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async submitEditTask(request: FluxEditRequest, imagePath: string): Promise<string> {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const endpoint = request.model === 'kontext-pro' 
        ? '/v1/flux-kontext-pro' 
        : '/v1/flux-kontext-max';

      const payload = {
        prompt: request.prompt,
        image: imageBase64,
        prompt_upsampling: request.options?.promptUpsampling || false,
        seed: request.options?.seed,
        steps: request.options?.steps,
        guidance: request.options?.guidance,
      };

      console.log(`🚀 Submitting ${request.model} task for image ${request.imageId}`);
      
      const response = await this.client.post(endpoint, payload);
      
      if (response.data?.id) {
        console.log(`✅ Task submitted successfully: ${response.data.id}`);
        return response.data.id;
      } else {
        throw new Error('No task ID returned from Flux API');
      }

    } catch (error) {
      console.error('Flux API submission error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Flux API error: ${message}`);
      }
      throw error;
    }
  }

  async getTaskResult(taskId: string): Promise<FluxAPIResponse> {
    try {
      const response = await this.client.get(`/v1/get-result`, {
        params: { id: taskId }
      });

      return response.data;

    } catch (error) {
      console.error('Flux API result error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Flux API error: ${message}`);
      }
      throw error;
    }
  }

  async downloadResult(resultUrl: string, outputPath: string): Promise<void> {
    try {
      const response = await axios.get(resultUrl, {
        responseType: 'stream',
        timeout: 60000,
      });

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

    } catch (error) {
      console.error('Download error:', error);
      throw new Error(`Failed to download result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}