import { Injectable, BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service.interface';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class LocalDiskStorageService implements StorageService {
  async save(file: Express.Multer.File, userId: string): Promise<{ url: string; type: string }> {
    // 1. Validate MIME Type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and PDF are allowed.');
    }

    // 2. Validate Size (Max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException('File is too large. Max size is 5MB.');
    }

    // 3. Determine extension and type based on validated MIME type
    let extension = '';
    let type = '';
    if (file.mimetype === 'image/jpeg') {
      extension = '.jpg';
      type = 'image';
    } else if (file.mimetype === 'image/png') {
      extension = '.png';
      type = 'image';
    } else if (file.mimetype === 'application/pdf') {
      extension = '.pdf';
      type = 'pdf';
    }

    // 4. Generate pure UUID filename to eliminate path traversal on write
    const uuidFilename = `${crypto.randomUUID()}${extension}`;
    const userUploadDir = path.join(process.cwd(), 'uploads', userId);

    // 5. Ensure directory exists recursively
    await fs.promises.mkdir(userUploadDir, { recursive: true });

    // 6. Write file buffer
    const filePath = path.join(userUploadDir, uuidFilename);
    await fs.promises.writeFile(filePath, file.buffer);

    return {
      url: `/uploads/${userId}/${uuidFilename}`,
      type,
    };
  }

  async delete(url: string): Promise<void> {
    const parts = url.split('/');
    // Expected url: /uploads/{userId}/{filename}
    if (parts.length >= 4 && parts[1] === 'uploads') {
      const userId = parts[2];
      const filename = parts[3];

      const uploadRoot = path.join(process.cwd(), 'uploads');
      const targetPath = path.join(uploadRoot, userId, filename);
      const resolvedPath = path.resolve(targetPath);

      // Path traversal security check
      if (resolvedPath.startsWith(uploadRoot)) {
        try {
          if (fs.existsSync(resolvedPath)) {
            await fs.promises.unlink(resolvedPath);
          }
        } catch (err) {
          console.error(`Failed to delete file at ${resolvedPath}:`, err);
        }
      }
    }
  }
}
