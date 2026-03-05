-- RateMyLecture Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables

-- 1. Create lecture_type enum
CREATE TYPE lecture_type AS ENUM ('lecture', 'section');

-- 2. Batches table
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- 3. Modules table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE
);

-- 4. Lectures table
CREATE TABLE lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  type lecture_type NOT NULL,
  number INT NOT NULL
);

-- 5. Sources table
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  duration_minutes INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 1 AND score <= 10),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_modules_batch_id ON modules(batch_id);
CREATE INDEX idx_lectures_module_id ON lectures(module_id);
CREATE INDEX idx_sources_lecture_id ON sources(lecture_id);
CREATE INDEX idx_ratings_source_id ON ratings(source_id);

-- Disable RLS for public access (no authentication required)
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations (public app)
CREATE POLICY "Allow all on batches" ON batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on modules" ON modules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on lectures" ON lectures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sources" ON sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ratings" ON ratings FOR ALL USING (true) WITH CHECK (true);
