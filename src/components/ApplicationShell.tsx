import React, { useState, useRef, useEffect, memo } from 'react'
import {
  PanelLeft, Search, Moon, Sun, Palette, Leaf, Bell,
  UserCircle, Library, PenLine, BookOpen, GraduationCap,
  Settings, HelpCircle, LogOut, Home, Compass, Trophy,
  Clock, Users, BarChart2, Menu
} from 'lucide-react'
import type { SettingsState, Theme } from '../lib/types'
import { MobileDrawer } from './MobileDrawer'

// ── BRAND MARK (High-Resolution Graphic Badge) ──────────────────────────────
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="brand-mark inline-flex items-center justify-center relative overflow-hidden rounded-md flex-shrink-0"
      aria-label="Draftwell"
      style={{ width: size, height: size }}
    >
      <img
        src={`${import.meta.env.BASE_URL}Draftwell-logo.png.png`}
        alt="Draftwell"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.parentElement?.classList.add('brand-mark--fallback')
        }}
      />
      <span className="brand-mark__letter font-serif font-bold text-amber-500 select-none" aria-hidden>
        D
      </span>
    </span>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. TOP STAGNANT ELEMENT (React.memo, z-index: 50, Solid Dark Background)
// ══════════════════════════════════════════════════════════════════════════════
export interface TopBarProps {
  settings: SettingsState
  unreadCount: number
  onToggleSidebar: () => void
  onNavigate: (route: string) => void
  onCycleTheme: () => void
  onSignOut: () => void
}

