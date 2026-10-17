'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DraftwellReader } from '@/components/DraftwellReader';
import { supabase } from '@/lib/supabase';

export default function ReaderPage() {
  const params = useParams();
  const novelId = String(params.novelId || '');
  const chapterNum = parseInt(String(params.chapterNum || '1'), 10);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    async function resolveUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        const guest = localStorage.getItem('draftwell_guest_id') || crypto.randomUUID();
        localStorage.setItem('draftwell_guest_id', guest);
        setUserId(guest);
      }
    }
    resolveUser();
  }, []);

  if (!userId) {
    return <div style={{ padding: '40px' }}>Preparing reader session...</div>;
  }

  return <DraftwellReader novelId={novelId} chapterNum={chapterNum} userId={userId} />;
}
