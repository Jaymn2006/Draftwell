import { useState, useMemo } from 'react'
import {
  ArrowLeft, BookOpen, Check, CheckCircle2, Clock,
  GraduationCap, PenLine, Sparkles, Trophy, User, ArrowRight
} from 'lucide-react'
import { MASTERCLASSES, type Masterclass } from '../lib/masterclasses'
import { useApp } from '../lib/context'
import { useToast } from '../lib/toast'
import type { Story, Chapter } from '../lib/types'

interface MasterclassesViewProps {
  activeId?: string
}

export function MasterclassesView({ activeId }: MasterclassesViewProps) {
  const { navigate, saveStory, userId } = useApp()
  const { success } = useToast()

  const [category, setCategory] = useState<string>('All')
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('draftwell-completed-masterclasses') || '[]')
    } catch {
      return []
    }
  })

  function toggleComplete(id: string) {
    const next = completedIds.includes(id)
      ? completedIds.filter((x) => x !== id)
      : [...completedIds, id]
    setCompletedIds(next)
    localStorage.setItem('draftwell-completed-masterclasses', JSON.stringify(next))
    success(next.includes(id) ? 'Masterclass completed! Added to your writer badge.' : 'Marked as uncompleted')
  }

  // If a specific masterclass is selected
  const activeClass: Masterclass | undefined = MASTERCLASSES.find((m) => m.id === activeId)

  const filtered = useMemo(() => {
    if (category === 'All') return MASTERCLASSES
    return MASTERCLASSES.filter((m) => m.category === category)
  }, [category])

  // Handle "Draft Exercise in Studio"
  function handleDraftExercise(mc: Masterclass) {
    const id = `story-mc-${Date.now()}`
    const now = Date.now()
    const initialChapter: Chapter = {
      id: `ch-${id}-1`,
      storyId: id,
      number: 1,
      title: mc.exercise.suggestedChapterTitle,
      body: `/* CRAFT EXERCISE: ${mc.title} */\n/* PROMPT: ${mc.exercise.prompt} */\n\n`,
      note: `Exercise target: ~${mc.exercise.targetWords} words. Focus on: ${mc.corePrinciples.map((p) => p.title).join(', ')}.`,
      status: 'Draft',
      wordCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    const story: Story = {
      id,
      userId: userId ?? 'offline-device',
      title: `Exercise: ${mc.exercise.title}`,
      author: 'Studio Exercise',
      description: `Manuscript exercise from masterclass "${mc.title}" with instructor ${mc.instructor}.`,
      genre: 'Literary',
      tags: ['Masterclass', mc.category, 'Exercise'],
      status: 'Draft',
      coverColor: '#1a3a5c',
      coverGradient: 'linear-gradient(145deg, #1a3a5c, #0a1b2d 60%, #285585)',
      chapters: [initialChapter],
      totalWords: 0,
      isOwn: true,
      createdAt: now,
      updatedAt: now,
    }

    saveStory(story)
    success(`Studio draft initialized for "${mc.exercise.title}"`)
    navigate(`/studio/edit/${id}`)
  }

  // ── DETAILED LESSON VIEW ──────────────────────────────────────────────────
  if (activeClass) {
    const isCompleted = completedIds.includes(activeClass.id)
    return (
      <div className="masterclass-lesson page">
        <button className="back-btn" onClick={() => navigate('/studio/masterclasses')}>
          <ArrowLeft size={16} /> All Masterclasses
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, marginBottom: 8 }}>
          <span className="tag">{activeClass.category}</span>
          <span className="tag" style={{ background: 'var(--surface-raised)', color: 'var(--accent)' }}>
            {activeClass.level} Level
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {activeClass.readTime} min read
          </span>
          {isCompleted && (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8', fontSize: 12, fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Completed
            </span>
          )}
        </div>

        <h1 style={{ font: "600 clamp(26px, 4vw, 36px)/1.2 'Fraunces', serif", color: 'var(--ink)', margin: '8px 0 12px' }}>
          {activeClass.title}
        </h1>
        <p style={{ color: 'var(--muted-strong)', fontSize: 16, lineHeight: 1.5, marginBottom: 24 }}>
          {activeClass.subtitle}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--surface-raised)', borderRadius: 8, border: '1px solid var(--line)' }}>
          <div className="avatar avatar--md">{activeClass.instructor.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong style={{ display: 'block', color: 'var(--ink)' }}>{activeClass.instructor}</strong>
            <small style={{ color: 'var(--muted)' }}>{activeClass.instructorRole}</small>
          </div>
          <button
            className={`btn btn--sm ${isCompleted ? 'btn--ghost' : 'btn--primary'}`}
            style={{ marginLeft: 'auto' }}
            onClick={() => toggleComplete(activeClass.id)}>
            {isCompleted ? <><Check size={14} /> Completed</> : 'Mark Complete'}
          </button>
        </div>

        <blockquote className="masterclass-quote">
          "{activeClass.quote}"
        </blockquote>

        <div style={{ color: 'var(--ink)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          <p>{activeClass.overview}</p>
        </div>

        <h2 style={{ font: "600 20px 'Fraunces', serif", color: 'var(--ink)', marginBottom: 16 }}>
          Core Craft Principles
        </h2>
        <div className="masterclass-principles">
          {activeClass.corePrinciples.map((cp, idx) => (
            <div key={idx} className="principle-card">
              <h3>{idx + 1}. {cp.title}</h3>
              <p>{cp.description}</p>
              {cp.example && (
                <div className="principle-card__example">
                  {cp.example}
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 style={{ font: "600 20px 'Fraunces', serif", color: 'var(--ink)', marginTop: 32, marginBottom: 16 }}>
          Manuscript Checklist
        </h2>
        <ul style={{ paddingLeft: 20, color: 'var(--ink-soft)', lineHeight: 1.8, fontSize: 14 }}>
          {activeClass.craftBreakdown.map((item, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{item}</li>
          ))}
        </ul>

        {/* Interactive Studio Exercise */}
        <div className="masterclass-exercise-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontWeight: 600, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            <Sparkles size={16} /> Interactive Studio Exercise
          </div>
          <h3 style={{ font: "600 22px 'Fraunces', serif", color: 'var(--ink)', marginBottom: 8 }}>
            {activeClass.exercise.title}
          </h3>
          <p style={{ color: 'var(--muted-strong)', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
            {activeClass.exercise.prompt}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              Suggested Target: <strong>~{activeClass.exercise.targetWords} words</strong>
            </span>
            <button
              className="btn btn--primary"
              onClick={() => handleDraftExercise(activeClass)}>
              <PenLine size={15} /> Draft Exercise in Studio <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── HUB VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="masterclasses-view page">
      <div className="masterclass-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontWeight: 600, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          <GraduationCap size={18} /> Masterclass Upgrade & Craft Guides
        </div>
        <h1>Writing Masterclasses</h1>
        <p>
          Learn the foundational and master-level techniques of pacing, voice, dialogue subtext, and worldbuilding from acclaimed authors. Each class includes interactive manuscript exercises you can draft directly in Draftwell Studio.
        </p>
      </div>

      <div className="tab-row" style={{ marginBottom: 24 }}>
        {['All', 'Structure', 'Dialogue', 'Worldbuilding', 'Plot', 'Pacing', 'Revision'].map((c) => (
          <button
            key={c}
            className={`tab ${category === c ? 'tab--active' : ''}`}
            onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="masterclasses-grid">
        {filtered.map((mc) => {
          const isDone = completedIds.includes(mc.id)
          return (
            <article
              key={mc.id}
              className="masterclass-card"
              onClick={() => navigate(`/studio/masterclasses/${mc.id}`)}>
              <div className="masterclass-card__top">
                <span className="tag">{mc.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{mc.readTime} min</span>
                  {isDone && <CheckCircle2 size={15} color="#38bdf8" />}
                </div>
              </div>
              <h2 className="masterclass-card__title">{mc.title}</h2>
              <p className="masterclass-card__sub">{mc.subtitle}</p>
              <div className="masterclass-card__instructor">
                <User size={13} />
                <span>{mc.instructor}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 600 }}>
                  {mc.level}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
