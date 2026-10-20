export const STORAGE_SERVICE_TOKEN = 'StorageService';

export interface StorageService {
  save(file: Express.Multer.File, userId: string): Promise<{ url: string; type: string }>;
  delete(url: string): Promise<void>;
}
