# ArtLab - AI Image Editor

Transform your images with AI using Black Forest Labs' Flux APIs. Upload images, describe your edits in natural language, and get professional results powered by Kontext Pro and Max models.

## Features

- **Drag & Drop Upload** - Easy image uploading with progress tracking
- **AI-Powered Editing** - Use natural language to describe desired changes
- **Dual Models** - Choose between Kontext Pro (fast) or Max (high-quality)
- **Edit History** - Track all edits with before/after comparisons
- **Local Storage** - All images stored locally with metadata
- **Real-time Updates** - Live progress tracking during AI processing

## Quick Start

1. **Get API Key**
   - Visit [dashboard.bfl.ai](https://dashboard.bfl.ai/) to get your Flux API key
   - Sign up and create a new API key

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your FLUX_API_KEY
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Usage

1. **Upload Image** - Drag & drop or click to upload (JPEG, PNG, WebP, TIFF)
2. **Describe Changes** - Write what you want to change about the image
3. **Choose Model** - Select Pro for speed or Max for quality
4. **Submit Edit** - Watch real-time progress as AI processes your request
5. **View Results** - Compare before/after and download results

## Project Structure

```
artlab/
├── frontend/          # React + TypeScript + Tailwind
├── backend/           # Node.js + Express API
├── shared/            # Shared types and utilities
└── uploads/           # Uploaded images storage
└── results/           # AI-edited results storage
```

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build production version
- `npm run lint` - Run linting on all projects
- `npm test` - Run test suites

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Image Processing**: Sharp, Multer
- **AI Integration**: Black Forest Labs Flux APIs
- **Storage**: Local filesystem with JSON metadata

## API Models

### Kontext Pro
- **Speed**: Fast (8x faster than competitors)
- **Use Case**: Iterative editing, quick changes
- **Best For**: Rapid prototyping, multiple variations

### Kontext Max
- **Quality**: Experimental high-quality model
- **Use Case**: Final edits, precision work
- **Best For**: Typography, detailed modifications

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and architecture documentation.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

For issues with the application, please check the console logs and ensure your Flux API key is correctly configured in the backend environment file.