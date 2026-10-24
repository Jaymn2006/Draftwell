-- Production Relational Schema for Draftwell Serialized Engine
-- Merges existing Draftwell tables with high-retention novel network features
-- Execute inside Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'novel_status_enum') THEN
    CREATE TYPE public.novel_status_enum AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  avatar_url TEXT,
  coins_held INT DEFAULT 100,
  star_balance INT DEFAULT 0,
  is_creator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.novels (
  id BIGSERIAL PRIMARY KEY,
  creator_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  synopsis TEXT,
  cover_image_url TEXT,
  genre VARCHAR(64) DEFAULT 'Fantasy',
  status VARCHAR(32) DEFAULT 'ONGOING',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id BIGSERIAL PRIMARY KEY,
  novel_id BIGINT REFERENCES public.novels(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  coin_cost INT DEFAULT 10,
  star_cost INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(novel_id, chapter_number)
);

CREATE TABLE IF NOT EXISTS public.user_bookshelves (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  novel_id BIGINT REFERENCES public.novels(id) ON DELETE CASCADE,
  last_read_chapter_number INT DEFAULT 1,
  bookmarked_paragraph_index INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, novel_id)
);

CREATE TABLE IF NOT EXISTS public.chapter_unlocks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  chapter_id BIGINT REFERENCES public.chapters(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS public.chapter_star_unlocks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  chapter_id BIGINT REFERENCES public.chapters(id) ON DELETE CASCADE,
  stars_spent INT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS public.content_reviews (
  id BIGSERIAL PRIMARY KEY,
  chapter_id BIGINT REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  review_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.author_earnings (
  author_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_stars_earned INT DEFAULT 0,
  withdrawable_sol NUMERIC(16, 8) DEFAULT 0.0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.payment_intents (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  payment_method VARCHAR(32) NOT NULL,
  transaction_reference VARCHAR(128) UNIQUE NOT NULL,
  fiat_amount_usd NUMERIC(10, 2) NOT NULL,
  stars_credited INT NOT NULL,
  status VARCHAR(32) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_novels_main_lookup ON public.novels(genre, status);
CREATE INDEX IF NOT EXISTS idx_chapters_ordered_seek ON public.chapters(novel_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_bookshelf_sync ON public.user_bookshelves(user_id);
CREATE INDEX IF NOT EXISTS idx_intents_ref ON public.payment_intents(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_star_unlocks ON public.chapter_star_unlocks(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_novels_title_trgm ON public.novels USING gin (title gin_trgm_ops);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookshelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_star_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access For Novels" ON public.novels FOR SELECT USING (true);
CREATE POLICY "Public Read Access For Chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Users Can Manage Their Own Bookshelves" ON public.user_bookshelves FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users Can Edit Their Own Profiles" ON public.user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can track their own payments" ON public.payment_intents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can verify their star unlocks" ON public.chapter_star_unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own unlocks" ON public.chapter_unlocks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authors can view own earnings" ON public.author_earnings FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Public can read reviews" ON public.content_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert reviews" ON public.content_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can create novels" ON public.novels FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own novels" ON public.novels FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can insert chapters" ON public.chapters FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.novels n WHERE n.id = novel_id AND n.creator_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_username VARCHAR(100);
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(COALESCE(NEW.email, 'user'), '@', 1) || '_' || substr(md5(random()::text), 1, 4)
  );

  INSERT INTO public.user_profiles (id, username, avatar_url, coins_held, star_balance)
  VALUES (NEW.id, v_username, NEW.raw_user_meta_data->>'avatar_url', 100, 0)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();
