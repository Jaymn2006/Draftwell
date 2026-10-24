'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listNovels, ensureAnonymousUser, type Novel } from '@/lib/firebase';

export default function LibraryPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const user = await ensureAnonymousUser();
        setUserId(user.uid);
        const rows = await listNovels(48);
        setNovels(rows);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ marginTop: 0, color: '#111827' }}>Draftwell Library</h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>
        Discover serialized novels. Open any title to enter the infinite-scroll reader canvas with
        paragraph-level bookmarks.
      </p>

      {userId && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '14px'
          }}
        >
          Signed in as guest <code>{userId.slice(0, 8)}…</code> — bookmarks and unlocks sync to your
          device session.
        </div>
      )}

      {loading ? (
        <p>Loading catalog...</p>
      ) : novels.length === 0 ? (
        <p style={{ color: '#6b7280' }}>
          No novels yet. Authors can publish from the{' '}
          <Link href="/author" style={{ color: '#e67e22' }}>
            Author Console
          </Link>
          .
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          {novels.map((n) => (
            <Link
              key={n.id}
              href={`/read/${n.id}/1`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <img
                src={
                  n.cover_image_url ||
                  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
                }
                alt={n.title}
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              />
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#e67e22', fontWeight: 600 }}>{n.genre}</div>
                <h3 style={{ margin: '6px 0 4px', fontSize: '16px' }}>{n.title}</h3>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>by {n.author_name}</div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#4b5563',
                    marginTop: '8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {n.synopsis || 'No synopsis yet.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
