// ── Draftwell Product Shell — full platform (Phases B + C + D + E) ────────
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Bell, Bookmark, BookMarked, BookOpen, Check,
  ChevronRight, Compass, FileText, Filter, Flame, Globe, Heart,
  Home, ImagePlus, Library, Mic, MicOff, MoreHorizontal, PenLine,
  Plus, Search, Settings, Share2, Sparkles, Star, Trophy, Trash2,
  Upload, UserCircle, Users, WandSparkles, X, Maximize2, Minimize2,
  AlignJustify, Type, Moon, Sun, Leaf, Zap, BookCopy, Clock,
  BarChart2, MessageCircle, Bell as BellIcon, Eye, ChevronDown,
  CheckCircle, LogOut, HelpCircle, PanelLeft, GraduationCap, Download,
  Palette, Menu, ThumbsUp, ThumbsDown, MessageSquare
} from 'lucide-react'
import { useApp } from './lib/context'
import { useToast } from './lib/toast'
import { submitFeedback } from './lib/cloud'
import { DEMO_AUTHORS, DEMO_STORIES, GENRES } from './lib/demo'
import { MASTERCLASSES } from './lib/masterclasses'
import { MobileDrawer } from './components/MobileDrawer'
import { BookPreviewView } from './components/BookPreview'
import { MasterclassesView } from './components/MasterclassesView'
import { MiraCraftCoach } from './components/MiraCraftCoach'
import { LazyCover, LazyNovelCover } from './components/LazyImage'
import { ApplicationShell } from './components/ApplicationShell'
import { fetchSampleCoversFromBoard, pinterestCoverService } from './lib/pinterestCoverService'
import { getCoverForBook } from './lib/bookCovers'
import { supabase } from './lib/supabase'
import { logOutFirebase } from './lib/firebase'
import type { Chapter, Comment, ReaderTheme, Story, StoryStatus, Theme } from './lib/types'

// ── Brand mark ────────────────────────────────────────────────────────────
function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <span className="brand-mark" aria-label="Draftwell" style={{ width: size, height: size }}>
      <img src={`${import.meta.env.BASE_URL}Draftwell-logo.png.png`} alt="Draftwell"
        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('brand-mark--fallback') }} />
      <span className="brand-mark__letter" aria-hidden>D</span>
    </span>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────
