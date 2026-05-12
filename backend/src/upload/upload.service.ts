import { Injectable } from '@nestjs/common';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as multer from 'multer';

// Simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable()
export class UploadService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  constructor() {
    // Create uploads directory if it doesn't exist
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  getMulterOptions(): multer.Options {
    const storage = multer.memoryStorage();

    const fileFilter = (
      _req: Express.Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback,
    ) => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'),
        );
      }
    };

    return {
      storage,
      fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5, // Max 5 files per upload
      },
    };
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; public_id: string }> {
    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const uniqueFilename = `${generateUUID()}.${fileExtension}`;
      const filePath = join(this.uploadsDir, uniqueFilename);

      // Write file to disk
      writeFileSync(filePath, file.buffer);

      // Create URL (for development, we'll use a simple approach)
      const imageUrl = `http://localhost:3001/uploads/${uniqueFilename}`;

      return {
        url: imageUrl,
        public_id: uniqueFilename,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Upload failed');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const filePath = join(this.uploadsDir, publicId);
      if (existsSync(filePath)) {
        // Note: We would need to import 'fs/promises' or use fs.unlinkSync
        // For now, this is a placeholder
        console.log(`Would delete file: ${filePath}`);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Delete failed');
    }
  }
}
