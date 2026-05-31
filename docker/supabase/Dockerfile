FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl bash docker.io \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

RUN npm install -g supabase@2.102.0

COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

HEALTHCHECK --interval=15s --timeout=5s --start-period=180s --retries=20 \
  CMD curl -sf http://host.docker.internal:54321/rest/v1/ -o /dev/null || exit 1

ENTRYPOINT ["/entrypoint.sh"]
