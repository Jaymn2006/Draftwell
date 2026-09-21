// ── Enterprise Database TypeScript Mapping (Supabase / PostgreSQL) ─────────

export type NovelStatus = 'ongoing' | 'completed' | 'hiatus'

export interface UIPreferences {
  theme_mode: 'dark' | 'light' | 'amber' | 'eye'
  font_family: 'serif' | 'sans'
  font_size: number
  line_height: number
  margin_padding_index: number
  reading_mode: 'scroll' | 'paged'
}

export const DEFAULT_UI_PREFERENCES: UIPreferences = {
  theme_mode: 'dark',
  font_family: 'serif',
  font_size: 16,
  line_height: 1.6,
  margin_padding_index: 2,
  reading_mode: 'scroll',
}

export interface ProfileRow {
  id: string // UUID referencing auth.users
  username: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserSettingsRow {
  id: string // UUID referencing profiles.id
  ui_preferences: UIPreferences
  updated_at: string
}

export interface NovelRow {
  id: string // UUID
  title: string
  author_name: string
  cover_image_url: string | null
  synopsis: string | null
  status: NovelStatus
  tags: string[]
  created_at: string
}

export interface ChapterRow {
  id: string // UUID
  novel_id: string
  chapter_number: number
  title: string
  content_text: string
  sequence_order: number
  published_at: string | null
}

export interface UserReadingProgressRow {
  user_id: string
  novel_id: string
  chapter_id: string
  last_scrolled_percentage: number
  updated_at: string
}

export interface PreservedFeaturesRow {
  user_id: string
  feature_flags: Record<string, unknown>
}

// ── Service request/response DTOs ─────────────────────────────────────────

export interface NovelCatalogFilters {
  tag?: string
  search?: string
  page: number
  pageSize?: number
}

export interface NovelCatalogResponse {
  novels: NovelRow[]
  totalCount: number
  page: number
  totalPages: number
  hasMore: boolean
}

export interface ReadingProgressPayload {
  novelId: string
  chapterId: string
  scrollPercent: number
}

export interface StorageUploadResult {
  publicUrl: string
  path: string
  error?: string
}

export interface ChapterDetailPayload {
  id: string
  title: string
  content_text: string
  chapter_number: number
  sequence_order: number
  novel_id: string
}
