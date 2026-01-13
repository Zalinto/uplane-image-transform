import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import axios, { AxiosError } from 'axios';

@Injectable()
export class BackgroundRemovalService {
  private readonly logger = new Logger(BackgroundRemovalService.name);
  private readonly apiKey: string;
  private readonly apiEndpoint = 'https://api.remove.bg/v1.0/removebg';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('REMOVE_BG_API_KEY') || '';
  }

  async removeBackground(imageBuffer: Buffer): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('REMOVE_BG_API_KEY is not configured');
    }

    this.logger.log('Removing background from image...');

    try {
      // Convert Buffer to Uint8Array, then to Blob for FormData compatibility
      const uint8Array = new Uint8Array(imageBuffer);
      const blob = new Blob([uint8Array], { type: 'image/png' });

      const formData = new FormData();
      formData.append('size', 'auto');
      formData.append('image_file', blob, 'input.png');

      const response = await axios.post<Buffer>(this.apiEndpoint, formData, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
        responseType: 'arraybuffer',
      });

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }

      const contentType = response.headers['content-type'];
      if (!contentType?.startsWith('image/')) {
        throw new Error(`Expected image response, got: ${contentType}`);
      }

      this.logger.log('Background removed successfully');

      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          const errorMessage = Buffer.from(
            axiosError.response.data as ArrayBuffer,
          ).toString('utf-8');
          this.logger.error(`Background removal API error: ${errorMessage}`);
          throw new Error(`Background removal failed: ${errorMessage}`);
        }

        this.logger.error(
          `Background removal network error: ${axiosError.message}`,
        );
        throw new Error(`Background removal failed: ${axiosError.message}`);
      }

      this.logger.error(
        `Unexpected error during background removal: ${error.message}`,
      );
      throw new Error(`Background removal failed: ${error.message}`);
    }
  }
}
