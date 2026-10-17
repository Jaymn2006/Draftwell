import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Draftwell — Multi-Page Interactive Serialization',
  description: 'High-retention novel network with paragraph bookmarks, author console, and hybrid payments.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc' }}>
        <header
          style={{
            background: '#111827',
            color: '#fff',
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.25rem' }}>
            📚 Draftwell
          </a>
          <nav style={{ display: 'flex', gap: '20px' }}>
            <a href="/" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
              Library
            </a>
            <a href="/author" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
              Author Console
            </a>
            <a href="/billing" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
              Star Terminal
            </a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
