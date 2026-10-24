'use client';

import { useParams } from 'next/navigation';
import { DraftwellReader } from '@/components/DraftwellReader';

export default function ReadPage() {
  const params = useParams();
  const novelId = String(params.novelId || '');
  const chapterNum = parseInt(String(params.chapterNum || '1'), 10) || 1;
  return <DraftwellReader novelId={novelId} chapterNum={chapterNum} />;
}
