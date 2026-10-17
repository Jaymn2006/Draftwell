#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}====================================================${NC}"
echo -e "  DRAFTWELL RETENTION PLATFORM INITIALIZER"
echo -e "${CYAN}====================================================${NC}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo -e "${GREEN}[1/4] Verifying workspace...${NC}"
if [ ! -f package.json ]; then
  echo "package.json missing — aborting."
  exit 1
fi

echo -e "${GREEN}[2/4] Installing frontend dependencies...${NC}"
npm install

echo -e "${GREEN}[3/4] Building C++ paragraph indexer (optional)...${NC}"
if command -v cmake >/dev/null 2>&1; then
  mkdir -p backend/cpp/build
  (cd backend/cpp/build && cmake .. && cmake --build . --config Release) || true
else
  echo "  cmake not found — skipping native module (reader still works)."
fi

echo -e "${GREEN}[4/4] C# backend restore (optional)...${NC}"
if command -v dotnet >/dev/null 2>&1; then
  (cd backend/csharp/Draftwell.Billing && dotnet restore) || true
else
  echo "  dotnet SDK not found — Next.js billing route will handle verification locally."
fi

echo -e "${CYAN}>>> Draftwell modules ready.${NC}"
echo "  Frontend:  npm run dev"
echo "  C# API:    cd backend/csharp/Draftwell.Billing && dotnet run"
echo "  SQL:       paste supabase/draftwell_engine.sql into Supabase SQL Editor"
echo "  Env:       copy .env.example to .env.local and fill keys"
