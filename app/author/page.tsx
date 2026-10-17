'use client';

import { useEffect, useState } from 'react';
import { DraftwellAuthor } from '@/components/DraftwellAuthor';
import { supabase } from '@/lib/supabase';

export default function AuthorPage() {
  const [userId, setUserId] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function resolve() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await supabase.from('user_profiles').update({ is_creator: true }).eq('id', user.id);
      }
      setReady(true);
    }
    resolve();
  }, []);

  if (!ready) {
    return <div style={{ padding: '40px' }}>Loading author workspace...</div>;
  }

  if (!userId) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '24px', textAlign: 'center' }}>
        <h2>Author Console requires sign-in</h2>
        <p style={{ color: '#6b7280' }}>
          Authenticate with Supabase (email magic link or OAuth) so your creator_id is bound to published works.
        </p>
      </div>
    );
  }

  return <DraftwellAuthor creatorId={userId} />;
}
