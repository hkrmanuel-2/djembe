import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in .env file');
    console.error('💡 Create a .env file in the project root with:');
    console.error('   VITE_SUPABASE_URL=your_supabase_url');
    console.error('   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
    throw new Error('Supabase credentials are required. Please add them to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/* 
==================================================
DATABASE SCHEMA - Run this in Supabase SQL Editor
==================================================

-- 1. LOOPS TABLE (stores available loops)
CREATE TABLE IF NOT EXISTS loops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(10) DEFAULT '🎵',
  color VARCHAR(50) DEFAULT 'bg-purple-400',
  hover_color VARCHAR(50) DEFAULT 'hover:bg-purple-500',
  border VARCHAR(50) DEFAULT 'border-purple-600',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROJECTS TABLE (stores user projects)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  bpm INTEGER NOT NULL DEFAULT 120,
  placed_loops JSONB NOT NULL DEFAULT '[]',
  bars INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES (allow all for now)
CREATE POLICY "Allow all on loops" ON loops
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

-- 5. CREATE INDEXES
CREATE INDEX IF NOT EXISTS loops_name_idx ON loops(name);
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_updated_at_idx ON projects(updated_at DESC);

-- 6. AUTO-UPDATE TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. INSERT SAMPLE LOOPS
INSERT INTO loops (name, url, icon, color, hover_color, border) VALUES
  ('Adowa Drum', '/loops/adowa.mp3', '🥁', 'bg-purple-400', 'hover:bg-purple-500', 'border-purple-600'),
  ('Bell', '/loops/bell.mp3', '🔔', 'bg-yellow-300', 'hover:bg-yellow-400', 'border-yellow-500'),
  ('Shaker', '/loops/shaker.mp3', '🎵', 'bg-orange-300', 'hover:bg-orange-400', 'border-orange-500'),
  ('Melody Loop', '/loops/melody.mp3', '🎹', 'bg-pink-300', 'hover:bg-pink-400', 'border-pink-500')
ON CONFLICT DO NOTHING;

*/