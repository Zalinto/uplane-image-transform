import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BackgroundRemovalService } from './services/background-removal.service';
import { ImageProcessingService } from './services/image-processing.service';
import { StorageService } from './services/storage.service';
import { DatabaseService } from './services/database.service';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    private readonly backgroundRemovalService: BackgroundRemovalService,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly storageService: StorageService,
    private readonly databaseService: DatabaseService,
  ) {}

  async processImage(file: Express.Multer.File, pageId?: string): Promise<{
    id: string;
    url: string;
    originalUrl: string;
    createdAt: Date;
  }> {
    this.logger.log(`Processing image: ${file.originalname}${pageId ? ` for page ${pageId}` : ''}`);

    const imageId = uuidv4();

    try {
      const imageBuffer = file.buffer;

      this.logger.log('Step 1: Uploading original image...');
      const originalFolder = pageId ? `original/${pageId}` : 'original';
      const originalFilename = `${imageId}.${file.mimetype.split('/')[1] || 'png'}`;
      const originalPath = `${originalFolder}/${originalFilename}`;
      await this.storageService.uploadImage(
        imageBuffer,
        originalPath,
        file.mimetype,
      );

      this.logger.log('Step 2: Removing background...');
      const noBgImage = await this.backgroundRemovalService.removeBackground(
        imageBuffer,
      );

      this.logger.log('Step 3: Flipping image horizontally...');
      const flippedImage = await this.imageProcessingService.flipHorizontal(
        noBgImage,
      );

      this.logger.log('Step 4: Uploading processed image to Supabase...');
      const processedFolder = pageId ? `processed/${pageId}` : 'processed';
      const processedFilename = `${imageId}.png`;
      const processedPath = `${processedFolder}/${processedFilename}`;
      const uploadResult = await this.storageService.uploadImage(
        flippedImage,
        processedPath,
        'image/png',
      );

      this.logger.log('Step 5: Saving metadata to database...');
      const originalUrl = await this.storageService.getPublicUrl(originalPath);
      await this.databaseService.createImage({
        original_path: originalPath,
        processed_path: processedPath,
        page_id: pageId,
      });

      this.logger.log(`Image processed successfully: ${uploadResult.url}`);

      return {
        id: uploadResult.id,
        url: uploadResult.url,
        originalUrl,
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to process image: ${error.message}`);
      throw error;
    }
  }

  async deleteImage(id: string): Promise<void> {
    this.logger.log(`Deleting image with id: ${id}`);
    await this.storageService.deleteImage(id);
    await this.databaseService.deleteImage(id);
  }

  async deleteImageRecord(dbId: string): Promise<void> {
    this.logger.log(`Deleting image record: ${dbId}`);
    await this.databaseService.deleteImage(dbId);
  }

  async getAllImages(): Promise<Array<{ id: string; url: string; originalUrl: string; createdAt: Date }>> {
    this.logger.log('Getting all images');
    const records = await this.databaseService.getAllImages();

    return Promise.all(
      records.map(async record => ({
        id: record.id,
        url: await this.storageService.getPublicUrl(record.processedPath),
        originalUrl: await this.storageService.getPublicUrl(record.originalPath),
        createdAt: new Date(record.createdAt),
      }))
    );
  }

  async getAllImagesByPageId(pageId: string): Promise<Array<{ id: string; url: string; originalUrl: string; createdAt: Date }>> {
    this.logger.log(`Getting images for page: ${pageId}`);
    const records = await this.databaseService.getAllImages(pageId);

    return Promise.all(
      records.map(async record => ({
        id: record.id,
        url: await this.storageService.getPublicUrl(record.processedPath),
        originalUrl: await this.storageService.getPublicUrl(record.originalPath),
        createdAt: new Date(record.createdAt),
      }))
    );
  }

  async getImageById(dbId: string): Promise<{ id: string; url: string; originalUrl: string; createdAt: Date } | null> {
    this.logger.log(`Getting image by id: ${dbId}`);
    const record = await this.databaseService.getImageById(dbId);

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      url: await this.storageService.getPublicUrl(record.processedPath),
      originalUrl: await this.storageService.getPublicUrl(record.originalPath),
      createdAt: new Date(record.createdAt),
    };
  }
}
