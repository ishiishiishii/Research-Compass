#!/bin/bash
set -e

if [ ! -f frontend/.env ] && [ -f frontend/.env.example ]; then
  cp frontend/.env.example frontend/.env
fi

if ! curl -sf http://host.docker.internal:54321/rest/v1/ >/dev/null 2>&1; then
  echo "Starting Supabase (host Docker)..."
  npx supabase start --ignore-health-check || true
fi
