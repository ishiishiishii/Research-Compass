#!/bin/bash
set -euo pipefail

cd /workspace

echo "==> Research Compass: starting Supabase local stack (Auth + DB + API + Studio)..."

if supabase status 2>/dev/null | grep -q "API URL"; then
  echo "    Supabase is already running."
else
  supabase start
fi

echo "==> Applying DB migrations..."
supabase db reset --yes

echo ""
echo "==> Supabase is ready!"
supabase status
echo ""

# Keep container alive so compose healthcheck and depends_on work
while true; do
  sleep 3600
done
