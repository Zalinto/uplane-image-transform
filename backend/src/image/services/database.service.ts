import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import postgresModule from 'postgres';

// Handle both ESM default export and CommonJS module
const postgres =
  typeof postgresModule === 'function'
    ? postgresModule
    : (postgresModule as any).default;

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly db;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('DATABASE_URL');

    if (!supabaseUrl) {
      throw new Error('Supabase URL is not configured');
    }
    const client = postgres(supabaseUrl);
    this.db = drizzle(client, { schema });
  }

  async createImage(data: {
    original_path: string;
    processed_path: string;
    page_id?: string;
  }) {
    this.logger.log(`Creating image record: ${data.original_path}`);

    const [result] = await this.db
      .insert(schema.images)
      .values({
        originalPath: data.original_path,
        processedPath: data.processed_path,
        pageId: data.page_id,
      })
      .returning();

    this.logger.log(`Image record created: ${result.id}`);
    return result;
  }

  async getAllImages(pageId?: string) {
    this.logger.log(
      `Fetching all images${pageId ? ` for page ${pageId}` : ''}`,
    );

    const results = await this.db
      .select()
      .from(schema.images)
      .orderBy(desc(schema.images.createdAt));

    this.logger.log(`Found ${results.length} images`);
    return results;
  }

  async getImageById(id: string) {
    this.logger.log(`Fetching image: ${id}`);

    const results = await this.db
      .select()
      .from(schema.images)
      .where(eq(schema.images.id, id))
      .limit(1);

    return results[0] || null;
  }

  async deleteImage(id: string) {
    this.logger.log(`Deleting image record: ${id}`);

    await this.db.delete(schema.images).where(eq(schema.images.id, id));

    this.logger.log(`Image record deleted: ${id}`);
  }

  async deleteByPageId(pageId: string) {
    this.logger.log(`Deleting images for page: ${pageId}`);

    await this.db.delete(schema.images).where(eq(schema.images.pageId, pageId));

    this.logger.log(`Images deleted for page: ${pageId}`);
  }
}
