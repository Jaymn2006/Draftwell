'use client';

import React, { useState, useEffect } from 'react';
import { ensureAnonymousUser, createNovel, createChapter, nextChapterNumber } from '@/lib/firebase';

export const DraftwellAuthor: React.FC = () => {
  const [creatorId, setCreatorId] = useState('');
  const [title, setTitle] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [novelId, setNovelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureAnonymousUser().then((u) => setCreatorId(u.uid));
  }, []);

  const executePublishSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pseudonym.trim()) {
      setFeedback('Validation Alert: Provide clear title and author name specifications.');
      return;
    }
    if (!creatorId) {
      setFeedback('Auth not ready — refresh and try again.');
      return;
    }
    setLoading(true);
    setFeedback('');
    try {
      const id = await createNovel({
        creator_id: creatorId,
        title: title.trim(),
        author_name: pseudonym.trim(),
        synopsis: synopsis.trim(),
        genre
      });
      setNovelId(id);
      setFeedback(`Success: "${title}" is live on Draftwell. Novel ID: ${id}`);
      setTitle('');
      setPseudonym('');
      setSynopsis('');
    } catch (err: unknown) {
      setFeedback(`Deployment Failure: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const publishChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novelId || !chapterTitle.trim() || !chapterContent.trim()) {
      setFeedback('Provide a published novel ID, chapter title, and content.');
      return;
    }
    setLoading(true);
    try {
      const nextNumber = await nextChapterNumber(novelId);
      await createChapter({
        novel_id: novelId,
        chapter_number: nextNumber,
        title: chapterTitle.trim(),
        content: chapterContent.trim(),
        is_premium: isPremium,
        coin_cost: isPremium ? 10 : 0,
        star_cost: isPremium ? 1 : 0
      });
      setFeedback(`Chapter ${nextNumber} "${chapterTitle}" published successfully.`);
      setChapterTitle('');
      setChapterContent('');
      setIsPremium(false);
    } catch (err: unknown) {
      setFeedback(`Chapter publish failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '24px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'system-ui, sans-serif', color: '#111' }}>
      <h3 style={{ margin: '0 0 6px 0', color: '#111827' }}>✍️ Draftwell Creative Workshop</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px 0' }}>
        Launch original books and deploy premium serialized manuscripts to the global registry (Firebase).
      </p>
      {feedback && (
        <div style={{ background: feedback.startsWith('Success') || feedback.includes('published') ? '#f0fdf4' : '#fef2f2', color: feedback.startsWith('Success') || feedback.includes('published') ? '#166534' : '#991b1b', padding: '10px', borderRadius: '4px', marginBottom: '14px', fontSize: '14px', fontWeight: 'bold' }}>
          {feedback}
        </div>
      )}
      <form onSubmit={executePublishSeries} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <h4 style={{ margin: 0 }}>1. Create New Novel Series</h4>
        <input type="text" placeholder="Novel Series Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="Pen Name / Pseudonym" value={pseudonym} onChange={(e) => setPseudonym(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <textarea placeholder="Write your book's primary promotional summary hook..." value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={4} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="Fantasy">Fantasy</option>
          <option value="Romance">Romance</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Mystery">Mystery</option>
          <option value="Literary">Literary</option>
          <option value="Horror">Horror</option>
        </select>
        <button type="submit" disabled={loading} style={{ backgroundColor: '#111827', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Publishing...' : 'LAUNCH NOVEL TRACK'}
        </button>
      </form>
      <form onSubmit={publishChapter} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ margin: 0 }}>2. Publish Chapter (use Novel ID from above)</h4>
        <input type="text" placeholder="Novel ID" value={novelId ?? ''} onChange={(e) => setNovelId(e.target.value || null)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="Chapter Title" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <textarea placeholder="Paste or write the full chapter content..." value={chapterContent} onChange={(e) => setChapterContent(e.target.value)} rows={10} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'Georgia, serif' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
          Premium chapter (requires coins/stars to unlock)
        </label>
        <button type="submit" disabled={loading} style={{ backgroundColor: '#e67e22', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Publishing...' : 'PUBLISH CHAPTER'}
        </button>
      </form>
    </div>
  );
};
