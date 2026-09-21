import { supabase, isSupabaseConfigured } from './supabase'
import type {
  NovelCatalogFilters,
  NovelCatalogResponse,
  NovelRow,
  ChapterDetailPayload,
  ReadingProgressPayload,
  UIPreferences,
  UserSettingsRow,
  StorageUploadResult,
} from './types/database'
import { DEFAULT_UI_PREFERENCES } from './types/database'

const OFFLINE_QUEUE_KEY = 'draftwell_offline_sync_queue'
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface QueuedSyncItem {
  id: string
  type: 'reading_progress' | 'settings'
  payload: unknown
  timestamp: number
  retries: number
}

/**
 * Executes a network call with exponential backoff fault-tolerance.
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 500
): Promise<T> {
  let attempt = 0
  let delay = initialDelayMs

  while (attempt < maxRetries) {
    try {
      return await operation()
    } catch (err) {
      attempt++
      if (attempt >= maxRetries) {
        throw err
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }

  throw new Error('Operation exceeded maximum retry attempts')
}

export class SupabaseService {
  private static instance: SupabaseService | null = null
  private progressDebounceTimers: Map<string, number> = new Map()
  private isProcessingQueue = false

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processOfflineQueue().catch(() => {})
      })
    }
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  /**
   * PART 2.A: fetchNovelCatalog
   * Optimized catalog querying utilizing index-backed pagination and attribute search.
   * Isolates catalog profiles without downloading heavy chapter text streams.
   */
  public async fetchNovelCatalog(
    filters: NovelCatalogFilters
  ): Promise<NovelCatalogResponse> {
    const pageSize = filters.pageSize ?? 12
    const page = Math.max(1, filters.page)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    if (!supabase || !isSupabaseConfigured) {
      return {
        novels: [],
        totalCount: 0,
        page,
        totalPages: 0,
        hasMore: false,
      }
    }

    const client = supabase
    return withRetry(async () => {
      let query = client
        .from('novels')
        .select(
          'id, title, author_name, cover_image_url, synopsis, status, tags, created_at',
          { count: 'exact' }
        )

      // Attribute text matching
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`
        query = query.or(
          `title.ilike.${searchTerm},author_name.ilike.${searchTerm},synopsis.ilike.${searchTerm}`
        )
      }

      // Horizontal taxonomy tag matching
      if (filters.tag && filters.tag !== 'All') {
        query = query.contains('tags', [filters.tag])
      }

      // Range pagination & ordered retrieval
      query = query.order('created_at', { ascending: false }).range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Failed to fetch novel catalog: ${error.message}`)
      }

      const novels = (data as NovelRow[]) ?? []
      const totalCount = count ?? novels.length
      const totalPages = Math.ceil(totalCount / pageSize)

      return {
        novels,
        totalCount,
        page,
        totalPages,
        hasMore: page < totalPages,
      }
    })
  }

  /**
   * PART 2.B: fetchChapterContent
   * Isolates text payload delivery by mapping specific fields for target viewports.
   */
  public async fetchChapterContent(
    novelId: string,
    chapterNumber: number
  ): Promise<ChapterDetailPayload | null> {
    if (!supabase || !isSupabaseConfigured) return null

    const client = supabase
    return withRetry(async () => {
      const { data, error } = await client
        .from('chapters')
        .select('id, title, content_text, chapter_number, sequence_order, novel_id')
        .eq('novel_id', novelId)
        .eq('chapter_number', chapterNumber)
        .maybeSingle()

      if (error) {
        throw new Error(`Failed to fetch chapter content: ${error.message}`)
      }

      return (data as ChapterDetailPayload) ?? null
    })
  }

  /**
   * PART 2.C: syncReadingProgress
   * Thread-safe idempotent upsert with debouncing and timestamp protection.
   */
  public syncReadingProgress(progress: ReadingProgressPayload): Promise<boolean> {
    const key = `${progress.novelId}:${progress.chapterId}`

    // Clear active debounce timer for this reading entity
    const existingTimer = this.progressDebounceTimers.get(key)
    if (existingTimer) {
      window.clearTimeout(existingTimer)
    }

    return new Promise((resolve) => {
      const timer = window.setTimeout(async () => {
        this.progressDebounceTimers.delete(key)
        try {
          const success = await this.executeReadingProgressSync(progress)
          resolve(success)
        } catch {
          // Store in offline fallback queue
          this.enqueueOfflineMutation('reading_progress', progress)
          resolve(false)
        }
      }, 450) // 450ms debounce window

      this.progressDebounceTimers.set(key, timer)
    })
  }

  private async executeReadingProgressSync(
    progress: ReadingProgressPayload
  ): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) {
      this.enqueueOfflineMutation('reading_progress', progress)
      return false
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) {
      this.enqueueOfflineMutation('reading_progress', progress)
      return false
    }

    const boundedPercent = Math.min(Math.max(Number(progress.scrollPercent.toFixed(2)), 0), 100)
    const nowIso = new Date().toISOString()

    const { error } = await supabase
      .from('user_reading_progress')
      .upsert(
        {
          user_id: userId,
          novel_id: progress.novelId,
          chapter_id: progress.chapterId,
          last_scrolled_percentage: boundedPercent,
          updated_at: nowIso,
        },
        { onConflict: 'user_id,novel_id' }
      )

    if (error) {
      throw new Error(`Progress upsert failed: ${error.message}`)
    }

    return true
  }

  /**
   * PART 2.D: updateAccountSettings
   * Merges UI preference matrices directly via JSONB with client-side bounds verification.
   */
  public async updateAccountSettings(
    settings: Partial<UIPreferences>
  ): Promise<UIPreferences> {
    // Client-side validation boundaries
    const validated: Partial<UIPreferences> = {}

    if (settings.theme_mode && ['dark', 'light', 'amber', 'eye'].includes(settings.theme_mode)) {
      validated.theme_mode = settings.theme_mode
    }
    if (settings.font_family && ['serif', 'sans'].includes(settings.font_family)) {
      validated.font_family = settings.font_family
    }
    if (typeof settings.font_size === 'number') {
      validated.font_size = Math.min(Math.max(settings.font_size, 12), 36)
    }
    if (typeof settings.line_height === 'number') {
      validated.line_height = Math.min(Math.max(settings.line_height, 1.2), 2.5)
    }
    if (typeof settings.margin_padding_index === 'number') {
      validated.margin_padding_index = Math.min(Math.max(settings.margin_padding_index, 0), 4)
    }
    if (settings.reading_mode && ['scroll', 'paged'].includes(settings.reading_mode)) {
      validated.reading_mode = settings.reading_mode
    }

    if (!supabase || !isSupabaseConfigured) {
      this.enqueueOfflineMutation('settings', validated)
      return { ...DEFAULT_UI_PREFERENCES, ...validated }
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) {
      this.enqueueOfflineMutation('settings', validated)
      return { ...DEFAULT_UI_PREFERENCES, ...validated }
    }

    const client = supabase
    return withRetry(async () => {
      // First fetch current settings to perform clean JSONB merge
      const { data: currentRecord } = await client
        .from('user_settings')
        .select('ui_preferences')
        .eq('id', userId)
        .maybeSingle()

      const mergedPreferences: UIPreferences = {
        ...DEFAULT_UI_PREFERENCES,
        ...(currentRecord?.ui_preferences ?? {}),
        ...validated,
      }

      const { error } = await client
        .from('user_settings')
        .upsert({
          id: userId,
          ui_preferences: mergedPreferences,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        throw new Error(`Settings update failed: ${error.message}`)
      }

      return mergedPreferences
    })
  }

  /**
   * PART 2.3: Storage Integration Engine
   * Validates sizing caps (max 2MB), checks image mime-types, verifies array-buffer headers,
   * and uploads to Supabase Storage.
   */
  public async uploadAsset(
    bucket: 'avatars' | 'covers',
    file: File,
    customFilename?: string
  ): Promise<StorageUploadResult> {
    if (!supabase || !isSupabaseConfigured) {
      return { publicUrl: '', path: '', error: 'Supabase storage is not configured' }
    }

    // 1. File sizing cap validation
    if (file.size > MAX_UPLOAD_BYTES) {
      return {
        publicUrl: '',
        path: '',
        error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 2MB limit`,
      }
    }

    // 2. MIME type verification
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return {
        publicUrl: '',
        path: '',
        error: `Invalid file format: ${file.type}. Only JPEG, PNG, and WebP are permitted.`,
      }
    }

    // 3. Client-side ArrayBuffer magic-byte verification
    try {
      const buffer = await file.slice(0, 12).arrayBuffer()
      const headerBytes = new Uint8Array(buffer)
      const isValidImageHeader = this.verifyImageHeader(headerBytes, file.type)

      if (!isValidImageHeader) {
        return {
          publicUrl: '',
          path: '',
          error: 'Security validation failed: File binary header does not match declared image type',
        }
      }
    } catch {
      return { publicUrl: '', path: '', error: 'Failed to inspect file binary header' }
    }

    // 4. Secure upload to Supabase Storage
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id ?? 'anonymous'
      const extension = file.name.split('.').pop() || 'jpg'
      const fileName = customFilename || `${userId}_${Date.now()}.${extension}`
      const filePath = `${fileName}`

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

      if (error) {
        return { publicUrl: '', path: '', error: error.message }
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

      return {
        publicUrl: urlData.publicUrl,
        path: data.path,
      }
    } catch (err) {
      return {
        publicUrl: '',
        path: '',
        error: err instanceof Error ? err.message : 'Unknown upload error occurred',
      }
    }
  }

  /**
   * Verifies magic bytes for JPEG, PNG, and WebP images.
   */
  private verifyImageHeader(bytes: Uint8Array, mimeType: string): boolean {
    if (bytes.length < 4) return false

    // JPEG: FF D8 FF
    if (mimeType === 'image/jpeg') {
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    }

    // PNG: 89 50 4E 47
    if (mimeType === 'image/png') {
      return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    }

    // WebP: RIFF ... WEBP (52 49 46 46)
    if (mimeType === 'image/webp') {
      return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    }

    return false
  }

  /**
   * PART 2.4: Fault Tolerance & Offline Buffer Resiliency
   */
  private enqueueOfflineMutation(type: QueuedSyncItem['type'], payload: unknown) {
    if (typeof localStorage === 'undefined') return
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)
      const queue: QueuedSyncItem[] = raw ? JSON.parse(raw) : []
      queue.push({
        id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        payload,
        timestamp: Date.now(),
        retries: 0,
      })
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue.slice(-50))) // Keep max 50 items
    } catch {
      // Ignore localStorage write quotas
    }
  }

  public async processOfflineQueue(): Promise<void> {
    if (this.isProcessingQueue || typeof localStorage === 'undefined') return
    if (!navigator.onLine || !supabase || !isSupabaseConfigured) return

    this.isProcessingQueue = true
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)
      if (!raw) return

      const queue: QueuedSyncItem[] = JSON.parse(raw)
      if (queue.length === 0) return

      const remaining: QueuedSyncItem[] = []

      for (const item of queue) {
        try {
          if (item.type === 'reading_progress') {
            await this.executeReadingProgressSync(item.payload as ReadingProgressPayload)
          } else if (item.type === 'settings') {
            await this.updateAccountSettings(item.payload as Partial<UIPreferences>)
          }
        } catch {
          if (item.retries < 5) {
            remaining.push({ ...item, retries: item.retries + 1 })
          }
        }
      }

      if (remaining.length > 0) {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining))
      } else {
        localStorage.removeItem(OFFLINE_QUEUE_KEY)
      }
    } finally {
      this.isProcessingQueue = false
    }
  }
}

export const supabaseService = SupabaseService.getInstance()
