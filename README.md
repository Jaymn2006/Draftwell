# 📚 Draftwell: Multi-Page Interactive Serialization Infrastructure

Draftwell is an optimized multi-page **Online Novel Publishing Framework** engineered with **TypeScript / Next.js** on the frontend, **Supabase PostgreSQL** for the relational layer, a **C# ASP.NET Core** billing gateway, and a **C++** paragraph-indexing native module.

## Architecture

| Layer | Technology | Role |
|-------|------------|------|
| Frontend | Next.js 14 (App Router) + TypeScript | Library, infinite-scroll reader canvas, author console, Star terminal |
| Database | Supabase (PostgreSQL) | Novels, chapters, bookshelves, paragraph bookmarks, Stars ledger, payment audit |
| Billing API | C# / .NET 8 (`backend/csharp`) | Server-side payment verification, 60/40 revenue split, Solana + M-Pesa + Fonbnk |
| Native | C++17 (`backend/cpp`) | High-performance paragraph offset indexer for stable cross-device bookmarks |
| Hosting | Vercel (frontend) + any host for C# (Railway, Azure, local) | Hobby-tier compatible |

## Core Features

- **Sticky paragraph bookmarks** — click any paragraph; position is upserted to `user_bookshelves.bookmarked_paragraph_index`
- **Premium gating** — coins or Stars unlock; no mock data
- **Author console** — publish novels + chapters with optional premium flags
- **Hybrid payments** — 1 Star = $0.10 USD; 60% author / 40% platform; Solana treasury `EDZjEbRAtqyC8z6ta6PYHX161Xynt13tWpd7orKERkbz`; M-Pesa `+254793760799`
- **Zero-mock mandate** — all reads/writes go through live Supabase queries or the C# gateway

## Quick Start

```bash
chmod +x scripts/setup_dev.sh
./scripts/setup_dev.sh
```

1. Create a Supabase project and enable Anonymous + Email auth.
2. Run `supabase/draftwell_engine.sql` in the SQL Editor.
3. Copy `.env.example` → `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Frontend: `npm run dev` → http://localhost:3000
5. (Optional) C# billing:  
   `cd backend/csharp/Draftwell.Billing && dotnet run`  
   Then set `BILLING_BACKEND_URL=http://localhost:5080` in `.env.local`.

## Routes

| Path | Description |
|------|-------------|
| `/` | Public novel library |
| `/read/[novelId]/[chapterNum]` | Immersive reader canvas |
| `/author` | Creator upload console |
| `/billing` | Star top-up terminal |
| `/api/billing/verify` | Next.js proxy → C# backend (or local verification) |

## C# Backend

Secure payment verification lives in `backend/csharp/Draftwell.Billing`.  
Private keys and RPC calls never leave the server. The Next.js route prefers the C# service when `BILLING_BACKEND_URL` is set.

## C++ Module

Build with CMake:

```bash
cd backend/cpp && mkdir build && cd build
cmake .. && cmake --build . --config Release
```

Produces a static library and a shared library (`draftwell_paragraph`) callable via P/Invoke from C# if needed for bulk content indexing.

## Revenue Split

Enforced exclusively on the server (C# or Next.js service role):

- 60% of Stars → `author_earnings.total_stars_earned`
- 40% → platform treasury accounting

Frontend never holds private keys or split logic.

---

Maintained as the Draftwell open-source serialization network.
