#!/bin/bash
set -e

cd /workspace

# ローカル開発用 .env（Cloud 用 frontend/.env.example ではなくルートの .env.example を使う）
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi
if [ ! -f frontend/.env ]; then
  if [ -f .env.example ]; then
    cp .env.example frontend/.env
  elif [ -f frontend/.env.example ]; then
    cp frontend/.env.example frontend/.env
  fi
fi

# ホスト Docker 上の Supabase を起動（devcontainer は docker.sock をマウント）
if ! curl -sf http://host.docker.internal:54321/rest/v1/ >/dev/null 2>&1; then
  echo "Starting Supabase on host Docker..."
  npx supabase start --ignore-health-check
fi

# anon key を frontend/.env に同期
if [ -f frontend/.env ]; then
  ANON_KEY=$(npx supabase status -o env 2>/dev/null | grep '^ANON_KEY=' | cut -d= -f2- | tr -d '"')
  if [ -n "$ANON_KEY" ]; then
    sed -i "s|^VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$ANON_KEY|" frontend/.env
  fi
fi

echo ""
echo "Dev Container ready."
echo "  Run: npm run dev --prefix frontend"
echo "  App:    http://localhost:5173"
echo "  API:    http://localhost:54321"
echo "  Studio: http://localhost:54323"
echo ""
