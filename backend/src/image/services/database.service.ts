import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ImageRecord {
  id: string;
  original_path: string;
  processed_path: string;
  page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateImageDto {
  original_path: string;
  processed_path: string;
  page_id?: string;
}

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createImage(data: CreateImageDto): Promise<ImageRecord> {
    this.logger.log(`Creating image record: ${data.original_path}`);

    const { data: result, error } = await this.supabase
      .from('images')
      .insert({
        original_path: data.original_path,
        processed_path: data.processed_path,
        page_id: data.page_id,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create image record: ${error.message}`);
      throw new Error(`Failed to create image record: ${error.message}`);
    }

    this.logger.log(`Image record created: ${result.id}`);
    return result;
  }

  async getAllImages(pageId?: string): Promise<ImageRecord[]> {
    this.logger.log(`Fetching all images${pageId ? ` for page ${pageId}` : ''}`);

    let query = this.supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (pageId) {
      query = query.eq('page_id', pageId);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Failed to fetch images: ${error.message}`);
      throw new Error(`Failed to fetch images: ${error.message}`);
    }

    this.logger.log(`Found ${data?.length || 0} images`);
    return data || [];
  }

  async getImageById(id: string): Promise<ImageRecord | null> {
    this.logger.log(`Fetching image: ${id}`);

    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`Failed to fetch image: ${error.message}`);
      throw new Error(`Failed to fetch image: ${error.message}`);
    }

    return data;
  }

  async deleteImage(id: string): Promise<void> {
    this.logger.log(`Deleting image record: ${id}`);

    const { error } = await this.supabase
      .from('images')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error(`Failed to delete image record: ${error.message}`);
      throw new Error(`Failed to delete image record: ${error.message}`);
    }

    this.logger.log(`Image record deleted: ${id}`);
  }

  async deleteByPageId(pageId: string): Promise<void> {
    this.logger.log(`Deleting images for page: ${pageId}`);

    const { error } = await this.supabase
      .from('images')
      .delete()
      .eq('page_id', pageId);

    if (error) {
      this.logger.error(`Failed to delete images: ${error.message}`);
      throw new Error(`Failed to delete images: ${error.message}`);
    }

    this.logger.log(`Images deleted for page: ${pageId}`);
  }
}
