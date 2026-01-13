import { pgTable, uuid, timestamp, text } from 'drizzle-orm/pg-core';

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  originalPath: text('original_path').notNull(),
  processedPath: text('processed_path').notNull(),
  pageId: text('page_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ImageRecord = typeof images.$inferSelect;
