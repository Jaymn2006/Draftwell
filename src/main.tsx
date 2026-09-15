// ── Draftwell — Application Entry Point ──────────────────────────────────
import { Component, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowDownToLine, ArrowLeft, BookOpen, Check, ChevronRight,
  CircleHelp, Eye, FileText, ImagePlus, LayoutPanelLeft, Mic,
  MoreHorizontal, Palette, Plus, Settings, Sparkles, Upload,
  WandSparkles, X, MicOff,
} from 'lucide-react'
import './styles.css'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { loadUserSettings, saveUserSettings, submitFeedback, syncDraftToCloud } from './lib/cloud'
import { ProductShell } from './product'
import { AppProvider } from './lib/context'
import { ToastProvider } from './lib/toast'
import { defaultSettings, OFFLINE_USER_ID, migrateLegacyData, scopedKey } from './lib/store'
import type { SettingsState } from './lib/types'

// ── Types local to the Studio ─────────────────────────────────────────────
type OldChapter = { id: number; title: string; note: string; body: string; status: string }
type Theme = 'light' | 'dark' | 'amber' | 'eye'
type OldSettingsState = { name: string; role: string; theme: Theme; accent: string; font: 'serif' | 'sans'; page: 'classic' | 'modern' }
type SpeechRecognitionResult = { [key: number]: { transcript: string }; isFinal: boolean; length: number }
type SpeechRecognitionResultList = { [key: number]: SpeechRecognitionResult; length: number }
type SpeechRecognitionEvent = { results: SpeechRecognitionResultList; resultIndex: number }
type SpeechRecognitionInstance = { continuous: boolean; interimResults: boolean; lang: string; onstart: () => void; onend: () => void; onerror: (event?: { error?: string }) => void; onresult: (event: SpeechRecognitionEvent) => void; start: () => void; stop: () => void }
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance
type AuthMode = 'sign-in' | 'sign-up' | 'forgot'
type FeedbackKind = 'first-minute' | 'monthly' | 'quarterly'

// ── Mira AI — kept here for Creator Studio ───────────────────────────────
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

async function callMira(systemPrompt: string, userMessage: string, maxTokens = 220): Promise<string> {
  if (!OPENAI_KEY) {
    return "Omg hey! 👋 I'm Mira, your writing bestie! To unlock my full powers, add your VITE_OPENAI_API_KEY to .env.local — then I can actually help you write something amazing! ✨"
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      temperature: 0.88,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err?.error?.message ?? `OpenAI error ${res.status}`)
  }
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0]?.message?.content?.trim() ?? "Hmm, I blanked for a sec — try again? 💫"
}

const MIRA_SYSTEM = `You are Mira — Draftwell's AI writing companion. Your vibe is a classy, confident, warm teenager who genuinely LOVES great writing and wants every writer to succeed. Think: the coolest, most encouraging English teacher you ever had, but make her 17, stylish, and lowkey obsessed with good prose.

YOUR VOICE:
- Warm, upbeat, and genuinely enthusiastic — you light up when you see good writing
- Classy and intelligent, never sloppy. You use proper sentences but keep it conversational
- Occasionally use light expressions like "oh wow", "honestly?", "love that for you", "okay but this is genuinely good" — sparingly, never cringe
- You give real, actionable craft advice — tension, voice, imagery, pacing, character, dialogue
- Two to three sentences max for writing feedback. Be vivid and specific
- Never summarise the text back to the writer — they wrote it, they know what's in it
- No bullet points, no headers, just flowing warm guidance
- When explaining app features, be clear and delightful — like a friend showing you their favourite app

YOUR KNOWLEDGE — you know every feature of Draftwell inside out:
STUDIO (the writing desk): Chapters panel on the left, editor in the centre, microphone for real-time dictation, Save button for cloud sync, inline chapter title editing.
AGENT RAIL: "Read my scene" for craft feedback, "Find the next beat" for story suggestions, "Read all chapters" for manuscript overview, free-text Ask input.
BOOK PREVIEW: Shows manuscript as a real book with export TXT. SETTINGS: Four themes, four accent colours, two font styles. PRODUCT SHELL: Home, Discover, Library, Rankings, Reader, Following, Search, Creator Studio.`

const TOUR_STEPS: { title: string; prompt: string }[] = [
  { title: 'Welcome to Draftwell!', prompt: 'Give a warm, excited welcome to Draftwell. Introduce yourself as Mira. Tell the writer this is their creative home. Keep it to 2–3 sentences with your signature classy-teen warmth.' },
  { title: 'Your Manuscript', prompt: 'Explain the chapter list in the left sidebar: how to see all chapters, click one to open it, and use the "+ chapter" button to add a new one. Be encouraging and clear. 2–3 sentences.' },
  { title: 'The Writing Editor', prompt: 'Explain the centre editor: the chapter title (click to rename), the manuscript textarea, the word count at the bottom, and the Save button. Keep it warm and practical. 2–3 sentences.' },
  { title: 'The Microphone — Speak Your Story', prompt: 'Explain the microphone / dictation feature with genuine excitement. Tell the writer to click the "Speak a thought" button, speak naturally, and watch their words appear in real time. Click again to stop. 2–3 sentences.' },
  { title: 'Book Preview', prompt: 'Explain Book Preview — how clicking it in the sidebar shows the manuscript as a real book with a cover and first page, and there\'s an Export TXT button. Sound genuinely delighted. 2–3 sentences.' },
  { title: 'Mira — That\'s Me! ✨', prompt: 'Introduce the Agent Rail (the right panel) as yourself — Mira. Explain "Read my scene" gives craft feedback, "Find the next beat" suggests what comes next, and "Read all chapters" gives a full manuscript overview. 2–3 sentences.' },
  { title: 'Ask Mira Anything', prompt: 'Explain the "Ask Mira anything" input. The writer can type ANY question about writing, craft, characters, plot, grammar — and you\'ll answer. Sound warm and inviting. 2–3 sentences.' },
  { title: 'Settings & Themes', prompt: 'Explain Settings: four beautiful themes (Dark, Light, Amber, Eye Protection), accent colours, and serif/sans font styles. 2–3 sentences.' },
  { title: 'Cloud Sync & Offline', prompt: 'Explain cloud sync: when signed in, all chapters and settings automatically save to the cloud. Offline everything saves on the device. 2–3 sentences.' },
  { title: 'You\'re Ready! Go Write Something Beautiful ✨', prompt: 'Give a warm, heartfelt sign-off. Tell the writer they now know everything about Draftwell and it\'s time to write something amazing. Remind them you\'re always here. End with genuine encouragement. 2–3 sentences.' },
]

