'use client';

import { useEffect, useState } from 'react';
import { DraftwellFintech } from '@/components/DraftwellFintech';
import { supabase } from '@/lib/supabase';

export default function BillingPage() {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    async function resolve() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        const guest = localStorage.getItem('draftwell_guest_id') || crypto.randomUUID();
        localStorage.setItem('draftwell_guest_id', guest);
        setUserId(guest);
      }
    }
    resolve();
  }, []);

  if (!userId) {
    return <div style={{ padding: '40px' }}>Preparing billing terminal...</div>;
  }

  return <DraftwellFintech userId={userId} />;
}