export const TopBar = memo(function TopBar({
  settings,
  unreadCount,
  onToggleSidebar,
  onNavigate,
  onCycleTheme,
  onSignOut,
}: TopBarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const profileRef = useRef<HTMLDivElement>(null)

  // Outside click listener to dismiss profile popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header
      id="draftwell-topbar"
      className="topbar fixed top-0 left-0 w-full h-16 z-50 flex items-center gap-4 px-4 sm:px-6 border-b border-[#233140] bg-[#0c1015] shadow-md select-none flex-shrink-0"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '64px',
        zIndex: 50,
        backgroundColor: '#0c1015', // Solid dark background match to prevent text blending during scroll
      }}
      role="banner"
    >
      {/* Mobile Drawer Trigger */}
      <button
        type="button"
        className="topbar__menu-btn md:hidden p-2 rounded-lg text-[#8fa2b3] hover:text-[#eaf1f7] hover:bg-[#18222e] transition-colors"
        aria-label="Toggle navigation menu"
        onClick={onToggleSidebar}
      >
        <PanelLeft size={20} />
      </button>

      {/* Brand Logo & Title */}
      <button
        type="button"
        className="topbar__brand flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 text-left group"
        onClick={() => onNavigate('/home')}
        aria-label="Draftwell home"
      >
        <BrandMark size={28} />
        <span className="topbar__brand-name font-serif font-bold text-lg tracking-tight text-[#f2f6fa] group-hover:text-amber-400 transition-colors">
          Draftwell
        </span>
      </button>

      {/* Center Search Bar */}
      <form
        className="topbar__search flex-1 max-w-md mx-2 sm:mx-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#233140] bg-[#121922] focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all text-[#8fa2b3]"
        onSubmit={handleSearchSubmit}
        role="search"
      >
        <Search size={16} className="text-[#62778a] flex-shrink-0" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search titles, authors, worlds…"
          aria-label="Search stories, authors, and genres"
          className="w-full bg-transparent text-sm text-[#eaf1f7] placeholder-[#62778a] outline-none border-0"
        />
      </form>

      {/* Right Actions & Utilities */}
      <div className="topbar__actions flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Quick Theme Cycle Switcher */}
        <button
          type="button"
          className="topbar__theme-toggle p-2 rounded-lg text-[#8fa2b3] hover:text-[#eaf1f7] hover:bg-[#18222e] transition-colors"
          aria-label={`Theme: ${settings.theme}. Click to change theme`}
          onClick={onCycleTheme}
          title={`Theme: ${settings.theme}`}
        >
          {settings.theme === 'dark' && <Moon size={18} />}
          {settings.theme === 'light' && <Sun size={18} />}
          {settings.theme === 'amber' && <Palette size={18} />}
          {settings.theme === 'eye' && <Leaf size={18} />}
        </button>

        {/* Notifications Icon Button */}
        <button
          type="button"
          className="topbar__notif relative p-2 rounded-lg text-[#8fa2b3] hover:text-[#eaf1f7] hover:bg-[#18222e] transition-colors"
          aria-label="Notifications"
          onClick={() => onNavigate('/notifications')}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="badge absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-[#0c1015] font-mono text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile Utilities Menu */}
        <div ref={profileRef} className="profile-wrap relative">
          <button
            type="button"
            className="topbar__profile flex items-center gap-2 py-1 px-2.5 rounded-full border border-[#233140] bg-[#121922] hover:border-amber-500/60 transition-all cursor-pointer"
            aria-label="Author and Profile utilities"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((prev) => !prev)}
          >
            <span className="avatar avatar--sm w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/40">
              {settings.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="topbar__profile-name hidden sm:inline-block text-xs font-semibold text-[#d4e1ed] max-w-[110px] truncate">
              {settings.name}
            </span>
          </button>

          {profileMenuOpen && (
            <div
              className="dropdown absolute right-0 mt-2 w-56 rounded-xl border border-[#233140] bg-[#0f151c] shadow-2xl p-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#b0c2d3] hover:text-white hover:bg-[#1a2430] text-left transition-colors"
                onClick={() => { setProfileMenuOpen(false); onNavigate('/profile') }}
              >
                <UserCircle size={16} /> Author Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#b0c2d3] hover:text-white hover:bg-[#1a2430] text-left transition-colors"
                onClick={() => { setProfileMenuOpen(false); onNavigate('/library') }}
              >
                <Library size={16} /> My Library
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#b0c2d3] hover:text-white hover:bg-[#1a2430] text-left transition-colors"
                onClick={() => { setProfileMenuOpen(false); onNavigate('/studio') }}
              >
                <PenLine size={16} /> Creator Studio
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#b0c2d3] hover:text-white hover:bg-[#1a2430] text-left transition-colors"
                onClick={() => { setProfileMenuOpen(false); onNavigate('/studio/preview') }}
              >
                <BookOpen size={16} /> Live Book Preview
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#b0c2d3] hover:text-white hover:bg-[#1a2430] text-left transition-colors"
                onClick={() => { setProfileMenuOpen(false); onNavigate('/studio/masterclasses') }}
              >
                <GraduationCap size={16} /> Masterclasses
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#b0c2d3] hover:text-white hover:bg-[#1a2430] text-left transition-colors"
                onClick={() => { setProfileMenuOpen(false); onNavigate('/settings') }}
              >
                <Settings size={16} /> Settings
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#b0c2d3] hover:text-white hover:bg-[#1a2430] text-left transition-colors"
                onClick={() => { setProfileMenuOpen(false); onNavigate('/help') }}
              >
                <HelpCircle size={16} /> Help &amp; Support
              </button>
              <div className="h-px bg-[#233140] my-1" />
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 text-left transition-colors font-medium"
                onClick={() => { setProfileMenuOpen(false); onSignOut() }}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
})

// ══════════════════════════════════════════════════════════════════════════════
// 2. LEFT STAGNANT ELEMENT (React.memo, z-index: 40, w-64 Fixed Block)
// ══════════════════════════════════════════════════════════════════════════════
export interface LeftNavigationSidebarProps {
  currentRoute: string
  libraryCount: number
  followsCount: number
  settings: SettingsState
  onNavigate: (route: string) => void
}

export const LeftNavigationSidebar = memo(function LeftNavigationSidebar({
  currentRoute,
  libraryCount,
  followsCount,
  settings,
  onNavigate,
}: LeftNavigationSidebarProps) {
  return (
    <aside
      id="draftwell-sidebar"
      className="sidebar hidden md:flex w-64 h-full overflow-y-auto flex-shrink-0 flex-col border-r border-[#233140] bg-[#080c11] px-3 py-5 z-40 select-none"
      style={{
        width: '16rem', // w-64 = 256px
        height: '100%',
        overflowY: 'auto',
        flexShrink: 0,
        zIndex: 40,
        backgroundColor: '#080c11',
      }}
      aria-label="Main Navigation"
    >
      <nav className="sidebar__nav flex-1 flex flex-col gap-1 text-sm">
        {/* DISCOVER SECTION */}
        <div className="sidebar__section-label px-3 pt-2 pb-1.5 text-[10px] font-mono tracking-widest font-semibold text-[#62778a] uppercase">
          Discover
        </div>
        {[
          { path: '/home', label: 'Home', icon: Home },
          { path: '/discover', label: 'Discover', icon: Compass },
          { path: '/rankings', label: 'Rankings', icon: Trophy },
          { path: '/search', label: 'Search', icon: Search },
        ].map(({ path, label, icon: Icon }) => {
          const isActive = currentRoute === path || (path !== '/home' && currentRoute.startsWith(path))
          return (
            <button
              key={path}
              type="button"
              className={`sidebar__link w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-left transition-colors ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 font-semibold'
                  : 'text-[#8fa2b3] hover:text-[#eaf1f7] hover:bg-[#121922]'
              }`}
              onClick={() => onNavigate(path)}
            >
              <Icon size={16} className={isActive ? 'text-amber-400' : 'text-[#62778a]'} />
              <span>{label}</span>
            </button>
          )
        })}

        {/* MY SHELF SECTION */}
        <div className="sidebar__section-label px-3 pt-4 pb-1.5 text-[10px] font-mono tracking-widest font-semibold text-[#62778a] uppercase">
          My Shelf
        </div>
        {[
          { path: '/library', label: 'Library', icon: Library, count: libraryCount },
          { path: '/history', label: 'History', icon: Clock, count: 0 },
          { path: '/following', label: 'Following', icon: Users, count: followsCount },
        ].map(({ path, label, icon: Icon, count }) => {
          const isActive = currentRoute === path
          return (
            <button
              key={path}
              type="button"
              className={`sidebar__link w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-left transition-colors ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 font-semibold'
                  : 'text-[#8fa2b3] hover:text-[#eaf1f7] hover:bg-[#121922]'
              }`}
              onClick={() => onNavigate(path)}
            >
              <Icon size={16} className={isActive ? 'text-amber-400' : 'text-[#62778a]'} />
              <span>{label}</span>
              {count > 0 && (
                <span className="sidebar__count ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          )
        })}

        {/* CREATOR STUDIO SECTION */}
        <div className="sidebar__section-label px-3 pt-4 pb-1.5 text-[10px] font-mono tracking-widest font-semibold text-[#62778a] uppercase">
          Creator Studio
        </div>
        {[
          { path: '/studio', label: 'Dashboard', icon: BarChart2, activeCheck: (r: string) => r === '/studio' },
          { path: '/studio/write/new', label: 'Write Novel', icon: PenLine, activeCheck: (r: string) => r.startsWith('/studio/write') || r.startsWith('/studio/edit') },
          { path: '/studio/preview', label: 'Book Preview', icon: BookOpen, activeCheck: (r: string) => r.startsWith('/studio/preview') },
          { path: '/studio/masterclasses', label: 'Masterclasses', icon: GraduationCap, activeCheck: (r: string) => r.startsWith('/studio/masterclasses') },
        ].map(({ path, label, icon: Icon, activeCheck }) => {
          const isActive = activeCheck(currentRoute)
          return (
            <button
              key={path}
              type="button"
              className={`sidebar__link w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-left transition-colors ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 font-semibold'
                  : 'text-[#8fa2b3] hover:text-[#eaf1f7] hover:bg-[#121922]'
              }`}
              onClick={() => onNavigate(path)}
            >
              <Icon size={16} className={isActive ? 'text-amber-400' : 'text-[#62778a]'} />
              <span>{label}</span>
            </button>
          )
        })}

        <div className="h-px bg-[#233140] my-3 mx-2" />

        <button
          type="button"
          className={`sidebar__link w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-left transition-colors ${
            currentRoute === '/settings'
              ? 'bg-amber-500/15 text-amber-300 font-semibold'
              : 'text-[#8fa2b3] hover:text-[#eaf1f7] hover:bg-[#121922]'
          }`}
          onClick={() => onNavigate('/settings')}
        >
          <Settings size={16} className={currentRoute === '/settings' ? 'text-amber-400' : 'text-[#62778a]'} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Sidebar Author Footnote */}
      <div className="sidebar__user mt-auto pt-3 border-t border-[#233140] flex items-center gap-2.5 px-2 text-xs text-[#8fa2b3]">
        <span className="avatar avatar--sm w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center border border-amber-500/30">
          {settings.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="sidebar__username font-medium text-[#d4e1ed] truncate max-w-[140px]">
          {settings.name}
        </span>
      </div>
    </aside>
  )
})

// ══════════════════════════════════════════════════════════════════════════════
// 3. APPLICATION SHELL MATRIX (Two-Way Fixed Blueprint)
// ══════════════════════════════════════════════════════════════════════════════
export interface ApplicationShellProps {
  settings: SettingsState
  currentRoute: string
  unreadCount: number
  libraryCount: number
  followsCount: number
  onNavigate: (route: string) => void
  onCycleTheme: () => void
  onSignOut: () => void
  children: React.ReactNode
}

export function ApplicationShell({
  settings,
  currentRoute,
  unreadCount,
  libraryCount,
  followsCount,
  onNavigate,
  onCycleTheme,
  onSignOut,
  children,
}: ApplicationShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [currentRoute])

  return (
    <div
      id="draftwell-shell-matrix"
      className="h-screen w-screen overflow-hidden flex flex-col bg-[#050b12] text-[#eef4f5] fixed inset-0"
      style={{
        '--accent': settings.accent,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      } as React.CSSProperties}
      data-sidebar={sidebarOpen ? 'open' : 'closed'}
    >
      {/* Slideout Mobile Drawer */}
      <MobileDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* TOP STAGNANT ELEMENT (Fixed at top, z-index: 50, h-16, w-full, solid dark background) */}
      <TopBar
        settings={settings}
        unreadCount={unreadCount}
        onToggleSidebar={() => setSidebarOpen(true)}
        onNavigate={onNavigate}
        onCycleTheme={onCycleTheme}
        onSignOut={onSignOut}
      />

      {/* BOTTOM SPLIT WORKSPACE (flex-1 flex overflow-hidden) */}
      <div
        id="draftwell-split-workspace"
        className="flex-1 flex overflow-hidden w-full"
        style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 64px)',
          marginTop: '64px', // Critical offset matching the 64px (h-16) fixed TopBar
          overflow: 'hidden',
        }}
      >
        {/* LEFT STAGNANT ELEMENT (w-64 h-full overflow-y-auto flex-shrink-0, z-index: 40) */}
        <LeftNavigationSidebar
          currentRoute={currentRoute}
          libraryCount={libraryCount}
          followsCount={followsCount}
          settings={settings}
          onNavigate={onNavigate}
        />

        {/* MAIN SCROLL CONTAINER OFFSET REGIME (flex-1 h-full overflow-y-auto padding-top-offsets) */}
        <main
          id="main-scroll-feed"
          className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-[#050b12] relative select-text"
          style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollBehavior: 'smooth',
            overscrollBehaviorY: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
          tabIndex={0}
        >
          {/* Main Feed Wrapper with Critical Padding Safety Margins to prevent clipping on viewport initialization */}
          <div
            className="main-feed-wrapper w-full min-h-full px-4 sm:px-8 lg:px-10 pt-6 pb-20 md:pb-16 max-w-7xl mx-auto"
            style={{
              boxSizing: 'border-box',
              minHeight: '100%',
              paddingTop: '24px', // Top padding ensures Featured Story banner ("The Shape of Rain") is never clipped
            }}
          >
            {children}
          </div>
        </main>
      </div>

      {/* RESPONSIVE BOTTOM NAVIGATION */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <button
          className={`bottom-nav__item${currentRoute === '/home' ? ' bottom-nav__item--active' : ''}`}
          onClick={() => onNavigate('/home')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button
          className={`bottom-nav__item${currentRoute === '/discover' || currentRoute.startsWith('/discover') ? ' bottom-nav__item--active' : ''}`}
          onClick={() => onNavigate('/discover')}
        >
          <Compass size={20} />
          <span>Discover</span>
        </button>
        <button
          className={`bottom-nav__item${currentRoute === '/search' || currentRoute.startsWith('/search') ? ' bottom-nav__item--active' : ''}`}
          onClick={() => onNavigate('/search')}
        >
          <Search size={20} />
          <span>Search</span>
        </button>
        <button
          className={`bottom-nav__item${currentRoute.startsWith('/studio') ? ' bottom-nav__item--active' : ''}`}
          onClick={() => onNavigate('/studio')}
        >
          <PenLine size={20} />
          <span>Studio</span>
        </button>
        <button
          className={`bottom-nav__item${currentRoute === '/library' ? ' bottom-nav__item--active' : ''}`}
          onClick={() => onNavigate('/library')}
        >
          <Library size={20} />
          <span>Shelf</span>
          {libraryCount > 0 && <span className="bottom-nav__badge">{libraryCount}</span>}
        </button>
        <button
          className={`bottom-nav__item${currentRoute.startsWith('/settings') ? ' bottom-nav__item--active' : ''}`}
          onClick={() => onNavigate('/settings')}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button className="bottom-nav__item" onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  )
}
