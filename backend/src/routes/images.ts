import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ImageFile, APIResponse } from '../../../shared/src/types';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and TIFF are allowed.'));
    }
  },
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      } as APIResponse);
    }

    const imageId = uuidv4();
    const filename = `${imageId}.webp`;
    const uploadPath = path.join(process.cwd(), 'uploads', filename);

    await sharp(req.file.buffer)
      .webp({ quality: 90 })
      .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      .toFile(uploadPath);

    const imageFile: ImageFile = {
      id: imageId,
      filename,
      originalName: req.file.originalname,
      path: uploadPath,
      size: fs.statSync(uploadPath).size,
      mimeType: 'image/webp',
      uploadedAt: new Date()
    };

    // Save metadata
    const metadataPath = path.join(process.cwd(), 'uploads', `${imageId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(imageFile, null, 2));

    res.json({
      success: true,
      data: imageFile
    } as APIResponse<ImageFile>);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    } as APIResponse);
  }
});

router.get('/', (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const files = fs.readdirSync(uploadsDir);
    
    const imageFiles: ImageFile[] = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const metadataPath = path.join(uploadsDir, file);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        return metadata;
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    res.json({
      success: true,
      data: imageFiles
    } as APIResponse<ImageFile[]>);

  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list images'
    } as APIResponse);
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(process.cwd(), 'uploads', `${id}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      } as APIResponse);
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    res.json({
      success: true,
      data: metadata
    } as APIResponse<ImageFile>);

  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get image'
    } as APIResponse);
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(process.cwd(), 'uploads', `${id}.json`);
    const imagePath = path.join(process.cwd(), 'uploads', `${id}.webp`);
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      } as APIResponse);
    }

    fs.unlinkSync(metadataPath);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    } as APIResponse);

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image'
    } as APIResponse);
  }
});

export default router;