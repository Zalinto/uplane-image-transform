import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  async flipHorizontal(imageBuffer: Buffer): Promise<Buffer> {
    this.logger.log('Flipping image horizontally...');

    try {
      const processedBuffer = await sharp(imageBuffer)
        .flop()
        .toBuffer();

      this.logger.log('Image flipped successfully');

      return processedBuffer;
    } catch (error) {
      this.logger.error(`Failed to flip image: ${error.message}`);
      throw new Error(`Image flipping failed: ${error.message}`);
    }
  }
}
