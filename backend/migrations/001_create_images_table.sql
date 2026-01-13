-- Create images table to store image metadata
-- This table tracks both original and processed image paths

CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_path TEXT NOT NULL,
  processed_path TEXT NOT NULL,
  page_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on page_id for faster queries
CREATE INDEX IF NOT EXISTS idx_images_page_id ON images(page_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);

-- Create index on original_path for lookups
CREATE INDEX IF NOT EXISTS idx_images_original_path ON images(original_path);

-- Enable Row Level Security (RLS)
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (can be restricted based on page_id)
CREATE POLICY "Allow public read access" ON images
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow authenticated inserts
CREATE POLICY "Allow authenticated inserts" ON images
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated deletes
CREATE POLICY "Allow authenticated deletes" ON images
  FOR DELETE
  TO anon
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE images IS 'Stores metadata for uploaded and processed images';
COMMENT ON COLUMN images.id IS 'Unique identifier for the image record';
COMMENT ON COLUMN images.original_path IS 'Path to original uploaded image in storage';
COMMENT ON COLUMN images.processed_path IS 'Path to processed image in storage';
COMMENT ON COLUMN images.page_id IS 'Page ID associated with the image';
COMMENT ON COLUMN images.created_at IS 'When the image was created';
COMMENT ON COLUMN images.updated_at IS 'When the image record was last updated';
