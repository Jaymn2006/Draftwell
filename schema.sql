-- ============================================================================
-- DRAFTWELL — ENTERPRISE DATABASE ARCHITECTURE & RELATIONAL SCHEMA
-- Platform: Supabase / PostgreSQL 15+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SYSTEM INITIALIZATION & CORE EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 2. CUSTOM TYPES & DOMAINS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'novel_status_enum') THEN
    CREATE TYPE public.novel_status_enum AS ENUM ('ongoing', 'completed', 'hiatus');
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. CORE RELATIONAL TABLES
-- ----------------------------------------------------------------------------

-- A. Profiles (User Account Identity Layer)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(64) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- B. User Settings (Reader Engine & UI Preferences)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  ui_preferences JSONB NOT NULL DEFAULT '{
    "theme_mode": "dark",
    "font_family": "serif",
    "font_size": 16,
    "line_height": 1.6,
    "margin_padding_index": 2,
    "reading_mode": "scroll"
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- C. Novels (Manuscript Catalog & Work Metadata)
CREATE TABLE IF NOT EXISTS public.novels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author_name VARCHAR(128) NOT NULL,
  cover_image_url TEXT,
  synopsis TEXT,
  status public.novel_status_enum NOT NULL DEFAULT 'ongoing',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigram Fuzzy Indexes for fast multi-attribute search across massive catalogs
