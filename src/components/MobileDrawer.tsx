import React from 'react'
import {
  Home, Compass, Trophy, Search, Library, Clock, Users,
  PenLine, BookOpen, GraduationCap, Upload, Settings, HelpCircle,
  X, Sun, Moon, Palette, Check
} from 'lucide-react'
import { useApp } from '../lib/context'
import type { Theme } from '../lib/types'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { route, navigate, settings, updateSettings, library, follows } = useApp()

  if (!isOpen) return null

  function handleNav(path: string) {
    navigate(path)
    onClose()
  }

  const themes: { id: Theme; label: string; icon: React.ElementType }[] = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'amber', label: 'Amber', icon: Palette },
    { id: 'eye', label: 'Eye-Safe', icon: Sun },
  ]

  return (
    <div className="mobile-drawer" role="dialog" aria-modal aria-label="Navigation menu">
      <div className="mobile-drawer__backdrop" onClick={onClose} />
      <div className="mobile-drawer__panel">
        <div className="mobile-drawer__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="brand-mark" style={{ width: 28, height: 28 }}>
              <img src={`${import.meta.env.BASE_URL}Draftwell-logo.png.png`} alt="Draftwell"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('brand-mark--fallback') }} />
              <span className="brand-mark__letter" aria-hidden>D</span>
            </span>
            <span style={{ font: "600 18px 'Fraunces', serif", color: 'var(--ink)' }}>Draftwell</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="mobile-drawer__body">
          <div className="mobile-drawer__section">DISCOVER & EXPLORE</div>
          <button className={`mobile-drawer__link${route === '/home' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/home')}>
            <Home size={18} /> Home
          </button>
          <button className={`mobile-drawer__link${route === '/discover' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/discover')}>
            <Compass size={18} /> Discover Stories
          </button>
          <button className={`mobile-drawer__link${route === '/rankings' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/rankings')}>
            <Trophy size={18} /> Top Rankings
          </button>
          <button className={`mobile-drawer__link${route === '/search' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/search')}>
            <Search size={18} /> Search Titles & Authors
          </button>

          <div className="mobile-drawer__section">POPULAR GENRES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 10px 10px' }}>
            {['Novels', 'Fanfiction', 'Comics', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance'].map((g) => (
              <button key={g} className="tag" onClick={() => handleNav(`/discover?genre=${encodeURIComponent(g)}`)}>
                {g}
              </button>
            ))}
          </div>

          <div className="mobile-drawer__section">MY SHELF</div>
          <button className={`mobile-drawer__link${route === '/library' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/library')}>
            <Library size={18} /> My Library
            {library.length > 0 && <span className="sidebar__count" style={{ marginLeft: 'auto' }}>{library.length}</span>}
          </button>
          <button className={`mobile-drawer__link${route === '/history' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/history')}>
            <Clock size={18} /> Reading History
          </button>
          <button className={`mobile-drawer__link${route === '/following' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/following')}>
            <Users size={18} /> Following
            {follows.length > 0 && <span className="sidebar__count" style={{ marginLeft: 'auto' }}>{follows.length}</span>}
          </button>

          <div className="mobile-drawer__section">CREATOR STUDIO</div>
          <button className={`mobile-drawer__link${route === '/studio' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/studio')}>
            <PenLine size={18} /> Writer Dashboard
          </button>
          <button className={`mobile-drawer__link${route === '/studio/preview' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/studio/preview')}>
            <BookOpen size={18} /> Live Book Preview
          </button>
          <button className={`mobile-drawer__link${route.startsWith('/studio/masterclasses') ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/studio/masterclasses')}>
            <GraduationCap size={18} /> Masterclasses & Craft
          </button>
          <button className={`mobile-drawer__link${route === '/studio/write/new' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/studio/write/new')}>
            <PenLine size={18} /> Write New Novel
          </button>
          <button className={`mobile-drawer__link${route === '/studio/import' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/studio/import')}>
            <Upload size={18} /> Import Novel (.txt)
          </button>

          <div className="mobile-drawer__section">PREFERENCES & THEME</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '4px 10px 12px' }}>
            {themes.map(({ id, label, icon: Icon }) => (
              <button key={id}
                className={`btn btn--xs ${settings.theme === id ? 'btn--primary' : 'btn--ghost'}`}
                style={{ justifyContent: 'flex-start', gap: 6 }}
                onClick={() => updateSettings({ theme: id })}>
                <Icon size={12} /> {label}
                {settings.theme === id && <Check size={12} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>

          <button className={`mobile-drawer__link${route === '/settings' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/settings')}>
            <Settings size={18} /> Account & Settings
          </button>
          <button className={`mobile-drawer__link${route === '/help' ? ' mobile-drawer__link--active' : ''}`}
            onClick={() => handleNav('/help')}>
            <HelpCircle size={18} /> Help & Shortcuts
          </button>
        </div>

        <div className="mobile-drawer__footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="avatar avatar--sm">{settings.name.slice(0, 2).toUpperCase()}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ display: 'block', color: 'var(--ink)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {settings.name}
              </strong>
              <small style={{ color: 'var(--muted)', fontSize: 11 }}>Creator & Reader</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
