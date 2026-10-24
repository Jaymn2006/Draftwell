# Draftwell

Your Voice in Print — a novel studio with sample books, author workshop, and reader.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Data:** Firebase Auth (anonymous) + Cloud Firestore
- **Samples:** Local sample books with matching covers and long chapters to welcome new readers

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Sample Books

The library includes family-friendly sample adventures (Enchanted Forest Quest, Captain Comet, Time-Traveling Inventors Club) with covers that match their titles and authors, plus long sample chapters. These load instantly so visitors can start reading right away.

## Author Studio

Visit `/author` to write new novels, preview covers, edit chapters, and publish. Content syncs to Firebase when configured.

## Deploy to Vercel (recommended)

GitHub Pages support has been removed. Deploy to Vercel for the best experience:

1. Import `Jaymn2006/Draftwell` at https://vercel.com/new
2. Framework preset: Next.js
3. Deploy — no environment variables required for core functionality

## Firebase setup (optional, for user-created books)

1. Enable Anonymous sign-in
2. Publish rules from `firestore.rules`
3. Create indexes as prompted

Config is embedded in `lib/firebase.ts`.

## Routes

| Path | Purpose |
|------|--------|
| `/` | Library (samples + user books) |
| `/author` | Author Studio — write, edit, cover preview, publish |
| `/read/[novelId]/[chapterNum]` | Reader (supports samples and Firebase books) |
| `/billing` | Star top-up |

All sample stories are wholesome adventure and friendship tales.
