import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import imageRoutes from './routes/images';
import fluxRoutes from './routes/flux';
import { errorHandler } from './middleware/errorHandler';
import { createDirectories } from './utils/fileSystem';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

createDirectories();

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/results', express.static(path.join(process.cwd(), 'results')));

app.use('/api/images', imageRoutes);
app.use('/api/flux', fluxRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 ArtLab Backend running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(process.cwd(), 'uploads')}`);
  console.log(`🎨 Results directory: ${path.join(process.cwd(), 'results')}`);
});