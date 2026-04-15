-- Upgrade products table to match Demo Portal structure
-- Adds video_image_url, visual_description, and legacy-compat columns
-- Removes old description and sort_order columns

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "video_image_url" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "visual_description" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "target_audience" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "solution" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "pain_point" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand_dna" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "airtable_record_id" text;

-- Migrate existing description data to visual_description
UPDATE "products" SET "visual_description" = "description" WHERE "description" IS NOT NULL AND "visual_description" IS NULL;

-- Drop old columns
ALTER TABLE "products" DROP COLUMN IF EXISTS "description";
ALTER TABLE "products" DROP COLUMN IF EXISTS "sort_order";
