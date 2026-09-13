import { useMemo, useState } from 'react'
import {
  Bell,
  BookMarked,
  BookOpen,
  Compass,
  Home,
  Library,
  Search,
  Settings,
  Trophy,
  UserCircle,
  Users,
  PenLine,
  ChevronRight,
  Plus,
  Bookmark,
  ArrowLeft,
} from 'lucide-react'

type Chapter = { id: number; title: string; note: string; body: string; status: string }
type SettingsState = { name: string; role: string; theme: 'light' | 'dark' | 'amber' | 'eye'; accent: string; font: 'serif' | 'sans'; page: 'classic' | 'modern' }

type ProductShellProps = {
  route: string
  chapters: Chapter[]
  settings: SettingsState
  userId: string | null
  onLogout: () => Promise<void>
  navigate: (route: string) => void
}

type Work = { title: string; author: string; type: string; description: string; tags: string[]; status: string }

const works: Work[] = [
  { title: 'The Shape of Rain', author: 'Mara Ellison', type: 'Novel', description: 'A quiet town remembers how to breathe before the storm arrives.', tags: ['Literary', 'Mystery'], status: 'Draft' },
  { title: 'Salt in the Static', author: 'Ari Okafor', type: 'Novel', description: 'Two voices find each other across a city built on old radio signals.', tags: ['Sci-fi', 'Drama'], status: 'Ongoing' },
  { title: 'The Glass Orchard', author: 'Nia Vale', type: 'Fanfic', description: 'A tender return to a world that never stopped waiting.', tags: ['Fantasy', 'Romance'], status: 'Complete' },
]

function ProductBrandMark() {
  return <span className="product-brand-mark" aria-label="Draftwell logo"><img src={`${import.meta.env.BASE_URL}Draftwell-logo.png.png`} alt="Draftwell" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('brand-mark-fallback') }} /><span className="brand-mark-fallback-letter" aria-hidden="true">D</span></span>
}

function routeTitle(route: string) {
  return route === '/home' ? 'Home' : route.slice(1).split('/')[0].replace('-', ' ')
}

