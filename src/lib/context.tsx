// ── Draftwell App Context ─────────────────────────────────────────────────
import { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import type {
  Story, Chapter, SettingsState, LibraryItem, ReadingHistory,
  Bookmark, Comment, Notification, Follow, Rating
} from './types'
import {
  defaultSettings, loadSettings, saveSettings,
  loadMyStories, saveMyStories, loadLibrary, saveLibrary,
  loadHistory, saveHistory, addHistoryEntry,
  loadBookmarks, saveBookmarks, loadComments, saveComments,
  loadNotifications, saveNotifications, loadFollows, saveFollows,
  loadRatings, saveRatings, loadLikes, saveLikes,
  loadProgress, saveProgress, migrateLegacyData, OFFLINE_USER_ID
} from './store'
import { DEMO_STORIES } from './demo'

interface AppContextValue {
  // Auth
  userId: string | null
  authenticated: boolean
  setAuthenticated: (v: boolean) => void
  setUserId: (id: string | null) => void

  // Settings
  settings: SettingsState
  updateSettings: (patch: Partial<SettingsState>) => void

  // Navigation
  route: string
  navigate: (path: string) => void

  // Stories (user-owned)
  myStories: Story[]
  saveStory: (story: Story) => void
  deleteStory: (id: string) => void

  // All stories (demo + own)
  allStories: Story[]
  getStory: (id: string) => Story | undefined

  // Library
  library: LibraryItem[]
  isInLibrary: (storyId: string) => boolean
  addToLibrary: (storyId: string) => void
  removeFromLibrary: (storyId: string) => void

  // Progress
  getProgress: (storyId: string) => number
  updateProgress: (storyId: string, chapterIndex: number) => void

  // History
  history: ReadingHistory[]
  addHistory: (entry: ReadingHistory) => void
  clearHistory: () => void

  // Bookmarks
  bookmarks: Bookmark[]
  toggleBookmark: (storyId: string, chapterId: string, chapterNumber: number) => void
  isBookmarked: (storyId: string, chapterId: string) => boolean

  // Comments
  comments: Comment[]
  addComment: (comment: Comment) => void
  deleteComment: (id: string) => void
  likeComment: (id: string) => void

  // Notifications
  notifications: Notification[]
  unreadCount: number
  markAllRead: () => void
  markRead: (id: string) => void
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void

  // Follows
  follows: Follow[]
  isFollowing: (authorName: string) => boolean
  toggleFollow: (authorName: string, authorId?: string) => void

  // Ratings
  getRating: (storyId: string) => number
  rateStory: (storyId: string, value: number) => void

  // Likes
  likes: string[]
  isLiked: (storyId: string) => boolean
  toggleLike: (storyId: string) => void

  // Sync status
  syncStatus: 'saved' | 'saving' | 'offline' | 'synced' | 'error'
  setSyncStatus: (s: AppContextValue['syncStatus']) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ userId, authenticated, setAuthenticated, setUserId, children }: {
  userId: string | null
  authenticated: boolean
  setAuthenticated: (v: boolean) => void
  setUserId: (id: string | null) => void
  children: ReactNode
}) {
  const uid = userId ?? OFFLINE_USER_ID

  // Run migration once on mount
  useEffect(() => { if (userId) migrateLegacyData(userId) }, [userId])

  const [settings, setSettingsState] = useState<SettingsState>(() => loadSettings(uid))
  const [myStories, setMyStories] = useState<Story[]>(() => loadMyStories(uid))
  const [library, setLibrary] = useState<LibraryItem[]>(() => loadLibrary(uid))
  const [history, setHistory] = useState<ReadingHistory[]>(() => loadHistory(uid))
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks(uid))
  const [comments, setComments] = useState<Comment[]>(() => loadComments(uid))
  const [notifications, setNotifications] = useState<Notification[]>(() => loadNotifications(uid))
  const [follows, setFollows] = useState<Follow[]>(() => loadFollows(uid))
  const [ratings, setRatings] = useState<Rating[]>(() => loadRatings(uid))
  const [likes, setLikes] = useState<string[]>(() => loadLikes(uid))
  const [syncStatus, setSyncStatus] = useState<AppContextValue['syncStatus']>('saved')
  const [route, setRoute] = useState(() => {
    const p = window.location.pathname.replace('/Draftwell', '') || '/home'
    return p === '/' ? '/home' : p
  })
  const notifCounter = useRef(0)

  // Re-load when user changes
  useEffect(() => {
    setSettingsState(loadSettings(uid))
    setMyStories(loadMyStories(uid))
    setLibrary(loadLibrary(uid))
    setHistory(loadHistory(uid))
    setBookmarks(loadBookmarks(uid))
    setComments(loadComments(uid))
    setNotifications(loadNotifications(uid))
    setFollows(loadFollows(uid))
    setRatings(loadRatings(uid))
    setLikes(loadLikes(uid))
  }, [uid])

  // Apply theme
  useEffect(() => { document.documentElement.dataset.theme = settings.theme }, [settings.theme])

  // Browser back/forward
  useEffect(() => {
    const handler = () => {
      const p = window.location.pathname.replace('/Draftwell', '') || '/home'
      setRoute(p === '/' ? '/home' : p)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const navigate = useCallback((path: string) => {
    const full = `/Draftwell${path}`
    window.history.pushState({}, '', full)
    setRoute(path)
    window.scrollTo(0, 0)
  }, [])

  const updateSettings = useCallback((patch: Partial<SettingsState>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(uid, next)
      return next
    })
  }, [uid])

  const saveStory = useCallback((story: Story) => {
    setMyStories((prev) => {
      const exists = prev.findIndex((s) => s.id === story.id)
      const next = exists >= 0
        ? prev.map((s) => (s.id === story.id ? story : s))
        : [...prev, story]
      saveMyStories(uid, next)
      return next
    })
  }, [uid])

  const deleteStory = useCallback((id: string) => {
    setMyStories((prev) => {
      const next = prev.filter((s) => s.id !== id)
      saveMyStories(uid, next)
      return next
    })
  }, [uid])

  const allStories = [...DEMO_STORIES, ...myStories]
  const getStory = useCallback((id: string) => allStories.find((s) => s.id === id), [myStories])

  const isInLibrary = useCallback((sid: string) => library.some((l) => l.storyId === sid), [library])
  const addToLibrary = useCallback((sid: string) => {
    setLibrary((prev) => {
      if (prev.some((l) => l.storyId === sid)) return prev
      const next = [...prev, { storyId: sid, addedAt: Date.now(), progress: 0, completed: false }]
      saveLibrary(uid, next)
      return next
    })
  }, [uid])
  const removeFromLibrary = useCallback((sid: string) => {
    setLibrary((prev) => { const next = prev.filter((l) => l.storyId !== sid); saveLibrary(uid, next); return next })
  }, [uid])

  const getProgress = useCallback((sid: string) => loadProgress(uid, sid), [uid])
  const updateProgress = useCallback((sid: string, idx: number) => {
    saveProgress(uid, sid, idx)
    setLibrary((prev) => {
      const next = prev.map((l) => l.storyId === sid ? { ...l, progress: idx } : l)
      saveLibrary(uid, next)
      return next
    })
  }, [uid])

  const addHistory = useCallback((entry: ReadingHistory) => {
    addHistoryEntry(uid, entry)
    setHistory(loadHistory(uid))
  }, [uid])
  const clearHistory = useCallback(() => { saveHistory(uid, []); setHistory([]) }, [uid])

  const toggleBookmark = useCallback((sid: string, cid: string, cnum: number) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.storyId === sid && b.chapterId === cid)
      const next = exists
        ? prev.filter((b) => !(b.storyId === sid && b.chapterId === cid))
        : [...prev, { id: `bm-${Date.now()}`, storyId: sid, chapterId: cid, chapterNumber: cnum, createdAt: Date.now() }]
      saveBookmarks(uid, next)
      return next
    })
  }, [uid])
  const isBookmarked = useCallback((sid: string, cid: string) => bookmarks.some((b) => b.storyId === sid && b.chapterId === cid), [bookmarks])

  const addComment = useCallback((c: Comment) => {
    setComments((prev) => { const next = [c, ...prev]; saveComments(uid, next); return next })
  }, [uid])
  const deleteComment = useCallback((id: string) => {
    setComments((prev) => { const next = prev.filter((c) => c.id !== id); saveComments(uid, next); return next })
  }, [uid])
  const likeComment = useCallback((id: string) => {
    setComments((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, likes: c.likes + 1 } : c)
      saveComments(uid, next)
      return next
    })
  }, [uid])

  const unreadCount = notifications.filter((n) => !n.read).length
  const markAllRead = useCallback(() => {
    setNotifications((prev) => { const next = prev.map((n) => ({ ...n, read: true })); saveNotifications(uid, next); return next })
  }, [uid])
  const markRead = useCallback((id: string) => {
    setNotifications((prev) => { const next = prev.map((n) => n.id === id ? { ...n, read: true } : n); saveNotifications(uid, next); return next })
  }, [uid])
  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const notif: Notification = { ...n, id: `notif-${Date.now()}-${notifCounter.current++}`, createdAt: Date.now(), read: false }
    setNotifications((prev) => { const next = [notif, ...prev].slice(0, 100); saveNotifications(uid, next); return next })
  }, [uid])

  const isFollowing = useCallback((name: string) => follows.some((f) => f.authorName === name), [follows])
  const toggleFollow = useCallback((name: string, authorId = name) => {
    setFollows((prev) => {
      const exists = prev.some((f) => f.authorName === name)
      const next = exists ? prev.filter((f) => f.authorName !== name) : [...prev, { authorId, authorName: name, followedAt: Date.now() }]
      saveFollows(uid, next)
      return next
    })
  }, [uid])

  const getRating = useCallback((sid: string) => ratings.find((r) => r.storyId === sid)?.value ?? 0, [ratings])
  const rateStory = useCallback((sid: string, value: number) => {
    setRatings((prev) => {
      const next = [...prev.filter((r) => r.storyId !== sid), { storyId: sid, value, ratedAt: Date.now() }]
      saveRatings(uid, next)
      return next
    })
  }, [uid])

  const isLiked = useCallback((sid: string) => likes.includes(sid), [likes])
  const toggleLike = useCallback((sid: string) => {
    setLikes((prev) => {
      const next = prev.includes(sid) ? prev.filter((l) => l !== sid) : [...prev, sid]
      saveLikes(uid, next)
      return next
    })
  }, [uid])

  const value: AppContextValue = {
    userId, authenticated, setAuthenticated, setUserId,
    settings, updateSettings,
    route, navigate,
    myStories, saveStory, deleteStory,
    allStories, getStory,
    library, isInLibrary, addToLibrary, removeFromLibrary,
    getProgress, updateProgress,
    history, addHistory, clearHistory,
    bookmarks, toggleBookmark, isBookmarked,
    comments, addComment, deleteComment, likeComment,
    notifications, unreadCount, markAllRead, markRead, addNotification,
    follows, isFollowing, toggleFollow,
    getRating, rateStory,
    likes, isLiked, toggleLike,
    syncStatus, setSyncStatus,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
