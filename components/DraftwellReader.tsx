'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ensureAnonymousUser,
  getChapter,
  getProfile,
  getBookmark,
  isUnlocked,
  unlockWithCoins,
  unlockWithStars,
  saveBookmark,
  type Chapter
} from '@/lib/firebase';
import { getSampleChapter } from '@/lib/sampleBooks';

interface DraftwellReaderProps {
  novelId: string;
  chapterNum: number;
}

export const DraftwellReader: React.FC<DraftwellReaderProps> = ({ novelId, chapterNum }) => {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [themeMode, setThemeMode] = useState<'sepia' | 'dark' | 'light'>('sepia');
  const [activeBookmark, setActiveBookmark] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [userStars, setUserStars] = useState(0);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchContentAndAccessState = useCallback(async () => {
    setLoading(true);
    try {
      const user = await ensureAnonymousUser();
      setUserId(user.uid);

      if (novelId.startsWith('sample-')) {
        const sampleChap = getSampleChapter(novelId, chapterNum);
        if (sampleChap) {
          setChapter({
            id: `${novelId}-${chapterNum}`,
            novel_id: novelId,
            chapter_number: sampleChap.chapter_number,
            title: sampleChap.title,
            content: sampleChap.content,
            is_premium: false,
            coin_cost: 0,
            star_cost: 0,
          });
          setUnlocked(true);
          setLoading(false);
          return;
        }
      }

      const chapData = await getChapter(novelId, chapterNum);
      if (!chapData) {
        setChapter(null);
        setLoading(false);
        return;
      }
      setChapter(chapData);
      const profile = await getProfile(user.uid);
      if (profile) {
        setUserCoins(profile.coins_held ?? 0);
        setUserStars(profile.star_balance ?? 0);
      }
      setActiveBookmark(await getBookmark(user.uid, novelId));
      if (!chapData.is_premium) setUnlocked(true);
      else setUnlocked(await isUnlocked(user.uid, chapData.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [novelId, chapterNum]);

  useEffect(() => {
    fetchContentAndAccessState();
  }, [fetchContentAndAccessState]);

  const processPremiumGateUnlock = async () => {
    if (!chapter || !userId || novelId.startsWith('sample-')) return;
    try {
      await unlockWithCoins(userId, chapter.id, chapter.coin_cost, novelId, chapterNum);
      setUserCoins((c) => c - chapter.coin_cost);
      setUnlocked(true);
    } catch {
      alert('Insufficient Balance: Top up coins or stars from the Star Terminal.');
    }
  };

  const processStarUnlock = async () => {
    if (!chapter || !userId || novelId.startsWith('sample-')) return;
    try {
      await unlockWithStars(userId, chapter.id, chapter.star_cost, novelId, chapterNum);
      setUserStars((s) => s - chapter.star_cost);
      setUnlocked(true);
    } catch {
      alert('Insufficient Stars. Purchase Stars from the Premium Terminal.');
    }
  };

  const saveLiveParagraphBookmark = async (paraIdx: number) => {
    if (!userId || novelId.startsWith('sample-')) return;
    setActiveBookmark(paraIdx);
    await saveBookmark(userId, novelId, chapterNum, paraIdx);
  };

  const computeThemeStyles = () => {
    if (themeMode === 'dark') return { canvas: '#121214', text: '#e1e1e6', utility: '#202024' };
    if (themeMode === 'light') return { canvas: '#ffffff', text: '#121214', utility: '#f0f0f5' };
    return { canvas: '#f9f3e6', text: '#443322', utility: '#ede4cf' };
  };
  const viewColors = computeThemeStyles();

  if (loading) {
    return <div style={{ color: '#888', padding: '30px', fontFamily: 'sans-serif' }}>Assembling narrative context layers...</div>;
  }
  if (!chapter) {
    return <div style={{ color: '#888', padding: '30px', fontFamily: 'sans-serif' }}>Chapter not found. Publish content from the Author Studio or try a sample book.</div>;
  }

  return (
    <div style={{ backgroundColor: viewColors.canvas, color: viewColors.text, minHeight: '100vh', fontFamily: 'Georgia, serif', transition: 'background-color 0.2s' }}>
      <div style={{ position: 'sticky', top: 0, backgroundColor: viewColors.utility, padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', fontFamily: 'sans-serif', zIndex: 10 }}>
        <h4 style={{ margin: 0 }}>Draftwell / Ch. {chapter.chapter_number}</h4>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#e67e22' }}>🪙 {userCoins} Coins</span>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#7000FF' }}>⭐ {userStars} Stars</span>
          <button onClick={() => setFontSize((s) => Math.max(14, s - 2))} style={{ width: '30px', height: '30px' }} type="button">A-</button>
          <button onClick={() => setFontSize((s) => Math.min(26, s + 2))} style={{ width: '30px', height: '30px' }} type="button">A+</button>
          <select value={themeMode} onChange={(e) => setThemeMode(e.target.value as 'sepia' | 'dark' | 'light')} style={{ padding: '4px' }}>
            <option value="sepia">Sepia Canvas</option>
            <option value="light">Day Reading</option>
            <option value="dark">Midnight Night</option>
          </select>
        </div>
      </div>
      <div style={{ maxWidth: '660px', margin: '0 auto', padding: '40px 20px', fontSize: `${fontSize}px`, lineHeight: '1.9' }}>
        <h2 style={{ marginBottom: '24px', fontFamily: 'Georgia, serif' }}>{chapter.title}</h2>
        {unlocked ? (
          <div>
            {chapter.content.split('\n').map((para, index) => (
              <p key={index} onClick={() => saveLiveParagraphBookmark(index)} style={{ marginBottom: '26px', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: activeBookmark === index ? 'rgba(230,126,34,0.1)' : 'transparent', borderLeft: activeBookmark === index ? '3px solid #e67e22' : 'none' }} title="Click to bookmark this exact reading spot">
                {para}
              </p>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed rgba(0,0,0,0.15)', borderRadius: '8px', background: viewColors.utility, marginTop: '40px', fontFamily: 'sans-serif' }}>
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>🔒</div>
            <h3>Premium Chapter Gate</h3>
            <p style={{ color: '#777', fontSize: '15px', marginBottom: '24px' }}>Support creators on Draftwell by unlocking this chapter with coins or stars.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={processPremiumGateUnlock} style={{ backgroundColor: '#e67e22', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 'bold', padding: '12px 28px', borderRadius: '30px', cursor: 'pointer' }} type="button">UNLOCK FOR {chapter.coin_cost} COINS</button>
              <button onClick={processStarUnlock} style={{ backgroundColor: '#7000FF', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 'bold', padding: '12px 28px', borderRadius: '30px', cursor: 'pointer' }} type="button">UNLOCK FOR {chapter.star_cost} STARS</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
