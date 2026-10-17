import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyACk9h3rI2i3NuVS0zvs1KqMJdy3h_IKrw',
  authDomain: 'gen-lang-client-0285271751.firebaseapp.com',
  projectId: 'gen-lang-client-0285271751',
  storageBucket: 'gen-lang-client-0285271751.firebasestorage.app',
  messagingSenderId: '631033994376',
  appId: '1:631033994376:web:4cb41d1eea97c01e2a933d'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export type Novel = {
  id: string;
  title: string;
  author_name: string;
  synopsis?: string;
  cover_image_url?: string;
  genre: string;
  status: string;
  creator_id: string;
  created_at?: unknown;
};

export type Chapter = {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_premium: boolean;
  coin_cost: number;
  star_cost: number;
};

export type UserProfile = {
  id: string;
  username: string;
  coins_held: number;
  star_balance: number;
};

export async function ensureAnonymousUser(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  const uid = cred.user.uid;
  const ref = doc(db, 'user_profiles', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      username: `reader_${uid.slice(0, 6)}`,
      coins_held: 100,
      star_balance: 0,
      created_at: serverTimestamp()
    });
  }
  return cred.user;
}

export function watchAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function listNovels(max = 48): Promise<Novel[]> {
  const q = query(collection(db, 'novels'), orderBy('created_at', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Novel[];
}

export async function createNovel(input: {
  creator_id: string;
  title: string;
  author_name: string;
  synopsis: string;
  genre: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'novels'), {
    ...input,
    cover_image_url:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    status: 'ONGOING',
    created_at: serverTimestamp()
  });
  return ref.id;
}

export async function createChapter(input: {
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_premium: boolean;
  coin_cost: number;
  star_cost: number;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'chapters'), {
    ...input,
    created_at: serverTimestamp()
  });
  return ref.id;
}

export async function getChapter(novelId: string, chapterNum: number): Promise<Chapter | null> {
  const q = query(
    collection(db, 'chapters'),
    where('novel_id', '==', novelId),
    where('chapter_number', '==', chapterNum),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as DocumentData) } as Chapter;
}

export async function nextChapterNumber(novelId: string): Promise<number> {
  const q = query(
    collection(db, 'chapters'),
    where('novel_id', '==', novelId),
    orderBy('chapter_number', 'desc'),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return 1;
  return (snap.docs[0].data().chapter_number as number) + 1;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'user_profiles', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as DocumentData) } as UserProfile;
}

export async function updateBalances(uid: string, coins?: number, stars?: number) {
  const payload: Record<string, number> = {};
  if (typeof coins === 'number') payload.coins_held = coins;
  if (typeof stars === 'number') payload.star_balance = stars;
  await updateDoc(doc(db, 'user_profiles', uid), payload);
}

export async function isUnlocked(uid: string, chapterId: string): Promise<boolean> {
  const coin = await getDoc(doc(db, 'chapter_unlocks', `${uid}_${chapterId}`));
  if (coin.exists()) return true;
  const star = await getDoc(doc(db, 'chapter_star_unlocks', `${uid}_${chapterId}`));
  return star.exists();
}

export async function unlockWithCoins(uid: string, chapterId: string, cost: number, novelId: string, chapterNum: number) {
  const profile = await getProfile(uid);
  if (!profile || profile.coins_held < cost) throw new Error('Insufficient coins');
  await updateBalances(uid, profile.coins_held - cost);
  await setDoc(doc(db, 'chapter_unlocks', `${uid}_${chapterId}`), {
    user_id: uid,
    chapter_id: chapterId,
    unlocked_at: serverTimestamp()
  });
  await setDoc(
    doc(db, 'user_bookshelves', `${uid}_${novelId}`),
    {
      user_id: uid,
      novel_id: novelId,
      last_read_chapter_number: chapterNum,
      updated_at: serverTimestamp()
    },
    { merge: true }
  );
}

export async function unlockWithStars(uid: string, chapterId: string, cost: number, novelId: string, chapterNum: number) {
  const profile = await getProfile(uid);
  if (!profile || profile.star_balance < cost) throw new Error('Insufficient stars');
  await updateBalances(uid, undefined, profile.star_balance - cost);
  await setDoc(doc(db, 'chapter_star_unlocks', `${uid}_${chapterId}`), {
    user_id: uid,
    chapter_id: chapterId,
    stars_spent: cost,
    unlocked_at: serverTimestamp()
  });
  await setDoc(
    doc(db, 'user_bookshelves', `${uid}_${novelId}`),
    {
      user_id: uid,
      novel_id: novelId,
      last_read_chapter_number: chapterNum,
      updated_at: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getBookmark(uid: string, novelId: string): Promise<number> {
  const snap = await getDoc(doc(db, 'user_bookshelves', `${uid}_${novelId}`));
  if (!snap.exists()) return 0;
  return (snap.data().bookmarked_paragraph_index as number) || 0;
}

export async function saveBookmark(uid: string, novelId: string, chapterNum: number, paraIdx: number) {
  await setDoc(
    doc(db, 'user_bookshelves', `${uid}_${novelId}`),
    {
      user_id: uid,
      novel_id: novelId,
      last_read_chapter_number: chapterNum,
      bookmarked_paragraph_index: paraIdx,
      updated_at: serverTimestamp()
    },
    { merge: true }
  );
}

export async function creditStars(uid: string, stars: number, method: string, txRef: string, usd: number) {
  const profile = await getProfile(uid);
  const current = profile?.star_balance ?? 0;
  await setDoc(
    doc(db, 'user_profiles', uid),
    {
      username: profile?.username || `reader_${uid.slice(0, 6)}`,
      coins_held: profile?.coins_held ?? 100,
      star_balance: current + stars
    },
    { merge: true }
  );
  await setDoc(doc(db, 'payment_intents', txRef), {
    user_id: uid,
    payment_method: method,
    transaction_reference: txRef,
    fiat_amount_usd: usd,
    stars_credited: stars,
    status: 'COMPLETED',
    created_at: serverTimestamp()
  });
}