// ── Studio defaults ───────────────────────────────────────────────────────
const oldDefaultSettings: OldSettingsState = { name: 'Mara Ellison', role: 'Author', theme: 'dark', accent: '#d88a2f', font: 'serif', page: 'classic' }
const offlineUserId = OFFLINE_USER_ID

const initialChapters: OldChapter[] = [
  { id: 1, title: 'The first light', note: 'Open with the town before the storm.', status: 'Draft', body: 'The town woke before the sun did.\n\nAt four seventeen, every window on Marrow Street blinked gold, one after another, as if the houses were remembering how to breathe. Mara watched from the kitchen floor, her back against the oven, and counted them twice.\n\nBy the time the last light came on, the rain had started.' },
  { id: 2, title: 'A map of small things', note: 'Let the reader discover the house.', status: 'Notes', body: 'There were maps everywhere in the house, but none of them showed a place she recognized.' },
  { id: 3, title: 'The weather inside', note: 'The first honest conversation.', status: 'Outline', body: 'The weather had followed them in.' },
]
const starterText = initialChapters[0].body

function readScoped<T>(userId: string, key: string, fallback: T): T {
  const saved = localStorage.getItem(scopedKey(userId, key))
  if (!saved) return fallback
  try { return JSON.parse(saved) as T } catch { return fallback }
}

// ── Brand mark — inline SVG (no external PNG dependency) ─────────────────
function BrandMarkSVG({ size = 28 }: { size?: number }) {
  return (
    <span className="brand-mark" aria-label="Draftwell logo" style={{ width: size, height: size }}>
      <img
        src={`${import.meta.env.BASE_URL}Draftwell-logo.png.png`}
        alt="Draftwell"
        width={size}
        height={size}
        loading="eager"
        decoding="async"
        style={{ width: size, height: size, objectFit: 'cover' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.parentElement?.classList.add('brand-mark--fallback')
        }}
      />
      <span className="brand-mark__letter" aria-hidden="true">D</span>
    </span>
  )
}

// ── Boot skeleton — shown before any JS state resolves ───────────────────
function BootSkeleton() {
  return (
    <div className="boot-skeleton" aria-hidden="true">
      <div className="boot-skeleton__topbar">
        <div className="boot-skeleton__logo" />
        <div className="boot-skeleton__search" />
        <div className="boot-skeleton__avatar" />
      </div>
      <div className="boot-skeleton__body">
        <div className="boot-skeleton__sidebar">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="boot-skeleton__nav-item" style={{ width: `${60 + (i % 3) * 15}%` }} />
          ))}
        </div>
        <div className="boot-skeleton__main">
          <div className="boot-skeleton__hero" />
          <div className="boot-skeleton__cards">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="boot-skeleton__card">
                <div className="boot-skeleton__cover" />
                <div className="boot-skeleton__title" />
                <div className="boot-skeleton__meta" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Intro screen — max 800ms, skips if already seen ──────────────────────
function IntroScreen() {
  return (
    <main className="intro-screen">
      <div className="intro-glow" />
      <div className="intro-logo">
        <BrandMarkSVG size={64} />
        <span>Draftwell</span>
      </div>
      <p className="intro-tagline">Your voice, in print.</p>
      <div className="intro-progress"><span /></div>
    </main>
  )
}

