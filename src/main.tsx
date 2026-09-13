import { Component, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowDownToLine,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  FileText,
  Headphones,
  ImagePlus,
  LayoutPanelLeft,
  Mic,
  MoreHorizontal,
  Palette,
  Plus,
  Settings,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from 'lucide-react'
import './styles.css'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { loadUserSettings, saveUserSettings, submitFeedback, syncDraftToCloud } from './lib/cloud'
import { ProductShell } from './product'

type Chapter = { id: number; title: string; note: string; body: string; status: string }
type Theme = 'light' | 'dark' | 'amber' | 'eye'
type SettingsState = { name: string; role: string; theme: Theme; accent: string; font: 'serif' | 'sans'; page: 'classic' | 'modern' }
type SpeechRecognitionResult = { [key: number]: { transcript: string }; isFinal: boolean; length: number }
type SpeechRecognitionResultList = { [key: number]: SpeechRecognitionResult; length: number }
type SpeechRecognitionEvent = { results: SpeechRecognitionResultList; resultIndex: number }
type SpeechRecognitionInstance = { continuous: boolean; interimResults: boolean; lang: string; onstart: () => void; onend: () => void; onerror: (event?: { error?: string }) => void; onresult: (event: SpeechRecognitionEvent) => void; start: () => void; stop: () => void }
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance
type AuthMode = 'sign-in' | 'sign-up' | 'forgot'
type FeedbackKind = 'first-minute' | 'monthly' | 'quarterly'

// ── Mira AI agent ─────────────────────────────────────────────────────────
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

// ── Mira personality: classy teen, warm, smart, fun ──────────────────────
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
STUDIO (the writing desk):
  - Chapters panel on the left: add chapters with "+ chapter", click any to switch
  - Editor in the centre: type freely, or use the microphone button to dictate
  - Microphone button: click once to START recording — it transcribes your speech in real time as you write. Click again to STOP. Works in Chrome and Edge
  - Save button: saves locally and syncs to cloud if you're signed in
  - Chapter title: click to edit it inline
  - Chapter status badge: shows Draft / Notes / Outline

AGENT RAIL (right side — that's you, Mira!):
  - "Read my scene" — Mira reads your active chapter and gives craft feedback
  - "Find the next beat" — Mira suggests a vivid next sentence or story beat
  - "Read all chapters" — Mira gives an overview of your whole manuscript
  - Ask Mira anything input — type any writing question and press Enter or the send button
  - Tour with Mira — step-by-step walkthrough of every feature

BOOK PREVIEW:
  - Shows your manuscript as a real book — cover + opening page
  - Export TXT button downloads a plain-text copy of all chapters
  - Access via "Book preview" in the sidebar nav or the preview button

SETTINGS:
  - Change your name and author profile
  - Four themes: Dark (default), Light, Amber, Eye-protection green
  - Four accent colours
  - Two document styles: Quiet Classic (serif) and Clean Modern (sans-serif)
  - Sign out from the modal footer

PRODUCT SHELL (Home, Discover, Library, etc.):
  - Home: see featured stories and your library
  - Discover: browse novels, fanfic, comics
  - Library: your saved stories
  - Rankings: trending works
  - Reader: read a story chapter by chapter
  - Write: start a new creative project
  - Creator Studio: back to your writing desk

CLOUD SYNC:
  - Works automatically when signed in — chapters and settings sync to Supabase
  - Offline mode: use "Continue offline" at sign-in — everything saves on-device
  - Status shows in the sidebar footer: "Saved to cloud and device" when synced

SIGN IN / SIGN UP:
  - Create account with email + password
  - Forgot password sends a reset email
  - "Continue offline" skips auth and saves locally`

// ── Tour steps ────────────────────────────────────────────────────────────
const TOUR_STEPS: { title: string; prompt: string }[] = [
  {
    title: 'Welcome to Draftwell!',
    prompt: 'Give a warm, excited welcome to Draftwell. Introduce yourself as Mira. Tell the writer this is their creative home — a beautiful place to write, save, and shape their stories. Keep it to 2–3 sentences with your signature classy-teen warmth.',
  },
  {
    title: 'Your Manuscript',
    prompt: 'Explain the chapter list in the left sidebar: how to see all chapters, click one to open it, and use the "+ chapter" button to add a new one. Be encouraging and clear. 2–3 sentences.',
  },
  {
    title: 'The Writing Editor',
    prompt: 'Explain the centre editor: the chapter title (click to rename), the manuscript textarea (just start typing!), the word count at the bottom, and the Save button. Keep it warm and practical. 2–3 sentences.',
  },
  {
    title: 'The Microphone — Speak Your Story',
    prompt: 'Explain the microphone / dictation feature with genuine excitement. Tell the writer to click the "Speak a thought" button, speak naturally, and watch their words appear in real time. Click again to stop. Works in Chrome and Edge. 2–3 sentences.',
  },
  {
    title: 'Book Preview',
    prompt: 'Explain Book Preview — how clicking it in the sidebar shows the manuscript as a real book with a cover and first page, and there\'s an Export TXT button to download everything. Sound genuinely delighted by this feature. 2–3 sentences.',
  },
  {
    title: 'Mira — That\'s Me! ✨',
    prompt: 'Introduce the Agent Rail (the right panel) as yourself — Mira. Explain "Read my scene" gives craft feedback, "Find the next beat" suggests what comes next, and "Read all chapters" gives a full manuscript overview. Use first person and sound excited. 2–3 sentences.',
  },
  {
    title: 'Ask Mira Anything',
    prompt: 'Explain the "Ask Mira anything" input at the bottom of the agent rail. The writer can type ANY question — about writing craft, their story, characters, plot, grammar, anything — and you\'ll answer. Sound warm and inviting. 2–3 sentences.',
  },
  {
    title: 'Settings & Themes',
    prompt: 'Explain Settings: click the profile button or Settings in the sidebar. They can change their name, pick from four beautiful themes (Dark, Light, Amber, Eye Protection), choose accent colours, and switch between serif and sans-serif writing styles. 2–3 sentences.',
  },
  {
    title: 'Cloud Sync & Offline',
    prompt: 'Explain cloud sync: when signed in, all chapters and settings automatically save to the cloud. If offline, everything still saves on the device and syncs when they reconnect. The status shows in the sidebar footer. 2–3 sentences.',
  },
  {
    title: 'You\'re Ready! Go Write Something Beautiful ✨',
    prompt: 'Give a warm, heartfelt sign-off. Tell the writer they now know everything about Draftwell and it\'s time to write something amazing. Remind them you\'re always here in the agent rail whenever they need help. End with genuine encouragement. 2–3 sentences.',
  },
]
const defaultSettings: SettingsState = { name: 'Mara Ellison', role: 'Author', theme: 'dark', accent: '#d88a2f', font: 'serif', page: 'classic' }

const offlineUserId = 'offline-device'

function scopedKey(userId: string, key: string) {
  return `draftwell:${userId}:${key}`
}

function readScoped<T>(userId: string, key: string, fallback: T): T {
  const saved = localStorage.getItem(scopedKey(userId, key))
  if (!saved) return fallback
  try { return JSON.parse(saved) as T } catch { return fallback }
}

const initialChapters: Chapter[] = [
  { id: 1, title: 'The first light', note: 'Open with the town before the storm.', status: 'Draft', body: 'The town woke before the sun did.\n\nAt four seventeen, every window on Marrow Street blinked gold, one after another, as if the houses were remembering how to breathe. Mara watched from the kitchen floor, her back against the oven, and counted them twice.\n\nBy the time the last light came on, the rain had started.', },
  { id: 2, title: 'A map of small things', note: 'Let the reader discover the house.', status: 'Notes', body: 'There were maps everywhere in the house, but none of them showed a place she recognized.', },
  { id: 3, title: 'The weather inside', note: 'The first honest conversation.', status: 'Outline', body: 'The weather had followed them in.', },
]

const starterText = initialChapters[0].body

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <main style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', background: '#050b12', color: '#eef4f5', fontFamily: 'DM Sans, sans-serif', padding: '40px', textAlign: 'center' }}>
          <div>
            <span style={{ display: 'block', color: '#d88a2f', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '1.3px', marginBottom: '16px' }}>DRAFTWELL · SOMETHING WENT WRONG</span>
            <h1 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: 500 }}>The page couldn't load</h1>
            <p style={{ margin: '0 0 28px', color: '#9aa9b3', fontSize: '14px', lineHeight: 1.6, maxWidth: '400px' }}>{this.state.error.message}</p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload() }}
              style={{ padding: '11px 20px', border: '1px solid #d88a2f', background: '#d88a2f', color: '#fff9ef', fontSize: '12px', cursor: 'pointer', borderRadius: '999px' }}
            >
              Reload Draftwell
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}

function App() {
  const [introDone, setIntroDone] = useState(() => sessionStorage.getItem('draftwell-intro-seen') === 'true')
  const [authenticated, setAuthenticated] = useState(() => !isSupabaseConfigured || localStorage.getItem('draftwell-offline-mode') === 'true')
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('draftwell-offline-mode') === 'true' ? offlineUserId : null)
  const [privateReady, setPrivateReady] = useState(false)

  useEffect(() => {
    if (introDone) return
    const timer = window.setTimeout(() => { sessionStorage.setItem('draftwell-intro-seen', 'true'); setIntroDone(true) }, 3200)
    return () => window.clearTimeout(timer)
  }, [introDone])

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
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session))
      setUserId(session?.user.id ?? null)
      setPrivateReady(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const [chapters, setChapters] = useState<Chapter[]>(() => {
    return initialChapters
  })
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
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [route, setRoute] = useState(() => window.location.pathname === '/' ? '/home' : window.location.pathname)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const speechSessionRef = useRef(false)
  const speechRestartRef = useRef<number | null>(null)
  // baseline body text at the moment recording started — so we can append without duplication
  const speechBaseRef = useRef<string>('')

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname === '/' ? '/home' : window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(nextRoute: string) {
    window.history.pushState({}, '', nextRoute)
    setRoute(nextRoute)
    window.scrollTo(0, 0)
  }

  const activeChapter = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0]
  const wordCount = useMemo(() => chapters.reduce((total, chapter) => total + chapter.body.trim().split(/\s+/).filter(Boolean).length, 0), [chapters])
  const activeWords = activeChapter.body.trim().split(/\s+/).filter(Boolean).length

  useEffect(() => {
    if (!userId) return
    setPrivateReady(false)
    setChapters(readScoped(userId, 'chapters', initialChapters))
    setSettings(readScoped(userId, 'settings', defaultSettings))
    if (!supabase || userId === offlineUserId) {
      setPrivateReady(true)
      return
    }
    loadUserSettings()
      .then((saved) => {
        if (saved) setSettings(saved)
        setPrivateReady(true)
      })
      .catch(() => setPrivateReady(true))
  }, [userId])
  useEffect(() => {
    if (!userId || !privateReady) return
    localStorage.setItem(scopedKey(userId, 'chapters'), JSON.stringify(chapters))
  }, [chapters, privateReady, userId])
  useEffect(() => {
    if (!userId || !privateReady) return
    localStorage.setItem(scopedKey(userId, 'settings'), JSON.stringify(settings))
    if (supabase && userId !== offlineUserId) saveUserSettings(settings).catch(() => undefined)
  }, [privateReady, settings, userId])
  useEffect(() => { document.documentElement.dataset.theme = settings.theme }, [settings.theme])
  useEffect(() => {
    if (!authenticated || !privateReady || !supabase || userId === offlineUserId || localStorage.getItem('draftwell-offline-mode') === 'true') return
    setCloudStatus('syncing')
    syncDraftToCloud(chapters, settings)
      .then(() => setCloudStatus('synced'))
      .catch(() => {
        setCloudStatus('error')
        setAgentMessage('Your draft is safe offline, but cloud sync needs attention. Check your Supabase configuration.')
      })
  }, [authenticated, privateReady, userId])
  useEffect(() => {
    if (!userId || !privateReady) return
    const now = Date.now()
    const firstUseKey = scopedKey(userId, 'first-use')
    const firstUse = Number(localStorage.getItem(firstUseKey) ?? now)
    localStorage.setItem(firstUseKey, String(firstUse))
    const firstAt = Number(localStorage.getItem(scopedKey(userId, 'feedback-first-at')) ?? 0)
    const monthlyAt = Number(localStorage.getItem(scopedKey(userId, 'feedback-monthly-at')) ?? 0)
    const quarterlyAt = Number(localStorage.getItem(scopedKey(userId, 'feedback-quarterly-at')) ?? 0)
    const due = firstAt ? (monthlyAt ? (quarterlyAt ? quarterlyAt + 90 * 24 * 60 * 60 * 1000 : monthlyAt + 90 * 24 * 60 * 60 * 1000) : firstAt + 30 * 24 * 60 * 60 * 1000) : firstUse + 60_000
    const kind: FeedbackKind = firstAt ? (monthlyAt ? 'quarterly' : 'monthly') : 'first-minute'
    const timer = window.setTimeout(() => {
      if (Date.now() >= due) { setFeedbackKind(kind); setFeedbackOpen(true) }
    }, Math.max(0, due - now))
    return () => window.clearTimeout(timer)
  }, [feedbackOpen, privateReady, userId])
  useEffect(() => () => {
    speechSessionRef.current = false
    if (speechRestartRef.current) window.clearTimeout(speechRestartRef.current)
    recognitionRef.current?.stop()
  }, [])

  function updateBody(body: string) {
    setChapters((current) => current.map((chapter) => chapter.id === activeId ? { ...chapter, body, status: 'Draft' } : chapter))
    setIsSaved(false)
  }

  function addChapter() {
    const id = Math.max(...chapters.map((chapter) => chapter.id), 0) + 1
    setChapters([...chapters, { id, title: `Chapter ${id}`, note: 'Give this chapter a note.', status: 'Outline', body: '' }])
    setActiveId(id)
    setIsSaved(false)
  }

  async function saveDraft() {
    setIsSaved(true)
    if (userId) localStorage.setItem(scopedKey(userId, 'chapters'), JSON.stringify(chapters))
    if (!isSupabaseConfigured) { setCloudStatus('offline'); return }
    setCloudStatus('syncing')
    try {
      await syncDraftToCloud(chapters, settings)
      setCloudStatus('synced')
    } catch {
      setCloudStatus('error')
      setAgentMessage('Your draft is safe offline, but cloud sync needs attention. Check your Supabase configuration.')
    }
  }

  async function sendFeedback(rating: number, message: string) {
    if (userId) {
      const timestampKey = feedbackKind === 'first-minute' ? 'feedback-first-at' : feedbackKind === 'monthly' ? 'feedback-monthly-at' : 'feedback-quarterly-at'
      localStorage.setItem(scopedKey(userId, timestampKey), String(Date.now()))
      localStorage.setItem(scopedKey(userId, 'feedback-draft'), JSON.stringify({ rating, message, kind: feedbackKind }))
    }
    try { await submitFeedback({ rating, message, kind: feedbackKind }) } catch { setAgentMessage('Your feedback is saved on this device. We could not send it yet, but your writing is safe.') }
    setFeedbackOpen(false)
  }

  function dismissFeedback() {
    if (userId) {
      const timestampKey = feedbackKind === 'first-minute' ? 'feedback-first-at' : feedbackKind === 'monthly' ? 'feedback-monthly-at' : 'feedback-quarterly-at'
      localStorage.setItem(scopedKey(userId, timestampKey), String(Date.now()))
    }
    setFeedbackOpen(false)
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
    } finally {
      setAgentBusy(false)
    }
  }

  async function runTourStep(step: number) {
    if (agentBusy) return
    setTourStep(step)
    setTourActive(true)
    setAgentBusy(true)
    setAgentMessage(`${TOUR_STEPS[step].title} — Mira is preparing… ✨`)
    try {
      const reply = await callMira(MIRA_SYSTEM, TOUR_STEPS[step].prompt, 180)
      setAgentMessage(reply)
    } catch (err) {
      setAgentMessage(err instanceof Error ? `Oops! ${err.message}` : 'Something went wrong — try again? 💫')
    } finally {
      setAgentBusy(false)
    }
  }

  function advanceTour(direction: 1 | -1) {
    const next = tourStep + direction
    if (next < 0 || next >= TOUR_STEPS.length) { setTourActive(false); return }
    void runTourStep(next)
  }

  function startTour() { void runTourStep(0) }

  function dictate() {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition

    // ── STOP ──────────────────────────────────────────────
    if (isRecording) {
      speechSessionRef.current = false
      if (speechRestartRef.current) window.clearTimeout(speechRestartRef.current)
      recognitionRef.current?.stop()
      setIsRecording(false)
      setAgentMessage('Microphone stopped. Your transcript is saved in the manuscript.')
      return
    }

    if (!SpeechRecognition) {
      setAgentMessage('Speech recognition needs Chrome or Edge. You can still type here.')
      return
    }

    // ── START ─────────────────────────────────────────────
    // Capture current body as the baseline so we can append without duplication
    speechBaseRef.current = activeChapter.body
    speechSessionRef.current = true

    function startRecognition() {
      if (!speechSessionRef.current) return

      const recognition = new SpeechRecognition!()
      recognitionRef.current = recognition
      recognition.continuous = true
      recognition.interimResults = true       // show words as they are spoken
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsRecording(true)
        setAgentMessage('Listening… speak naturally. Mira is writing every word.')
      }

      recognition.onend = () => {
        if (!speechSessionRef.current) { setIsRecording(false); return }
        // auto-restart keeps the session alive indefinitely until user toggles off
        speechRestartRef.current = window.setTimeout(startRecognition, 150)
      }

      recognition.onerror = (event) => {
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          speechSessionRef.current = false
          setIsRecording(false)
          setAgentMessage('Microphone access was denied. Allow it in your browser settings, then try again.')
        } else if (event?.error === 'network') {
          // network hiccup — keep trying
          setAgentMessage('Brief network hiccup. Reconnecting microphone…')
        } else if (event?.error === 'no-speech') {
          // silence — just restart quietly, don't change message
        } else {
          setAgentMessage('Recognition paused briefly. Reconnecting…')
        }
      }

      recognition.onresult = (event) => {
        // Accumulate ALL results from this recognition session
        let interimText = ''
        let finalText = ''

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]
          const text = result[0].transcript
          if (result.isFinal) {
            finalText += (finalText ? ' ' : '') + text
          } else {
            interimText += text
          }
        }

        // Build the full body: base + all finals + current interim
        const separator = speechBaseRef.current.trim() ? '\n\n' : ''
        const combined = finalText + (interimText ? ' ' + interimText : '')
        const newBody = speechBaseRef.current + (combined.trim() ? separator + combined.trim() : '')
        updateBody(newBody)

        // Advance baseline as finals accumulate so restarts don't repeat them
        if (finalText) {
          speechBaseRef.current = speechBaseRef.current + (speechBaseRef.current.trim() ? '\n\n' : '') + finalText.trim()
        }

        if (finalText) setAgentMessage('Mira is capturing your words. Keep speaking.')
      }

      try { recognition.start() } catch {
        speechRestartRef.current = window.setTimeout(startRecognition, 500)
      }
    }

    startRecognition()
  }

  if (!introDone) return <IntroScreen />
  if (!authenticated) return <AuthScreen onOffline={() => { localStorage.setItem('draftwell-offline-mode', 'true'); setUserId(offlineUserId); setPrivateReady(false); setAuthenticated(true) }} />
  if (route !== '/studio') return <ProductShell route={route} chapters={chapters} settings={settings} userId={userId} onLogout={logOut} navigate={navigate} />

  return (
    <div className="app-shell" style={{ '--accent': settings.accent } as React.CSSProperties}>
      <header className="topbar">
        <div className="brand"><BrandMark /><span>Draftwell</span></div>
        <div className="topbar-project"><button className="studio-back" onClick={() => navigate('/home')}><ArrowLeft size={15} /> My Stories</button><ChevronRight size={14} /><div><span className="eyebrow">CURRENT PROJECT</span><strong>The Shape of Rain</strong></div></div>
        <div className="top-actions"><button className="icon-button" title="Help" onClick={() => setHelpOpen(true)}><CircleHelp size={18} /></button><button className="profile-button" onClick={() => setSettingsOpen(true)}><span className="avatar">ME</span><span>{settings.name}</span><ChevronRight size={14} /></button></div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="side-heading"><div><span className="eyebrow">YOUR LIBRARY</span><h2>My stories</h2></div><button className="icon-button quiet" title="New project" onClick={() => setAgentMessage('New projects will be available when project creation is connected to your workspace. Use “chapter” to continue shaping this manuscript.') }><Plus size={18} /></button></div>
          <div className="project-card"><div className="project-cover"><span>THE<br /><i>SHAPE</i><br />OF RAIN</span></div><div className="project-meta"><strong>The Shape of Rain</strong><span>Novel · 18% complete</span><div className="progress"><span style={{ width: '18%' }} /></div></div><div className="project-menu-wrap"><button className="project-menu-button" title="Project actions" aria-expanded={projectMenuOpen} onClick={() => setProjectMenuOpen((open) => !open)}><MoreHorizontal size={16} className="muted-icon" /></button>{projectMenuOpen && <div className="project-menu" role="menu"><button onClick={() => { setProjectMenuOpen(false); setAgentMessage('You are already editing The Shape of Rain.') }}>Continue writing</button><button onClick={() => { setProjectMenuOpen(false); setAgentMessage('Project rename is not connected yet. Your manuscript remains unchanged.') }}>Rename</button><button onClick={() => { setProjectMenuOpen(false); setAgentMessage('Project duplication is not connected yet. Your manuscript remains safe.') }}>Duplicate</button><button onClick={() => { setProjectMenuOpen(false); setAgentMessage('Archive is not connected yet. No project data was changed.') }}>Archive</button><button className="danger" onClick={() => { setProjectMenuOpen(false); setAgentMessage('Delete is not connected yet. No project data was changed.') }}>Delete</button></div>}</div></div>
          <nav className="side-nav"><button className="nav-item active" onClick={() => setAgentMessage('You are already in the writing workspace.') }><LayoutPanelLeft size={17} /> Workspace</button><button className="nav-item" onClick={() => setPreviewOpen(true)}><BookOpen size={17} /> Book preview <span className="nav-count">4K</span></button><button className="nav-item" onClick={() => setAgentMessage('Export and publishing are available from Book Preview. Review your manuscript there before exporting a copy.') }><ArrowDownToLine size={17} /> Export & publish</button></nav>
          <div className="outline-label"><span className="eyebrow">MANUSCRIPT</span><button className="new-chapter" onClick={addChapter}><Plus size={14} /> chapter</button></div>
          <div className="chapter-list">{chapters.map((chapter, index) => <button key={chapter.id} className={`chapter-item ${chapter.id === activeId ? 'selected' : ''}`} onClick={() => setActiveId(chapter.id)}><span className="chapter-number">{String(index + 1).padStart(2, '0')}</span><span className="chapter-info"><strong>{chapter.title}</strong><small>{chapter.status} · {chapter.body.trim().split(/\s+/).filter(Boolean).length} words</small></span><ChevronRight size={14} /></button>)}</div>
          <div className="sidebar-footer"><button className="nav-item" onClick={() => setSettingsOpen(true)}><Settings size={17} /> Settings</button><div className="storage-status"><Check size={14} /> {cloudStatus === 'syncing' ? 'Syncing to cloud…' : cloudStatus === 'synced' ? 'Saved to cloud and device' : cloudStatus === 'error' ? 'Saved offline · cloud retry needed' : cloudStatus === 'ready' ? 'Cloud storage ready' : 'Everything is saved on this device'}</div></div>
        </aside>

        <main className="editor-area">
          <div className="editor-toolbar"><div className="breadcrumb"><span>Part one</span><ChevronRight size={14} /><strong>{activeChapter.title}</strong></div><div className="toolbar-actions"><span className="save-state">{isSaved ? <><Check size={14} /> Saved locally</> : 'Unsaved changes'}</span><button className="secondary-button" onClick={saveDraft}><Check size={15} /> Save</button><button className={`record-button ${isRecording ? 'recording' : ''}`} onClick={dictate}><Mic size={16} /> {isRecording ? 'Listening…' : 'Speak a thought'}</button></div></div>
          <div className="editor-scroll"><div className="chapter-kicker">CHAPTER {String(chapters.findIndex((chapter) => chapter.id === activeId) + 1).padStart(2, '0')} <span>•</span> {activeChapter.status.toUpperCase()}</div><input className="chapter-title" value={activeChapter.title} onChange={(event) => setChapters(chapters.map((chapter) => chapter.id === activeId ? { ...chapter, title: event.target.value } : chapter))} /><textarea className={`manuscript ${settings.font}`} value={activeChapter.body} onChange={(event) => updateBody(event.target.value)} placeholder="Begin speaking or writing here..." /><div className="editor-foot"><span>{activeWords.toLocaleString()} words in this chapter</span><span>⌘ ↵ to save</span></div></div>
        </main>

        <aside className="agent-rail">
          <div className="agent-header"><div><span className="eyebrow">DRAFTWELL AGENT</span><h2>Mira ✨</h2></div><span className={`sparkle ${agentBusy ? 'agent-thinking' : ''}`}><Sparkles size={17} /></span></div>
          <div className="agent-intro"><div className="agent-orbit"><WandSparkles size={22} /></div><p className="agent-message">{agentMessage}</p></div>

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
            <button disabled={agentBusy} onClick={startTour} className="tour-button">
              <Sparkles size={15} /> {agentBusy && tourActive ? 'Loading…' : 'Tour with Mira'}
            </button>
            <button
              disabled={agentBusy}
              onClick={() => askMira(
                'Read this scene and give one precise craft observation — focus on tension, imagery, or voice.',
                `Chapter: ${activeChapter.title}\n\n${activeChapter.body}`
              )}
            ><WandSparkles size={15} /> {agentBusy && !tourActive ? 'Thinking… ✨' : 'Read my scene'}</button>
            <button
              disabled={agentBusy}
              onClick={() => askMira(
                'Suggest one vivid, concrete next beat or sentence the writer could add to continue the momentum of this chapter.',
                `Chapter: ${activeChapter.title}\n\n${activeChapter.body}`
              )}
            ><Sparkles size={15} /> {agentBusy && !tourActive ? 'Thinking… ✨' : 'Find the next beat'}</button>
            <button
              disabled={agentBusy}
              onClick={() => askMira(
                'Give a warm overall feel of the manuscript so far — what is working beautifully and one gentle thing to watch.',
                chapters.map((c) => `${c.title}:\n${c.body}`).join('\n\n---\n\n')
              )}
            ><BookOpen size={15} /> {agentBusy && !tourActive ? 'Thinking… ✨' : 'Read all chapters'}</button>
          </div>

          <div className="agent-ask-row">
            <input
              className="agent-ask-input"
              placeholder="Ask Mira anything…"
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && agentInput.trim()) {
                  void askMira(
                    'Answer the writer\'s question with warmth and expertise. You know writing craft deeply and love helping writers grow.',
                    `Question: ${agentInput}\n\nCurrent chapter (${activeChapter.title}):\n${activeChapter.body}`
                  )
                  setAgentInput('')
                }
              }}
              disabled={agentBusy}
            />
            <button
              className="agent-ask-send"
              disabled={agentBusy || !agentInput.trim()}
              onClick={() => {
                if (!agentInput.trim()) return
                void askMira(
                  'Answer the writer\'s question with warmth and expertise. You know writing craft deeply and love helping writers grow.',
                  `Question: ${agentInput}\n\nCurrent chapter (${activeChapter.title}):\n${activeChapter.body}`
                )
                setAgentInput('')
              }}
            ><Sparkles size={14} /></button>
          </div>
          <div className="rail-divider" />
          <div className="rail-section"><div className="section-label"><span>CHAPTER NOTE</span><button title="Edit note" onClick={() => setAgentMessage('Chapter notes are read-only in this workspace. Add the thought to the manuscript or ask me for a next beat! ✨')}><FileText size={14} /></button></div><p className="chapter-note">{activeChapter.note}</p></div>
          <div className="rail-section"><div className="section-label"><span>AT A GLANCE</span><MoreHorizontal size={15} /></div><div className="glance-row"><span>Project words</span><strong>{wordCount.toLocaleString()}</strong></div><div className="glance-row"><span>Reading time</span><strong>{Math.max(1, Math.round(wordCount / 200))} min</strong></div><div className="glance-row"><span>Chapters</span><strong>{chapters.length}</strong></div></div>
          <button className="preview-link" onClick={() => setPreviewOpen(true)}><BookOpen size={16} /> See how it reads as a book <ChevronRight size={15} /></button>
        </aside>
      </div>

      {settingsOpen && <SettingsModal settings={settings} setSettings={setSettings} close={() => setSettingsOpen(false)} logOut={logOut} />}
      {helpOpen && <HelpModal close={() => setHelpOpen(false)} />}
      {previewOpen && <PreviewModal chapters={chapters} close={() => setPreviewOpen(false)} />}
      {feedbackOpen && <FeedbackModal kind={feedbackKind} close={dismissFeedback} submit={sendFeedback} />}
    </div>
  )
}

function BrandMark() {
  return <span className="brand-mark" aria-label="Draftwell logo"><img src={`${import.meta.env.BASE_URL}Draftwell-logo.png.png`} alt="Draftwell" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('brand-mark-fallback') }} /><span className="brand-mark-fallback-letter" aria-hidden="true">D</span></span>
}

function IntroScreen() {
  return <main className="intro-screen"><div className="intro-glow" /><div className="intro-logo"><BrandMark /><span>Draftwell</span></div><p className="intro-tagline">Your voice, in print.</p><div className="intro-progress"><span /></div></main>
}

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
        const { error } = await supabase.auth.resetPasswordForEmail(email)
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
  return <main className="auth-screen"><div className="auth-art"><div className="auth-art-glow" /><BrandMark /><div className="auth-wordmark">Draftwell</div><p>Your voice, in print.</p></div><section className="auth-panel"><div className="auth-panel-inner"><div className="auth-mini-brand"><BrandMark /><strong>Draftwell</strong></div><span className="eyebrow">A QUIET PLACE TO WRITE</span><h1>{title}</h1><p className="auth-subtitle">Write out loud, keep every thought, and shape it into something lasting.</p><form onSubmit={submit}>{mode !== 'forgot' && <label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>}{mode !== 'forgot' && <label>Password<input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} /></label>}{mode === 'forgot' && <label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>}<button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Create account' : 'Send reset link'}</button></form>{message && <p className="auth-message">{message}</p>}{mode === 'sign-in' && <button className="text-button" onClick={() => setMode('forgot')}>Forgot password?</button>}{mode === 'forgot' && <button className="text-button" onClick={() => setMode('sign-in')}>Back to sign in</button>}<div className="auth-divider"><span>or</span></div><button className="offline-button" onClick={onOffline}>Continue offline</button><p className="auth-switch">{mode === 'sign-up' ? 'Already have an account?' : 'New to Draftwell?'} <button className="text-button inline" onClick={() => setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}>{mode === 'sign-up' ? 'Sign in' : 'Create an account'}</button></p><small className="auth-note">Your writing stays on this device when offline and syncs securely when you reconnect.</small></div></section></main>
}

function HelpModal({ close }: { close: () => void }) {
  return <div className="modal-backdrop"><div className="modal help-modal"><div className="modal-heading"><div><span className="eyebrow">DRAFTWELL GUIDE</span><h2>A quiet place to make</h2></div><button className="icon-button" onClick={close} aria-label="Close help"><X size={18} /></button></div><p className="help-copy">Draftwell keeps the creative work in your hands: speak an idea, shape the manuscript, design the book, and return to it whenever inspiration comes back.</p><div className="help-grid"><section><span className="help-label">WRITE</span><strong>Speak a thought</strong><p>Use the microphone to transcribe one idea at a time. Your words are added to the active chapter, never silently rewritten.</p></section><section><span className="help-label">SAVE</span><strong>Your work stays yours</strong><p>Drafts and settings are saved for the signed-in account. Offline writing stays on this device and can sync when you reconnect.</p></section><section><span className="help-label">SHAPE</span><strong>Build the book</strong><p>Add chapters, change the reading style, ask the Agent for a next beat, and open Book Preview to see the manuscript as a book.</p></section><section><span className="help-label">SHORTCUTS</span><strong>A few useful cues</strong><p>Use Tab to move through controls, Escape to close a panel, and save before leaving a long writing session.</p></section></div><div className="help-contact"><strong>Need a human?</strong><span>Bug reports, product ideas, and account help</span><a href="mailto:jaymn2006@gmail.com">jaymn2006@gmail.com</a></div><div className="modal-footer"><span>Draftwell · your voice, in print.</span><button className="primary-button" onClick={close}>Close guide</button></div></div></div>
}

function SettingsModal({ settings, setSettings, close, logOut }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>>; close: () => void; logOut: () => Promise<void> }) {
  const themes: { id: Theme; label: string; className: string }[] = [{ id: 'light', label: 'Light', className: 'light-swatch' }, { id: 'dark', label: 'Dark', className: 'dark-swatch' }, { id: 'amber', label: 'Amber', className: 'amber-swatch' }, { id: 'eye', label: 'Eye protection', className: 'eye-swatch' }]
  return <div className="modal-backdrop"><div className="modal settings-modal"><div className="modal-heading"><div><span className="eyebrow">WORKSPACE SETTINGS</span><h2>Make it yours</h2></div><button className="icon-button" onClick={close}><X size={18} /></button></div><div className="setting-block"><label>Profile</label><div className="profile-setting"><div className="avatar large">ME</div><div><input value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} /><span>{settings.role} · stored locally</span></div></div></div><div className="setting-block"><label>Reading comfort</label><div className="theme-options theme-grid">{themes.map((theme) => <button key={theme.id} className={settings.theme === theme.id ? 'theme-option selected' : 'theme-option'} onClick={() => setSettings({ ...settings, theme: theme.id })}><span className={`theme-swatch ${theme.className}`} />{theme.id === 'eye' && <Eye size={14} />}{theme.label}</button>)}</div></div><div className="setting-block"><label>Accent colour</label><div className="color-row">{['#c4543d', '#287a74', '#9b6a37', '#5c6599'].map((color) => <button key={color} className={`color-swatch ${settings.accent === color ? 'chosen' : ''}`} style={{ background: color }} onClick={() => setSettings({ ...settings, accent: color })} />)}</div></div><div className="setting-block"><label>Document style</label><div className="style-options"><button className={settings.font === 'serif' ? 'style-option selected' : 'style-option'} onClick={() => setSettings({ ...settings, font: 'serif' })}><span className="style-preview serif">Aa</span><span><strong>Quiet classic</strong><small>Literary serif</small></span></button><button className={settings.font === 'sans' ? 'style-option selected' : 'style-option'} onClick={() => setSettings({ ...settings, font: 'sans' })}><span className="style-preview sans">Aa</span><span><strong>Clean modern</strong><small>Contemporary sans</small></span></button></div></div><div className="modal-footer"><span><Palette size={15} /> Changes stay on this device</span><button className="secondary-button" onClick={() => void logOut()}>Sign out</button><button className="primary-button" onClick={close}>Done</button></div></div></div>
}

function FeedbackModal({ kind, close, submit }: { kind: FeedbackKind; close: () => void; submit: (rating: number, message: string) => Promise<void> }) {
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const title = kind === 'first-minute' ? 'How is Draftwell feeling?' : kind === 'monthly' ? 'A month with Draftwell' : 'A little further in'
  const timing = kind === 'first-minute' ? 'A one-minute check-in' : kind === 'monthly' ? 'Your first monthly check-in' : 'A check-in every three months'
  return <div className="modal-backdrop"><div className="modal feedback-modal"><div className="modal-heading"><div><span className="eyebrow">A QUICK CHECK-IN · {timing.toUpperCase()}</span><h2>{title}</h2></div><button className="icon-button" onClick={close} aria-label="Close feedback"><X size={18} /></button></div><p className="feedback-copy">Your honest feedback helps shape what we build next. Tell us what felt good, what got in the way, and what you would love to see.</p><label className="feedback-label">Your rating</label><div className="rating-row">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} className={value <= rating ? 'rating selected' : 'rating'} onClick={() => setRating(value)} aria-label={`${value} stars`}>★</button>)}</div><label className="feedback-label" htmlFor="feedback-message">What should we improve?</label><textarea id="feedback-message" className="feedback-textarea" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what worked, what did not, or what you want next..." /><div className="modal-footer"><span>Saved locally and sent securely when online</span><button className="primary-button" disabled={!rating} onClick={() => submit(rating, message)}>Send feedback</button></div></div></div>
}

function PreviewModal({ chapters, close }: { chapters: Chapter[]; close: () => void }) {
  function exportText() {
    const content = chapters.map((chapter) => `${chapter.title}\n\n${chapter.body}`).join('\n\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'the-shape-of-rain.txt'
    link.click()
    URL.revokeObjectURL(url)
  }
  return <div className="modal-backdrop preview-backdrop"><div className="preview-modal"><div className="preview-top"><div><span className="eyebrow">BOOK PREVIEW</span><h2>The Shape of Rain</h2></div><div className="preview-tools"><button className="secondary-button" onClick={() => alert('Cover upload is not connected yet. Your current cover remains unchanged.')}><Upload size={15} /> Upload cover</button><button className="secondary-button" onClick={exportText}><ArrowDownToLine size={15} /> Export TXT</button><button className="icon-button" onClick={close}><X size={18} /></button></div></div><div className="book-stage"><div className="book-cover"><div className="cover-top">A NOVEL</div><div className="cover-title">THE<br /><i>SHAPE</i><br />OF RAIN</div><div className="cover-author">MARA ELLISON</div><div className="cover-mark">D</div></div><div className="book-page"><div className="page-running">THE SHAPE OF RAIN <span>01</span></div><h3>{chapters[0]?.title}</h3><p>{chapters[0]?.body || starterText}</p><div className="page-rule" /><span className="page-number">1</span></div></div><div className="preview-bottom"><div><strong>Ready for the shelf</strong><span>TXT export · {chapters.length} chapters · {chapters.reduce((a, c) => a + c.body.length, 0).toLocaleString()} characters</span></div><button className="primary-button" onClick={() => alert('Cover editing will be available after cover upload is connected.')}><ImagePlus size={16} /> Add your cover</button></div></div></div>
}

export default App

const rootElement = document.getElementById('root')!
const rootWindow = window as typeof window & { __draftwellRoot?: ReturnType<typeof createRoot> }
const root = rootWindow.__draftwellRoot ?? createRoot(rootElement)
rootWindow.__draftwellRoot = root
root.render(<ErrorBoundary><App /></ErrorBoundary>)
