import express from 'express';
import { z } from 'zod';
import { FluxEditRequest, APIResponse, FluxTask } from '../../../shared/src/types';
import { taskManager } from '../services/taskManager';

const router = express.Router();

const editRequestSchema = z.object({
  imageId: z.string().uuid(),
  prompt: z.string().min(1).max(1000),
  model: z.enum(['kontext-pro', 'kontext-max']),
  options: z.object({
    promptUpsampling: z.boolean().optional(),
    seed: z.number().int().optional(),
    steps: z.number().int().min(1).max(50).optional(),
    guidance: z.number().min(0).max(20).optional(),
  }).optional(),
});

router.post('/edit', async (req, res) => {
  try {
    const validatedData = editRequestSchema.parse(req.body);
    
    const task = await taskManager.createTask(validatedData as FluxEditRequest);
    
    res.json({
      success: true,
      data: task
    } as APIResponse<FluxTask>);

  } catch (error) {
    console.error('Edit request error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      } as APIResponse);
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Edit request failed'
    } as APIResponse);
  }
});

router.get('/status/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = taskManager.getTask(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      } as APIResponse);
    }

    res.json({
      success: true,
      data: task
    } as APIResponse<FluxTask>);

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    } as APIResponse);
  }
});

router.get('/tasks', (req, res) => {
  try {
    const { imageId } = req.query;
    
    let tasks: FluxTask[];
    
    if (imageId && typeof imageId === 'string') {
      tasks = taskManager.getTasksByImage(imageId);
    } else {
      tasks = taskManager.getAllTasks();
    }

    res.json({
      success: true,
      data: tasks
    } as APIResponse<FluxTask[]>);

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tasks'
    } as APIResponse);
  }
});

router.get('/models', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'kontext-pro',
        name: 'FLUX.1 Kontext [pro]',
        description: 'Fast, iterative image editing with local modifications',
        speed: 'fast',
        quality: 'good'
      },
      {
        id: 'kontext-max',
        name: 'FLUX.1 Kontext [max]',
        description: 'Experimental model with improved prompt adherence and typography',
        speed: 'slower',
        quality: 'excellent'
      }
    ]
  } as APIResponse);
});

export default router;