function wc(text: string) { return text.trim().split(/\s+/).filter(Boolean).length }
function readTime(words: number) { return Math.max(1, Math.round(words / 200)) }
function slug(title: string) { return title.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
function timeAgo(ms: number) {
  const diff = Date.now() - ms
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return new Date(ms).toLocaleDateString()
}

// ── Cover component ───────────────────────────────────────────────────────
function StoryCover({ story, onClick, size = 'md' }: { story: Story; onClick?: () => void; size?: 'sm' | 'md' | 'lg' }) {
  const resolvedCover = story.coverImage || getCoverForBook(story.title) || getCoverForBook(story.id)
  return (
    <LazyNovelCover
      title={story.title}
      author={story.author}
      coverImage={resolvedCover}
      coverColor={story.coverColor}
      coverGradient={story.coverGradient}
      size={size}
      onClick={onClick}
    />
  )
}

// ── Rating stars ──────────────────────────────────────────────────────────
function StarRating({ value, max = 5, onChange }: { value: number; max?: number; onChange?: (v: number) => void }) {
  const [hov, setHov] = useState(0)
  return (
    <div className="star-rating" role={onChange ? 'group' : undefined} aria-label={`Rating: ${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button"
          className={`star${(hov || value) >= n ? ' star--filled' : ''}`}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHov(n)}
          onMouseLeave={() => onChange && setHov(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          tabIndex={onChange ? 0 : -1}
          style={{ cursor: onChange ? 'pointer' : 'default' }}
        >★</button>
      ))}
    </div>
  )
}

// ── Tag pill ──────────────────────────────────────────────────────────────
function Tag({ label, onClick }: { label: string; onClick?: () => void }) {
  return onClick
    ? <button className="tag" onClick={onClick}>{label}</button>
    : <span className="tag">{label}</span>
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ icon: Icon = BookOpen, title, text, action, onAction }: {
  icon?: React.ElementType; title: string; text: string; action?: string; onAction?: () => void
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><Icon size={28} /></div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__text">{text}</p>
      {action && onAction && <button className="btn btn--primary" onClick={onAction}>{action}</button>}
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = '16px', radius = '4px' }: { w?: string; h?: string; radius?: string }) {
  return <span className="skeleton" style={{ width: w, height: h, borderRadius: radius }} />
}

// ── Confirmation modal ────────────────────────────────────────────────────
function ConfirmModal({ title, body, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }: {
  title: string; body: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onCancel])
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="confirm-title">
        <h2 id="confirm-title" className="confirm-modal__title">{title}</h2>
        <p className="confirm-modal__body">{body}</p>
        <div className="confirm-modal__actions">
          <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PRODUCT SHELL — top-level layout
// ══════════════════════════════════════════════════════════════════════════
export function ProductShell() {
  const app = useApp()
  const { route, navigate, settings, unreadCount } = app

  const isReader = route.startsWith('/read/')
  if (isReader) return <ReaderPage />

  function cycleTheme() {
    const sequence: Theme[] = ['dark', 'light', 'amber', 'eye']
    const nextIdx = (sequence.indexOf(settings.theme) + 1) % sequence.length
    app.updateSettings({ theme: sequence[nextIdx] })
  }

  function handleSignOut() {
    if (supabase) void supabase.auth.signOut()
    void logOutFirebase()
    localStorage.removeItem('draftwell-offline-mode')
    app.setAuthenticated(false)
    app.setUserId(null)
  }

  return (
    <ApplicationShell
      settings={settings}
      currentRoute={route}
      unreadCount={unreadCount}
      libraryCount={app.library.length}
      followsCount={app.follows.length}
      onNavigate={navigate}
      onCycleTheme={cycleTheme}
      onSignOut={handleSignOut}
    >
      {route === '/home' && <HomePage />}
      {(route === '/discover' || route.startsWith('/discover?') || route.startsWith('/genre/')) && <DiscoverPage />}
      {route === '/rankings' && <RankingsPage />}
      {(route === '/search' || route.startsWith('/search?')) && <SearchPage />}
      {route === '/library' && <LibraryPage />}
      {route === '/history' && <HistoryPage />}
      {route === '/following' && <FollowingPage />}
      {route.startsWith('/story/') && <StoryDetailPage />}
      {route.startsWith('/author/') && <AuthorPage />}
      {route === '/notifications' && <NotificationsPage />}
      {route === '/profile' && <ProfilePage />}
      {route.startsWith('/settings') && <SettingsPage />}
      {route === '/help' && <HelpPage />}
      {route.startsWith('/studio') && <StudioShell />}
      {!route.match(/^\/(home|discover|rankings|search|library|history|following|story|author|notifications|profile|settings|help|studio|read)/) && <NotFoundPage />}
    </ApplicationShell>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════════════════════
function HomePage() {
  const { navigate, allStories, isInLibrary, addToLibrary, removeFromLibrary, library, history } = useApp()
  const { success } = useToast()

  const featured = allStories.find((s) => s.id === 'demo-1') ?? allStories[0]
  // Avoid repeating the featured story in trending and new releases
  const otherStories = allStories.filter((s) => s.id !== featured?.id)
  const trending = [...otherStories].sort((a, b) => (b.reads ?? 0) - (a.reads ?? 0)).slice(0, 4)
  const newReleases = [...otherStories].filter((s) => !trending.some((t) => t.id === s.id)).slice(0, 4)
  const continueReading = library.filter((l) => l.progress > 0 && !l.completed)
    .map((l) => allStories.find((s) => s.id === l.storyId))
    .filter(Boolean) as Story[]

  function handleLibraryToggle(s: Story) {
    if (isInLibrary(s.id)) { removeFromLibrary(s.id); success(`Removed from library`) }
    else { addToLibrary(s.id); success(`Added to your library`) }
  }

  return (
    <div className="page home-page">
      {/* Hero */}
      <section className="hero" style={{ '--hero-bg': featured.coverGradient ?? featured.coverColor } as React.CSSProperties}>
        <div className="hero__glow" />
        <div className="hero__content">
          <span className="eyebrow">FEATURED STORY</span>
          <h1 className="hero__title">{featured.title}</h1>
          <p className="hero__author">by {featured.author}</p>
          <div className="hero__meta">
            <Tag label={featured.genre} />
            <span className="hero__stat"><Star size={13} /> {featured.rating?.toFixed(1)}</span>
            <span className="hero__stat"><BookOpen size={13} /> {featured.chapters.length} chapters</span>
            <span className={`status-badge status-badge--${featured.status.toLowerCase()}`}>{featured.status}</span>
          </div>
          <p className="hero__desc">{featured.description}</p>
          <div className="hero__actions">
            <button className="btn btn--primary btn--lg" onClick={() => navigate(`/read/${featured.id}/0`)}>
              <BookOpen size={16} /> Start Reading
            </button>
            <button className="btn btn--ghost btn--lg" onClick={() => navigate(`/story/${featured.id}`)}>
              View Details
            </button>
            <button className={`btn btn--icon-only ${isInLibrary(featured.id) ? 'btn--saved' : 'btn--ghost'}`}
              aria-label={isInLibrary(featured.id) ? 'Remove from library' : 'Add to library'}
              onClick={() => handleLibraryToggle(featured)}>
              <Bookmark size={18} />
            </button>
          </div>
        </div>
        <div className="hero__cover">
          <StoryCover story={featured} size="lg" onClick={() => navigate(`/story/${featured.id}`)} />
        </div>
      </section>

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <section className="home-section">
          <div className="section-head">
            <h2>Continue Reading</h2>
            <button className="section-head__link" onClick={() => navigate('/library')}>Your library <ChevronRight size={14} /></button>
          </div>
          <div className="card-row">
            {continueReading.slice(0, 4).map((s) => {
              const item = library.find((l) => l.storyId === s.id)!
              const ch = s.chapters[item.progress]
              return (
                <article key={s.id} className="continue-card" onClick={() => navigate(`/read/${s.id}/${item.progress}`)}>
                  <StoryCover story={s} size="sm" />
                  <div className="continue-card__body">
                    <h3>{s.title}</h3>
                    <p>Chapter {item.progress + 1}{ch ? `: ${ch.title}` : ''}</p>
                    <div className="progress-bar"><span style={{ width: `${Math.min(100, ((item.progress + 1) / s.chapters.length) * 100)}%` }} /></div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* Trending */}
      <section className="home-section">
        <div className="section-head">
          <h2><Flame size={18} /> Trending Now</h2>
          <button className="section-head__link" onClick={() => navigate('/rankings')}>See rankings <ChevronRight size={14} /></button>
        </div>
        <div className="work-grid">
          {trending.map((s) => <WorkCard key={s.id} story={s} onLibraryToggle={handleLibraryToggle} />)}
        </div>
      </section>

      {/* New Releases */}
      <section className="home-section">
        <div className="section-head">
          <h2>New Releases</h2>
          <button className="section-head__link" onClick={() => navigate('/discover')}>Discover more <ChevronRight size={14} /></button>
        </div>
        <div className="work-grid">
          {newReleases.map((s) => <WorkCard key={s.id} story={s} onLibraryToggle={handleLibraryToggle} />)}
        </div>
      </section>

      {/* Genres */}
      <section className="home-section">
        <div className="section-head"><h2>Browse by Genre</h2></div>
        <div className="genre-grid">
          {GENRES.filter((g) => g !== 'All').map((g) => (
            <button key={g} className="genre-tile" onClick={() => navigate(`/genre/${slug(g)}`)}>
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Authors */}
      <section className="home-section">
        <div className="section-head"><h2>Popular Authors</h2></div>
        <div className="author-row">
          {DEMO_AUTHORS.slice(0, 4).map((a) => <AuthorCard key={a.id} author={a} />)}
        </div>
      </section>
    </div>
  )
}

// ── Work card ─────────────────────────────────────────────────────────────
function WorkCard({ story: s, onLibraryToggle }: { story: Story; onLibraryToggle: (s: Story) => void }) {
  const { navigate, isInLibrary } = useApp()
  return (
    <article className="work-card">
      <StoryCover story={s} size="md" onClick={() => navigate(`/story/${s.id}`)} />
      <div className="work-card__body">
        <div className="work-card__meta">
          <span className="tag tag--sm">{s.genre}</span>
          <span className={`status-badge status-badge--${s.status.toLowerCase()}`}>{s.status}</span>
        </div>
        <h3 className="work-card__title" onClick={() => navigate(`/story/${s.id}`)}>{s.title}</h3>
        <p className="work-card__author">by {s.author}</p>
        <p className="work-card__desc">{s.description}</p>
        <div className="work-card__footer">
          <span className="work-card__stat"><Star size={11} />{s.rating?.toFixed(1) ?? '—'}</span>
          <span className="work-card__stat"><BookOpen size={11} />{s.chapters.length} ch</span>
          {s.reads && <span className="work-card__stat"><Eye size={11} />{(s.reads / 1000).toFixed(1)}k</span>}
          <div className="work-card__actions">
            <button className="btn btn--xs btn--primary" onClick={() => navigate(`/read/${s.id}/0`)}>Read</button>
            <button className={`btn btn--xs ${isInLibrary(s.id) ? 'btn--saved' : 'btn--ghost'}`}
              aria-label={isInLibrary(s.id) ? 'Saved' : 'Save'}
              onClick={() => onLibraryToggle(s)}>
              <Bookmark size={12} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Author card ───────────────────────────────────────────────────────────
function AuthorCard({ author }: { author: typeof DEMO_AUTHORS[0] }) {
  const { navigate, isFollowing, toggleFollow } = useApp()
  const { success } = useToast()
  return (
    <article className="author-card">
      <div className="avatar avatar--lg">{author.name.slice(0, 2).toUpperCase()}</div>
      <h3 className="author-card__name" onClick={() => navigate(`/author/${slug(author.name)}`)}>{author.name}</h3>
      <p className="author-card__genre">{author.genre}</p>
      <p className="author-card__followers">{author.followers.toLocaleString()} followers</p>
      <button className={`btn btn--sm ${isFollowing(author.name) ? 'btn--following' : 'btn--primary'}`}
        onClick={() => { toggleFollow(author.name, author.id); success(isFollowing(author.name) ? `Unfollowed ${author.name}` : `Following ${author.name}`) }}>
        {isFollowing(author.name) ? <><Check size={13} /> Following</> : <>+ Follow</>}
      </button>
    </article>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// DISCOVER PAGE
// ══════════════════════════════════════════════════════════════════════════
function DiscoverPage() {
  const { allStories, navigate, isInLibrary, addToLibrary, removeFromLibrary, route } = useApp()
  const { success } = useToast()
  const [genre, setGenre] = useState(() => {
    const m = route.match(/\/genre\/(.+)/)
    if (m) return m[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return 'All'
  })
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState<'trending' | 'newest' | 'rating' | 'reads'>('trending')
  const [query, setQuery] = useState('')
  const [pinterestCovers, setPinterestCovers] = useState<string[]>([])
  const [coversLoading, setCoversLoading] = useState(false)
  const [coverSource, setCoverSource] = useState<'pinterest' | 'cdn-proxy' | 'fallback'>('fallback')

  const loadDiscoveryCovers = useCallback(async (force = false) => {
    setCoversLoading(true)
    try {
      const covers = await fetchSampleCoversFromBoard('sample-webnovel-covers', {
        width: 400,
        height: 600,
        limit: 12,
        forceRefresh: force,
      })
      setPinterestCovers(covers)
      if (pinterestCoverService.isOffline()) {
        setCoverSource('fallback')
      } else if (pinterestCoverService.isMediaCdnEnabled()) {
        setCoverSource('cdn-proxy')
      } else if (pinterestCoverService.getAccessToken()) {
        setCoverSource('pinterest')
      } else {
        setCoverSource('fallback')
      }
    } catch (err) {
      console.warn('Novel discovery shelf cover boundary caught:', err)
      setPinterestCovers(pinterestCoverService.getLocalPlaceholders(6))
      setCoverSource('fallback')
    } finally {
      setCoversLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDiscoveryCovers()
  }, [loadDiscoveryCovers])

  const filtered = useMemo(() => {
    let list = allStories.filter((s) => !s.isOwn)
    if (genre !== 'All') list = list.filter((s) => s.genre === genre || s.tags.includes(genre))
    if (status !== 'All') list = list.filter((s) => s.status === status)
    if (query) list = list.filter((s) => `${s.title} ${s.author} ${s.description} ${s.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    if (sort === 'trending') list = [...list].sort((a, b) => (b.reads ?? 0) - (a.reads ?? 0))
    if (sort === 'newest') list = [...list].sort((a, b) => b.createdAt - a.createdAt)
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    if (sort === 'reads') list = [...list].sort((a, b) => (b.reads ?? 0) - (a.reads ?? 0))
    return list
  }, [allStories, genre, status, sort, query])

  const storiesWithCovers = useMemo(() => {
    return filtered.map((s, idx) => {
      const assigned = s.coverImage || getCoverForBook(s.title) || getCoverForBook(s.id)
      if (assigned) {
        return {
          ...s,
          coverImage: assigned,
        }
      }
      if (pinterestCovers.length > 0) {
        return {
          ...s,
          coverImage: pinterestCovers[idx % pinterestCovers.length],
        }
      }
      return s
    })
  }, [filtered, pinterestCovers])

  function handleLibraryToggle(s: Story) {
    if (isInLibrary(s.id)) { removeFromLibrary(s.id); success('Removed from library') }
    else { addToLibrary(s.id); success('Added to your library') }
  }

  return (
    <div className="page discover-page">
      <div className="page-head">
        <h1>Discover</h1>
      </div>

      {/* Pinterest Inspiration Shelf Status & Sync Controller */}
      <div className="discovery-shelf-banner" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '10px 14px',
        marginBottom: '14px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        background: 'var(--card-bg, rgba(255,255,255,0.03))',
        fontSize: '12px',
        color: 'var(--muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Novel Discovery Shelf:</span>
          <span>
            {coverSource === 'cdn-proxy'
              ? '⚡ Cloudinary WebP Edge Proxy'
              : coverSource === 'pinterest'
              ? '🎨 Pinterest API v5 Pins'
              : '🛡️ Local Geometric Zero-Reflow Placeholders'}
          </span>
        </div>
        <button
          className="btn btn--xs btn--ghost"
          onClick={() => {
            loadDiscoveryCovers(true)
            success('Refreshing Pinterest inspiration covers…')
          }}
          disabled={coversLoading}
          title="Refresh board cover pins"
        >
          {coversLoading ? 'Syncing…' : 'Sync Board Covers'}
        </button>
      </div>

      <div className="discover-filters">
        <div className="filter-group">
          <label htmlFor="filter-search" className="sr-only">Search</label>
          <div className="search-input">
            <Search size={14} />
            <input id="filter-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles, authors, tags…" />
            {query && <button className="search-input__clear" onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button>}
          </div>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-genre" className="sr-only">Genre</label>
          <select id="filter-genre" value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Filter by genre">
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-status" className="sr-only">Status</label>
          <select id="filter-status" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            {['All', 'Ongoing', 'Completed', 'Draft'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-sort" className="sr-only">Sort by</label>
          <select id="filter-sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort by">
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="rating">Top Rated</option>
            <option value="reads">Most Read</option>
          </select>
        </div>
        {(genre !== 'All' || status !== 'All' || query) && (
          <button className="btn btn--ghost btn--sm" onClick={() => { setGenre('All'); setStatus('All'); setQuery('') }}>
            <X size={13} /> Clear filters
          </button>
        )}
      </div>
      <p className="result-count">{filtered.length} {filtered.length === 1 ? 'story' : 'stories'}{query ? ` matching "${query}"` : ''}</p>
      {filtered.length === 0
        ? <EmptyState icon={Search} title="No stories found" text="Try adjusting your filters or search terms." action="Clear all" onAction={() => { setGenre('All'); setStatus('All'); setQuery('') }} />
        : <div className="work-grid work-grid--discover">{storiesWithCovers.map((s) => <WorkCard key={s.id} story={s} onLibraryToggle={handleLibraryToggle} />)}</div>
      }
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// RANKINGS PAGE
// ══════════════════════════════════════════════════════════════════════════
function RankingsPage() {
  const { allStories, navigate } = useApp()
  const [tab, setTab] = useState<'trending' | 'rating' | 'new' | 'completed'>('trending')
  const ranked = useMemo(() => {
    const base = allStories.filter((s) => !s.isOwn)
    if (tab === 'trending') return [...base].sort((a, b) => (b.reads ?? 0) - (a.reads ?? 0))
    if (tab === 'rating') return [...base].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    if (tab === 'new') return [...base].sort((a, b) => b.createdAt - a.createdAt)
    return base.filter((s) => s.status === 'Completed').sort((a, b) => (b.reads ?? 0) - (a.reads ?? 0))
  }, [allStories, tab])

  return (
    <div className="page rankings-page">
      <div className="page-head"><h1>Rankings</h1></div>
      <div className="tab-row">
        {([['trending', 'Trending'], ['rating', 'Top Rated'], ['new', 'New'], ['completed', 'Completed']] as const).map(([k, l]) => (
          <button key={k} className={`tab${tab === k ? ' tab--active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="ranking-list">
        {ranked.map((s, i) => (
          <button key={s.id} className="ranking-item" onClick={() => navigate(`/story/${s.id}`)}>
            <span className={`rank-num${i < 3 ? ' rank-num--top' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
            <StoryCover story={s} size="sm" />
            <div className="ranking-item__body">
              <h3>{s.title}</h3>
              <p>by {s.author} · {s.genre}</p>
              <div className="ranking-item__stats">
                <span><Star size={11} />{s.rating?.toFixed(1)}</span>
                <span><Eye size={11} />{((s.reads ?? 0) / 1000).toFixed(1)}k</span>
                <span><BookOpen size={11} />{s.chapters.length} ch</span>
              </div>
            </div>
            <ChevronRight size={16} className="ranking-item__chevron" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// SEARCH PAGE
// ══════════════════════════════════════════════════════════════════════════
function SearchPage() {
  const { allStories, navigate, isInLibrary, addToLibrary, removeFromLibrary, route } = useApp()
  const { success } = useToast()
  const [query, setQuery] = useState(() => {
    const m = route.match(/[?&]q=([^&]*)/)
    return m ? decodeURIComponent(m[1]) : ''
  })
  const [selectedGenre, setSelectedGenre] = useState<string>('All')
  const [searchRating, setSearchRating] = useState<'helpful' | 'unhelpful' | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSendFeedback(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!feedbackText.trim() && !searchRating) return
    setIsSubmittingFeedback(true)
    try {
      await submitFeedback({
        rating: searchRating === 'helpful' ? 5 : 2,
        message: `Search query: "${query}" | Genre: "${selectedGenre}" | Note: ${feedbackText}`,
        kind: 'first-minute',
      }).catch(() => {
        try {
          const list = JSON.parse(localStorage.getItem('draftwell-search-feedback') || '[]')
          list.push({ query, selectedGenre, rating: searchRating, text: feedbackText, date: Date.now() })
          localStorage.setItem('draftwell-search-feedback', JSON.stringify(list))
        } catch {
          // ignore quota
        }
      })
      setFeedbackSubmitted(true)
      success('Thank you! Your search feedback helps us curate more webnovels.')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const { results, matchCounts } = useMemo(() => {
    if (!query.trim() && selectedGenre === 'All') {
      return { results: [], matchCounts: { title: 0, author: 0, genre: 0, tag: 0 } }
    }

    const q = query.trim().toLowerCase()
    let titleMatches = 0
    let authorMatches = 0
    let genreMatches = 0
    let tagMatches = 0

    const list = allStories.filter((s) => {
      // Genre filter check
      if (selectedGenre !== 'All' && s.genre !== selectedGenre && !s.tags.includes(selectedGenre)) {
        return false
      }

      if (!q) return true

      const matchT = s.title.toLowerCase().includes(q)
      const matchA = s.author.toLowerCase().includes(q)
      const matchG = s.genre.toLowerCase().includes(q)
      const matchTag = s.tags.some((t) => t.toLowerCase().includes(q))
      const matchDesc = s.description.toLowerCase().includes(q)

      if (matchT) titleMatches++
      if (matchA) authorMatches++
      if (matchG) genreMatches++
      if (matchTag) tagMatches++

      return matchT || matchA || matchG || matchTag || matchDesc
    })

    return {
      results: list,
      matchCounts: { title: titleMatches, author: authorMatches, genre: genreMatches, tag: tagMatches },
    }
  }, [query, selectedGenre, allStories])

  function handleLibraryToggle(s: Story) {
    if (isInLibrary(s.id)) { removeFromLibrary(s.id); success('Removed from library') }
    else { addToLibrary(s.id); success('Added to your library') }
  }

  const suggestedTerms = ['The Shape of Rain', 'Mara Ellison', 'Fantasy', 'Mystery', 'Sci-Fi', 'Completed']

  return (
    <div className="page search-page">
      <div className="page-head"><h1>Search</h1></div>

      <div className="search-bar">
        <Search size={18} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, authors, genres and tags…"
          aria-label="Search"
        />
        {(query || selectedGenre !== 'All') && (
          <button
            className="search-bar__clear"
            onClick={() => {
              setQuery('')
              setSelectedGenre('All')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Genre Filter Pills */}
      <div className="search-filter-pills" style={{ margin: '14px 0 6px' }}>
        <button
          className={`search-filter-pill${selectedGenre === 'All' ? ' search-filter-pill--active' : ''}`}
          onClick={() => setSelectedGenre('All')}
        >
          All Genres
        </button>
        {GENRES.filter((g) => g !== 'All').map((g) => (
          <button
            key={g}
            className={`search-filter-pill${selectedGenre === g ? ' search-filter-pill--active' : ''}`}
            onClick={() => setSelectedGenre(selectedGenre === g ? 'All' : g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Search Feedback Summary Bar */}
      {(query.trim() || selectedGenre !== 'All') && (
        <div className="search-feedback-container">
          <div className="search-feedback-bar">
            <div className="search-feedback-summary">
              <span>Results:</span>
              <span className="search-feedback-badge">
                {results.length} {results.length === 1 ? 'novel' : 'novels'}
              </span>
              {query && (
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  matching "{query}"
                </span>
              )}
              {selectedGenre !== 'All' && (
                <span className="tag tag--sm" style={{ marginLeft: 4 }}>
                  in {selectedGenre}
                </span>
              )}
            </div>

            {results.length > 0 && query && (
              <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--muted)' }}>
                {matchCounts.title > 0 && <span>{matchCounts.title} titles</span>}
                {matchCounts.author > 0 && <span>• {matchCounts.author} authors</span>}
                {matchCounts.tag > 0 && <span>• {matchCounts.tag} tags</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty Prompt when no query */}
      {!query && selectedGenre === 'All' && (
        <div className="search-empty">
          <p className="search-empty__hint">Discover stories by title, author, or genre</p>
          <div className="genre-grid genre-grid--sm">
            {GENRES.filter((g) => g !== 'All').map((g) => (
              <button key={g} className="genre-tile" onClick={() => setSelectedGenre(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results Feedback with Helpful Suggestions */}
      {(query || selectedGenre !== 'All') && results.length === 0 && (
        <div className="search-empty-suggestions">
          <Search size={32} style={{ color: 'var(--accent)', opacity: 0.8 }} />
          <h2 style={{ font: "500 20px 'Fraunces', serif", color: 'var(--ink)', margin: 0 }}>
            No stories found {query ? `for "${query}"` : `in ${selectedGenre}`}
          </h2>
          <p>Try searching for keywords, exploring different genres, or using one of these popular queries:</p>
          <div className="search-suggestions-list">
            {suggestedTerms.map((term) => (
              <button
                key={term}
                className="search-suggest-chip"
                onClick={() => {
                  setQuery(term)
                  setSelectedGenre('All')
                }}
              >
                {term}
              </button>
            ))}
          </div>
          <button
            className="btn btn--ghost btn--sm"
            style={{ marginTop: 8 }}
            onClick={() => {
              setQuery('')
              setSelectedGenre('All')
            }}
          >
            Clear search filters
          </button>
        </div>
      )}

      {/* Search Results Grid */}
      {results.length > 0 && (
        <div className="work-grid work-grid--discover" style={{ marginTop: 12 }}>
          {results.map((s) => (
            <WorkCard key={s.id} story={s} onLibraryToggle={handleLibraryToggle} />
          ))}
        </div>
      )}

      {/* Search Feedback Action Component */}
      <div className="search-feedback-action-box">
        <div className="search-feedback-action-box__header">
          <div className="search-feedback-action-box__title">
            <MessageSquare size={15} style={{ color: 'var(--accent)' }} />
            <span>Search Feedback</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>
              · Help improve Draftwell discovery
            </span>
          </div>

          <div className="search-feedback-action-box__actions">
            <button
              className={`search-feedback-vote-btn${searchRating === 'helpful' ? ' search-feedback-vote-btn--voted' : ''}`}
              onClick={() => {
                setSearchRating('helpful')
                success('Marked search results as helpful')
              }}
              title="Helpful results"
            >
              <ThumbsUp size={13} />
              <span>Relevant</span>
            </button>
            <button
              className={`search-feedback-vote-btn${searchRating === 'unhelpful' ? ' search-feedback-vote-btn--voted' : ''}`}
              onClick={() => {
                setSearchRating('unhelpful')
                setFeedbackOpen(true)
              }}
              title="Not what you were looking for"
            >
              <ThumbsDown size={13} />
              <span>Could be better</span>
            </button>
            <button
              className="btn btn--xs btn--ghost"
              onClick={() => setFeedbackOpen((v) => !v)}
            >
              {feedbackOpen ? 'Hide' : "Can't find a webnovel?"}
            </button>
          </div>
        </div>

        {feedbackOpen && (
          <form className="search-feedback-form" onSubmit={handleSendFeedback}>
            {feedbackSubmitted ? (
              <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--accent)' }}>
                ✓ Feedback recorded. Our content and search team reviews novel requests and missing keywords regularly!
              </p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Which book, author, or genre were you hoping to find?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="search-feedback-input"
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn--xs btn--ghost"
                    onClick={() => setFeedbackOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn--xs btn--primary"
                    disabled={isSubmittingFeedback || (!feedbackText.trim() && !searchRating)}
                  >
                    {isSubmittingFeedback ? 'Sending…' : 'Submit Search Feedback'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// STORY DETAIL PAGE
// ══════════════════════════════════════════════════════════════════════════
function StoryDetailPage() {
  const { route, navigate, getStory, isInLibrary, addToLibrary, removeFromLibrary,
    isFollowing, toggleFollow, isLiked, toggleLike, getRating, rateStory, getProgress,
    comments, addComment, settings } = useApp()
  const { success, info } = useToast()
  const storyId = route.replace('/story/', '')
  const story = getStory(storyId)
  const [commentBody, setCommentBody] = useState('')
  const [showRating, setShowRating] = useState(false)
  const myRating = getRating(storyId)
  const progress = getProgress(storyId)
  const storyComments = comments.filter((c) => c.storyId === storyId)

  if (!story) return <NotFoundPage />

  function handleShare() {
    const url = window.location.href
    if (navigator.share) navigator.share({ title: story!.title, text: story!.description, url }).catch(() => {})
    else { navigator.clipboard?.writeText(url); info('Link copied to clipboard') }
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentBody.trim()) return
    addComment({ id: `c-${Date.now()}`, storyId: storyId, userId: 'me', authorName: settings.name, body: commentBody.trim(), likes: 0, createdAt: Date.now(), replies: [] })
    setCommentBody('')
    success('Comment posted')
  }

  return (
    <div className="page story-detail-page">
      <button className="back-btn" onClick={() => window.history.back()}><ArrowLeft size={16} /> Back</button>
      <div className="story-detail">
        <div className="story-detail__cover">
          <StoryCover story={story} size="lg" />
          <div className="story-detail__cover-actions">
            <button className={`btn btn--primary btn--full`} onClick={() => navigate(`/read/${story.id}/${progress}`)}>
              <BookOpen size={16} />{progress > 0 ? 'Continue Reading' : 'Start Reading'}
            </button>
            <button className={`btn ${isInLibrary(story.id) ? 'btn--saved btn--full' : 'btn--ghost btn--full'}`}
              onClick={() => { if (isInLibrary(story.id)) { removeFromLibrary(story.id); success('Removed from library') } else { addToLibrary(story.id); success('Added to your library') } }}>
              <Bookmark size={15} />{isInLibrary(story.id) ? 'In Library' : 'Add to Library'}
            </button>
            <div className="story-detail__cover-row">
              <button className={`btn btn--ghost btn--icon-only ${isLiked(story.id) ? 'btn--liked' : ''}`} aria-label="Like"
                onClick={() => { toggleLike(story.id); success(isLiked(story.id) ? 'Liked' : 'Unliked') }}>
                <Heart size={16} />
              </button>
              <button className="btn btn--ghost btn--icon-only" aria-label="Share" onClick={handleShare}><Share2 size={16} /></button>
              <button className="btn btn--ghost btn--icon-only" aria-label="Rate story" onClick={() => setShowRating((v) => !v)}><Star size={16} /></button>
            </div>
            {showRating && (
              <div className="story-detail__rate">
                <p>Your rating</p>
                <StarRating value={myRating} onChange={(v) => { rateStory(story.id, v); success('Rating saved'); setShowRating(false) }} />
              </div>
            )}
          </div>
        </div>
        <div className="story-detail__info">
          <span className="eyebrow">{story.genre}</span>
          <h1 className="story-detail__title">{story.title}</h1>
          <p className="story-detail__author-line">by <button className="link-btn" onClick={() => navigate(`/author/${slug(story.author)}`)}>{story.author}</button></p>
          <div className="story-detail__stats">
            {story.rating && <span><Star size={13} />{story.rating.toFixed(1)} ({story.ratingCount} ratings)</span>}
            <span><BookOpen size={13} />{story.chapters.length} chapters</span>
            <span><Eye size={13} />{((story.reads ?? 0) / 1000).toFixed(1)}k reads</span>
            <span className={`status-badge status-badge--${story.status.toLowerCase()}`}>{story.status}</span>
          </div>
          <p className="story-detail__desc">{story.description}</p>
          <div className="story-detail__tags">{story.tags.map((t) => <Tag key={t} label={t} onClick={() => navigate(`/discover?genre=${t}`)} />)}</div>
          {!story.isOwn && (
            <button className={`btn ${isFollowing(story.author) ? 'btn--following' : 'btn--primary'} btn--sm`}
              onClick={() => { toggleFollow(story.author); success(isFollowing(story.author) ? `Unfollowed ${story.author}` : `Following ${story.author}`) }}>
              {isFollowing(story.author) ? <><Check size={13} /> Following</> : <>+ Follow {story.author}</>}
            </button>
          )}

          {/* Table of Contents */}
          <div className="toc">
            <h2 className="toc__title">Chapters</h2>
            {story.chapters.map((ch, i) => (
              <button key={ch.id} className={`toc__item${progress === i ? ' toc__item--current' : ''}`}
                onClick={() => navigate(`/read/${story.id}/${i}`)}>
                <span className="toc__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="toc__body">
                  <strong>{ch.title}</strong>
                  <small>{ch.wordCount.toLocaleString()} words · {readTime(ch.wordCount)} min</small>
                </span>
                {progress === i && <span className="toc__badge">Reading</span>}
                {progress > i && <CheckCircle size={14} className="toc__check" />}
              </button>
            ))}
          </div>

          {/* Comments */}
          <div className="comments-section">
            <h2 className="comments-section__title"><MessageCircle size={18} /> Comments ({storyComments.length})</h2>
            <form className="comment-form" onSubmit={handleComment}>
              <textarea className="comment-form__input" value={commentBody} onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Share your thoughts…" rows={3} maxLength={1000} />
              <div className="comment-form__footer">
                <span className="comment-form__count">{commentBody.length}/1000</span>
                <button type="submit" className="btn btn--primary btn--sm" disabled={!commentBody.trim()}>Post</button>
              </div>
            </form>
            {storyComments.length === 0 && <p className="comments-empty">Be the first to comment on this story.</p>}
            {storyComments.map((c) => (
              <div key={c.id} className="comment">
                <div className="avatar avatar--sm">{c.authorName.slice(0, 2).toUpperCase()}</div>
                <div className="comment__body">
                  <div className="comment__header"><strong>{c.authorName}</strong><span className="comment__time">{timeAgo(c.createdAt)}</span></div>
                  <p className="comment__text">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// READER PAGE — 4 skeuomorphic themes
// ══════════════════════════════════════════════════════════════════════════
function ReaderPage() {
  const { route, navigate, getStory, updateProgress, addHistory, isBookmarked,
    toggleBookmark, settings, updateSettings } = useApp()
  const { success } = useToast()
  const parts = route.replace('/read/', '').split('/')
  const storyId = parts[0]
  const [chapterIdx, setChapterIdx] = useState(() => parseInt(parts[1] ?? '0', 10) || 0)
  const story = getStory(storyId)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [tocFilter, setTocFilter] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const readerRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(true)
  const hideTimer = useRef<number | null>(null)

  // Auto-hide controls
  function resetHideTimer() {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setShowControls(false), 3500)
  }
  useEffect(() => { resetHideTimer(); return () => { if (hideTimer.current) clearTimeout(hideTimer.current) } }, [])

  // Keyboard navigation
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
      if (e.key === 'Escape') { setSettingsOpen(false); setTocOpen(false) }
      if (e.key === 't' || e.key === 'T') setTocOpen((v) => !v)
      if (e.key === 'b' || e.key === 'B') handleBookmark()
      if (e.key === 's' || e.key === 'S') setSettingsOpen((v) => !v)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  if (!story) return <NotFoundPage />
  const chapter = story.chapters[chapterIdx]
  if (!chapter) return <NotFoundPage />

  // ── Long-Form Scroll Tracking & Offline Position Persistence ─────────
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      if (total > 0) {
        const pct = Math.min(100, Math.max(0, (window.scrollY / total) * 100))
        setScrollProgress(pct)
        try {
          localStorage.setItem(`draftwell-read-pos-${storyId}-${chapter.id}`, String(window.scrollY))
        } catch {
          // ignore quota
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [storyId, chapter.id])

  // Restore previous position if returning to this chapter
  useEffect(() => {
    const saved = localStorage.getItem(`draftwell-read-pos-${storyId}-${chapter.id}`)
    if (saved) {
      const pos = parseFloat(saved)
      if (pos > 100) {
        window.scrollTo({ top: pos, behavior: 'instant' })
      }
    }
  }, [storyId, chapter.id])

  function goNext() {
    const next = chapterIdx + 1
    if (next < story!.chapters.length) {
      setChapterIdx(next)
      updateProgress(storyId, next)
      const base = import.meta.env.BASE_URL.replace(/\/$/, '')
      window.history.replaceState({}, '', `${base}/read/${storyId}/${next}`)
      window.scrollTo(0, 0)
      addHistory({ storyId, chapterId: chapter.id, chapterNumber: next + 1, readAt: Date.now(), progress: next })
    }
  }
  function goPrev() {
    const prev = chapterIdx - 1
    if (prev >= 0) {
      setChapterIdx(prev)
      updateProgress(storyId, prev)
      const base = import.meta.env.BASE_URL.replace(/\/$/, '')
      window.history.replaceState({}, '', `${base}/read/${storyId}/${prev}`)
      window.scrollTo(0, 0)
    }
  }
  function handleBookmark() {
    toggleBookmark(storyId, chapter.id, chapterIdx + 1)
    success(isBookmarked(storyId, chapter.id) ? 'Bookmark removed' : 'Bookmarked')
  }
  function toggleFullscreen() {
    if (!fullscreen) readerRef.current?.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
    setFullscreen((v) => !v)
  }

  const rt = settings.readerTheme
  const wordCount = chapter.wordCount || wc(chapter.body)
  const isLast = chapterIdx === story.chapters.length - 1

  return (
    <div ref={readerRef} className={`reader reader--${rt}`} onMouseMove={resetHideTimer} onTouchStart={resetHideTimer}
      data-width={settings.readerWidth}>
      {/* Reader top bar */}
      <div className={`reader-bar reader-bar--top${showControls ? '' : ' reader-bar--hidden'}`}>
        <button className="reader-btn" aria-label="Back" onClick={() => navigate(`/story/${storyId}`)}>
          <ArrowLeft size={18} />
        </button>
        <div className="reader-bar__title">
          <span className="reader-bar__story">{story.title}</span>
          <span className="reader-bar__chapter">Ch. {chapterIdx + 1} of {story.chapters.length} · {wordCount.toLocaleString()} words</span>
        </div>
        <div className="reader-bar__actions">
          <button className="reader-btn" aria-label="Table of contents (T)" title="Contents (T)" onClick={() => setTocOpen((v) => !v)}><AlignJustify size={17} /></button>
          <button className={`reader-btn${isBookmarked(storyId, chapter.id) ? ' reader-btn--active' : ''}`} aria-label="Bookmark (B)" title="Bookmark (B)" onClick={handleBookmark}><Bookmark size={17} /></button>
          <button className="reader-btn" aria-label="Settings (S)" title="Settings (S)" onClick={() => setSettingsOpen((v) => !v)}><Settings size={17} /></button>
          <button className="reader-btn" aria-label="Fullscreen" onClick={toggleFullscreen}>{fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button>
        </div>
      </div>

      {/* Real-time In-Chapter Progress Bar */}
      <div className="reader-progress">
        <div className="reader-progress__bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* TOC panel with Search */}
      {tocOpen && (
        <div className="reader-toc">
          <div className="reader-toc__head">
            <h2>Chapters ({story.chapters.length})</h2>
            <button className="icon-btn" onClick={() => setTocOpen(false)}><X size={16} /></button>
          </div>
          <div className="reader-toc__search">
            <input
              type="text"
              placeholder="Filter chapters..."
              value={tocFilter}
              onChange={(e) => setTocFilter(e.target.value)}
              className="reader-toc__input"
            />
          </div>
          <div className="reader-toc__list">
            {story.chapters
              .map((ch, i) => ({ ch, i }))
              .filter(({ ch, i }) => !tocFilter.trim() || ch.title.toLowerCase().includes(tocFilter.toLowerCase()) || String(i + 1).includes(tocFilter))
              .map(({ ch, i }) => (
                <button key={ch.id} className={`reader-toc__item${i === chapterIdx ? ' reader-toc__item--active' : ''}`}
                  onClick={() => { setChapterIdx(i); updateProgress(storyId, i); setTocOpen(false); window.scrollTo(0, 0) }}>
                  <span className="reader-toc__num">{i + 1}</span>
                  <span>{ch.title}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Settings panel */}
      {settingsOpen && (
        <div className="reader-settings">
          <div className="reader-settings__head"><h2>Reading settings</h2><button className="icon-btn" onClick={() => setSettingsOpen(false)}><X size={16} /></button></div>
          <label className="reader-settings__label">Theme</label>
          <div className="reader-settings__themes">
            {([
              ['draftwell', Moon, 'Draftwell'],
              ['paper', Sun, 'Paper'],
              ['midnight', Moon, 'Midnight'],
              ['sepia', Leaf, 'Sepia'],
              ['eink', Type, 'E-Ink'],
            ] as [ReaderTheme, React.ElementType, string][]).map(([id, Icon, name]) => (
              <button key={id} className={`reader-theme-btn${rt === id ? ' reader-theme-btn--active' : ''}`}
                data-theme-preview={id} onClick={() => updateSettings({ readerTheme: id })}>
                <Icon size={14} />{name}
              </button>
            ))}
          </div>
          <label className="reader-settings__label">Font size</label>
          <div className="reader-settings__row">
            <button className="btn btn--ghost btn--sm" onClick={() => updateSettings({ readerFontSize: Math.max(14, settings.readerFontSize - 2) })}>A-</button>
            <span className="reader-settings__val">{settings.readerFontSize}px</span>
            <button className="btn btn--ghost btn--sm" onClick={() => updateSettings({ readerFontSize: Math.min(28, settings.readerFontSize + 2) })}>A+</button>
          </div>
          <label className="reader-settings__label">Line spacing</label>
          <div className="reader-settings__row">
            {([1.4, 1.6, 1.8, 2.0, 2.2] as const).map((v) => (
              <button key={v} className={`btn btn--ghost btn--sm${settings.readerLineHeight === v ? ' btn--active' : ''}`}
                onClick={() => updateSettings({ readerLineHeight: v })}>{v}</button>
            ))}
          </div>
          <label className="reader-settings__label">Page width</label>
          <div className="reader-settings__row">
            {(['narrow', 'medium', 'wide'] as const).map((w) => (
              <button key={w} className={`btn btn--ghost btn--sm${settings.readerWidth === w ? ' btn--active' : ''}`}
                onClick={() => updateSettings({ readerWidth: w })}>{w}</button>
            ))}
          </div>
          <label className="reader-settings__label">Font</label>
          <div className="reader-settings__row">
            <button className={`btn btn--ghost btn--sm${settings.font === 'serif' ? ' btn--active' : ''}`}
              onClick={() => updateSettings({ font: 'serif' })} style={{ fontFamily: 'Georgia, serif' }}>Serif</button>
            <button className={`btn btn--ghost btn--sm${settings.font === 'sans' ? ' btn--active' : ''}`}
              onClick={() => updateSettings({ font: 'sans' })}>Sans</button>
          </div>
        </div>
      )}

      {/* Chapter content */}
      <article
        className="reader-content"
        onDoubleClick={() => setShowControls((v) => !v)}
        style={{ fontSize: settings.readerFontSize, lineHeight: settings.readerLineHeight, fontFamily: settings.font === 'serif' ? "'Fraunces', Georgia, serif" : "'DM Sans', sans-serif" }}
      >
        <div className="reader-chapter-meta">
          <span className="reader-chapter-num">CHAPTER {String(chapterIdx + 1).padStart(2, '0')}</span>
          <h1 className="reader-chapter-title">{chapter.title}</h1>
          <div className="reader-chapter-stats">
            <span>{wordCount.toLocaleString()} words</span>
            <span>·</span>
            <span>{readTime(wordCount)} min read</span>
            <span>·</span>
            <span>Double-click text for distraction-free view</span>
          </div>
        </div>
        <div className="reader-body">
          {chapter.body.split('\n\n').map((para, i) => (
            para.trim() ? <p key={i}>{para.trim()}</p> : <br key={i} />
          ))}
        </div>
      </article>

      {/* Chapter end / navigation */}
      {isLast ? (
        <div className="chapter-end chapter-end--final">
          <div className="chapter-end__check"><CheckCircle size={36} /></div>
          <h2>Story Complete</h2>
          <p>You've finished <em>{story.title}</em> by {story.author}.</p>
          <div className="chapter-end__actions">
            <button className="btn btn--primary" onClick={() => { navigate(`/story/${storyId}`) }}>Rate & Review</button>
            <button className="btn btn--ghost" onClick={() => navigate('/discover')}>Discover More Stories</button>
          </div>
        </div>
      ) : (
        <div className="chapter-end">
          <p className="chapter-end__label">End of Chapter {chapterIdx + 1}</p>
          <div className="chapter-end__nav">
            <button className="btn btn--ghost" disabled={chapterIdx === 0} onClick={goPrev}><ArrowLeft size={15} /> Prev</button>
            <button className="btn btn--primary" onClick={goNext}>Next Chapter <ArrowRight size={15} /></button>
          </div>
        </div>
      )}

      {/* Bottom nav bar with in-chapter telemetry & reading stats */}
      <div className={`reader-bar reader-bar--bottom${showControls ? '' : ' reader-bar--hidden'}`}>
        <button className="reader-btn" disabled={chapterIdx === 0} aria-label="Previous chapter" onClick={goPrev}><ArrowLeft size={18} /></button>
        <div className="reader-bar__stats-pill">
          <span className="reader-bar__progress">Ch. {chapterIdx + 1}/{story.chapters.length}</span>
          <span className="reader-bar__dot">·</span>
          <span className="reader-bar__pct">{Math.round(scrollProgress)}% read</span>
          <span className="reader-bar__dot">·</span>
          <span className="reader-bar__rem">{Math.max(1, Math.ceil((wordCount * (1 - scrollProgress / 100)) / 200))} min left</span>
        </div>
        <button className="reader-btn" disabled={isLast} aria-label="Next chapter" onClick={goNext}><ArrowRight size={18} /></button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// LIBRARY PAGE
// ══════════════════════════════════════════════════════════════════════════
function LibraryPage() {
  const { library, allStories, navigate, removeFromLibrary, addToLibrary } = useApp()
  const { success } = useToast()
  const [tab, setTab] = useState<'all' | 'reading' | 'completed'>('all')
  const items = useMemo(() => {
    const base = library.map((l) => ({ item: l, story: allStories.find((s) => s.id === l.storyId) })).filter((x) => x.story)
    if (tab === 'reading') return base.filter((x) => x.item.progress > 0 && !x.item.completed)
    if (tab === 'completed') return base.filter((x) => x.item.completed)
    return base
  }, [library, allStories, tab])

  return (
    <div className="page library-page">
      <div className="page-head"><h1>My Library</h1></div>
      <div className="tab-row">
        <button className={`tab${tab === 'all' ? ' tab--active' : ''}`} onClick={() => setTab('all')}>All ({library.length})</button>
        <button className={`tab${tab === 'reading' ? ' tab--active' : ''}`} onClick={() => setTab('reading')}>Reading</button>
        <button className={`tab${tab === 'completed' ? ' tab--active' : ''}`} onClick={() => setTab('completed')}>Completed</button>
      </div>
      {items.length === 0 ? (
        <div className="empty-state-wrap">
          <div className="empty-state-card">
            <div className="empty-state-card__art"><Library size={32} /></div>
            <h2>Your reading shelf is waiting</h2>
            <p>Save novels, serials, and masterclass exercises to track your reading progress across all your devices.</p>
            <button className="btn btn--primary" onClick={() => navigate('/discover')}>
              <Compass size={15} /> Discover New Stories
            </button>
          </div>

          <div className="suggested-shelf-section">
            <div className="section-head">
              <h2>Recommended for Your Shelf</h2>
              <button className="section-head__link" onClick={() => navigate('/discover')}>Browse all <ChevronRight size={14} /></button>
            </div>
            <div className="work-grid work-grid--discover">
              {allStories.filter((s) => !s.isOwn).slice(0, 3).map((s) => (
                <WorkCard key={s.id} story={s} onLibraryToggle={(st) => {
                  addToLibrary(st.id)
                  success(`Added "${st.title}" to your shelf`)
                }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
          <div className="library-grid">
            {items.map(({ item, story: s }) => (
              <article key={item.storyId} className="library-card">
                <StoryCover story={s!} size="md" onClick={() => navigate(`/read/${s!.id}/${item.progress}`)} />
                <div className="library-card__body">
                  <h3 className="library-card__title" onClick={() => navigate(`/story/${s!.id}`)}>{s!.title}</h3>
                  <p className="library-card__author">by {s!.author}</p>
                  <div className="progress-bar library-card__progress">
                    <span style={{ width: `${Math.min(100, ((item.progress + 1) / s!.chapters.length) * 100)}%` }} />
                  </div>
                  <p className="library-card__chapter">Chapter {item.progress + 1} of {s!.chapters.length}</p>
                  <div className="library-card__actions">
                    <button className="btn btn--primary btn--sm" onClick={() => navigate(`/read/${s!.id}/${item.progress}`)}>
                      {item.progress > 0 ? 'Continue' : 'Start Reading'}
                    </button>
                    <button className="btn btn--ghost btn--icon-only" aria-label="Remove from library"
                      onClick={() => { removeFromLibrary(item.storyId); success('Removed from library') }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// HISTORY PAGE
// ══════════════════════════════════════════════════════════════════════════
function HistoryPage() {
  const { history, allStories, navigate, clearHistory } = useApp()
  const { success } = useToast()
  const [confirm, setConfirm] = useState(false)

  const entries = history.map((h) => ({ h, story: allStories.find((s) => s.id === h.storyId) })).filter((x) => x.story)

  return (
    <div className="page history-page">
      <div className="page-head">
        <h1>Reading History</h1>
        {history.length > 0 && <button className="btn btn--ghost btn--sm" onClick={() => setConfirm(true)}><Trash2 size={14} /> Clear</button>}
      </div>
      {confirm && <ConfirmModal title="Clear history?" body="This will remove all reading history. Your library and progress are kept." confirmLabel="Clear history" danger onConfirm={() => { clearHistory(); setConfirm(false); success('History cleared') }} onCancel={() => setConfirm(false)} />}
      {entries.length === 0
        ? <EmptyState icon={Clock} title="No chapters behind you yet" text="Your reading history will appear here." action="Discover a Story" onAction={() => navigate('/discover')} />
        : (
          <div className="history-list">
            {entries.map(({ h, story: s }) => (
              <div key={`${h.storyId}-${h.readAt}`} className="history-item">
                <StoryCover story={s!} size="sm" onClick={() => navigate(`/read/${s!.id}/${h.progress}`)} />
                <div className="history-item__body">
                  <h3 className="history-item__title" onClick={() => navigate(`/story/${s!.id}`)}>{s!.title}</h3>
                  <p>Chapter {h.chapterNumber} · {timeAgo(h.readAt)}</p>
                </div>
                <button className="btn btn--primary btn--sm" onClick={() => navigate(`/read/${s!.id}/${h.progress}`)}>Continue</button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// FOLLOWING PAGE
// ══════════════════════════════════════════════════════════════════════════
function FollowingPage() {
  const { follows, toggleFollow, allStories, navigate } = useApp()
  const { success } = useToast()
  return (
    <div className="page following-page">
      <div className="page-head"><h1>Following</h1></div>
      {follows.length === 0 ? (
        <div className="empty-state-wrap">
          <div className="empty-state-card">
            <div className="empty-state-card__art"><Users size={32} /></div>
            <h2>Follow the voices you love</h2>
            <p>Follow celebrated authors and community serialists to receive alerts whenever new chapters and novels drop.</p>
            <button className="btn btn--primary" onClick={() => navigate('/discover')}>
              <Compass size={15} /> Explore All Stories
            </button>
          </div>

          <div className="suggested-shelf-section">
            <div className="section-head">
              <h2>Acclaimed Authors to Follow</h2>
              <button className="section-head__link" onClick={() => navigate('/discover')}>View more <ChevronRight size={14} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {DEMO_AUTHORS.slice(0, 3).map((author) => (
                <div key={author.id} className="following-card">
                  <div className="following-card__head">
                    <div className="avatar avatar--md">{author.name.slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 className="following-card__name" onClick={() => navigate(`/author/${slug(author.name)}`)}>{author.name}</h3>
                      <p className="following-card__genre">{author.genre} · {author.followers.toLocaleString()} readers</p>
                    </div>
                    <button className="btn btn--primary btn--sm" onClick={() => {
                      toggleFollow(author.name)
                      success(`Now following ${author.name}`)
                    }}>
                      + Follow
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted-strong)', lineHeight: 1.5, marginTop: 10 }}>
                    {author.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
          <div className="following-grid">
            {follows.map((f) => {
              const author = DEMO_AUTHORS.find((a) => a.name === f.authorName)
              const stories = allStories.filter((s) => s.author === f.authorName)
              return (
                <div key={f.authorId} className="following-card">
                  <div className="following-card__head">
                    <div className="avatar avatar--md">{f.authorName.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <h3 className="following-card__name" onClick={() => navigate(`/author/${slug(f.authorName)}`)}>{f.authorName}</h3>
                      {author && <p className="following-card__genre">{author.genre}</p>}
                    </div>
                    <button className="btn btn--following btn--sm" onClick={() => { toggleFollow(f.authorName); success(`Unfollowed ${f.authorName}`) }}>
                      <Check size={13} /> Following
                    </button>
                  </div>
                  {stories.length > 0 && (
                    <div className="following-card__stories">
                      {stories.slice(0, 2).map((s) => (
                        <button key={s.id} className="following-story" onClick={() => navigate(`/story/${s.id}`)}>
                          <span className="following-story__dot" style={{ background: s.coverColor }} />
                          <span>{s.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// AUTHOR PAGE
// ══════════════════════════════════════════════════════════════════════════
function AuthorPage() {
  const { route, navigate, allStories, isFollowing, toggleFollow, isInLibrary, addToLibrary, removeFromLibrary } = useApp()
  const { success } = useToast()
  const authorSlug = route.replace('/author/', '')
  const author = DEMO_AUTHORS.find((a) => slug(a.name) === authorSlug)
  const authorName = author?.name ?? authorSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const stories = allStories.filter((s) => s.author === authorName)

  return (
    <div className="page author-page">
      <button className="back-btn" onClick={() => window.history.back()}><ArrowLeft size={16} /> Back</button>
      <div className="author-hero">
        <div className="avatar avatar--xl">{authorName.slice(0, 2).toUpperCase()}</div>
        <div className="author-hero__info">
          <h1>{authorName}</h1>
          {author && <p className="author-hero__bio">{author.bio}</p>}
          <div className="author-hero__stats">
            {author && <span>{author.followers.toLocaleString()} followers</span>}
            <span>{stories.length} {stories.length === 1 ? 'story' : 'stories'}</span>
          </div>
          <button className={`btn ${isFollowing(authorName) ? 'btn--following' : 'btn--primary'} btn--sm`}
            onClick={() => { toggleFollow(authorName); success(isFollowing(authorName) ? `Unfollowed ${authorName}` : `Following ${authorName}`) }}>
            {isFollowing(authorName) ? <><Check size={13} /> Following</> : <>+ Follow</>}
          </button>
        </div>
      </div>
      <h2 className="author-page__stories-title">Stories by {authorName}</h2>
      {stories.length === 0
        ? <EmptyState icon={BookOpen} title="No stories yet" text="This author hasn't published on Draftwell yet." />
        : <div className="work-grid">{stories.map((s) => <WorkCard key={s.id} story={s} onLibraryToggle={(st) => { if (isInLibrary(st.id)) { removeFromLibrary(st.id); success('Removed') } else { addToLibrary(st.id); success('Added to library') } }} />)}</div>
      }
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE
// ══════════════════════════════════════════════════════════════════════════
function NotificationsPage() {
  const { notifications, markAllRead, markRead, unreadCount } = useApp()
  return (
    <div className="page notifications-page">
      <div className="page-head">
        <h1>Notifications {unreadCount > 0 && <span className="badge badge--inline">{unreadCount}</span>}</h1>
        {unreadCount > 0 && <button className="btn btn--ghost btn--sm" onClick={markAllRead}><Check size={14} /> Mark all read</button>}
      </div>
      {notifications.length === 0
        ? <EmptyState icon={BellIcon} title="You're all caught up" text="New chapters, comments, and updates will appear here." />
        : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div key={n.id} className={`notif-item${n.read ? '' : ' notif-item--unread'}`} onClick={() => markRead(n.id)}>
                <div className="notif-item__icon">
                  {n.type === 'chapter' && <BookOpen size={16} />}
                  {n.type === 'comment' && <MessageCircle size={16} />}
                  {n.type === 'follow' && <Users size={16} />}
                  {n.type === 'system' && <BellIcon size={16} />}
                  {n.type === 'achievement' && <Star size={16} />}
                </div>
                <div className="notif-item__body">
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                  <span className="notif-item__time">{timeAgo(n.createdAt)}</span>
                </div>
                {!n.read && <div className="notif-item__dot" />}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PROFILE PAGE
// ══════════════════════════════════════════════════════════════════════════
function ProfilePage() {
  const { settings, library, history, follows, myStories, navigate } = useApp()
  const completed = library.filter((l) => l.completed).length
  const totalChapters = history.length
  return (
    <div className="page profile-page">
      <div className="profile-hero">
        <div className="avatar avatar--xl">{settings.name.slice(0, 2).toUpperCase()}</div>
        <div className="profile-hero__info">
          <span className="eyebrow">CREATOR PROFILE</span>
          <h1>{settings.name}</h1>
          <p className="profile-hero__role">{settings.role}</p>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/settings/profile')}>
            Edit profile
          </button>
        </div>
      </div>
      <div className="profile-stats-grid">
        {([
          ['Stories Saved', library.length, Library],
          ['Completed', completed, CheckCircle],
          ['Chapters Read', totalChapters, BookOpen],
          ['Following', follows.length, Users],
          ['My Stories', myStories.length, PenLine],
        ] as [string, number, React.ElementType][]).map(([label, val, Icon]) => (
          <div key={label} className="profile-stat">
            <Icon size={18} />
            <strong>{val.toLocaleString()}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {myStories.length > 0 && (
        <ProfileStoriesSection myStories={myStories} navigate={navigate} />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ══════════════════════════════════════════════════════════════════════════
function SettingsPage() {
  const { settings, updateSettings, route, navigate, clearHistory, library, myStories } = useApp()
  const { success, warning } = useToast()
  const [confirm, setConfirm] = useState<'history' | 'library' | 'data' | null>(null)
  const category = route.split('/').at(-1) ?? 'settings'

  function exportData() {
    const data = {
      settings,
      library: JSON.parse(localStorage.getItem(`draftwell:${settings.name}:library`) ?? '[]'),
      history: JSON.parse(localStorage.getItem(`draftwell:${settings.name}:history`) ?? '[]'),
      myStories,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'draftwell-data.json'; a.click()
    URL.revokeObjectURL(url)
    success('Data exported')
  }

  const categories = [
    'overview', 'appearance', 'reading', 'notifications', 'privacy', 'data'
  ]

  return (
    <div className="page settings-page">
      <div className="page-head"><h1>Settings</h1></div>
      {confirm === 'history' && <ConfirmModal title="Clear reading history?" body="All reading history will be removed. Library and progress are kept." confirmLabel="Clear history" danger onConfirm={() => { clearHistory(); setConfirm(null); success('History cleared') }} onCancel={() => setConfirm(null)} />}
      {confirm === 'data' && <ConfirmModal title="Reset all local data?" body="This will erase your library, history, stories, settings, and all local data. This cannot be undone." confirmLabel="Reset everything" danger onConfirm={() => { localStorage.clear(); window.location.reload() }} onCancel={() => setConfirm(null)} />}
      <div className="settings-layout">
        <nav className="settings-nav">
          {categories.map((c) => (
            <button key={c} className={`settings-nav__item${(category === c || (c === 'overview' && category === 'settings')) ? ' settings-nav__item--active' : ''}`}
              onClick={() => navigate(c === 'overview' ? '/settings' : `/settings/${c}`)}>
              {c.replace(/-/g, ' ')}
            </button>
          ))}
        </nav>
        <div className="settings-content">

          {(category === 'settings' || category === 'overview') && (
            <div className="settings-section">
              <h2>Settings Overview</h2>
              <p className="settings-desc">Manage your Draftwell experience.</p>
              <div className="settings-overview-grid">
                {categories.filter((c) => c !== 'overview').map((c) => (
                  <button key={c} className="settings-overview-tile" onClick={() => navigate(`/settings/${c}`)}>
                    <span className="settings-overview-tile__label">{c.replace(/-/g, ' ')}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {category === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <div className="setting-block">
                <label className="setting-label">Interface theme</label>
                <div className="theme-options">
                  {([['dark', 'Dark'], ['light', 'Light'], ['amber', 'Amber'], ['eye', 'Eye Care']] as const).map(([id, label]) => (
                    <button key={id} className={`theme-option${settings.theme === id ? ' theme-option--active' : ''}`}
                      onClick={() => { updateSettings({ theme: id }); success(`Theme changed to ${label}`) }}
                      data-theme-swatch={id}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="setting-block">
                <label className="setting-label">Accent color</label>
                <div className="accent-options">
                  {['#d88a2f', '#c4543d', '#287a74', '#5c6599', '#9b6a37'].map((color) => (
                    <button key={color} className={`accent-swatch${settings.accent === color ? ' accent-swatch--active' : ''}`}
                      style={{ background: color }} aria-label={`Accent color ${color}`}
                      onClick={() => { updateSettings({ accent: color }); success('Accent updated') }} />
                  ))}
                </div>
              </div>
              <div className="setting-block">
                <label className="setting-label">Interface font</label>
                <div className="font-options">
                  <button className={`font-option${settings.font === 'serif' ? ' font-option--active' : ''}`}
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                    onClick={() => updateSettings({ font: 'serif' })}>Serif</button>
                  <button className={`font-option${settings.font === 'sans' ? ' font-option--active' : ''}`}
                    onClick={() => updateSettings({ font: 'sans' })}>Sans-serif</button>
                </div>
              </div>
            </div>
          )}

          {category === 'reading' && (
            <div className="settings-section">
              <h2>Reading</h2>
              <div className="setting-block">
                <label className="setting-label">Default reader theme</label>
                <div className="theme-options">
                  {(['draftwell', 'paper', 'midnight', 'sepia', 'eink'] as const).map((t) => (
                    <button key={t} className={`theme-option${settings.readerTheme === t ? ' theme-option--active' : ''}`}
                      onClick={() => updateSettings({ readerTheme: t })}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="setting-block">
                <label className="setting-label">Default font size: {settings.readerFontSize}px</label>
                <input type="range" min={14} max={28} step={2} value={settings.readerFontSize}
                  onChange={(e) => updateSettings({ readerFontSize: +e.target.value })} className="settings-range" />
              </div>
              <div className="setting-block">
                <label className="setting-label">Default page width</label>
                <div className="font-options">
                  {(['narrow', 'medium', 'wide'] as const).map((w) => (
                    <button key={w} className={`font-option${settings.readerWidth === w ? ' font-option--active' : ''}`}
                      onClick={() => updateSettings({ readerWidth: w })}>{w}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {category === 'notifications' && (
            <div className="settings-section">
              <h2>Notifications</h2>
              {([
                ['notifyAuthorUpdates', 'New chapters from followed authors'],
                ['notifyComments', 'Comments and replies'],
                ['notifySystem', 'System updates'],
              ] as const).map(([key, label]) => (
                <div key={key} className="setting-toggle">
                  <span>{label}</span>
                  <button className={`toggle${settings[key] ? ' toggle--on' : ''}`}
                    aria-checked={settings[key]} role="switch"
                    onClick={() => updateSettings({ [key]: !settings[key] })}>
                    <span className="toggle__thumb" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {category === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy</h2>
              <div className="setting-toggle">
                <span>Public profile</span>
                <button className={`toggle${settings.profilePublic ? ' toggle--on' : ''}`}
                  aria-checked={settings.profilePublic} role="switch"
                  onClick={() => updateSettings({ profilePublic: !settings.profilePublic })}>
                  <span className="toggle__thumb" />
                </button>
              </div>
            </div>
          )}

          {category === 'data' && (
            <div className="settings-section">
              <h2>Data</h2>
              <div className="settings-data-actions">
                <div className="settings-data-item">
                  <div><strong>Export your data</strong><p>Download all your stories, library, and settings as JSON.</p></div>
                  <button className="btn btn--ghost btn--sm" onClick={exportData}><FileText size={14} /> Export</button>
                </div>
                <div className="settings-data-item">
                  <div><strong>Clear reading history</strong><p>Removes your reading history. Library and progress are kept.</p></div>
                  <button className="btn btn--ghost btn--sm" onClick={() => setConfirm('history')}><Trash2 size={14} /> Clear</button>
                </div>
                <div className="settings-data-item settings-data-item--danger">
                  <div><strong>Reset all data</strong><p>Permanently erases all local Draftwell data. Cannot be undone.</p></div>
                  <button className="btn btn--danger btn--sm" onClick={() => setConfirm('data')}><Trash2 size={14} /> Reset</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// HELP PAGE
// ══════════════════════════════════════════════════════════════════════════
function HelpPage() {
  const [open, setOpen] = useState<string | null>(null)
  const faqs = [
    { id: '1', q: 'How do I start reading?', a: 'Go to Home or Discover, find a story, and click "Start Reading". Your progress saves automatically.' },
    { id: '2', q: 'How do I save a story?', a: 'Click the bookmark icon on any story card or detail page to add it to your Library.' },
    { id: '3', q: 'How do I create my own story?', a: 'Go to Creator Studio via the sidebar or profile menu. Click "New Story" to start.' },
    { id: '4', q: 'Does it work offline?', a: 'Yes. All your stories, library, and progress are saved locally. You can read and write without an internet connection.' },
    { id: '5', q: 'How does the microphone work?', a: 'In the writing editor, click "Speak a thought" to dictate. It transcribes in real time. Click again to stop. Works in Chrome and Edge.' },
    { id: '6', q: 'Can I upload novels from outside the app?', a: 'Yes! In Creator Studio, use "Import Story" to upload a .txt file. The app will auto-split it into chapters.' },
    { id: '7', q: 'How do I change the reading theme?', a: 'While reading, click the settings icon in the top bar. Choose from Draftwell, Paper, Midnight, Sepia, or E-Ink.' },
    { id: '8', q: 'How do I follow an author?', a: 'Click "+ Follow" on any author\'s profile or story detail page. Their updates appear in your Following section.' },
  ]
  return (
    <div className="page help-page">
      <div className="page-head"><h1>Help</h1></div>
      <div className="faq-list">
        {faqs.map((f) => (
          <div key={f.id} className="faq-item">
            <button className="faq-item__q" onClick={() => setOpen(open === f.id ? null : f.id)}
              aria-expanded={open === f.id}>
              {f.q}
              <ChevronDown size={16} className={`faq-item__chevron${open === f.id ? ' faq-item__chevron--open' : ''}`} />
            </button>
            {open === f.id && <p className="faq-item__a">{f.a}</p>}
          </div>
        ))}
      </div>
      <div className="help-contact">
        <strong>Still need help?</strong>
        <a href="mailto:jaymn2006@gmail.com">jaymn2006@gmail.com</a>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// CREATOR STUDIO SHELL
// ══════════════════════════════════════════════════════════════════════════
function StudioShell() {
  const { route, navigate } = useApp()
  const isEditor = route.startsWith('/studio/write/') || route.startsWith('/studio/edit/')
  if (isEditor) return <StoryEditor />

  if (route.startsWith('/studio/preview')) {
    const storyId = route.replace('/studio/preview/', '').replace('/studio/preview', '')
    return <BookPreviewView initialStoryId={storyId || undefined} />
  }

  if (route.startsWith('/studio/masterclasses')) {
    const mcId = route.replace('/studio/masterclasses/', '').replace('/studio/masterclasses', '')
    return <MasterclassesView activeId={mcId || undefined} />
  }

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <div className="studio-sidebar__label">CREATOR STUDIO</div>
        {([
          ['/studio', BarChart2, 'Dashboard'],
          ['/studio/stories', BookCopy, 'My Novels'],
          ['/studio/write/new', Plus, 'Write Novel'],
          ['/studio/preview', BookOpen, 'Book Preview'],
          ['/studio/masterclasses', GraduationCap, 'Masterclasses'],
          ['/studio/import', Upload, 'Import Novel'],
        ] as const).map(([path, Icon, label]) => (
          <button key={path} className={`studio-sidebar__link${route === path || (path !== '/studio' && route.startsWith(path)) ? ' studio-sidebar__link--active' : ''}`}
            onClick={() => navigate(path)}>
            <Icon size={16} />{label}
          </button>
        ))}
      </aside>
      <div className="studio-content">
        {route === '/studio' && <StudioDashboard />}
        {route === '/studio/stories' && <MyStoriesView />}
        {route === '/studio/write/new' && <CreateStoryView />}
        {route === '/studio/import' && <ImportNovelView />}
      </div>
    </div>
  )
}

// ── Studio Dashboard ──────────────────────────────────────────────────────
function StudioDashboard() {
  const { myStories, allStories, navigate, settings } = useApp()
  const totalWords = myStories.reduce((acc, s) => acc + s.totalWords, 0)
  const totalChapters = myStories.reduce((acc, s) => acc + s.chapters.length, 0)
  const publishedCount = myStories.filter((s) => s.status !== 'Draft').length

  const mostRecentStory = myStories.length > 0
    ? [...myStories].sort((a, b) => b.updatedAt - a.updatedAt)[0]
    : allStories[0]

  return (
    <div className="studio-dashboard">
      <div className="studio-dashboard__greeting">
        <span className="eyebrow">CREATOR STUDIO & NOVEL WORKBENCH</span>
        <h1>Welcome back, {settings.name.split(' ')[0]}.</h1>
        <p style={{ color: 'var(--muted-strong)', fontSize: 14, marginTop: 4 }}>
          Your central desk for drafting serials, previewing hardcover manuscripts, and mastering prose craft.
        </p>
      </div>

      {/* Quick Actions Bar */}
      <div className="studio-quick-actions">
        <button className="studio-quick-btn studio-quick-btn--primary" onClick={() => navigate('/studio/write/new')}>
          <Plus size={16} /> Write New Novel
        </button>
        <button className="studio-quick-btn" onClick={() => navigate('/studio/preview')}>
          <BookOpen size={16} /> Live Book Preview
        </button>
        <button className="studio-quick-btn" onClick={() => navigate('/studio/masterclasses')}>
          <GraduationCap size={16} /> Masterclasses & Craft
        </button>
        <button className="studio-quick-btn" onClick={() => navigate('/studio/import')}>
          <Upload size={16} /> Import Novel (.txt)
        </button>
      </div>

      {/* Hero Spotlight: Continue Writing */}
      {mostRecentStory && (
        <div className="studio-spotlight">
          <div className="studio-spotlight__content">
            <span className="tag" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600 }}>
              CONTINUE WRITING
            </span>
            <h2 className="studio-spotlight__title">{mostRecentStory.title}</h2>
            <p className="studio-spotlight__meta">
              {mostRecentStory.chapters.length} chapters drafted · {mostRecentStory.totalWords.toLocaleString()} words · Last updated {timeAgo(mostRecentStory.updatedAt)}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button className="btn btn--primary btn--sm" onClick={() => navigate(`/studio/edit/${mostRecentStory.id}`)}>
                <PenLine size={14} /> Open Manuscript Editor
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/studio/preview/${mostRecentStory.id}`)}>
                <BookOpen size={14} /> Preview as Book
              </button>
            </div>
          </div>
          <div className="studio-spotlight__cover">
            <StoryCover story={mostRecentStory} size="md" />
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="studio-stats">
        {([
          ['Novels', myStories.length, BookCopy],
          ['Total Chapters', totalChapters, FileText],
          ['Drafted Words', totalWords.toLocaleString(), PenLine],
          ['Published', publishedCount, Globe],
        ] as [string, string | number, React.ElementType][]).map(([label, val, Icon]) => (
          <div key={label} className="studio-stat">
            <Icon size={20} />
            <strong>{val}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Novels Desk */}
      <div className="studio-section-head">
        <h2>Your Manuscripts</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/studio/import')}>
            <Upload size={13} /> Import
          </button>
          <button className="btn btn--primary btn--sm" onClick={() => navigate('/studio/write/new')}>
            <Plus size={13} /> New Story
          </button>
        </div>
      </div>

      {myStories.length === 0 ? (
        <div className="studio-empty">
          <PenLine size={40} />
          <h2>Your first story starts here.</h2>
          <p>Create a story, write chapters, and preview in print-grade book spreads.</p>
          <div className="studio-empty__actions">
            <button className="btn btn--primary" onClick={() => navigate('/studio/write/new')}>Create a Story</button>
            <button className="btn btn--ghost" onClick={() => navigate('/studio/import')}>Import a Novel</button>
          </div>
        </div>
      ) : (
        <div className="novels-grid">
          {myStories.map((s) => <NovelCard key={s.id} story={s} />)}
        </div>
      )}

      {/* Craft Masterclasses Spotlight */}
      <div className="studio-section-head" style={{ marginTop: 36 }}>
        <div>
          <h2>Writing Masterclasses</h2>
          <p style={{ color: 'var(--muted-strong)', fontSize: 13, marginTop: 2 }}>
            Master narrative pacing, voice, dialogue subtext, and worldbuilding techniques.
          </p>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/studio/masterclasses')}>
          View All ({MASTERCLASSES.length}) <ChevronRight size={14} />
        </button>
      </div>

      <div className="masterclasses-grid" style={{ marginBottom: 30 }}>
        {MASTERCLASSES.slice(0, 2).map((mc) => (
          <article
            key={mc.id}
            className="masterclass-card"
            onClick={() => navigate(`/studio/masterclasses/${mc.id}`)}>
            <div className="masterclass-card__top">
              <span className="tag">{mc.category}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{mc.readTime} min read</span>
            </div>
            <h3 className="masterclass-card__title">{mc.title}</h3>
            <p className="masterclass-card__sub">{mc.subtitle}</p>
            <div className="masterclass-card__instructor">
              <span>{mc.instructor}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 600 }}>{mc.level}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// ── Novel Card for Studio ─────────────────────────────────────────────────
function NovelCard({ story: s }: { story: Story }) {
  const { navigate, deleteStory, saveStory } = useApp()
  const { success } = useToast()
  const [confirm, setConfirm] = useState(false)

  function handleExport() {
    let fullText = `${s.title.toUpperCase()}\nby ${s.author}\n\n${s.description || ''}\n\n${'='.repeat(40)}\n\n`
    s.chapters.forEach((ch, i) => {
      fullText += `CHAPTER ${i + 1}: ${ch.title}\n\n${ch.body}\n\n${'-'.repeat(30)}\n\n`
    })

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-manuscript.txt`
    a.click()
    URL.revokeObjectURL(url)
    success(`"${s.title}" downloaded as .txt`)
  }

  function handleAddChapter() {
    const id = `ch-${s.id}-${Date.now()}`
    const num = s.chapters.length + 1
    const newCh: Chapter = { id, storyId: s.id, number: num, title: `Chapter ${num}`, body: '', note: '', status: 'Draft', wordCount: 0, createdAt: Date.now(), updatedAt: Date.now() }
    const updated: Story = { ...s, chapters: [...s.chapters, newCh], updatedAt: Date.now() }
    saveStory(updated)
    success(`Chapter ${num} added`)
    navigate(`/studio/edit/${s.id}`)
  }

  return (
    <>
      {confirm && (
        <ConfirmModal
          title={`Delete "${s.title}"?`}
          body="This will permanently delete the manuscript and all its chapters."
          confirmLabel="Delete"
          danger
          onConfirm={() => { deleteStory(s.id); success('Manuscript deleted') }}
          onCancel={() => setConfirm(false)}
        />
      )}
      <div className="novel-card">
        <div className="novel-card__head">
          <StoryCover story={s} size="sm" onClick={() => navigate(`/studio/edit/${s.id}`)} />
          <div className="novel-card__body">
            <h3 className="novel-card__title" onClick={() => navigate(`/studio/edit/${s.id}`)} style={{ cursor: 'pointer' }}>
              {s.title}
            </h3>
            <p className="novel-card__meta">
              {s.genre} · {s.chapters.length} chapters · {s.totalWords.toLocaleString()} words
            </p>
            <span className={`status-badge status-badge--${s.status.toLowerCase()}`}>
              {s.status}
            </span>
          </div>
        </div>
        <p className="novel-card__desc">
          {s.description || 'No summary entered. Click Write to start drafting your chapters.'}
        </p>
        <div className="novel-card__footer">
          <div className="novel-card__actions">
            <button className="btn btn--primary btn--xs" onClick={() => navigate(`/studio/edit/${s.id}`)}>
              <PenLine size={12} /> Write
            </button>
            <button className="btn btn--ghost btn--xs" onClick={() => navigate(`/studio/preview/${s.id}`)}>
              <BookOpen size={12} /> Preview
            </button>
            <button className="btn btn--ghost btn--xs" onClick={handleAddChapter} title="Add Chapter">
              <Plus size={12} /> Chapter
            </button>
            <button className="btn btn--ghost btn--xs" onClick={handleExport} title="Download .txt">
              <Download size={12} />
            </button>
          </div>
          <button className="icon-btn icon-btn--xs icon-btn--danger" onClick={() => setConfirm(true)} aria-label="Delete novel">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </>
  )
}

// ── Story row ─────────────────────────────────────────────────────────────
function StoryRow({ story: s }: { story: Story }) {
  const { navigate, deleteStory } = useApp()
  const { success } = useToast()
  const [confirm, setConfirm] = useState(false)

  function handleExport() {
    let fullText = `${s.title.toUpperCase()}\nby ${s.author}\n\n${s.description || ''}\n\n${'='.repeat(40)}\n\n`
    s.chapters.forEach((ch, i) => {
      fullText += `CHAPTER ${i + 1}: ${ch.title}\n\n${ch.body}\n\n${'-'.repeat(30)}\n\n`
    })

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-manuscript.txt`
    a.click()
    URL.revokeObjectURL(url)
    success(`"${s.title}" downloaded as .txt`)
  }

  return (
    <>
      {confirm && <ConfirmModal title={`Delete "${s.title}"?`} body="This will permanently delete the story and all its chapters." confirmLabel="Delete" danger onConfirm={() => { deleteStory(s.id); success('Story deleted') }} onCancel={() => setConfirm(false)} />}
      <div className="story-row">
        <StoryCover story={s} size="sm" />
        <div className="story-row__body">
          <h3 className="story-row__title">{s.title}</h3>
          <p className="story-row__meta">{s.chapters.length} chapters · {s.totalWords.toLocaleString()} words · <span className={`status-badge status-badge--${s.status.toLowerCase()}`}>{s.status}</span></p>
        </div>
        <div className="story-row__actions">
          <button className="btn btn--primary btn--sm" onClick={() => navigate(`/studio/edit/${s.id}`)}>Edit</button>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/studio/preview/${s.id}`)}><BookOpen size={13} /> Preview</button>
          <button className="btn btn--ghost btn--icon-only" onClick={handleExport} title="Download .txt"><Download size={13} /></button>
          <button className="btn btn--ghost btn--icon-only" aria-label="Delete story" onClick={() => setConfirm(true)}><Trash2 size={14} /></button>
        </div>
      </div>
    </>
  )
}

// ── My Stories View ───────────────────────────────────────────────────────
function MyStoriesView() {
  const { myStories, navigate } = useApp()
  return (
    <div className="my-stories-view">
      <div className="page-head">
        <h1>My Stories</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/studio/import')}><Upload size={14} /> Import</button>
          <button className="btn btn--primary btn--sm" onClick={() => navigate('/studio/write/new')}><Plus size={14} /> New Story</button>
        </div>
      </div>
      {myStories.length === 0
        ? <EmptyState icon={PenLine} title="Your first story starts here" text="Create a new story or import a novel from a file." action="Create Story" onAction={() => navigate('/studio/write/new')} />
        : <div className="studio-story-list">{myStories.map((s) => <StoryRow key={s.id} story={s} />)}</div>
      }
    </div>
  )
}

// ── Create Story View ─────────────────────────────────────────────────────
function CreateStoryView() {
  const { saveStory, navigate, settings, userId } = useApp()
  const { success } = useToast()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState(settings.name)
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('Literary')
  const [tags, setTags] = useState('')
  const COVER_COLORS = ['#a95748','#1a3a5c','#2d5a3d','#2c2c3e','#0d1b3e','#3d5a2a','#7a3d5a','#1a1a1a','#4a3a2a','#3a1a4a']
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const id = `story-${Date.now()}`
    const now = Date.now()
    const story: Story = {
      id, userId: userId ?? 'offline-device',
      title: title.trim(), author: author.trim(),
      description: description.trim(),
      genre, tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'Draft', coverColor,
      coverGradient: `linear-gradient(145deg, ${coverColor}, ${coverColor}dd 60%, ${coverColor}88)`,
      chapters: [], totalWords: 0, isOwn: true,
      createdAt: now, updatedAt: now,
    }
    saveStory(story)
    success(`"${title}" created`)
    navigate(`/studio/edit/${id}`)
  }

  return (
    <div className="create-story-view">
      <div className="page-head"><h1>New Story</h1></div>
      <form className="story-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="story-title">Title <span className="required">*</span></label>
          <input id="story-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your story's title" required maxLength={120} />
        </div>
        <div className="form-field">
          <label htmlFor="story-author">Author name</label>
          <input id="story-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
        </div>
        <div className="form-field">
          <label htmlFor="story-description">Description</label>
          <textarea id="story-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What is your story about?" maxLength={500} />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="story-genre">Genre</label>
            <select id="story-genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
              {GENRES.filter((g) => g !== 'All').map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="story-tags">Tags (comma separated)</label>
            <input id="story-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. Mystery, Dark, Romance" />
          </div>
        </div>
        <div className="form-field">
          <label>Cover color</label>
          <div className="cover-color-picker">
            {COVER_COLORS.map((c) => (
              <button type="button" key={c} className={`cover-swatch${coverColor === c ? ' cover-swatch--active' : ''}`}
                style={{ background: c }} aria-label={`Cover color ${c}`} onClick={() => setCoverColor(c)} />
            ))}
          </div>
          <div className="cover-preview"><StoryCover story={{ id: 'preview', userId: '', title: title || 'Your Story', author: author || 'You', description: '', genre, tags: [], status: 'Draft' as const, coverColor, chapters: [], totalWords: 0, isOwn: true, createdAt: 0, updatedAt: 0 } as Story} size="md" /></div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/studio')}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={!title.trim()}>Create Story</button>
        </div>
      </form>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// STORY EDITOR — write + manage chapters
// ══════════════════════════════════════════════════════════════════════════
function StoryEditor() {
  const { route, navigate, getStory, saveStory, settings } = useApp()
  const { success, error } = useToast()
  const storyId = route.replace('/studio/edit/', '').replace('/studio/write/', '')
  const rawStory = getStory(storyId)
  const [activeChIdx, setActiveChIdx] = useState(0)
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const saveTimer = useRef<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)
  const speechBaseRef = useRef('')
  const speechSessionRef = useRef(false)
  const speechRestartRef = useRef<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  if (!rawStory) return (
    <div className="page"><button className="back-btn" onClick={() => navigate('/studio')}><ArrowLeft size={16} /> Studio</button>
      <EmptyState icon={BookOpen} title="Story not found" text="This story no longer exists." action="Go to Studio" onAction={() => navigate('/studio')} /></div>
  )

  const story = rawStory

  const chapter: Chapter | undefined = story.chapters[activeChIdx]

  function autosave(updatedStory: Story) {
    setSyncStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => { saveStory(updatedStory); setSyncStatus('saved') }, 1200)
  }

  function updateChapter(patch: Partial<Chapter>) {
    if (!chapter) return
    const updated = story.chapters.map((ch, i) => i === activeChIdx ? { ...ch, ...patch, wordCount: wc(patch.body ?? ch.body), updatedAt: Date.now() } : ch)
    const updatedStory: Story = { ...story, chapters: updated, totalWords: updated.reduce((a, c) => a + c.wordCount, 0), updatedAt: Date.now() }
    saveStory(updatedStory)
    setSyncStatus('unsaved')
    autosave(updatedStory)
  }

  function addChapter() {
    const id = `ch-${storyId}-${Date.now()}`
    const num = story.chapters.length + 1
    const newCh: Chapter = { id, storyId, number: num, title: `Chapter ${num}`, body: '', note: '', status: 'Outline', wordCount: 0, createdAt: Date.now(), updatedAt: Date.now() }
    const updated: Story = { ...story, chapters: [...story.chapters, newCh], updatedAt: Date.now() }
    saveStory(updated)
    setActiveChIdx(story.chapters.length)
    success('Chapter added')
  }

  function deleteChapter(idx: number) {
    const updated: Story = { ...story, chapters: story.chapters.filter((_, i) => i !== idx).map((ch, i) => ({ ...ch, number: i + 1 })), updatedAt: Date.now() }
    saveStory(updated)
    setActiveChIdx(Math.min(idx, updated.chapters.length - 1))
    success('Chapter deleted')
  }

  function moveChapter(idx: number, dir: -1 | 1) {
    const target = idx + dir
    if (target < 0 || target >= story.chapters.length) return
    const chs = [...story.chapters]
    ;[chs[idx], chs[target]] = [chs[target], chs[idx]]
    const updated: Story = { ...story, chapters: chs.map((ch, i) => ({ ...ch, number: i + 1 })), updatedAt: Date.now() }
    saveStory(updated)
    setActiveChIdx(target)
  }

  function publishChapter() {
    if (!chapter) return
    const updatedStatus: Story['status'] = story.status === 'Draft' ? 'Ongoing' : story.status
    const updatedChapters = story.chapters.map((ch, i) => i === activeChIdx ? { ...ch, status: 'Published' as const, publishedAt: Date.now(), wordCount: wc(ch.body), updatedAt: Date.now() } : ch)
    const updatedStory: Story = { ...story, chapters: updatedChapters, status: updatedStatus, totalWords: updatedChapters.reduce((a, c) => a + c.wordCount, 0), updatedAt: Date.now() }
    saveStory(updatedStory)
    success('Chapter published')
  }

  // Dictation
  function dictate() {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (isRecording) {
      speechSessionRef.current = false
      if (speechRestartRef.current) clearTimeout(speechRestartRef.current)
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }
    if (!SR) { error('Speech recognition needs Chrome or Edge.'); return }
    speechBaseRef.current = chapter?.body ?? ''
    speechSessionRef.current = true
    function startRec() {
      if (!speechSessionRef.current) return
      const rec = new SR()
      recognitionRef.current = rec
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US'
      rec.onstart = () => setIsRecording(true)
      rec.onend = () => { if (speechSessionRef.current) { speechRestartRef.current = window.setTimeout(startRec, 150) } else { setIsRecording(false) } }
      rec.onerror = (e: any) => { if (e?.error === 'not-allowed') { speechSessionRef.current = false; setIsRecording(false); error('Microphone denied') } }
      rec.onresult = (e: any) => {
        let fin = ''; let interim = ''
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i]
          if (r.isFinal) fin += r[0].transcript
          else interim += r[0].transcript
        }
        const combined = fin + (interim ? ' ' + interim : '')
        if (!combined.trim()) return
        const sep = speechBaseRef.current.trim() ? '\n\n' : ''
        const body = speechBaseRef.current + sep + combined.trim()
        updateChapter({ body })
        if (fin) {
          speechBaseRef.current = speechBaseRef.current + (speechBaseRef.current.trim() ? '\n\n' : '') + fin.trim()
        }
      }
      try { rec.start() } catch { speechRestartRef.current = window.setTimeout(startRec, 500) }
    }
    startRec()
  }

  const activeWords = chapter ? wc(chapter.body) : 0
  const totalWords = story.chapters.reduce((a, c) => a + c.wordCount, 0)

  return (
    <div className="story-editor">
      {confirmDelete !== null && <ConfirmModal title="Delete chapter?" body="This chapter will be permanently deleted." confirmLabel="Delete" danger onConfirm={() => { deleteChapter(confirmDelete!); setConfirmDelete(null) }} onCancel={() => setConfirmDelete(null)} />}

      {/* Editor sidebar */}
      <aside className="editor-sidebar">
        <div className="editor-sidebar__head">
          <button className="back-btn back-btn--sm" onClick={() => navigate('/studio')}><ArrowLeft size={14} /> Studio</button>
          <div className="editor-sidebar__story-title">{story.title}</div>
          <div className="editor-sidebar__story-meta">
            <span className={`status-badge status-badge--${story.status.toLowerCase()}`}>{story.status}</span>
            <span>{totalWords.toLocaleString()} words</span>
          </div>
        </div>
        <div className="editor-sidebar__chapters-head">
          <span className="eyebrow">CHAPTERS</span>
          <button className="btn btn--xs btn--ghost" onClick={addChapter} aria-label="Add chapter"><Plus size={14} /></button>
        </div>
        <div className="editor-sidebar__chapters">
          {story.chapters.length === 0 && (
            <button className="editor-sidebar__add-first" onClick={addChapter}><Plus size={14} /> Add first chapter</button>
          )}
          {story.chapters.map((ch, i) => (
            <div key={ch.id} className={`editor-ch-item${i === activeChIdx ? ' editor-ch-item--active' : ''}`}>
              <button className="editor-ch-item__main" onClick={() => setActiveChIdx(i)}>
                <span className="editor-ch-item__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="editor-ch-item__info">
                  <strong>{ch.title}</strong>
                  <small>{ch.status} · {ch.wordCount} words</small>
                </span>
              </button>
              <div className="editor-ch-item__controls">
                <button className="icon-btn icon-btn--xs" aria-label="Move up" disabled={i === 0} onClick={() => moveChapter(i, -1)}>↑</button>
                <button className="icon-btn icon-btn--xs" aria-label="Move down" disabled={i === story.chapters.length - 1} onClick={() => moveChapter(i, 1)}>↓</button>
                <button className="icon-btn icon-btn--xs icon-btn--danger" aria-label="Delete chapter" onClick={() => setConfirmDelete(i)}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main editor */}
      <main className="editor-main">
        {!chapter ? (
          <div className="editor-main__empty">
            <p>Add a chapter to start writing.</p>
            <button className="btn btn--primary" onClick={addChapter}><Plus size={15} /> Add Chapter</button>
          </div>
        ) : (
          <>
            <div className="editor-toolbar">
              <div className="editor-toolbar__left">
                <span className="save-indicator">
                  {syncStatus === 'saving' && <><span className="save-dot save-dot--saving" /> Saving…</>}
                  {syncStatus === 'saved' && <><Check size={13} className="save-dot--saved" /> Saved</>}
                  {syncStatus === 'unsaved' && 'Unsaved changes'}
                </span>
              </div>
              <div className="editor-toolbar__right">
                <button className="btn btn--sm btn--ghost" onClick={() => navigate(`/studio/preview/${story.id}`)} title="Preview as printed book">
                  <BookOpen size={14} /> Preview Book
                </button>
                <button className={`btn btn--sm ${isRecording ? 'btn--recording' : 'btn--ghost'}`} onClick={dictate} aria-label={isRecording ? 'Stop recording' : 'Dictate'}>
                  {isRecording ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Dictate</>}
                </button>
                <select value={chapter.status} onChange={(e) => updateChapter({ status: e.target.value as Chapter['status'] })} aria-label="Chapter status" className="status-select">
                  {(['Outline', 'Notes', 'Draft', 'Published'] as const).map((s) => <option key={s}>{s}</option>)}
                </select>
                {chapter.status !== 'Published' && (
                  <button className="btn btn--primary btn--sm" onClick={publishChapter}>Publish</button>
                )}
              </div>
            </div>

            <div className="editor-scroll">
              <div className="editor-chapter-meta">
                <span className="editor-chapter-num">CHAPTER {String(activeChIdx + 1).padStart(2, '0')}</span>
              </div>
              <input className="editor-chapter-title"
                value={chapter.title}
                onChange={(e) => updateChapter({ title: e.target.value })}
                placeholder="Chapter title…" />
              <textarea className={`editor-manuscript editor-manuscript--${settings.font}`}
                value={chapter.body}
                onChange={(e) => updateChapter({ body: e.target.value })}
                placeholder="Begin writing here… or click Dictate to speak your story." />
              <div className="editor-foot">
                <span>{activeWords.toLocaleString()} words in this chapter</span>
                <span>{readTime(activeWords)} min read</span>
                <span>Total: {totalWords.toLocaleString()} words</span>
              </div>

              {/* Mira Craft Coach Diagnostic Assistant */}
              <div style={{ marginTop: 24 }}>
                <MiraCraftCoach currentText={chapter.body} chapterTitle={chapter.title} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// IMPORT NOVEL — upload TXT file
// ══════════════════════════════════════════════════════════════════════════
function ImportNovelView() {
  const { navigate, saveStory, settings, userId } = useApp()
  const { success, error } = useToast()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState(settings.name)
  const [genre, setGenre] = useState('Literary')
  const [fileContent, setFileContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsing, setParsing] = useState(false)
  const [chapterCount, setChapterCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.txt')) { error('Please upload a .txt file'); return }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setFileContent(text)
      if (!title) setTitle(file.name.replace(/\.txt$/i, '').replace(/_/g, ' ').replace(/-/g, ' '))
      const count = parseChapters(text).length
      setChapterCount(count)
    }
    reader.readAsText(file)
  }

  function parseChapters(text: string): { title: string; body: string }[] {
    // Try to split by Chapter headings
    const chapterRegex = /^(chapter\s+\w+[.:—\s-]*.*?)$/gim
    const splits = text.split(chapterRegex)
    if (splits.length > 2) {
      const chapters: { title: string; body: string }[] = []
      for (let i = 1; i < splits.length; i += 2) {
        const chTitle = splits[i].trim()
        const body = (splits[i + 1] ?? '').trim()
        if (body.length > 20) chapters.push({ title: chTitle || `Chapter ${chapters.length + 1}`, body })
      }
      if (chapters.length > 0) return chapters
    }
    // Fallback: split by blank lines, group into ~2000-word chunks
    const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    const chunks: { title: string; body: string }[] = []
    let current = ''
    let chNum = 1
    for (const para of paragraphs) {
      current += (current ? '\n\n' : '') + para
      if (wc(current) >= 1500) {
        chunks.push({ title: `Chapter ${chNum}`, body: current })
        current = ''
        chNum++
      }
    }
    if (current.trim()) chunks.push({ title: `Chapter ${chNum}`, body: current })
    return chunks.length > 0 ? chunks : [{ title: 'Chapter 1', body: text.trim() }]
  }

  function handleImport(e: React.FormEvent) {
    e.preventDefault()
    if (!fileContent || !title.trim()) return
    setParsing(true)
    setTimeout(() => {
      const chapters = parseChapters(fileContent)
      const id = `imported-${Date.now()}`
      const now = Date.now()
      const story: Story = {
        id, userId: userId ?? 'offline-device',
        title: title.trim(), author: author.trim(),
        description: `Imported from ${fileName}`,
        genre, tags: [genre],
        status: 'Draft',
        coverColor: '#4a3a2a',
        coverGradient: 'linear-gradient(145deg, #4a3a2a, #2a1a0a 60%, #6a4a3a)',
        chapters: chapters.map((ch, i) => ({
          id: `${id}-ch-${i}`, storyId: id, number: i + 1,
          title: ch.title, body: ch.body, note: '',
          status: 'Draft' as Chapter['status'],
          wordCount: wc(ch.body),
          createdAt: now, updatedAt: now,
        })),
        totalWords: chapters.reduce((a, c) => a + wc(c.body), 0),
        isOwn: true, createdAt: now, updatedAt: now,
      }
      saveStory(story)
      setParsing(false)
      success(`"${title}" imported — ${chapters.length} chapters`)
      navigate(`/studio/edit/${id}`)
    }, 400)
  }

  return (
    <div className="import-view">
      <div className="page-head"><h1>Import Novel</h1></div>
      <p className="import-view__desc">Upload a <code>.txt</code> file. Draftwell will automatically split it into chapters and add it to your Creator Studio.</p>
      <form className="story-form" onSubmit={handleImport}>
        <div className="form-field">
          <label>Upload file</label>
          <div className="file-upload" onClick={() => fileRef.current?.click()}>
            <Upload size={24} />
            <span>{fileName || 'Click to select a .txt file'}</span>
            {chapterCount > 0 && <span className="file-upload__count">{chapterCount} chapters detected</span>}
            <input ref={fileRef} type="file" accept=".txt" onChange={handleFile} style={{ display: 'none' }} />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="import-title">Story title</label>
          <input id="import-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        </div>
        <div className="form-field">
          <label htmlFor="import-author">Author</label>
          <input id="import-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
        </div>
        <div className="form-field">
          <label htmlFor="import-genre">Genre</label>
          <select id="import-genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
            {GENRES.filter((g) => g !== 'All').map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/studio')}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={!fileContent || !title.trim() || parsing}>
            {parsing ? 'Importing…' : 'Import Story'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// 404 PAGE
// ══════════════════════════════════════════════════════════════════════════
function NotFoundPage() {
  const { navigate } = useApp()
  return (
    <div className="page not-found-page">
      <div className="not-found">
        <span className="not-found__num">404</span>
        <h1>That page slipped between the chapters.</h1>
        <p>The page you're looking for doesn't exist — but there are plenty of good stories waiting.</p>
        <div className="not-found__actions">
          <button className="btn btn--primary" onClick={() => navigate('/home')}>Return Home</button>
          <button className="btn btn--ghost" onClick={() => navigate('/discover')}>Explore Stories</button>
        </div>
      </div>
    </div>
  )
}

// ── Profile stories section (avoids hook-in-callback) ────────────────────
function ProfileStoriesSection({ myStories, navigate }: { myStories: Story[]; navigate: (r: string) => void }) {
  const { isInLibrary, addToLibrary, removeFromLibrary } = useApp()
  const { success } = useToast()
  return (
    <div className="profile-section">
      <h2>My Stories</h2>
      <div className="work-grid">
        {myStories.slice(0, 3).map((s) => (
          <WorkCard key={s.id} story={s} onLibraryToggle={(st) => {
            if (isInLibrary(st.id)) { removeFromLibrary(st.id); success('Removed from library') }
            else { addToLibrary(st.id); success('Added to library') }
          }} />
        ))}
      </div>
      {myStories.length > 3 && (
        <button className="btn btn--ghost btn--sm" style={{ marginTop: 14 }} onClick={() => navigate('/studio/stories')}>
          View all stories
        </button>
      )}
    </div>
  )
}
