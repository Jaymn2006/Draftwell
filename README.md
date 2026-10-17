# Draftwell

Multi-page novel network: infinite-scroll reader, paragraph bookmarks, author console, Star billing.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Data:** Firebase Auth (anonymous) + Cloud Firestore
- **Optional backends:** C# billing verifier, C++ paragraph indexer under `backend/`

Supabase has been removed. No Supabase env vars are required.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Firebase setup (one-time)

1. Firebase Console → Authentication → enable **Anonymous** sign-in
2. Firestore → publish rules from `firestore.rules`
3. Create composite indexes when the console prompts (chapters by novel_id + chapter_number)

Config is embedded in `lib/firebase.ts` from the existing project `gen-lang-client-0285271751`.

## Deploy to Vercel

1. https://vercel.com/new → Import `Jaymn2006/Draftwell`
2. Framework: Next.js
3. Deploy (no env vars required for core app)

## Routes

| Path | Purpose |
|------|--------|
| `/` | Library |
| `/author` | Publish novels & chapters |
| `/read/[novelId]/[chapterNum]` | Reader canvas + bookmarks |
| `/billing` | Star top-up (M-Pesa / Solana / Fonbnk) |
| `/api/billing/verify` | Payment verification |

## Billing

- 1 Star = $0.10 USD
- 60% author / 40% platform on unlocks
- Treasury (Solana): `EDZjEbRAtqyC8z6ta6PYHX161Xynt13tWpd7orKERkbz`
- M-Pesa line: `+254793760799`
