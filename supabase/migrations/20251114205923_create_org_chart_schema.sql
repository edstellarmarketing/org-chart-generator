/*
  # Organizational Chart Generator Schema

  ## Overview
  This migration creates the database schema for a multi-tenant organizational chart generator
  for HR and L&D professionals.

  ## New Tables

  ### 1. `org_settings`
  Stores company-wide settings including logo and name
  - `id` (uuid, primary key) - Unique identifier for settings
  - `user_id` (uuid) - Reference to authenticated user (owner)
  - `company_name` (text) - Company name for the org chart
  - `company_logo_url` (text) - URL to company logo image
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update

  ### 2. `org_levels`
  Defines organizational levels with colors for visualization
  - `id` (uuid, primary key) - Unique identifier for level
  - `user_id` (uuid) - Reference to authenticated user (owner)
  - `level_name` (text) - Name of the level (e.g., "Executive", "Manager")
  - `level_order` (integer) - Hierarchical order (1 = highest)
  - `color` (text) - Hex color code for level visualization
  - `created_at` (timestamptz) - Timestamp of creation

  ### 3. `employees`
  Stores employee information for org chart
  - `id` (uuid, primary key) - Unique identifier for employee
  - `user_id` (uuid) - Reference to authenticated user (owner)
  - `employee_name` (text) - Full name of employee
  - `position` (text) - Job title/position
  - `level_id` (uuid) - Reference to org_levels
  - `manager_id` (uuid, nullable) - Self-reference for reporting structure
  - `picture_url` (text, nullable) - URL to employee picture
  - `email` (text, nullable) - Employee email
  - `department` (text, nullable) - Department name
  - `created_at` (timestamptz) - Timestamp of creation

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE operations
  - All policies verify authentication and ownership
*/

-- Create org_settings table
CREATE TABLE IF NOT EXISTS org_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text NOT NULL DEFAULT '',
  company_logo_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create org_levels table
CREATE TABLE IF NOT EXISTS org_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  level_name text NOT NULL,
  level_order integer NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  employee_name text NOT NULL,
  position text NOT NULL,
  level_id uuid REFERENCES org_levels(id) ON DELETE CASCADE,
  manager_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  picture_url text,
  email text,
  department text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org_settings
CREATE POLICY "Users can view own org settings"
  ON org_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own org settings"
  ON org_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own org settings"
  ON org_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own org settings"
  ON org_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for org_levels
CREATE POLICY "Users can view own org levels"
  ON org_levels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own org levels"
  ON org_levels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own org levels"
  ON org_levels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own org levels"
  ON org_levels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for employees
CREATE POLICY "Users can view own employees"
  ON employees FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own employees"
  ON employees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_org_levels_user_id ON org_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_org_levels_order ON org_levels(level_order);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_level_id ON employees(level_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_org_settings_user_id ON org_settings(user_id);