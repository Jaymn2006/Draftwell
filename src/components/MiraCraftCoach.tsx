import { useState } from 'react'
import {
  Sparkles, Wand2, Compass, Activity, Eye, MessageSquare,
  ArrowRight, Check, ChevronDown, RefreshCw
} from 'lucide-react'

interface MiraCraftCoachProps {
  currentText: string
  chapterTitle?: string
  onInsertSuggestion?: (text: string) => void
}

type CoachMode = 'hook' | 'rhythm' | 'sensory' | 'dialogue' | 'beats'

export function MiraCraftCoach({ currentText, chapterTitle, onInsertSuggestion }: MiraCraftCoachProps) {
  const [activeTab, setActiveTab] = useState<CoachMode>('hook')
  const [analyzing, setAnalyzing] = useState(false)

  // Word count & sentence metrics
  const words = currentText.trim().split(/\s+/).filter(Boolean)
  const sentences = currentText.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)
  const avgSentenceLen = sentences.length > 0 ? Math.round(words.length / sentences.length) : 0

  // Sensory vocabulary detection
  const sightWords = ['gleam', 'shadow', 'color', 'dark', 'light', 'flash', 'pale', 'scarlet', 'silver', 'silhouette', 'stared', 'gazed']
  const soundWords = ['whisper', 'hum', 'clatter', 'echo', 'thump', 'creak', 'rattle', 'screech', 'snap', 'hiss', 'clang', 'muffled']
  const touchWords = ['cold', 'warm', 'rough', 'smooth', 'damp', 'shiver', 'sting', 'fever', 'coarse', 'sharp', 'tremble', 'ache']
  const scentWords = ['smoke', 'ozone', 'coffee', 'pine', 'copper', 'rot', 'petrichor', 'salt', 'perfume', 'sweet', 'acrid', 'dust']

  const textLower = currentText.toLowerCase()
  const foundSight = sightWords.filter((w) => textLower.includes(w))
  const foundSound = soundWords.filter((w) => textLower.includes(w))
  const foundTouch = touchWords.filter((w) => textLower.includes(w))
  const foundScent = scentWords.filter((w) => textLower.includes(w))

  // Dialogue extraction
  const dialogueQuotes = currentText.match(/"([^"]+)"|“([^”]+)”/g) || []

  return (
    <div className="mira-coach-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="var(--accent)" />
          <strong style={{ color: 'var(--ink)', fontSize: 13, letterSpacing: 0.5 }}>
            Mira Craft Assistant
          </strong>
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)', font: "500 11px 'DM Mono', monospace" }}>
          {words.length} words · {sentences.length} sentences
        </span>
      </div>

      <div className="mira-coach-tabs">
        <button
          className={`mira-tab-btn ${activeTab === 'hook' ? 'mira-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('hook')}>
          Hook Doctor
        </button>
        <button
          className={`mira-tab-btn ${activeTab === 'rhythm' ? 'mira-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('rhythm')}>
          Rhythm & Pacing
        </button>
        <button
          className={`mira-tab-btn ${activeTab === 'sensory' ? 'mira-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('sensory')}>
          Sensory Layering
        </button>
        <button
          className={`mira-tab-btn ${activeTab === 'dialogue' ? 'mira-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('dialogue')}>
          Dialogue Subtext
        </button>
        <button
          className={`mira-tab-btn ${activeTab === 'beats' ? 'mira-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('beats')}>
          Next Beat
        </button>
      </div>

      <div className="mira-response-box">
        {activeTab === 'hook' && (
          <div>
            <h4 style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 4 }}>
              Opening Tension Diagnostic
            </h4>
            {sentences.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>Type your opening sentence above to test its hook potency.</p>
            ) : (
              <div>
                <p style={{ fontStyle: 'italic', marginBottom: 8, color: 'var(--ink-soft)' }}>
                  "{sentences[0]}"
                </p>
                <div style={{ fontSize: 12, color: 'var(--muted-strong)', lineHeight: 1.5 }}>
                  {sentences[0].length < 60 ? (
                    <span style={{ color: '#38bdf8' }}>✓ Good punchy opening. Keeps immediate cognitive friction high.</span>
                  ) : (
                    <span>Tip: Consider trimming subordinate clauses from the opening beat. Start on the disturbance rather than context.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rhythm' && (
          <div>
            <h4 style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 4 }}>
              Cadence & Sentence Flow
            </h4>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              <p>Average sentence length: <strong>{avgSentenceLen} words</strong>.</p>
              {avgSentenceLen > 24 && (
                <p style={{ color: '#f59e0b' }}>Flow is running heavy. Inject a 3-5 word staccato clause to raise tension.</p>
              )}
              {avgSentenceLen > 0 && avgSentenceLen <= 24 && (
                <p style={{ color: '#38bdf8' }}>Balanced pacing. Sentence rhythm demonstrates clean musicality.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sensory' && (
          <div>
            <h4 style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 4 }}>
              Sensory Anchor Score
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, marginTop: 6 }}>
              <div>Sight: <strong>{foundSight.length}</strong> {foundSight.length > 0 && `(${foundSight.slice(0, 2).join(', ')})`}</div>
              <div>Sound: <strong>{foundSound.length}</strong> {foundSound.length > 0 && `(${foundSound.slice(0, 2).join(', ')})`}</div>
              <div>Touch/Temp: <strong>{foundTouch.length}</strong> {foundTouch.length > 0 && `(${foundTouch.slice(0, 2).join(', ')})`}</div>
              <div>Scent/Taste: <strong>{foundScent.length}</strong> {foundScent.length > 0 && `(${foundScent.slice(0, 2).join(', ')})`}</div>
            </div>
            {foundScent.length === 0 && (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                Craft tip: Scent/taste triggers deep involuntary reader empathy. Consider mentioning ozone, cold iron, damp wool, or burnt toast.
              </p>
            )}
          </div>
        )}

        {activeTab === 'dialogue' && (
          <div>
            <h4 style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 4 }}>
              Dialogue Chemistry
            </h4>
            <p style={{ fontSize: 12, marginBottom: 6 }}>
              Detected {dialogueQuotes.length} lines of direct speech.
            </p>
            {dialogueQuotes.length > 0 ? (
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                Rule of thumb: Anchor every 2nd dialogue turn with a concrete physical beat instead of "he said/she said".
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                No spoken dialogue found in this draft yet. Dialogue creates instant character friction.
              </p>
            )}
          </div>
        )}

        {activeTab === 'beats' && (
          <div>
            <h4 style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 4 }}>
              Next Beat Suggestions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ padding: '6px 8px', background: 'var(--surface-raised)', borderRadius: 4 }}>
                <strong>1. Sudden Interruption:</strong> A knock on the outer door or a sudden radio whistle breaks the silence.
              </div>
              <div style={{ padding: '6px 8px', background: 'var(--surface-raised)', borderRadius: 4 }}>
                <strong>2. The Unspoken Lie:</strong> The protagonist agrees aloud with the other person, while hiding evidence in their coat.
              </div>
              <div style={{ padding: '6px 8px', background: 'var(--surface-raised)', borderRadius: 4 }}>
                <strong>3. The Physical Complication:</strong> Weather, machine failure, or a physical injury forces them to halt.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
