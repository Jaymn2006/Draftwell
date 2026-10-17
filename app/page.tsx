'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface NovelRow {
  id: number;
  title: string;
  author_name: string;
  synopsis: string | null;
  cover_image_url: string | null;
  genre: string;
  status: string;
}

export default function LibraryPage() {
  const [novels, setNovels] = useState<NovelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data } = await supabase
        .from('novels')
        .select('id, title, author_name, synopsis, cover_image_url, genre, status')
        .order('created_at', { ascending: false })
        .limit(48);

      setNovels((data as NovelRow[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ marginTop: 0, color: '#111827' }}>Draftwell Library</h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>
        Discover serialized novels. Open any title to enter the infinite-scroll reader canvas with paragraph-level bookmarks.
      </p>

      {!userId && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '14px'
          }}
        >
          Sign in via Supabase Auth to save bookmarks and unlock premium chapters. Anonymous browsing is available for free chapters.
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
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'box-shadow 0.15s'
              }}
            >
              <div
                style={{
                  height: '160px',
                  background: n.cover_image_url
                    ? `url(${n.cover_image_url}) center/cover`
                    : 'linear-gradient(135deg, #1e3a8a, #7c3aed)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '12px'
                }}
              >
                {!n.cover_image_url && (
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{n.title}</span>
                )}
              </div>
              <div style={{ padding: '14px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{n.title}</h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280' }}>
                  {n.author_name} · {n.genre}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#4b5563',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {n.synopsis || 'No synopsis provided.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
