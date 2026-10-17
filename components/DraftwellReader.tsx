'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ChapterPayload {
  id: number;
  chapter_number: number;
  title: string;
  content: string;
  is_premium: boolean;
  coin_cost: number;
  star_cost: number;
}

interface DraftwellReaderProps {
  novelId: string;
  chapterNum: number;
  userId: string;
}

export const DraftwellReader: React.FC<DraftwellReaderProps> = ({ novelId, chapterNum, userId }) => {
  const [chapter, setChapter] = useState<ChapterPayload | null>(null);
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [themeMode, setThemeMode] = useState<'sepia' | 'dark' | 'light'>('sepia');
  const [activeBookmark, setActiveBookmark] = useState<number>(0);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userStars, setUserStars] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchContentAndAccessState = useCallback(async () => {
    setLoading(true);

    const { data: chapData, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)
      .eq('chapter_number', chapterNum)
      .single();

    if (error || !chapData) {
      setLoading(false);
      return;
    }
    setChapter(chapData as ChapterPayload);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('coins_held, star_balance')
      .eq('id', userId)
      .single();

    if (profile) {
      setUserCoins(profile.coins_held ?? 0);
      setUserStars(profile.star_balance ?? 0);
    }

    const { data: shelf } = await supabase
      .from('user_bookshelves')
      .select('bookmarked_paragraph_index')
      .eq('user_id', userId)
      .eq('novel_id', novelId)
      .single();

    if (shelf) {
      setActiveBookmark(shelf.bookmarked_paragraph_index ?? 0);
    }

    if (!chapData.is_premium) {
      setUnlocked(true);
    } else {
      const { data: unlockRow } = await supabase
        .from('chapter_unlocks')
        .select('id')
        .eq('user_id', userId)
        .eq('chapter_id', chapData.id)
        .maybeSingle();

      const { data: starUnlock } = await supabase
        .from('chapter_star_unlocks')
        .select('id')
        .eq('user_id', userId)
        .eq('chapter_id', chapData.id)
        .maybeSingle();

      setUnlocked(!!unlockRow || !!starUnlock);
    }

    setLoading(false);
  }, [novelId, chapterNum, userId]);

  useEffect(() => {
    if (userId) {
      fetchContentAndAccessState();
    }
  }, [userId, fetchContentAndAccessState]);

  const processPremiumGateUnlock = async () => {
    if (!chapter) return;

    if (userCoins < chapter.coin_cost) {
      alert('Insufficient Balance: Top up your coin balance in your Profile Settings to continue reading.');
      return;
    }

    const updatedCoins = userCoins - chapter.coin_cost;

    const { error: profileErr } = await supabase
      .from('user_profiles')
      .update({ coins_held: updatedCoins })
      .eq('id', userId);

    if (profileErr) {
      alert('Failed to update balance. Please try again.');
      return;
    }

    const { error: unlockErr } = await supabase
      .from('chapter_unlocks')
      .insert([{ user_id: userId, chapter_id: chapter.id }]);

    if (!unlockErr) {
      setUserCoins(updatedCoins);
      setUnlocked(true);

      await supabase.from('user_bookshelves').upsert(
        {
          user_id: userId,
          novel_id: parseInt(novelId, 10),
          last_read_chapter_number: chapterNum
        },
        { onConflict: 'user_id,novel_id' }
      );
    }
  };

  const processStarUnlock = async () => {
    if (!chapter) return;

    if (userStars < chapter.star_cost) {
      alert('Insufficient Stars. Purchase Stars from the Premium Terminal.');
      return;
    }

    const updatedStars = userStars - chapter.star_cost;

    const { error: profileErr } = await supabase
      .from('user_profiles')
      .update({ star_balance: updatedStars })
      .eq('id', userId);

    if (profileErr) return;

    const { error: unlockErr } = await supabase
      .from('chapter_star_unlocks')
      .insert([{ user_id: userId, chapter_id: chapter.id, stars_spent: chapter.star_cost }]);

    if (!unlockErr) {
      setUserStars(updatedStars);
      setUnlocked(true);

      await supabase.from('user_bookshelves').upsert(
        {
          user_id: userId,
          novel_id: parseInt(novelId, 10),
          last_read_chapter_number: chapterNum
        },
        { onConflict: 'user_id,novel_id' }
      );
    }
  };

  const saveLiveParagraphBookmark = async (paraIdx: number) => {
    setActiveBookmark(paraIdx);
    await supabase.from('user_bookshelves').upsert(
      {
        user_id: userId,
        novel_id: parseInt(novelId, 10),
        last_read_chapter_number: chapterNum,
        bookmarked_paragraph_index: paraIdx
      },
      { onConflict: 'user_id,novel_id' }
    );
  };

  const computeThemeStyles = () => {
    if (themeMode === 'dark') return { canvas: '#121214', text: '#e1e1e6', utility: '#202024' };
    if (themeMode === 'light') return { canvas: '#ffffff', text: '#121214', utility: '#f0f0f5' };
    return { canvas: '#f9f3e6', text: '#443322', utility: '#ede4cf' };
  };

  const viewColors = computeThemeStyles();

  if (loading || !chapter) {
    return (
      <div style={{ color: '#888', padding: '30px', fontFamily: 'sans-serif' }}>
        Assembling narrative context layers...
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: viewColors.canvas,
        color: viewColors.text,
        minHeight: '100vh',
        fontFamily: 'Georgia, serif',
        transition: 'background-color 0.2s'
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: viewColors.utility,
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          fontFamily: 'sans-serif',
          zIndex: 10
        }}
      >
        <h4 style={{ margin: 0 }}>Draftwell / Ch. {chapter.chapter_number}</h4>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#e67e22' }}>
            🪙 {userCoins} Coins
          </span>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#7000FF' }}>
            ⭐ {userStars} Stars
          </span>
          <button
            onClick={() => setFontSize((s) => Math.max(14, s - 2))}
            style={{ width: '30px', height: '30px' }}
            type="button"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize((s) => Math.min(26, s + 2))}
            style={{ width: '30px', height: '30px' }}
            type="button"
          >
            A+
          </button>
          <select
            value={themeMode}
            onChange={(e) => setThemeMode(e.target.value as 'sepia' | 'dark' | 'light')}
            style={{ padding: '4px' }}
          >
            <option value="sepia">Sepia Canvas</option>
            <option value="light">Day Reading</option>
            <option value="dark">Midnight Night</option>
          </select>
        </div>
      </div>

      <div
        style={{
          maxWidth: '660px',
          margin: '0 auto',
          padding: '40px 20px',
          fontSize: `${fontSize}px`,
          lineHeight: '1.9'
        }}
      >
        <h2 style={{ marginBottom: '24px', fontFamily: 'Georgia, serif' }}>{chapter.title}</h2>

        {unlocked ? (
          <div>
            {chapter.content.split('\n').map((para, index) => (
              <p
                key={index}
                onClick={() => saveLiveParagraphBookmark(index)}
                style={{
                  marginBottom: '26px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  backgroundColor: activeBookmark === index ? 'rgba(230,126,34,0.1)' : 'transparent',
                  borderLeft: activeBookmark === index ? '3px solid #e67e22' : 'none'
                }}
                title="Click to bookmark this exact reading spot"
              >
                {para}
              </p>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              border: '1px dashed rgba(0,0,0,0.15)',
              borderRadius: '8px',
              background: viewColors.utility,
              marginTop: '40px',
              fontFamily: 'sans-serif'
            }}
          >
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>🔒</div>
            <h3>Premium Chapter Gate</h3>
            <p style={{ color: '#777', fontSize: '15px', marginBottom: '24px' }}>
              Support creators on Draftwell by unlocking this chapter with virtual coin or star allocations.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={processPremiumGateUnlock}
                style={{
                  backgroundColor: '#e67e22',
                  color: '#fff',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(230,126,34,0.3)'
                }}
                type="button"
              >
                UNLOCK FOR {chapter.coin_cost} COINS
              </button>
              <button
                onClick={processStarUnlock}
                style={{
                  backgroundColor: '#7000FF',
                  color: '#fff',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(112,0,255,0.3)'
                }}
                type="button"
              >
                UNLOCK FOR {chapter.star_cost} STARS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
