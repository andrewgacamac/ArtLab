# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArtLab is an AI-powered image editing interface that integrates with Black Forest Labs' Flux APIs (Kontext Pro and Max models). Users can upload images, apply AI-powered edits using natural language prompts, and save results locally.

## Architecture

**Monorepo Structure:**
- `frontend/` - React + TypeScript + Tailwind CSS web interface
- `backend/` - Node.js + Express API server  
- `shared/` - Shared TypeScript types and utilities

**Key Components:**
- **Image Upload**: Drag & drop interface with Sharp processing (converts to WebP, resizes to max 2048px)
- **Flux Integration**: Async task management with polling for Pro/Max model results
- **File Management**: Local storage with metadata tracking in JSON files
- **Task System**: Background processing with status tracking and result caching

## Development Commands

**Root Level:**
```bash
npm run dev              # Start both frontend and backend
npm run build           # Build both projects
npm run lint            # Lint both projects
npm test               # Run all tests
```

**Backend (port 3001):**
```bash
cd backend
npm run dev            # Development server with hot reload
npm run build          # TypeScript compilation
npm start             # Production server
npm run lint          # ESLint check
```

**Frontend (port 3000):**
```bash
cd frontend  
npm run dev           # Vite development server
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # ESLint check
```

## Environment Setup

1. **Backend Environment** (required):
   ```bash
   cp backend/.env.example backend/.env
   # Add your FLUX_API_KEY from dashboard.bfl.ai
   ```

2. **API Key**: Get from https://dashboard.bfl.ai/
3. **Dependencies**: Run `npm install` in root to install all workspace dependencies

## API Integration

**Black Forest Labs Flux APIs:**
- **Kontext Pro**: `/v1/flux-kontext-pro` - Fast iterative editing
- **Kontext Max**: `/v1/flux-kontext-max` - High-quality, precise edits
- **Result Polling**: `/v1/get-result` - Check task status and download results

**Key Services:**
- `FluxClient`: API wrapper with authentication and error handling
- `TaskManager`: Async task processing with automatic polling and result downloads
- Image processing pipeline: Upload → Sharp processing → Flux editing → Result storage

## File Storage

```
uploads/          # Original images (WebP format)
├── {uuid}.webp   # Processed source images  
└── {uuid}.json   # Image metadata

results/          # AI-edited images
└── {taskId}_result.webp

cache/            # Temporary files (auto-cleanup)
```

## TypeScript Types

Shared types are in `shared/src/types.ts`:
- `ImageFile`: Image metadata and file info
- `FluxEditRequest`: API request structure  
- `FluxTask`: Task status and results
- `APIResponse<T>`: Standardized API responses

## Frontend Architecture

**Components:**
- `ImageUpload`: Drag & drop with progress tracking
- `ImageGallery`: Grid view with edit/delete actions
- `ImageEditor`: Main editing interface with prompt input and model selection

**Hooks:**
- `useImageUpload`: File upload with progress and error handling
- `useFluxTasks`: Task management with automatic polling

**API Layer:** Centralized in `services/api.ts` with typed responses

## Development Notes

- Backend uses memory storage with Sharp for direct image processing
- Frontend proxies API calls through Vite dev server  
- Task polling runs every 3-5 seconds for active processing tasks
- All images are converted to WebP format for consistency
- Automatic cleanup of old cache files (configurable interval)
- Error handling includes both client and server-side validation