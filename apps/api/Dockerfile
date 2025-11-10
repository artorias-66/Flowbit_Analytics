FROM node:20-bookworm-slim AS base

WORKDIR /app

# Install OS deps (openssl for Prisma engines)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Copy root and workspace manifests
COPY package.json package-lock.json tsconfig.json turbo.json ./
COPY apps/api/package.json ./apps/api/package.json

# Install dependencies at root (handles workspaces)
RUN npm ci

# Copy Prisma schema and generate client (Postgres)
COPY apps/api/prisma ./apps/api/prisma
WORKDIR /app/apps/api
ENV PRISMA_SCHEMA_PATH=prisma/schema.postgres.prisma
RUN npx prisma generate --schema=$PRISMA_SCHEMA_PATH

# Copy source and build
COPY apps/api/tsconfig.json ./tsconfig.json
COPY apps/api/src ./src
RUN npm run build

# Runtime image
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and dependencies from builder
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/prisma ./prisma
COPY --from=base /app/apps/api/package.json ./package.json

# Port
EXPOSE 3001

# Start: create/update schema then start server
ENV PRISMA_SCHEMA_PATH=prisma/schema.postgres.prisma
CMD ["sh", "-lc", "npx prisma db push --schema=$PRISMA_SCHEMA_PATH && node dist/index.js"]