export function ProductShell({ route, chapters, settings, userId, onLogout, navigate }: ProductShellProps) {
  const [query, setQuery] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const libraryKey = `draftwell:${userId ?? 'guest'}:library`
  const [saved, setSaved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(libraryKey) ?? '[]') as string[] } catch { return [] }
  })
  const [readerChapter, setReaderChapter] = useState(0)
  const filtered = useMemo(() => works.filter((work) => `${work.title} ${work.author} ${work.type} ${work.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query])
  const title = route.startsWith('/reader') ? 'Reader' : route.startsWith('/preview') ? 'Book Preview' : routeTitle(route)

  function persistLibrary(next: string[]) {
    setSaved(next)
    localStorage.setItem(libraryKey, JSON.stringify(next))
  }

  function toggleSaved(titleToToggle: string) {
    persistLibrary(saved.includes(titleToToggle) ? saved.filter((title) => title !== titleToToggle) : [...saved, titleToToggle])
  }

  return <div className="product-shell" style={{ '--accent': settings.accent } as React.CSSProperties}>
    <header className="product-topbar"><button className="product-brand" onClick={() => navigate('/home')}><ProductBrandMark /><span>Draftwell</span></button><label className="global-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') navigate('/search') }} placeholder="Search stories, authors, worlds" /></label><div className="product-actions"><button title="Notifications" onClick={() => navigate('/notifications')}><Bell size={18} /></button><div className="profile-menu-wrap"><button title="Profile" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}><UserCircle size={19} /></button>{profileMenuOpen && <div className="profile-menu" role="menu"><button onClick={() => { setProfileMenuOpen(false); navigate('/profile') }}>Profile</button><button onClick={() => { setProfileMenuOpen(false); navigate('/studio') }}>Creator Studio</button><button onClick={() => { setProfileMenuOpen(false); navigate('/settings') }}>Settings</button><button onClick={() => { setProfileMenuOpen(false); void onLogout() }}>Sign out</button></div>}</div></div></header>
    <div className="product-layout"><aside className="product-sidebar"><div className="product-sidebar-label">DRAFTWELL</div><ProductNav route={route} navigate={navigate} /><div className="product-sidebar-divider" /><button className="product-write" onClick={() => navigate('/write')}><PenLine size={16} /> Write</button><button className="product-nav-link" onClick={() => navigate('/studio')}><BookOpen size={16} /> Creator Studio</button><div className="product-sidebar-bottom"><button className="product-nav-link" onClick={() => navigate('/settings')}><Settings size={16} /> Settings</button><span className="product-user">{settings.name}</span></div></aside>
    <main className="product-main"><div className="product-heading"><div><span className="eyebrow">{route.startsWith('/reader') ? 'READING ROOM' : 'DRAFTWELL'}</span><h1>{title}</h1></div>{route === '/home' && <button className="product-outline-button" onClick={() => navigate('/discover')}>Explore stories <ChevronRight size={15} /></button>}</div>
      {route === '/home' && <HomeView works={works} saved={saved} toggleSaved={toggleSaved} navigate={navigate} />}
      {(route === '/discover' || route === '/novels' || route === '/fanfic' || route === '/comics' || route === '/search') && <DiscoveryView route={route} works={filtered} saved={saved} toggleSaved={toggleSaved} navigate={navigate} query={query} setQuery={setQuery} />}
      {route.startsWith('/novel/') && <WorkDetailView navigate={navigate} />}
      {route === '/rankings' && <RankingsView works={works} navigate={navigate} />}
      {route === '/library' && <LibraryView saved={saved} works={works} navigate={navigate} />}
      {route === '/following' && <FollowingView navigate={navigate} />}
      {route === '/write' && <WriteView navigate={navigate} />}
      {route === '/profile' && <ProfileView settings={settings} navigate={navigate} />}
      {route === '/notifications' && <NotificationsView />}
      {route.startsWith('/settings') && <SettingsView settings={settings} navigate={navigate} />}
      {route.startsWith('/reader') && <ReaderView chapters={chapters} readerChapter={readerChapter} setReaderChapter={setReaderChapter} navigate={navigate} />}
      {route.startsWith('/preview') && <PreviewView chapters={chapters} navigate={navigate} />}
      {route.startsWith('/studio') && <StudioEntry navigate={navigate} />}
    </main></div>
  </div>
}

function ProductNav({ route, navigate }: { route: string; navigate: (route: string) => void }) {
  const links = [['/home', Home, 'Home'], ['/discover', Compass, 'Discover'], ['/search', Search, 'Search'], ['/novels', BookOpen, 'Novels'], ['/fanfic', Users, 'Fanfic'], ['/comics', BookMarked, 'Comics'], ['/rankings', Trophy, 'Rankings'], ['/library', Library, 'Library'], ['/following', Users, 'Following']] as const
  return <nav className="product-nav">{links.map(([path, Icon, label]) => <button key={path} className={route === path ? 'selected' : ''} onClick={() => navigate(path)}><Icon size={16} />{label}</button>)}</nav>
}

function HomeView({ works, saved, toggleSaved, navigate }: { works: Work[]; saved: string[]; toggleSaved: (title: string) => void; navigate: (route: string) => void }) {
  return <><section className="welcome-band"><div><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>Make room for the story.</h2><p>Read something new, return to a world you love, or step back into your manuscript.</p></div><button className="product-primary-button" onClick={() => navigate('/studio')}>Open writing desk <PenLine size={16} /></button></section><section className="product-section"><div className="section-heading"><h2>Continue reading</h2><button onClick={() => navigate('/library')}>Your library <ChevronRight size={15} /></button></div><WorkGrid works={works} saved={saved} toggleSaved={toggleSaved} navigate={navigate} /></section><section className="product-section"><div className="section-heading"><h2>For you</h2><button onClick={() => navigate('/discover')}>Discover more <ChevronRight size={15} /></button></div><div className="feature-row"><article className="feature-card"><span className="eyebrow">EDITOR'S PICK</span><h3>Stories with weather in them</h3><p>Atmosphere, memory, and the small decisions that change everything.</p><button onClick={() => navigate('/novel/the-shape-of-rain')}>Read collection <ChevronRight size={15} /></button></article><article className="quiet-card"><span className="eyebrow">YOUR LIBRARY</span><strong>{saved.length} saved stories</strong><p>Keep the books and worlds you want close.</p><button onClick={() => navigate('/library')}>Open library</button></article></div></section></>
}

function DiscoveryView({ route, works, saved, toggleSaved, navigate, query, setQuery }: { route: string; works: Work[]; saved: string[]; toggleSaved: (title: string) => void; navigate: (route: string) => void; query: string; setQuery: (value: string) => void }) {
  const label = route === '/search' ? 'Search results' : route === '/discover' ? 'Discover stories' : `${route.slice(1)} collection`
  return <><div className="filter-row"><div className="segmented"><button className="active">Trending</button><button>New</button><button>Completed</button></div><select aria-label="Filter by type"><option>All types</option><option>Novels</option><option>Fanfic</option><option>Comics</option></select><select aria-label="Filter by status"><option>Any status</option><option>Ongoing</option><option>Complete</option></select></div>{route === '/search' && <input className="large-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, authors, genres and tags" />}{query && <p className="result-count">{works.length} result{works.length === 1 ? '' : 's'} matching “{query}”</p>}<section className="product-section"><WorkGrid works={works} saved={saved} toggleSaved={toggleSaved} navigate={navigate} /></section></>
}

function WorkGrid({ works, saved, toggleSaved, navigate }: { works: Work[]; saved: string[]; toggleSaved: (title: string) => void; navigate: (route: string) => void }) {
  return <div className="work-grid">{works.map((work) => <article className="work-card" key={work.title}><button className="work-cover" onClick={() => navigate(`/novel/${work.title.toLowerCase().split(' ').join('-')}`)}><span>{work.title.split(' ').slice(0, 2).join('\n')}</span></button><div className="work-card-body"><div className="work-type">{work.type} · {work.status}</div><h3>{work.title}</h3><p>{work.description}</p><span className="work-author">by {work.author}</span><div className="work-card-actions"><button onClick={() => navigate('/reader/the-shape-of-rain')}><BookOpen size={14} /> Read</button><button className={saved.includes(work.title) ? 'saved' : ''} onClick={() => toggleSaved(work.title)}><Bookmark size={14} /> {saved.includes(work.title) ? 'Saved' : 'Save'}</button></div></div></article>)}</div>
}

function RankingsView({ works, navigate }: { works: Work[]; navigate: (route: string) => void }) { return <><div className="ranking-tabs"><button className="active">Trending now</button><button>Most read</button><button>Rising</button><button>Highest rated</button></div><div className="ranking-list">{works.map((work, index) => <button key={work.title} onClick={() => navigate('/reader/the-shape-of-rain')}><strong>0{index + 1}</strong><span><b>{work.title}</b><small>{work.author} · {work.type}</small></span><ChevronRight size={16} /></button>)}</div></> }
function LibraryView({ saved, works, navigate }: { saved: string[]; works: Work[]; navigate: (route: string) => void }) { const items = works.filter((work) => saved.includes(work.title)); return <section className="product-section"><div className="library-tabs"><button className="active">Saved</button><button>Reading</button><button>History</button><button>Downloaded</button></div>{items.length ? <WorkGrid works={items} saved={saved} toggleSaved={() => undefined} navigate={navigate} /> : <EmptyState title="Your library starts here" text="Save a story from Discover and it will stay close on every visit." action="Explore stories" onClick={() => navigate('/discover')} />}</section> }
function FollowingView({ navigate }: { navigate: (route: string) => void }) { return <EmptyState title="Follow the voices you love" text="Follow an author or story to see new chapters here." action="Discover authors" onClick={() => navigate('/discover')} /> }
function WriteView({ navigate }: { navigate: (route: string) => void }) { return <section className="creation-grid"><article><PenLine size={22} /><h2>Start a creative project</h2><p>Choose a format and bring a world into focus.</p><button className="product-primary-button" onClick={() => navigate('/studio')}>Create a novel</button></article><article><BookMarked size={22} /><h2>Fanfiction</h2><p>Write into a universe you already love.</p><button className="product-outline-button" onClick={() => navigate('/studio')}>Create fanfic</button></article><article><Compass size={22} /><h2>Comic project</h2><p>Plan episodes and pages in a visual workflow.</p><button className="product-outline-button" onClick={() => navigate('/studio')}>Start a comic</button></article></section> }
function ProfileView({ settings, navigate }: { settings: SettingsState; navigate: (route: string) => void }) { return <section className="profile-hero"><div className="profile-avatar">ME</div><span className="eyebrow">CREATOR PROFILE</span><h2>{settings.name}</h2><p>{settings.role} · Building quiet, cinematic stories.</p><div className="profile-stats"><span><b>1</b> project</span><span><b>0</b> followers</span><span><b>0</b> published</span></div><button className="product-outline-button" onClick={() => navigate('/settings/profile')}>Edit profile <ChevronRight size={15} /></button></section> }
function NotificationsView() { return <EmptyState title="You're all caught up" text="New chapters, replies, and account updates will appear here." action="" onClick={() => undefined} /> }
function SettingsView({ settings, navigate }: { settings: SettingsState; navigate: (route: string) => void }) { const categories = ['account', 'profile', 'appearance', 'reading', 'writing', 'speech', 'notifications', 'privacy', 'security', 'language', 'downloads', 'data', 'ai', 'accessibility', 'content', 'recommendations', 'creator']; const category = window.location.pathname.split('/').at(-1) ?? 'settings'; const descriptions: Record<string, string> = { account: 'Manage your account, session, and sign-out choices.', profile: 'Shape the identity readers see.', appearance: 'Choose the visual atmosphere for your Draftwell workspace.', reading: 'Set the comfort of your reading room.', writing: 'Tune the editor to your writing habits.', speech: 'Control speech recognition and voice behavior.', notifications: 'Choose which updates deserve your attention.', privacy: 'Understand and control what is visible.', security: 'Keep your account protected.', language: 'Prepare Draftwell for your language and region.', downloads: 'Manage offline reading and local storage.', data: 'Export or manage local Draftwell data.', ai: 'Control Mira and project context.', accessibility: 'Make Draftwell easier to use.', content: 'Choose the content you want to discover.', recommendations: 'Shape how Draftwell recommends stories.', creator: 'Set defaults for your creative work.' }; return <div className="settings-page"><nav className="settings-categories"><button className={category === 'settings' ? 'active' : ''} onClick={() => navigate('/settings')}>Overview</button>{categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => navigate(`/settings/${item}`)}>{item.replace('-', ' ')}</button>)}</nav><div className="settings-panel"><span className="eyebrow">DRAFTWELL SETTINGS · {category.toUpperCase()}</span><h2>{category === 'settings' ? 'Make Draftwell yours' : category.replace('-', ' ')}</h2><p>{descriptions[category] ?? `Your settings are saved for ${settings.name}.`}</p>{category === 'appearance' && <div className="settings-choice-row"><button className={settings.theme === 'dark' ? 'selected' : ''} onClick={() => document.documentElement.dataset.theme = 'dark'}>Dark</button><button className={settings.theme === 'light' ? 'selected' : ''} onClick={() => document.documentElement.dataset.theme = 'light'}>Light</button></div>}{category === 'settings' && <button className="product-primary-button" onClick={() => navigate('/studio')}>Return to studio</button>}</div></div> }
function WorkDetailView({ navigate }: { navigate: (route: string) => void }) { return <article className="profile-hero"><span className="eyebrow">NOVEL · ONGOING</span><h2>The Shape of Rain</h2><p>A quiet town remembers how to breathe before the storm arrives. Follow Mara through a story about memory, weather, and the things we carry home.</p><div className="profile-stats"><span><b>3</b> chapters</span><span><b>Literary</b> genre</span><span><b>Draft</b> status</span></div><button className="product-primary-button" onClick={() => navigate('/reader/the-shape-of-rain')}>Start reading <BookOpen size={15} /></button></article> }
function ReaderView({ chapters, readerChapter, setReaderChapter, navigate }: { chapters: Chapter[]; readerChapter: number; setReaderChapter: (value: number) => void; navigate: (route: string) => void }) { const chapter = chapters[readerChapter] ?? chapters[0]; return <article className="reader-page"><button className="reader-back" onClick={() => navigate('/home')}><ArrowLeft size={16} /> Back to Draftwell</button><span className="eyebrow">THE SHAPE OF RAIN · CHAPTER {String(readerChapter + 1).padStart(2, '0')}</span><h2>{chapter.title}</h2><div className="reader-copy">{chapter.body.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="reader-controls"><button disabled={readerChapter === 0} onClick={() => setReaderChapter(Math.max(0, readerChapter - 1))}>Previous</button><span>{readerChapter + 1} / {chapters.length}</span><button disabled={readerChapter === chapters.length - 1} onClick={() => setReaderChapter(Math.min(chapters.length - 1, readerChapter + 1))}>Next</button></div></article> }
function PreviewView({ chapters, navigate }: { chapters: Chapter[]; navigate: (route: string) => void }) { return <article className="dedicated-preview"><button className="reader-back" onClick={() => navigate('/studio')}><ArrowLeft size={16} /> Back to studio</button><div className="preview-book"><div className="book-cover-large">THE<br /><i>SHAPE</i><br />OF RAIN</div><div className="book-page-large"><span>THE SHAPE OF RAIN</span><h2>{chapters[0]?.title}</h2><p>{chapters[0]?.body}</p></div></div></article> }
function StudioEntry({ navigate }: { navigate: (route: string) => void }) { return <EmptyState title="Creator Studio" text="Your writing desk is ready. Open the current manuscript to continue." action="Open manuscript" onClick={() => navigate('/studio')} /> }
function EmptyState({ title, text, action, onClick }: { title: string; text: string; action: string; onClick: () => void }) { return <div className="empty-state"><div className="empty-mark">D</div><h2>{title}</h2><p>{text}</p>{action && <button className="product-primary-button" onClick={onClick}>{action}</button>}</div> }
