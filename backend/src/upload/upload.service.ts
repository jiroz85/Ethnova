import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as multer from 'multer';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
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
    return new Promise((resolve, reject) => {
      void cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'ethnova-marketplace',
            format: 'webp',
            quality: 'auto:good',
          },
          (error, result) => {
            if (error) {
              reject(
                new Error(typeof error === 'string' ? error : 'Upload failed'),
              );
            } else if (result) {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          },
        )
        .end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      void cloudinary.uploader.destroy(publicId, (error) => {
        if (error) {
          reject(
            new Error(typeof error === 'string' ? error : 'Delete failed'),
          );
        } else {
          resolve();
        }
      });
    });
  }
}
