'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DraftwellAuthorProps {
  creatorId: string;
}

export const DraftwellAuthor: React.FC<DraftwellAuthorProps> = ({ creatorId }) => {
  const [title, setTitle] = useState<string>('');
  const [pseudonym, setPseudonym] = useState<string>('');
  const [synopsis, setSynopsis] = useState<string>('');
  const [genre, setGenre] = useState<string>('Fantasy');
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [chapterContent, setChapterContent] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [novelId, setNovelId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const executePublishSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pseudonym.trim()) {
      setFeedback('Validation Alert: Provide clear title and author name specifications.');
      return;
    }

    setLoading(true);
    setFeedback('');

    const { data, error } = await supabase
      .from('novels')
      .insert([
        {
          creator_id: creatorId,
          title: title.trim(),
          author_name: pseudonym.trim(),
          synopsis: synopsis.trim(),
          genre,
          cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
          status: 'ONGOING'
        }
      ])
      .select('id')
      .single();

    setLoading(false);

    if (!error && data) {
      setNovelId(data.id);
      setFeedback(`Success: "${title}" is now officially live on the Draftwell registry! Novel ID: ${data.id}`);
      setTitle('');
      setPseudonym('');
      setSynopsis('');
    } else {
      setFeedback(`Deployment Failure: ${error?.message ?? 'Unknown error'}`);
    }
  };

  const publishChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novelId || !chapterTitle.trim() || !chapterContent.trim()) {
      setFeedback('Provide a published novel ID, chapter title, and content.');
      return;
    }

    setLoading(true);

    const { data: existing } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('novel_id', novelId)
      .order('chapter_number', { ascending: false })
      .limit(1);

    const nextNumber = existing && existing.length > 0 ? existing[0].chapter_number + 1 : 1;

    const { error } = await supabase.from('chapters').insert([
      {
        novel_id: novelId,
        chapter_number: nextNumber,
        title: chapterTitle.trim(),
        content: chapterContent.trim(),
        is_premium: isPremium,
        coin_cost: isPremium ? 10 : 0,
        star_cost: isPremium ? 1 : 0
      }
    ]);

    setLoading(false);

    if (!error) {
      setFeedback(`Chapter ${nextNumber} "${chapterTitle}" published successfully.`);
      setChapterTitle('');
      setChapterContent('');
      setIsPremium(false);
    } else {
      setFeedback(`Chapter publish failed: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '40px auto',
        padding: '24px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontFamily: 'system-ui, sans-serif',
        color: '#111'
      }}
    >
      <h3 style={{ margin: '0 0 6px 0', color: '#111827' }}>✍️ Draftwell Creative Workshop</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px 0' }}>
        Launch original books and deploy premium serialized manuscripts directly to the global registry.
      </p>

      {feedback && (
        <div
          style={{
            background: feedback.startsWith('Success') || feedback.includes('published') ? '#f0fdf4' : '#fef2f2',
            color: feedback.startsWith('Success') || feedback.includes('published') ? '#166534' : '#991b1b',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '14px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {feedback}
        </div>
      )}

      <form onSubmit={executePublishSeries} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <h4 style={{ margin: 0 }}>1. Create New Novel Series</h4>
        <input
          type="text"
          placeholder="Novel Series Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Pen Name / Pseudonym"
          value={pseudonym}
          onChange={(e) => setPseudonym(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <textarea
          placeholder="Write your book's primary promotional summary hook..."
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          rows={4}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="Fantasy">Fantasy</option>
          <option value="Romance">Romance</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Mystery">Mystery</option>
          <option value="Literary">Literary</option>
          <option value="Horror">Horror</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#111827',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Publishing...' : 'LAUNCH NOVEL TRACK'}
        </button>
      </form>

      <form onSubmit={publishChapter} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ margin: 0 }}>2. Publish Chapter (use Novel ID from above)</h4>
        <input
          type="number"
          placeholder="Novel ID"
          value={novelId ?? ''}
          onChange={(e) => setNovelId(e.target.value ? parseInt(e.target.value, 10) : null)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Chapter Title"
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <textarea
          placeholder="Paste or write the full chapter content..."
          value={chapterContent}
          onChange={(e) => setChapterContent(e.target.value)}
          rows={10}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'Georgia, serif' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
          Premium chapter (requires coins/stars to unlock)
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#e67e22',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Publishing...' : 'PUBLISH CHAPTER'}
        </button>
      </form>
    </div>
  );
};
