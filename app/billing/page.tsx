'use client';

import { useEffect, useState } from 'react';
import { DraftwellFintech } from '@/components/DraftwellFintech';
import { ensureAnonymousUser } from '@/lib/firebase';

export default function BillingPage() {
  const [userId, setUserId] = useState('');
  useEffect(() => {
    ensureAnonymousUser().then((u) => setUserId(u.uid));
  }, []);
  if (!userId) return <p style={{ padding: 24 }}>Loading wallet session…</p>;
  return <DraftwellFintech userId={userId} />;
}
