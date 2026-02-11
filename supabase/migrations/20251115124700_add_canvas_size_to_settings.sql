/*
  # Add Canvas Size Setting

  1. Changes
    - Add `canvas_size` column to `org_settings` table
    - Default value is 'auto' for existing records
    - Allows users to set preferred canvas size for org chart exports
  
  2. Canvas Size Options
    - auto: Full size with no constraints
    - ppt-standard: PowerPoint 4:3 (960x720px)
    - ppt-widescreen: PowerPoint 16:9 (1280x720px)
    - word-portrait: Word Portrait (816x1056px)
    - word-landscape: Word Landscape (1056x816px)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'org_settings' AND column_name = 'canvas_size'
  ) THEN
    ALTER TABLE org_settings 
    ADD COLUMN canvas_size text DEFAULT 'auto' NOT NULL;
  END IF;
END $$;