import fs from 'fs';
import path from 'path';

export const createDirectories = () => {
  const dirs = ['uploads', 'results', 'cache'];
  
  dirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
    }
  });
};

export const cleanupOldFiles = (directory: string, maxAge: number = 24 * 60 * 60 * 1000) => {
  const dirPath = path.join(process.cwd(), directory);
  
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  const now = Date.now();
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (now - stats.mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up old file: ${file}`);
    }
  });
};