import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 5, (req, res, cb) => {
      const options = this.uploadService.getMulterOptions();
      const multer = require('multer');
      const upload = multer(options);
      upload.single('files')(req, res, cb);
    }),
  )
  async uploadImages(
    @CurrentUser() user: AuthUser,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    try {
      const uploadPromises = files.map((file) =>
        this.uploadService.uploadImage(file),
      );
      const results = await Promise.all(uploadPromises);

      return {
        success: true,
        images: results,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Upload failed',
      );
    }
  }
}
