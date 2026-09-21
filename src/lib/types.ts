// ── Draftwell shared types ────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'amber' | 'eye'
export type Font = 'serif' | 'sans'
export type ReaderTheme = 'draftwell' | 'paper' | 'midnight' | 'sepia' | 'eink'
export type StoryStatus = 'Draft' | 'Ongoing' | 'Completed' | 'Archived'
export type ChapterStatus = 'Outline' | 'Notes' | 'Draft' | 'Published'
export type SyncStatus = 'saved' | 'saving' | 'offline' | 'syncing' | 'synced' | 'error'
export type FeedbackKind = 'first-minute' | 'monthly' | 'quarterly'
export type AuthMode = 'sign-in' | 'sign-up' | 'forgot'

export interface Chapter {
  id: string
  storyId: string
  number: number
  title: string
  body: string
  note: string
  status: ChapterStatus
  wordCount: number
  publishedAt?: number
  createdAt: number
  updatedAt: number
}

export interface Story {
  id: string
  userId: string
  title: string
  author: string
  description: string
  genre: string
  tags: string[]
  status: StoryStatus
  coverColor: string
  coverGradient?: string
  coverImage?: string
  chapters: Chapter[]
  totalWords: number
  createdAt: number
  updatedAt: number
  isOwn: boolean // true = user's own creation
  reads?: number
  rating?: number
  ratingCount?: number
}

export interface SettingsState {
  name: string
  role: string
  theme: Theme
  accent: string
  font: Font
  page: 'classic' | 'modern'
  readerTheme: ReaderTheme
  readerFontSize: number
  readerLineHeight: number
  readerWidth: 'narrow' | 'medium' | 'wide'
  notifyAuthorUpdates: boolean
  notifyComments: boolean
  notifySystem: boolean
  profilePublic: boolean
}

export interface LibraryItem {
  storyId: string
  addedAt: number
  progress: number // chapter index
  completed: boolean
}

export interface ReadingHistory {
  storyId: string
  chapterId: string
  chapterNumber: number
  readAt: number
  progress: number
}

export interface Bookmark {
  id: string
  storyId: string
  chapterId: string
  chapterNumber: number
  note?: string
  createdAt: number
}

export interface Comment {
  id: string
  storyId: string
  chapterId?: string
  userId: string
  authorName: string
  body: string
  likes: number
  createdAt: number
  replies: Comment[]
  pinned?: boolean
}

export interface Notification {
  id: string
  type: 'chapter' | 'comment' | 'reply' | 'follow' | 'system' | 'achievement'
  title: string
  body: string
  read: boolean
  storyId?: string
  createdAt: number
}

export interface Follow {
  authorId: string
  authorName: string
  followedAt: number
}

export interface Rating {
  storyId: string
  value: number
  ratedAt: number
}

export interface Toast {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  message: string
  duration?: number
}

// ── Speech recognition types ──────────────────────────────────────────────
export interface SpeechRecognitionResult {
  [key: number]: { transcript: string }
  isFinal: boolean
  length: number
}
export interface SpeechRecognitionResultList {
  [key: number]: SpeechRecognitionResult
  length: number
}
export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}
export interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: () => void
  onend: () => void
  onerror: (event?: { error?: string }) => void
  onresult: (event: SpeechRecognitionEvent) => void
  start: () => void
  stop: () => void
}
export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance
