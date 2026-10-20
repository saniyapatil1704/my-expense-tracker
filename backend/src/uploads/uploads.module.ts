import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { LocalDiskStorageService } from './local-disk-storage.service';
import { STORAGE_SERVICE_TOKEN } from './storage.service.interface';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [
    {
      provide: STORAGE_SERVICE_TOKEN,
      useClass: LocalDiskStorageService,
    },
  ],
  exports: [STORAGE_SERVICE_TOKEN],
})
export class UploadsModule {}
