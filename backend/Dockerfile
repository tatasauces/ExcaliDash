# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN DATABASE_URL="file:./dummy.db" npx prisma generate

# Copy source code
COPY src ./src

# Build TypeScript
RUN npx tsc

# Production stage
FROM node:20-slim

# Install OpenSSL for Prisma and gosu, create non-root user
RUN apt-get update && \
    apt-get install -y openssl gosu && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/sh nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy prisma schema and migrations for runtime and hydration template
COPY prisma ./prisma/
COPY prisma ./prisma_template/

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy the generated Prisma Client from builder to maintain the same structure
COPY --from=builder /app/src/generated ./dist/generated

# Generate Prisma Client in production (updates node_modules)
RUN DATABASE_URL="file:./dummy.db" npx prisma generate

# Create necessary directories (ownership will be set in entrypoint)
RUN mkdir -p /app/uploads /app/prisma

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# REMOVED: USER nodejs (We must stay root to fix permissions in entrypoint)

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]
