/*
  # Add show_logo field to org_settings table

  1. Changes
    - Add `show_logo` boolean column to `org_settings` table
    - Set default value to `true` (logo visible by default)
    - Update existing rows to have show_logo = true

  2. Notes
    - This allows users to toggle logo visibility in their org charts
    - Backward compatible - existing charts will continue showing logos
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'org_settings' AND column_name = 'show_logo'
  ) THEN
    ALTER TABLE org_settings ADD COLUMN show_logo boolean DEFAULT true;
  END IF;
END $$;

-- Update existing rows to have show_logo = true
UPDATE org_settings SET show_logo = true WHERE show_logo IS NULL;