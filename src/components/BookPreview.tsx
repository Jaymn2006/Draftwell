import { useState, useMemo } from 'react'
import {
  ArrowLeft, ArrowRight, Download, PenLine, BookOpen,
  ChevronLeft, ChevronRight, Sun, Moon, Palette, Sliders,
  List, Check, Sparkles
} from 'lucide-react'
import { useApp } from '../lib/context'
import { useToast } from '../lib/toast'
import type { Story } from '../lib/types'

interface BookPreviewProps {
  initialStoryId?: string
}

export function BookPreviewView({ initialStoryId }: BookPreviewProps) {
  const { allStories, myStories, navigate } = useApp()
  const { success } = useToast()

  // Prioritize user's own stories or the specified story, fallback to first story
  const availableStories = useMemo(() => {
    return myStories.length > 0 ? myStories : allStories
  }, [myStories, allStories])

  const [selectedStoryId, setSelectedStoryId] = useState<string>(() => {
    if (initialStoryId && availableStories.some((s) => s.id === initialStoryId)) {
      return initialStoryId
    }
    return availableStories[0]?.id ?? ''
  })

  const currentStory: Story | undefined = availableStories.find((s) => s.id === selectedStoryId) || availableStories[0]

  const [chapterIdx, setChapterIdx] = useState(0)
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark' | 'midnight'>('sepia')
  const [fontSize, setFontSize] = useState<number>(17)
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif')
  const [isDual, setIsDual] = useState<boolean>(true)
  const [showToc, setShowToc] = useState<boolean>(false)
  const [showCover, setShowCover] = useState<boolean>(false)

  if (!currentStory) {
    return (
      <div className="page book-preview-view">
        <button className="back-btn" onClick={() => navigate('/studio')}><ArrowLeft size={16} /> Studio</button>
        <div className="empty-state-card">
          <h2>No stories available to preview</h2>
          <p>Create a story or chapter in Creator Studio to see it in print-grade book layout.</p>
          <button className="btn btn--primary" onClick={() => navigate('/studio/write/new')}>Create a Story</button>
        </div>
      </div>
    )
  }

  const chapters = currentStory.chapters || []
  const activeChapter = chapters[chapterIdx]

  // Split text into two columns/pages when in dual spread
  const paragraphs = useMemo(() => {
    if (!activeChapter?.body) return ['No manuscript content has been drafted for this chapter yet. Click "Edit in Studio" to begin writing.']
    return activeChapter.body.split(/\n\n+/).filter(Boolean)
  }, [activeChapter])

  const [leftPageParas, rightPageParas] = useMemo(() => {
    if (!isDual || paragraphs.length <= 2) {
      return [paragraphs, []]
    }
    const mid = Math.ceil(paragraphs.length / 2)
    return [paragraphs.slice(0, mid), paragraphs.slice(mid)]
  }, [paragraphs, isDual])

  function handleExport() {
    if (!currentStory) return
    let fullText = `${currentStory.title.toUpperCase()}\nby ${currentStory.author}\n\n${currentStory.description || ''}\n\n${'='.repeat(40)}\n\n`
    chapters.forEach((ch, i) => {
      fullText += `CHAPTER ${i + 1}: ${ch.title}\n\n${ch.body}\n\n${'-'.repeat(30)}\n\n`
    })

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentStory.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-manuscript.txt`
    a.click()
    URL.revokeObjectURL(url)
    success('Manuscript downloaded as .txt')
  }

  return (
    <div className="book-preview-view">
      {/* Top Toolbar */}
      <div className="book-preview-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="back-btn back-btn--sm" onClick={() => navigate('/studio')}>
            <ArrowLeft size={14} /> Studio
          </button>
          <select
            value={currentStory.id}
            onChange={(e) => { setSelectedStoryId(e.target.value); setChapterIdx(0); setShowCover(false) }}
            className="input-select"
            style={{ fontWeight: 600, maxWidth: 220 }}
            aria-label="Select novel to preview">
            {availableStories.map((s) => (
              <option key={s.id} value={s.id}>{s.title} ({s.chapters.length} ch)</option>
            ))}
          </select>
        </div>

        <div className="book-preview-controls">
          {/* Cover Toggle */}
          <button
            className={`btn btn--xs ${showCover ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setShowCover((v) => !v)}>
            <BookOpen size={13} /> {showCover ? 'Reading Pages' : 'Book Cover'}
          </button>

          {/* Table of Contents */}
          <button
            className={`btn btn--xs ${showToc ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setShowToc((v) => !v)}
            title="Table of Contents">
            <List size={13} /> TOC
          </button>

          {/* Dual vs Single page toggle */}
          <button
            className="btn btn--xs btn--ghost"
            onClick={() => setIsDual((v) => !v)}
            title={isDual ? 'Switch to single page view' : 'Switch to dual page spread'}>
            {isDual ? 'Dual Spread' : 'Single Page'}
          </button>

          {/* Themes */}
          <div style={{ display: 'flex', gap: 2 }}>
            <button
              className={`cover-swatch ${theme === 'light' ? 'cover-swatch--active' : ''}`}
              style={{ background: '#fdfbf7', width: 22, height: 22, borderRadius: 4, border: '1px solid #ccc' }}
              onClick={() => setTheme('light')}
              title="Light Paper" />
            <button
              className={`cover-swatch ${theme === 'sepia' ? 'cover-swatch--active' : ''}`}
              style={{ background: '#f4ecd8', width: 22, height: 22, borderRadius: 4, border: '1px solid #d4c5a0' }}
              onClick={() => setTheme('sepia')}
              title="Warm Sepia" />
            <button
              className={`cover-swatch ${theme === 'dark' ? 'cover-swatch--active' : ''}`}
              style={{ background: '#0d1520', width: 22, height: 22, borderRadius: 4, border: '1px solid #283a4c' }}
              onClick={() => setTheme('dark')}
              title="Dark Ink" />
            <button
              className={`cover-swatch ${theme === 'midnight' ? 'cover-swatch--active' : ''}`}
              style={{ background: '#03060a', width: 22, height: 22, borderRadius: 4, border: '1px solid #1a2a3a' }}
              onClick={() => setTheme('midnight')}
              title="Midnight" />
          </div>

          {/* Export button */}
          <button className="btn btn--xs btn--ghost" onClick={handleExport} title="Download complete manuscript">
            <Download size={13} /> Export .TXT
          </button>

          {/* Jump to Edit */}
          {currentStory.isOwn && (
            <button className="btn btn--xs btn--primary" onClick={() => navigate(`/studio/edit/${currentStory.id}`)}>
              <PenLine size={13} /> Edit Story
            </button>
          )}
        </div>
      </div>

      {/* Table of contents dropdown drawer */}
      {showToc && (
        <div style={{
          background: 'var(--surface-raised)', border: '1px solid var(--line)', borderRadius: 8,
          padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8
        }}>
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              className={`btn btn--xs ${chapterIdx === idx && !showCover ? 'btn--primary' : 'btn--ghost'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => { setChapterIdx(idx); setShowCover(false); setShowToc(false) }}>
              <span style={{ opacity: 0.6, marginRight: 6 }}>{String(idx + 1).padStart(2, '0')}.</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Realistic Book Stage */}
      <div className="book-stage">
        <div className={`physical-book physical-book--${theme}`}>
          {showCover ? (
            <div className="book-cover-stage" style={{ background: currentStory.coverGradient ?? currentStory.coverColor, color: '#fff' }}>
              <span style={{ letterSpacing: 3, textTransform: 'uppercase', fontSize: 11, opacity: 0.8, marginBottom: 20 }}>
                {currentStory.genre} · {currentStory.status}
              </span>
              <h1 className="book-cover-stage__title">{currentStory.title}</h1>
              <p className="book-cover-stage__author">By {currentStory.author}</p>
              <div style={{ maxWidth: 460, opacity: 0.85, fontSize: 13, lineHeight: 1.6, marginBottom: 32 }}>
                {currentStory.description}
              </div>
              <button className="btn btn--primary btn--sm" onClick={() => setShowCover(false)} style={{ background: '#fff', color: '#111' }}>
                Open Book <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className={`book-spread ${isDual && rightPageParas.length > 0 ? 'book-spread--dual' : ''}`}>
              {/* Left Page (or single page) */}
              <div className="book-page">
                <div className="book-header">
                  <span>{currentStory.title}</span>
                  <span>Chapter {chapterIdx + 1}</span>
                </div>
                <div
                  className="book-body"
                  style={{
                    fontFamily: fontFamily === 'serif' ? "'Fraunces', serif" : fontFamily === 'mono' ? "'DM Mono', monospace" : "'DM Sans', sans-serif",
                    fontSize: `${fontSize}px`
                  }}>
                  <h2 style={{ font: "600 20px 'Fraunces', serif", marginBottom: 20, color: 'inherit' }}>
                    {activeChapter?.title || `Chapter ${chapterIdx + 1}`}
                  </h2>
                  {leftPageParas.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Right Page (dual spread mode) */}
              {isDual && rightPageParas.length > 0 && (
                <div className="book-page">
                  <div className="book-header">
                    <span>{activeChapter?.title || currentStory.author}</span>
                    <span>Page {chapterIdx * 2 + 2}</span>
                  </div>
                  <div
                    className="book-body"
                    style={{
                      fontFamily: fontFamily === 'serif' ? "'Fraunces', serif" : fontFamily === 'mono' ? "'DM Mono', monospace" : "'DM Sans', sans-serif",
                      fontSize: `${fontSize}px`
                    }}>
                    {rightPageParas.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Book Turn Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12 }}>
        <button
          className="btn btn--ghost btn--sm"
          disabled={chapterIdx === 0 && !showCover}
          onClick={() => {
            if (showCover) return
            if (chapterIdx > 0) setChapterIdx((c) => c - 1)
          }}>
          <ChevronLeft size={16} /> Previous Chapter
        </button>
        <span style={{ font: "500 12px 'DM Mono', monospace", color: 'var(--muted-strong)' }}>
          Chapter {chapterIdx + 1} of {chapters.length || 1}
        </span>
        <button
          className="btn btn--ghost btn--sm"
          disabled={chapterIdx >= chapters.length - 1}
          onClick={() => {
            if (chapterIdx < chapters.length - 1) setChapterIdx((c) => c + 1)
          }}>
          Next Chapter <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
