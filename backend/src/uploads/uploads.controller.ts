import { Controller, Get, Param, Res, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@UseGuards(AuthGuard)
@Controller('uploads')
export class UploadsController {
  @Get(':userId/:filename')
  serveFile(
    @Request() req: any,
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    // 1. Ownership check: ensure only the file owner can download the attachment
    if (req.user.sub !== userId) {
      throw new ForbiddenException('You do not have access to this receipt');
    }

    const uploadRoot = path.join(process.cwd(), 'uploads');
    const targetPath = path.join(uploadRoot, userId, filename);
    const resolvedPath = path.resolve(targetPath);

    // 2. Path Traversal protection
    if (!resolvedPath.startsWith(uploadRoot)) {
      throw new ForbiddenException('Invalid file path access request');
    }

    // 3. Existence check
    if (!fs.existsSync(resolvedPath)) {
      throw new NotFoundException('Requested receipt not found');
    }

    return res.sendFile(resolvedPath);
  }
}