// ── Auth screen ───────────────────────────────────────────────────────────
function AuthScreen({ onOffline }: { onOffline: () => void }) {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!supabase) { setMessage('Cloud sign-in is not configured. Continue offline or add your Supabase settings.'); return }
    setBusy(true)
    setMessage('')
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/Draftwell/`,
        })
        if (error) throw error
        setMessage('Check your email for a password reset link.')
      } else if (mode === 'sign-up') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Account created. Check your email if confirmation is required.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }

  const title = mode === 'sign-in' ? 'Welcome back' : mode === 'sign-up' ? 'Begin your book' : 'Find your way back'

  return (
    <main className="auth-screen">
      <div className="auth-art">
        <div className="auth-art-glow" />
        <BrandMarkSVG size={120} />
        <div className="auth-wordmark">Draftwell</div>
        <p>Your voice, in print.</p>
      </div>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-mini-brand"><BrandMarkSVG size={26} /><strong>Draftwell</strong></div>
          <span className="eyebrow">A QUIET PLACE TO WRITE</span>
          <h1>{title}</h1>
          <p className="auth-subtitle">Write out loud, keep every thought, and shape it into something lasting.</p>
          <form onSubmit={submit}>
            {mode !== 'forgot' && (
              <label>
                Email address
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </label>
            )}
            {mode !== 'forgot' && (
              <label>
                Password
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} />
              </label>
            )}
            {mode === 'forgot' && (
              <label>
                Email address
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </label>
            )}
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Create account' : 'Send reset link'}
            </button>
          </form>
          {message && <p className="auth-message">{message}</p>}
          {mode === 'sign-in' && <button className="text-button" onClick={() => setMode('forgot')}>Forgot password?</button>}
          {mode === 'forgot' && <button className="text-button" onClick={() => setMode('sign-in')}>Back to sign in</button>}
          <div className="auth-divider"><span>or</span></div>
          <button className="offline-button" onClick={onOffline}>Continue offline</button>
          <p className="auth-switch">
            {mode === 'sign-up' ? 'Already have an account?' : 'New to Draftwell?'}{' '}
            <button className="text-button inline" onClick={() => setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}>
              {mode === 'sign-up' ? 'Sign in' : 'Create an account'}
            </button>
          </p>
          <small className="auth-note">Your writing stays on this device when offline and syncs securely when you reconnect.</small>
        </div>
      </section>
    </main>
  )
}

// ── Error boundary ────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <main style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', background: '#050b12', color: '#eef4f5', fontFamily: 'DM Sans, sans-serif', padding: '40px', textAlign: 'center' }}>
          <div>
            <span style={{ display: 'block', color: '#d88a2f', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '1.3px', marginBottom: '16px' }}>DRAFTWELL · SOMETHING WENT WRONG</span>
            <h1 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: 500 }}>The page couldn't load</h1>
            <p style={{ margin: '0 0 28px', color: '#9aa9b3', fontSize: '14px', lineHeight: 1.6, maxWidth: '400px' }}>{this.state.error.message}</p>
            <button onClick={() => { this.setState({ error: null }); window.location.reload() }} style={{ padding: '11px 24px', border: 'none', background: '#d88a2f', color: '#fff9ef', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderRadius: '8px' }}>
              Reload Draftwell
            </button>
            <button onClick={() => this.setState({ error: null })} style={{ marginLeft: 12, padding: '11px 24px', border: '1px solid #263746', background: 'transparent', color: '#9aa9b3', fontSize: '13px', cursor: 'pointer', borderRadius: '8px' }}>
              Return Home
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ROOT APP — auth gate + context providers + route dispatch
// ══════════════════════════════════════════════════════════════════════════
function App() {
  // ── Boot: show skeleton immediately, skip intro if seen this session ──
  const alreadySeen = sessionStorage.getItem('draftwell-intro-seen') === 'true'
  const [introDone, setIntroDone] = useState(alreadySeen)
  const [booted, setBooted] = useState(alreadySeen) // shell skeleton fallback

  // Intro: max 800ms (down from 3200ms)
  useEffect(() => {
    if (introDone) return
    // Show shell skeleton after 200ms regardless (prevents blank screen)
    const skelTimer = window.setTimeout(() => setBooted(true), 200)
    // Complete intro at 800ms
    const introTimer = window.setTimeout(() => {
      sessionStorage.setItem('draftwell-intro-seen', 'true')
      setIntroDone(true)
    }, 800)
    return () => { window.clearTimeout(skelTimer); window.clearTimeout(introTimer) }
  }, [introDone])

  // ── Auth ──────────────────────────────────────────────────────────────
  const [authenticated, setAuthenticated] = useState(
    () => !isSupabaseConfigured || localStorage.getItem('draftwell-offline-mode') === 'true'
  )
  const [userId, setUserId] = useState<string | null>(
    () => localStorage.getItem('draftwell-offline-mode') === 'true' ? offlineUserId : null
  )
  const [privateReady, setPrivateReady] = useState(false)

  useEffect(() => {
    if (!supabase) return
    if (localStorage.getItem('draftwell-offline-mode') === 'true') {
      setAuthenticated(true)
      setUserId(offlineUserId)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session))
      setUserId(data.session?.user.id ?? null)
    }).catch(() => {
      // session check failed — let user continue offline
      setAuthenticated(true)
      setUserId(offlineUserId)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session))
      setUserId(session?.user.id ?? null)
      setPrivateReady(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Run legacy data migration once
  useEffect(() => {
    if (userId) migrateLegacyData(userId)
  }, [userId])

  // ── Route ─────────────────────────────────────────────────────────────
  const [route, setRoute] = useState(() => {
    const p = window.location.pathname.replace('/Draftwell', '') || '/home'
    return p === '/' ? '/home' : p
  })

  useEffect(() => {
    const handler = () => {
      const p = window.location.pathname.replace('/Draftwell', '') || '/home'
      setRoute(p === '/' ? '/home' : p)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  function navigate(nextRoute: string) {
    const full = `/Draftwell${nextRoute}`
    window.history.pushState({}, '', full)
    setRoute(nextRoute)
    window.scrollTo(0, 0)
  }

  // ── Show boot skeleton during intro (prevents blank screen) ───────────
  if (!introDone && !booted) return <IntroScreen />
  if (!introDone && booted) return <BootSkeleton />
  if (!authenticated) {
    return (
      <AuthScreen onOffline={() => {
        localStorage.setItem('draftwell-offline-mode', 'true')
        setUserId(offlineUserId)
        setPrivateReady(false)
        setAuthenticated(true)
      }} />
    )
  }

  // ── Studio route — legacy Mira editor ─────────────────────────────────
  if (route === '/studio') {
    return (
      <ToastProvider>
        <AppProvider userId={userId} authenticated={authenticated} setAuthenticated={setAuthenticated} setUserId={setUserId}>
          <StudioShellLegacy userId={userId} authenticated={authenticated} setAuthenticated={setAuthenticated} setUserId={setUserId} navigate={navigate} privateReady={privateReady} setPrivateReady={setPrivateReady} />
        </AppProvider>
      </ToastProvider>
    )
  }

  // ── Product shell — full reader/discovery platform ────────────────────
  return (
    <ToastProvider>
      <AppProvider userId={userId} authenticated={authenticated} setAuthenticated={setAuthenticated} setUserId={setUserId}>
        <ProductShell />
      </AppProvider>
    </ToastProvider>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// STUDIO SHELL — legacy Mira writing desk (kept intact)
// ══════════════════════════════════════════════════════════════════════════
interface StudioProps {
  userId: string | null
  authenticated: boolean
  setAuthenticated: (v: boolean) => void
  setUserId: (id: string | null) => void
  navigate: (route: string) => void
  privateReady: boolean
  setPrivateReady: (v: boolean) => void
}

function StudioShellLegacy({ userId, navigate, privateReady, setPrivateReady, setAuthenticated, setUserId }: StudioProps) {
  const uid = userId ?? offlineUserId

  const [chapters, setChapters] = useState<OldChapter[]>(() => readScoped(uid, 'chapters', initialChapters))
  const [activeId, setActiveId] = useState(1)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSaved, setIsSaved] = useState(true)
  const [cloudStatus, setCloudStatus] = useState<'offline' | 'ready' | 'syncing' | 'synced' | 'error'>(isSupabaseConfigured ? 'ready' : 'offline')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackKind, setFeedbackKind] = useState<FeedbackKind>('first-minute')
  const [agentMessage, setAgentMessage] = useState('Hey! ✨ I\'m Mira, your writing companion. I\'m here to help with your story, give craft feedback, and cheer you on. Click "Tour with Mira" to see everything this app can do!')
  const [agentBusy, setAgentBusy] = useState(false)
  const [agentInput, setAgentInput] = useState('')
  const [tourActive, setTourActive] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [settings, setSettings] = useState<OldSettingsState>(() => readScoped(uid, 'settings', oldDefaultSettings))
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const speechSessionRef = useRef(false)
  const speechRestartRef = useRef<number | null>(null)
  const speechBaseRef = useRef<string>('')

  // Persist chapters and settings
  useEffect(() => {
    if (!uid || !privateReady) return
    localStorage.setItem(scopedKey(uid, 'chapters'), JSON.stringify(chapters))
  }, [chapters, privateReady, uid])

  useEffect(() => {
    if (!uid || !privateReady) return
    localStorage.setItem(scopedKey(uid, 'settings'), JSON.stringify(settings))
    if (supabase && uid !== offlineUserId) saveUserSettings(settings as unknown as Parameters<typeof saveUserSettings>[0]).catch(() => undefined)
  }, [privateReady, settings, uid])

  useEffect(() => { document.documentElement.dataset.theme = settings.theme }, [settings.theme])

  // Load from cloud on mount
  useEffect(() => {
    if (!uid) return
    setPrivateReady(false)
    setChapters(readScoped(uid, 'chapters', initialChapters))
    setSettings(readScoped(uid, 'settings', oldDefaultSettings))
    if (!supabase || uid === offlineUserId) { setPrivateReady(true); return }
    loadUserSettings()
      .then((saved) => { if (saved) setSettings(saved as unknown as OldSettingsState); setPrivateReady(true) })
      .catch(() => setPrivateReady(true))
  }, [uid])

  // Cloud sync
  useEffect(() => {
    if (!privateReady || !supabase || uid === offlineUserId || localStorage.getItem('draftwell-offline-mode') === 'true') return
    setCloudStatus('syncing')
    syncDraftToCloud(chapters as unknown as Parameters<typeof syncDraftToCloud>[0], settings as unknown as Parameters<typeof syncDraftToCloud>[1])
      .then(() => setCloudStatus('synced'))
      .catch(() => { setCloudStatus('error') })
  }, [privateReady, uid])

  useEffect(() => () => {
    speechSessionRef.current = false
    if (speechRestartRef.current) window.clearTimeout(speechRestartRef.current)
    recognitionRef.current?.stop()
  }, [])

  const activeChapter = chapters.find((c) => c.id === activeId) ?? chapters[0]
  const wordCount = chapters.reduce((t, c) => t + c.body.trim().split(/\s+/).filter(Boolean).length, 0)
  const activeWords = activeChapter.body.trim().split(/\s+/).filter(Boolean).length

  function updateBody(body: string) {
    setChapters((cur) => cur.map((c) => c.id === activeId ? { ...c, body, status: 'Draft' } : c))
    setIsSaved(false)
  }

  function addChapter() {
    const id = Math.max(...chapters.map((c) => c.id), 0) + 1
    setChapters([...chapters, { id, title: `Chapter ${id}`, note: 'Give this chapter a note.', status: 'Outline', body: '' }])
    setActiveId(id)
    setIsSaved(false)
  }

  async function saveDraft() {
    setIsSaved(true)
    if (uid) localStorage.setItem(scopedKey(uid, 'chapters'), JSON.stringify(chapters))
    if (!isSupabaseConfigured) { setCloudStatus('offline'); return }
    setCloudStatus('syncing')
    try {
      await syncDraftToCloud(chapters as unknown as Parameters<typeof syncDraftToCloud>[0], settings as unknown as Parameters<typeof syncDraftToCloud>[1])
      setCloudStatus('synced')
    } catch { setCloudStatus('error') }
  }

  async function logOut() {
    if (supabase) await supabase.auth.signOut()
    localStorage.removeItem('draftwell-offline-mode')
    setUserId(null)
    setPrivateReady(false)
    setAuthenticated(false)
    setSettingsOpen(false)
  }

  async function askMira(prompt: string, userText: string) {
    if (agentBusy) return
    setAgentBusy(true)
    setAgentMessage('Mira is thinking… ✨')
    try {
      const reply = await callMira(MIRA_SYSTEM, `${prompt}\n\n---\n${userText || '(no text yet)'}`)
      setAgentMessage(reply)
    } catch (err) {
      setAgentMessage(err instanceof Error ? `Oops! ${err.message}` : 'Something went wrong — try again? 💫')
    } finally { setAgentBusy(false) }
  }

  async function runTourStep(step: number) {
    if (agentBusy) return
    setTourStep(step); setTourActive(true); setAgentBusy(true)
    setAgentMessage(`${TOUR_STEPS[step].title} — Mira is preparing… ✨`)
    try {
      const reply = await callMira(MIRA_SYSTEM, TOUR_STEPS[step].prompt, 180)
      setAgentMessage(reply)
    } catch (err) {
      setAgentMessage(err instanceof Error ? `Oops! ${err.message}` : 'Something went wrong — try again? 💫')
    } finally { setAgentBusy(false) }
  }

  function advanceTour(direction: 1 | -1) {
    const next = tourStep + direction
    if (next < 0 || next >= TOUR_STEPS.length) { setTourActive(false); return }
    void runTourStep(next)
  }

  function dictate() {
    const SR = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition

    if (isRecording) {
      speechSessionRef.current = false
      if (speechRestartRef.current) window.clearTimeout(speechRestartRef.current)
      recognitionRef.current?.stop()
      setIsRecording(false)
      setAgentMessage('Microphone stopped. Your transcript is saved in the manuscript.')
      return
    }
    if (!SR) { setAgentMessage('Speech recognition needs Chrome or Edge. You can still type here.'); return }

    speechBaseRef.current = activeChapter.body
    speechSessionRef.current = true

    function startRec() {
      if (!speechSessionRef.current) return
      const recognition = new SR!()
      recognitionRef.current = recognition
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.onstart = () => { setIsRecording(true); setAgentMessage('Listening… speak naturally. Mira is writing every word.') }
      recognition.onend = () => {
        if (!speechSessionRef.current) { setIsRecording(false); return }
        speechRestartRef.current = window.setTimeout(startRec, 150)
      }
      recognition.onerror = (event) => {
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          speechSessionRef.current = false; setIsRecording(false)
          setAgentMessage('Microphone access was denied. Allow it in your browser settings, then try again.')
        } else if (event?.error === 'network') {
          setAgentMessage('Brief network hiccup. Reconnecting microphone…')
        }
      }
      recognition.onresult = (event) => {
        let finalText = ''; let interimText = ''
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i]; const text = r[0].transcript
          if (r.isFinal) finalText += (finalText ? ' ' : '') + text
          else interimText += text
        }
        const sep = speechBaseRef.current.trim() ? '\n\n' : ''
        const combined = finalText + (interimText ? ' ' + interimText : '')
        updateBody(speechBaseRef.current + (combined.trim() ? sep + combined.trim() : ''))
        if (finalText) {
          speechBaseRef.current = speechBaseRef.current + (speechBaseRef.current.trim() ? '\n\n' : '') + finalText.trim()
          setAgentMessage('Mira is capturing your words. Keep speaking.')
        }
      }
      try { recognition.start() } catch { speechRestartRef.current = window.setTimeout(startRec, 500) }
    }
    startRec()
  }

  return (
    <div className="app-shell" style={{ '--accent': settings.accent } as React.CSSProperties}>
      <header className="topbar">
        <div className="brand"><BrandMarkSVG /><span>Draftwell</span></div>
        <div className="topbar-project">
          <button className="studio-back" onClick={() => navigate('/home')}><ArrowLeft size={15} /> My Stories</button>
          <ChevronRight size={14} />
          <div><span className="eyebrow">CURRENT PROJECT</span><strong>The Shape of Rain</strong></div>
        </div>
        <div className="top-actions">
          <button className="icon-button" title="Help" aria-label="Open help" onClick={() => setHelpOpen(true)}><CircleHelp size={18} /></button>
          <button className="profile-button" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
            <span className="avatar">{settings.name.slice(0, 2).toUpperCase()}</span>
            <span>{settings.name}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="side-heading">
            <div><span className="eyebrow">YOUR LIBRARY</span><h2>My stories</h2></div>
            <button className="icon-button quiet" title="New project" aria-label="New project" onClick={() => navigate('/studio/write/new')}><Plus size={18} /></button>
          </div>
          <div className="project-card">
            <div className="project-cover"><span>THE<br /><i>SHAPE</i><br />OF RAIN</span></div>
            <div className="project-meta">
              <strong>The Shape of Rain</strong>
              <span>Novel · {Math.round((chapters.reduce((a, c) => a + c.body.split(/\s+/).filter(Boolean).length, 0) / 80000) * 100)}% complete</span>
              <div className="progress"><span style={{ width: `${Math.min(100, Math.round((chapters.reduce((a, c) => a + c.body.split(/\s+/).filter(Boolean).length, 0) / 80000) * 100))}%` }} /></div>
            </div>
            <div className="project-menu-wrap">
              <button className="project-menu-button" title="Project actions" aria-expanded={projectMenuOpen} aria-label="Project actions" onClick={() => setProjectMenuOpen((o) => !o)}><MoreHorizontal size={16} className="muted-icon" /></button>
              {projectMenuOpen && (
                <div className="project-menu" role="menu">
                  <button role="menuitem" onClick={() => setProjectMenuOpen(false)}>Continue writing</button>
                  <button role="menuitem" onClick={() => setProjectMenuOpen(false)}>Rename</button>
                  <button role="menuitem" onClick={() => setProjectMenuOpen(false)}>Duplicate</button>
                  <button role="menuitem" className="danger" onClick={() => setProjectMenuOpen(false)}>Delete</button>
                </div>
              )}
            </div>
          </div>
          <nav className="side-nav" aria-label="Studio navigation">
            <button className="nav-item active" onClick={() => undefined}><LayoutPanelLeft size={17} /> Workspace</button>
            <button className="nav-item" onClick={() => setPreviewOpen(true)}><BookOpen size={17} /> Book preview</button>
            <button className="nav-item" onClick={saveDraft}><ArrowDownToLine size={17} /> Export &amp; publish</button>
          </nav>
          <div className="outline-label">
            <span className="eyebrow">MANUSCRIPT</span>
            <button className="new-chapter" onClick={addChapter} aria-label="Add chapter"><Plus size={14} /> chapter</button>
          </div>
          <div className="chapter-list">
            {chapters.map((chapter, index) => (
              <button key={chapter.id} className={`chapter-item${chapter.id === activeId ? ' selected' : ''}`} onClick={() => setActiveId(chapter.id)}>
                <span className="chapter-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="chapter-info">
                  <strong>{chapter.title}</strong>
                  <small>{chapter.status} · {chapter.body.trim().split(/\s+/).filter(Boolean).length} words</small>
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <button className="nav-item" onClick={() => setSettingsOpen(true)}><Settings size={17} /> Settings</button>
            <div className="storage-status">
              {cloudStatus === 'syncing' ? '↻ Syncing…' : cloudStatus === 'synced' ? '✓ Saved to cloud' : cloudStatus === 'error' ? '⚠ Saved offline' : cloudStatus === 'ready' ? '● Cloud ready' : '✓ Saved on device'}
            </div>
          </div>
        </aside>

        <main className="editor-area">
          <div className="editor-toolbar">
            <div className="breadcrumb"><span>Part one</span><ChevronRight size={14} /><strong>{activeChapter.title}</strong></div>
            <div className="toolbar-actions">
              <span className="save-state">{isSaved ? <><span style={{ color: 'var(--success)' }}>✓</span> Saved</> : 'Unsaved changes'}</span>
              <button className="secondary-button" onClick={saveDraft} aria-label="Save draft"><span>Save</span></button>
              <button className={`record-button${isRecording ? ' recording' : ''}`} onClick={dictate} aria-label={isRecording ? 'Stop dictation' : 'Start dictation'}>
                {isRecording ? <><MicOff size={15} /> Stop</> : <><Mic size={15} /> Speak</>}
              </button>
            </div>
          </div>
          <div className="editor-scroll">
            <div className="chapter-kicker">CHAPTER {String(chapters.findIndex((c) => c.id === activeId) + 1).padStart(2, '0')} <span>•</span> {activeChapter.status.toUpperCase()}</div>
            <input
              className="chapter-title"
              value={activeChapter.title}
              aria-label="Chapter title"
              onChange={(e) => setChapters(chapters.map((c) => c.id === activeId ? { ...c, title: e.target.value } : c))}
            />
            <textarea
              className={`manuscript ${settings.font}`}
              value={activeChapter.body}
              onChange={(e) => updateBody(e.target.value)}
              placeholder="Begin speaking or writing here…"
              aria-label="Manuscript editor"
            />
            <div className="editor-foot">
              <span>{activeWords.toLocaleString()} words in this chapter</span>
              <span>{wordCount.toLocaleString()} total · {Math.max(1, Math.round(wordCount / 200))} min read</span>
            </div>
          </div>
        </main>

        <aside className="agent-rail" aria-label="Mira writing assistant">
          <div className="agent-header">
            <div><span className="eyebrow">DRAFTWELL AGENT</span><h2>Mira ✨</h2></div>
            <span className={`sparkle${agentBusy ? ' agent-thinking' : ''}`}><Sparkles size={17} /></span>
          </div>
          <div className="agent-intro">
            <div className="agent-orbit"><WandSparkles size={22} /></div>
            <p className="agent-message">{agentMessage}</p>
          </div>

          {tourActive && (
            <div className="tour-controls">
              <span className="tour-step-label">{TOUR_STEPS[tourStep].title}</span>
              <div className="tour-nav">
                <button className="tour-nav-btn" disabled={tourStep === 0 || agentBusy} onClick={() => advanceTour(-1)}>← Prev</button>
                <span className="tour-progress">{tourStep + 1} / {TOUR_STEPS.length}</span>
                {tourStep < TOUR_STEPS.length - 1
                  ? <button className="tour-nav-btn tour-nav-btn--next" disabled={agentBusy} onClick={() => advanceTour(1)}>Next →</button>
                  : <button className="tour-nav-btn tour-nav-btn--done" disabled={agentBusy} onClick={() => setTourActive(false)}>Done ✓</button>
                }
              </div>
            </div>
          )}

          <div className="agent-actions">
            <button className="tour-button" disabled={agentBusy} onClick={() => void runTourStep(0)}>
              <Sparkles size={15} /> {agentBusy && tourActive ? 'Loading…' : 'Tour with Mira'}
            </button>
            <button disabled={agentBusy} onClick={() => askMira('Read this scene and give one precise craft observation — focus on tension, imagery, or voice.', `Chapter: ${activeChapter.title}\n\n${activeChapter.body}`)}>
              <WandSparkles size={15} /> {agentBusy && !tourActive ? 'Thinking… ✨' : 'Read my scene'}
            </button>
            <button disabled={agentBusy} onClick={() => askMira('Suggest one vivid, concrete next beat or sentence the writer could add.', `Chapter: ${activeChapter.title}\n\n${activeChapter.body}`)}>
              <Sparkles size={15} /> {agentBusy && !tourActive ? 'Thinking… ✨' : 'Find the next beat'}
            </button>
            <button disabled={agentBusy} onClick={() => askMira('Give a warm overall feel of the manuscript — what is working beautifully and one gentle thing to watch.', chapters.map((c) => `${c.title}:\n${c.body}`).join('\n\n---\n\n'))}>
              <BookOpen size={15} /> {agentBusy && !tourActive ? 'Thinking… ✨' : 'Read all chapters'}
            </button>
          </div>

          <div className="agent-ask-row">
            <input
              className="agent-ask-input"
              placeholder="Ask Mira anything…"
              value={agentInput}
              aria-label="Ask Mira anything"
              onChange={(e) => setAgentInput(e.target.value)}
              disabled={agentBusy}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && agentInput.trim()) {
                  void askMira('Answer the writer\'s question with warmth and expertise.', `Question: ${agentInput}\n\nCurrent chapter (${activeChapter.title}):\n${activeChapter.body}`)
                  setAgentInput('')
                }
              }}
            />
            <button
              className="agent-ask-send"
              aria-label="Send to Mira"
              disabled={agentBusy || !agentInput.trim()}
              onClick={() => {
                if (!agentInput.trim()) return
                void askMira('Answer the writer\'s question with warmth and expertise.', `Question: ${agentInput}\n\nCurrent chapter (${activeChapter.title}):\n${activeChapter.body}`)
                setAgentInput('')
              }}
            ><Sparkles size={14} /></button>
          </div>

          <div className="rail-divider" />
          <div className="rail-section">
            <div className="section-label"><span>CHAPTER NOTE</span><button aria-label="Edit chapter note" title="Chapter note"><FileText size={14} /></button></div>
            <p className="chapter-note">{activeChapter.note}</p>
          </div>
          <div className="rail-section">
            <div className="section-label"><span>AT A GLANCE</span><MoreHorizontal size={15} /></div>
            <div className="glance-row"><span>Project words</span><strong>{wordCount.toLocaleString()}</strong></div>
            <div className="glance-row"><span>Reading time</span><strong>{Math.max(1, Math.round(wordCount / 200))} min</strong></div>
            <div className="glance-row"><span>Chapters</span><strong>{chapters.length}</strong></div>
          </div>
          <button className="preview-link" onClick={() => setPreviewOpen(true)} aria-label="See book preview">
            <BookOpen size={16} /> See how it reads as a book <ChevronRight size={15} />
          </button>
        </aside>
      </div>

      {settingsOpen && <SettingsModal settings={settings} setSettings={setSettings} close={() => setSettingsOpen(false)} logOut={logOut} />}
      {helpOpen && <HelpModal close={() => setHelpOpen(false)} />}
      {previewOpen && <PreviewModal chapters={chapters} close={() => setPreviewOpen(false)} />}
    </div>
  )
}

// ── Settings modal ────────────────────────────────────────────────────────
function SettingsModal({ settings, setSettings, close, logOut }: {
  settings: OldSettingsState
  setSettings: React.Dispatch<React.SetStateAction<OldSettingsState>>
  close: () => void
  logOut: () => Promise<void>
}) {
  const themes: { id: Theme; label: string }[] = [
    { id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' },
    { id: 'amber', label: 'Amber' }, { id: 'eye', label: 'Eye Care' },
  ]
  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="settings-title">
        <div className="modal-heading">
          <div><span className="eyebrow">WORKSPACE SETTINGS</span><h2 id="settings-title">Make it yours</h2></div>
          <button className="icon-button" onClick={close} aria-label="Close settings"><X size={18} /></button>
        </div>
        <div className="setting-block">
          <label className="setting-block__label">Profile</label>
          <div className="profile-setting">
            <div className="avatar large">{settings.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <input value={settings.name} aria-label="Your name" onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
              <span>{settings.role} · stored locally</span>
            </div>
          </div>
        </div>
        <div className="setting-block">
          <label className="setting-block__label">Theme</label>
          <div className="theme-options theme-grid">
            {themes.map((t) => (
              <button key={t.id} className={`theme-option${settings.theme === t.id ? ' theme-option--active' : ''}`}
                onClick={() => setSettings({ ...settings, theme: t.id })}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className="setting-block">
          <label className="setting-block__label">Accent colour</label>
          <div className="color-row">
            {['#d88a2f', '#c4543d', '#287a74', '#5c6599'].map((color) => (
              <button key={color} className={`color-swatch${settings.accent === color ? ' cover-swatch--active' : ''}`}
                style={{ background: color }} aria-label={`Accent ${color}`}
                onClick={() => setSettings({ ...settings, accent: color })} />
            ))}
          </div>
        </div>
        <div className="setting-block">
          <label className="setting-block__label">Document style</label>
          <div className="style-options">
            <button className={`style-option${settings.font === 'serif' ? ' theme-option--active' : ''}`}
              onClick={() => setSettings({ ...settings, font: 'serif' })}>
              <span className="style-preview serif">Aa</span>
              <span><strong>Quiet classic</strong><small>Literary serif</small></span>
            </button>
            <button className={`style-option${settings.font === 'sans' ? ' theme-option--active' : ''}`}
              onClick={() => setSettings({ ...settings, font: 'sans' })}>
              <span className="style-preview sans">Aa</span>
              <span><strong>Clean modern</strong><small>Sans-serif</small></span>
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <span><Palette size={15} /> Changes stay on this device</span>
          <button className="secondary-button" onClick={() => void logOut()}>Sign out</button>
          <button className="primary-button" onClick={close}>Done</button>
        </div>
      </div>
    </div>
  )
}

// ── Help modal ────────────────────────────────────────────────────────────
function HelpModal({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal help-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="help-title">
        <div className="modal-heading">
          <div><span className="eyebrow">DRAFTWELL GUIDE</span><h2 id="help-title">A quiet place to make</h2></div>
          <button className="icon-button" onClick={close} aria-label="Close help"><X size={18} /></button>
        </div>
        <p className="help-copy">Draftwell keeps the creative work in your hands: speak an idea, shape the manuscript, design the book, and return to it whenever inspiration comes back.</p>
        <div className="help-grid">
          <section><span className="help-label">WRITE</span><strong>Speak a thought</strong><p>Use the microphone to transcribe one idea at a time. Your words are added to the active chapter, never silently rewritten.</p></section>
          <section><span className="help-label">SAVE</span><strong>Your work stays yours</strong><p>Drafts and settings are saved for the signed-in account. Offline writing stays on this device and syncs when you reconnect.</p></section>
          <section><span className="help-label">SHAPE</span><strong>Build the book</strong><p>Add chapters, change the reading style, ask Mira for a next beat, and open Book Preview to see the manuscript as a book.</p></section>
          <section><span className="help-label">SHORTCUTS</span><strong>A few useful cues</strong><p>Use Tab to move through controls, Escape to close a panel, and save before leaving a long writing session.</p></section>
        </div>
        <div className="help-contact">
          <strong>Need a human?</strong>
          <span>Bug reports, product ideas, and account help</span>
          <a href="mailto:jaymn2006@gmail.com">jaymn2006@gmail.com</a>
        </div>
        <div className="modal-footer">
          <span>Draftwell · your voice, in print.</span>
          <button className="primary-button" onClick={close}>Close guide</button>
        </div>
      </div>
    </div>
  )
}

// ── Preview modal ─────────────────────────────────────────────────────────
function PreviewModal({ chapters, close }: { chapters: OldChapter[]; close: () => void }) {
  function exportText() {
    const content = chapters.map((c) => `${c.title}\n\n${c.body}`).join('\n\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'the-shape-of-rain.txt'; link.click()
    URL.revokeObjectURL(url)
  }
  const firstChapter = chapters[0]
  return (
    <div className="modal-backdrop preview-backdrop" onClick={close}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="preview-top">
          <div><span className="eyebrow">BOOK PREVIEW</span><h2>The Shape of Rain</h2></div>
          <div className="preview-tools">
            <button className="secondary-button" onClick={exportText}><ArrowDownToLine size={15} /> Export TXT</button>
            <button className="icon-button" onClick={close} aria-label="Close preview"><X size={18} /></button>
          </div>
        </div>
        <div className="book-stage">
          <div className="book-cover">
            <div className="cover-top">A NOVEL</div>
            <div className="cover-title">THE<br /><i>SHAPE</i><br />OF RAIN</div>
            <div className="cover-author">MARA ELLISON</div>
            <div className="cover-mark">D</div>
          </div>
          <div className="book-page">
            <div className="page-running">THE SHAPE OF RAIN <span>01</span></div>
            <h3>{firstChapter?.title}</h3>
            <p>{firstChapter?.body || starterText}</p>
            <div className="page-rule" />
            <span className="page-number">1</span>
          </div>
        </div>
        <div className="preview-bottom">
          <div>
            <strong>Ready for the shelf</strong>
            <span>TXT export · {chapters.length} chapters · {chapters.reduce((a, c) => a + c.body.length, 0).toLocaleString()} characters</span>
          </div>
          <button className="primary-button" onClick={exportText}><ImagePlus size={16} /> Export manuscript</button>
        </div>
      </div>
    </div>
  )
}

// ── Mount ─────────────────────────────────────────────────────────────────
const rootElement = document.getElementById('root')!
const rootWindow = window as typeof window & { __draftwellRoot?: ReturnType<typeof createRoot> }
const root = rootWindow.__draftwellRoot ?? createRoot(rootElement)
rootWindow.__draftwellRoot = root
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
