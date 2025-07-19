import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FluxTask, FluxEditRequest } from '../../../shared/src/types';
import { FluxClient } from './fluxClient';

export class TaskManager {
  private tasks: Map<string, FluxTask> = new Map();
  private fluxClient: FluxClient;
  private tasksFile: string;

  constructor() {
    this.fluxClient = new FluxClient();
    this.tasksFile = path.join(process.cwd(), 'tasks.json');
    this.loadTasks();
    this.startPolling();
  }

  private loadTasks() {
    try {
      if (fs.existsSync(this.tasksFile)) {
        const data = fs.readFileSync(this.tasksFile, 'utf8');
        const tasks = JSON.parse(data);
        this.tasks = new Map(Object.entries(tasks));
        console.log(`📋 Loaded ${this.tasks.size} tasks from disk`);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  private saveTasks() {
    try {
      const tasksObject = Object.fromEntries(this.tasks);
      fs.writeFileSync(this.tasksFile, JSON.stringify(tasksObject, null, 2));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  async createTask(request: FluxEditRequest): Promise<FluxTask> {
    try {
      const taskId = uuidv4();
      const imagePath = path.join(process.cwd(), 'uploads', `${request.imageId}.webp`);

      if (!fs.existsSync(imagePath)) {
        throw new Error('Source image not found');
      }

      const task: FluxTask = {
        id: taskId,
        imageId: request.imageId,
        prompt: request.prompt,
        model: request.model,
        status: 'pending',
        createdAt: new Date(),
      };

      this.tasks.set(taskId, task);
      this.saveTasks();

      // Submit to Flux API in background
      this.submitTask(taskId, request, imagePath);

      return task;

    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  private async submitTask(taskId: string, request: FluxEditRequest, imagePath: string) {
    try {
      const task = this.tasks.get(taskId);
      if (!task) return;

      task.status = 'processing';
      this.tasks.set(taskId, task);
      this.saveTasks();

      const fluxTaskId = await this.fluxClient.submitEditTask(request, imagePath);
      
      // Store the Flux task ID for polling
      task.error = fluxTaskId; // Temporarily store in error field
      this.tasks.set(taskId, task);
      this.saveTasks();

    } catch (error) {
      console.error(`Task submission error for ${taskId}:`, error);
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : 'Submission failed';
        this.tasks.set(taskId, task);
        this.saveTasks();
      }
    }
  }

  private startPolling() {
    setInterval(async () => {
      const processingTasks = Array.from(this.tasks.values())
        .filter(task => task.status === 'processing' && task.error); // error field contains Flux task ID

      for (const task of processingTasks) {
        try {
          const fluxTaskId = task.error!; // Flux task ID stored in error field
          const result = await this.fluxClient.getTaskResult(fluxTaskId);

          if (result.status === 'Ready' && result.result?.sample) {
            await this.completeTask(task.id, result.result.sample);
          } else if (result.status === 'Error') {
            task.status = 'failed';
            task.error = result.error || 'Processing failed';
            task.completedAt = new Date();
            this.tasks.set(task.id, task);
            this.saveTasks();
          }

        } catch (error) {
          console.error(`Polling error for task ${task.id}:`, error);
        }
      }
    }, 5000); // Poll every 5 seconds
  }

  private async completeTask(taskId: string, resultUrl: string) {
    try {
      const task = this.tasks.get(taskId);
      if (!task) return;

      const resultFilename = `${taskId}_result.webp`;
      const resultPath = path.join(process.cwd(), 'results', resultFilename);

      await this.fluxClient.downloadResult(resultUrl, resultPath);

      task.status = 'completed';
      task.completedAt = new Date();
      task.resultUrl = resultUrl;
      task.resultPath = resultPath;
      task.error = undefined; // Clear the Flux task ID

      this.tasks.set(taskId, task);
      this.saveTasks();

      console.log(`✅ Task completed: ${taskId}`);

    } catch (error) {
      console.error(`Complete task error for ${taskId}:`, error);
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : 'Download failed';
        task.completedAt = new Date();
        this.tasks.set(taskId, task);
        this.saveTasks();
      }
    }
  }

  getTask(taskId: string): FluxTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): FluxTask[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTasksByImage(imageId: string): FluxTask[] {
    return Array.from(this.tasks.values())
      .filter(task => task.imageId === imageId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const taskManager = new TaskManager();