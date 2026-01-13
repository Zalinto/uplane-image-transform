import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BackgroundRemovalService } from './services/background-removal.service';
import { ImageProcessingService } from './services/image-processing.service';
import { StorageService } from './services/storage.service';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    private readonly backgroundRemovalService: BackgroundRemovalService,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly storageService: StorageService,
  ) {}

  async processImage(file: Express.Multer.File, pageId?: string): Promise<{
    id: string;
    url: string;
    createdAt: Date;
  }> {
    this.logger.log(`Processing image: ${file.originalname}${pageId ? ` for page ${pageId}` : ''}`);

    const imageId = uuidv4();

    try {
      const imageBuffer = file.buffer;

      this.logger.log('Step 1: Removing background...');
      const noBgImage = await this.backgroundRemovalService.removeBackground(
        imageBuffer,
      );

      this.logger.log('Step 2: Flipping image horizontally...');
      const flippedImage = await this.imageProcessingService.flipHorizontal(
        noBgImage,
      );

      this.logger.log('Step 3: Uploading to Supabase...');
      const folderPath = pageId ? `processed/${pageId}` : 'processed';
      const filename = `${imageId}.png`;
      const filePath = `${folderPath}/${filename}`;
      const uploadResult = await this.storageService.uploadImage(
        flippedImage,
        filePath,
        'image/png',
      );

      this.logger.log(`Image processed successfully: ${uploadResult.url}`);

      return {
        id: uploadResult.id,
        url: uploadResult.url,
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
  }

  async getAllImages(): Promise<Array<{ id: string; url: string; createdAt: Date }>> {
    this.logger.log('Getting all images');
    return await this.storageService.listAllImages();
  }
}