CREATE INDEX IF NOT EXISTS idx_novels_title_trgm ON public.novels USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_novels_author_trgm ON public.novels USING gin (author_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_novels_synopsis_trgm ON public.novels USING gin (synopsis gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_novels_tags_gin ON public.novels USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_novels_created_at ON public.novels(created_at DESC);

-- D. Chapters (High-Capacity Content Stream: 5,000 to 10,000+ words)
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_text TEXT NOT NULL,
  sequence_order NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ensure TOAST storage strategy compresses extensive chapter bodies
ALTER TABLE public.chapters ALTER COLUMN content_text SET STORAGE EXTENDED;

CREATE INDEX IF NOT EXISTS idx_chapters_novel_lookup ON public.chapters(novel_id, sequence_order ASC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chapters_novel_num ON public.chapters(novel_id, chapter_number);

-- E. User Reading Progress (Multi-Device Synchronized Tracker)
CREATE TABLE IF NOT EXISTS public.user_reading_progress (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  last_scrolled_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (last_scrolled_percentage >= 0.00 AND last_scrolled_percentage <= 100.00),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, novel_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_updated ON public.user_reading_progress(updated_at DESC);

-- F. Preserved Features (Feature Flags & Local Analytics)
CREATE TABLE IF NOT EXISTS public.preserved_features (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_flags JSONB NOT NULL DEFAULT '{
    "offline_sync_enabled": true,
    "craft_coach_enabled": true,
    "haptic_feedback_enabled": false,
    "experimental_audio_dictation": true
  }'::jsonb
);

-- ----------------------------------------------------------------------------
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preserved_features ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view usernames/avatars, users can only edit their own
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- User Settings: strictly private to owner
CREATE POLICY "Users can read their own settings" 
  ON public.user_settings FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings" 
  ON public.user_settings FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings FOR UPDATE 
  USING (auth.uid() = id);

-- Novels: Public read access; write access strictly authenticated
CREATE POLICY "Public can view novels" 
  ON public.novels FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create novels" 
  ON public.novels FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update novels" 
  ON public.novels FOR UPDATE 
  TO authenticated 
  USING (true);

-- Chapters: Public can read published chapters; authenticated authors can manage
CREATE POLICY "Public can view published chapters" 
  ON public.chapters FOR SELECT 
  USING (published_at IS NOT NULL AND published_at <= timezone('utc'::text, now()));

CREATE POLICY "Authenticated users can insert chapters" 
  ON public.chapters FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chapters" 
  ON public.chapters FOR UPDATE 
  TO authenticated 
  USING (true);

-- User Reading Progress: strictly isolated per auth.uid()
CREATE POLICY "Users can query own reading progress" 
  ON public.user_reading_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own reading progress" 
  ON public.user_reading_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading progress" 
  ON public.user_reading_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- Preserved Features: strictly isolated per auth.uid()
CREATE POLICY "Users can view own preserved features" 
  ON public.preserved_features FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own preserved features" 
  ON public.preserved_features FOR ALL 
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. AUTOMATED PROVISIONING TRIGGER (POST-REGISTRATION HOOK)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_username VARCHAR(64);
BEGIN
  -- Extract username from raw user metadata or synthesize from email
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)
  );

  -- 1. Initialize Profile
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (NEW.id, v_username, NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Initialize Default Reader Preferences
  INSERT INTO public.user_settings (id, ui_preferences)
  VALUES (NEW.id, '{
    "theme_mode": "dark",
    "font_family": "serif",
    "font_size": 16,
    "line_height": 1.6,
    "margin_padding_index": 2,
    "reading_mode": "scroll"
  }'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- 3. Initialize Preserved Features
  INSERT INTO public.preserved_features (user_id, feature_flags)
  VALUES (NEW.id, '{
    "offline_sync_enabled": true,
    "craft_coach_enabled": true,
    "haptic_feedback_enabled": false,
    "experimental_audio_dictation": true
  }'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();

-- ----------------------------------------------------------------------------
-- 6. HIGH-DENSITY SEED PIPELINES (STRESS TEST FRAMEWORK)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_novel_id UUID := 'd0000000-0000-4000-8000-000000000001'::uuid;
  v_chap1_id UUID := 'c0000000-0000-4000-8000-000000000001'::uuid;
  v_chap2_id UUID := 'c0000000-0000-4000-8000-000000000002'::uuid;
  v_long_prose TEXT;
BEGIN
  -- Insert Benchmark Novel
  INSERT INTO public.novels (id, title, author_name, cover_image_url, synopsis, status, tags, created_at)
  VALUES (
    v_novel_id,
    'The Shape of Rain',
    'Mara Ellison',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    'In a drowned city where memory can be dredged from silt, an archivist discovers an unsent letter from her grandmother that rewrites thirty years of sovereign history.',
    'ongoing',
    ARRAY['Literary', 'Speculative', 'Mystery', 'Atmospheric'],
    NOW() - INTERVAL '14 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    synopsis = EXCLUDED.synopsis;

  -- High density prose chunk ~1,000 words repeated to stress TOAST mechanics
  v_long_prose := 'The rain in Oakhaven did not fall; it settled like particulate bone against the slate eaves of the lower quays. Mara pressed her knuckles into the grain of the cedar desk, feeling the tremor of the tidal turbines three levels below the archive floor. Every manuscript in this hall had survived salt rot through five distinct administrations, each clerk leaving behind the faint smell of tallow and gum arabic.

She withdrew the cylinder from the inner pocket of her oilskin coat. It was wrapped in sheepskin cured with fish oil—a coastal treatment intended to keep out bilge rather than rain. The seals had not been broken by blade; they had split naturally along the parchment crease as the parchment contracted in the autumn chill.

"If you have opened this," her grandmother had written in the erratic copperplate script of the northern cartographers, "it is because the water has crossed the seventh weir. Do not look for the survey markers. The city was never surveyed. It was surrendered."

Mara leaned closer to the gimbal lamp. The brass arm groaned in the damp draft. Outside, through the triple-glazed clerestory window, the buoy lights blinked across the estuary—green, amber, extinguished, green. The harbour master had ceased maintaining the outer beacons three tides ago, yet the pilots still found the channel by memory alone, navigating by the sound of surf breaking against the submerged limestone columns of the Old Parliament.

She unfolded the accompanying chart. It was not drawn on rag paper, but on drafting linen that smelled faintly of turpentine. There were no depths recorded, only names: St. Jude-in-the-Fens, the Weaver’s Gate, the Foundry of the Third Bell. All sunken districts. But beside each name, penned in indigo ink that had resisted forty years of marsh humidity, was a sequence of ledger accounts and grain certificates. This was not a map of drownings. It was a record of liquidations.

The bell in the belltower struck four. Each chime carried through the iron framework of the archive stacks, setting the dry folio volumes vibrating on their cedar shelves. Mara did not turn around when the floorboards behind her creaked. In this house of dead paper, footsteps were either the night watchman or the settling of timber into mud.

"You should not have unstitched the outer binding," a voice said. It was dry, precise, smelling of tobacco and winter clover.

Mara kept her thumb pinned to the edge of the parchment. "She left it in the drawer with the cadastral surveys of fifty-eight. If she intended it buried, she would have dropped it in the intake pipe."

"She intended it found by someone with the sense to burn it," the voice replied.

She turned slowly. The lantern light caught the wet rim of a felt hat and the silver-chased pommel of an archivist’s cane. Outside, the rain thickened, beating against the leaded glass until the city below dissolved into ribbons of drowned light.';

  -- Insert Stress Test Chapter 1 (Sequence 1.0)
  INSERT INTO public.chapters (id, novel_id, chapter_number, title, content_text, sequence_order, published_at)
  VALUES (
    v_chap1_id,
    v_novel_id,
    1,
    'The Silt Archivist',
    v_long_prose || E'\n\n' || v_long_prose || E'\n\n' || v_long_prose,
    1.0,
    NOW() - INTERVAL '10 days'
  )
  ON CONFLICT (novel_id, chapter_number) DO UPDATE SET
    title = EXCLUDED.title,
    content_text = EXCLUDED.content_text;

  -- Insert Stress Test Chapter 2 (Sequence 2.0)
  INSERT INTO public.chapters (id, novel_id, chapter_number, title, content_text, sequence_order, published_at)
  VALUES (
    v_chap2_id,
    v_novel_id,
    2,
    'The Seventh Weir',
    v_long_prose || E'\n\n' || v_long_prose || E'\n\n' || v_long_prose || E'\n\n' || v_long_prose,
    2.0,
    NOW() - INTERVAL '5 days'
  )
  ON CONFLICT (novel_id, chapter_number) DO UPDATE SET
    title = EXCLUDED.title,
    content_text = EXCLUDED.content_text;
END $$;
