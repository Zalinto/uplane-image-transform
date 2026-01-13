import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    // Use service role key to bypass RLS for backend operations
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY');
    this.bucketName = this.configService.get<string>(
      'SUPABASE_BUCKET_NAME',
      'images',
    );

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadImage(
    imageBuffer: Buffer,
    filePath: string,
    contentType: string = 'image/png',
  ): Promise<{ id: string; url: string }> {
    this.logger.log(`Uploading image: ${filePath}`);

    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, imageBuffer, {
          contentType,
          upsert: false,
        });

      if (error) {
        this.logger.error(`Upload failed: ${error.message}`);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      this.logger.log(`Image uploaded successfully: ${urlData.publicUrl}`);

      return {
        id: data.path,
        url: urlData.publicUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error.message}`);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async deleteImage(id: string): Promise<void> {
    this.logger.log(`Deleting image: ${id}`);

    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([id]);

      if (error) {
        this.logger.error(`Deletion failed: ${error.message}`);
        throw new Error(`Failed to delete image: ${error.message}`);
      }

      this.logger.log(`Image deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error.message}`);
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  async listAllImages(): Promise<
    Array<{ id: string; url: string; createdAt: Date }>
  > {
    this.logger.log('Listing all images from bucket');

    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list('', { limit: 100 });

      if (error) {
        this.logger.error(`List failed: ${error.message}`);
        throw new Error(`Failed to list images: ${error.message}`);
      }

      const images = data.map((file) => {
        const { data: urlData } = this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(file.name);

        return {
          id: file.name,
          url: urlData.publicUrl,
          createdAt: new Date(file.created_at),
        };
      });

      this.logger.log(`Found ${images.length} images`);
      return images;
    } catch (error) {
      this.logger.error(`Failed to list images: ${error.message}`);
      throw new Error(`Image listing failed: ${error.message}`);
    }
  }

  async getPublicUrl(filePath: string): Promise<string> {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
