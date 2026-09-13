// ── Draftwell local-first storage service ────────────────────────────────
// All data is scoped to draftwell:{userId}:{key}
// Provides a consistent, typed interface over localStorage.

import type {
  Story, Chapter, SettingsState, LibraryItem, ReadingHistory,
  Bookmark, Comment, Notification, Follow, Rating, StoryStatus
} from './types'

export const OFFLINE_USER_ID = 'offline-device'

export function scopedKey(userId: string, key: string): string {
  return `draftwell:${userId}:${key}`
}

function read<T>(userId: string, key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(scopedKey(userId, key))
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(userId: string, key: string, value: T): void {
  try {
    localStorage.setItem(scopedKey(userId, key), JSON.stringify(value))
  } catch {
    // storage quota exceeded — fail silently
  }
}

// ── Default settings ──────────────────────────────────────────────────────
export const defaultSettings: SettingsState = {
  name: 'Reader',
  role: 'Author',
  theme: 'dark',
  accent: '#d88a2f',
  font: 'serif',
  page: 'classic',
  readerTheme: 'draftwell',
  readerFontSize: 18,
  readerLineHeight: 1.8,
  readerWidth: 'medium',
  notifyAuthorUpdates: true,
  notifyComments: true,
  notifySystem: true,
  profilePublic: true,
}

// ── Settings ──────────────────────────────────────────────────────────────
export function loadSettings(userId: string): SettingsState {
  return read(userId, 'settings', defaultSettings)
}
export function saveSettings(userId: string, settings: SettingsState): void {
  write(userId, 'settings', settings)
}

// ── Stories (user's own creations) ───────────────────────────────────────
export function loadMyStories(userId: string): Story[] {
  return read<Story[]>(userId, 'my-stories', [])
}
export function saveMyStories(userId: string, stories: Story[]): void {
  write(userId, 'my-stories', stories)
}

// ── Library (saved/reading external stories) ─────────────────────────────
export function loadLibrary(userId: string): LibraryItem[] {
  return read<LibraryItem[]>(userId, 'library', [])
}
export function saveLibrary(userId: string, items: LibraryItem[]): void {
  write(userId, 'library', items)
}

// ── Reading history ───────────────────────────────────────────────────────
export function loadHistory(userId: string): ReadingHistory[] {
  return read<ReadingHistory[]>(userId, 'history', [])
}
export function saveHistory(userId: string, history: ReadingHistory[]): void {
  write(userId, 'history', history)
}
export function addHistoryEntry(userId: string, entry: ReadingHistory): void {
  const existing = loadHistory(userId)
  const filtered = existing.filter(
    (h) => !(h.storyId === entry.storyId && h.chapterId === entry.chapterId)
  )
  saveHistory(userId, [entry, ...filtered].slice(0, 200))
}

// ── Bookmarks ─────────────────────────────────────────────────────────────
export function loadBookmarks(userId: string): Bookmark[] {
  return read<Bookmark[]>(userId, 'bookmarks', [])
}
export function saveBookmarks(userId: string, bookmarks: Bookmark[]): void {
  write(userId, 'bookmarks', bookmarks)
}

// ── Comments ──────────────────────────────────────────────────────────────
export function loadComments(userId: string): Comment[] {
  return read<Comment[]>(userId, 'comments', [])
}
export function saveComments(userId: string, comments: Comment[]): void {
  write(userId, 'comments', comments)
}

// ── Notifications ─────────────────────────────────────────────────────────
export function loadNotifications(userId: string): Notification[] {
  return read<Notification[]>(userId, 'notifications', [])
}
export function saveNotifications(userId: string, notifs: Notification[]): void {
  write(userId, 'notifications', notifs)
}

// ── Follows ───────────────────────────────────────────────────────────────
export function loadFollows(userId: string): Follow[] {
  return read<Follow[]>(userId, 'follows', [])
}
export function saveFollows(userId: string, follows: Follow[]): void {
  write(userId, 'follows', follows)
}

// ── Ratings ───────────────────────────────────────────────────────────────
export function loadRatings(userId: string): Rating[] {
  return read<Rating[]>(userId, 'ratings', [])
}
export function saveRatings(userId: string, ratings: Rating[]): void {
  write(userId, 'ratings', ratings)
}

// ── Liked stories ─────────────────────────────────────────────────────────
export function loadLikes(userId: string): string[] {
  return read<string[]>(userId, 'likes', [])
}
export function saveLikes(userId: string, likes: string[]): void {
  write(userId, 'likes', likes)
}

// ── Reading progress ──────────────────────────────────────────────────────
export function loadProgress(userId: string, storyId: string): number {
  return read<number>(userId, `progress:${storyId}`, 0)
}
export function saveProgress(userId: string, storyId: string, chapterIndex: number): void {
  write(userId, `progress:${storyId}`, chapterIndex)
}

// ── Feedback timestamps ───────────────────────────────────────────────────
export function loadFeedbackTimestamp(userId: string, kind: string): number {
  return read<number>(userId, `feedback-${kind}-at`, 0)
}
export function saveFeedbackTimestamp(userId: string, kind: string): void {
  write(userId, `feedback-${kind}-at`, Date.now())
}

// ── First use ─────────────────────────────────────────────────────────────
export function ensureFirstUse(userId: string): number {
  const key = scopedKey(userId, 'first-use')
  const existing = localStorage.getItem(key)
  if (existing) return Number(existing)
  const now = Date.now()
  localStorage.setItem(key, String(now))
  return now
}

// ── Migrate legacy keys ───────────────────────────────────────────────────
// Converts old `draftwell:{userId}:chapters` format to new my-stories format
export function migrateLegacyData(userId: string): void {
  const legacyChaptersKey = scopedKey(userId, 'chapters')
  const legacyChapters = localStorage.getItem(legacyChaptersKey)
  if (!legacyChapters) return

  const existing = loadMyStories(userId)
  if (existing.length > 0) return // already migrated

  try {
    type OldChapter = { id: number; title: string; note: string; body: string; status: string }
    const old = JSON.parse(legacyChapters) as OldChapter[]
    const now = Date.now()
    const story: Story = {
      id: 'migrated-story-1',
      userId,
      title: 'The Shape of Rain',
      author: loadSettings(userId).name,
      description: 'A quiet town remembers how to breathe before the storm arrives.',
      genre: 'Literary',
      tags: ['Literary', 'Mystery'],
      status: 'Draft' as StoryStatus,
      coverColor: '#a95748',
      chapters: old.map((c, i) => ({
        id: `migrated-ch-${c.id}`,
        storyId: 'migrated-story-1',
        number: i + 1,
        title: c.title,
        body: c.body,
        note: c.note,
        status: c.status as import('./types').ChapterStatus,
        wordCount: c.body.trim().split(/\s+/).filter(Boolean).length,
        createdAt: now,
        updatedAt: now,
      })),
      totalWords: old.reduce((acc, c) => acc + c.body.trim().split(/\s+/).filter(Boolean).length, 0),
      isOwn: true,
      createdAt: now,
      updatedAt: now,
    }
    saveMyStories(userId, [story])
  } catch {
    // migration failed — start fresh
  }
}
