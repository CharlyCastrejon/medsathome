-- =====================================================
-- MedsAtHome - Supabase SQL Script
-- =====================================================
-- Run this script in the SQL Editor of your Supabase dashboard
-- This script drops all existing tables and recreates them
-- =====================================================

-- =====================================================
-- Drop existing tables (clean setup)
-- =====================================================
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS user_families CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- Profiles Table
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Families Table
-- =====================================================
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for families
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Policies for families
CREATE POLICY "Anyone can view families by code"
  ON families
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create families"
  ON families
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- User-Families Table (many-to-many relationship)
-- =====================================================
CREATE TABLE user_families (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, family_id)
);

-- Enable RLS for user_families
ALTER TABLE user_families ENABLE ROW LEVEL SECURITY;

-- Policies for user_families
CREATE POLICY "Users can view their own family memberships"
  ON user_families
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can join families"
  ON user_families
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Now add the UPDATE policy for families (after user_families exists)
CREATE POLICY "Users can update their family"
  ON families
  FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM user_families WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- Medications Table
-- =====================================================
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  laboratory TEXT,
  administration_route TEXT,
  quantity TEXT,
  expiration_date DATE NOT NULL,
  recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Policies for medications
CREATE POLICY "Users can view family medications"
  ON medications
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM user_families WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family medications"
  ON medications
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND
    family_id IN (
      SELECT family_id FROM user_families WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update family medications"
  ON medications
  FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM user_families WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete family medications"
  ON medications
  FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM user_families WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- Indexes for better performance
-- =====================================================

-- Indexes for families
CREATE INDEX idx_families_code
  ON families(code);

-- Indexes for user_families
CREATE INDEX idx_user_families_user_id
  ON user_families(user_id);

CREATE INDEX idx_user_families_family_id
  ON user_families(family_id);

-- Indexes for medications
CREATE INDEX idx_medications_user_id
  ON medications(user_id);

CREATE INDEX idx_medications_family_id
  ON medications(family_id);

CREATE INDEX idx_medications_created_at
  ON medications(created_at DESC);

CREATE INDEX idx_medications_name
  ON medications(name);
