FROM mcr.microsoft.com/devcontainers/javascript-node:22

RUN npm install -g supabase@2.102.0 \
    && apt-get update \
    && apt-get install -y --no-install-recommends docker.io \
    && rm -rf /var/lib/apt/lists/*
