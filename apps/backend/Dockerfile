# Production Dockerfile for Bough & Burrow Backend (Medusa)
# Optimized for Dokploy deployment

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.11.0

# Copy workspace root files for proper dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/cms/package.json ./apps/cms/

# Install all dependencies (needed for workspace)
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY apps/backend/ ./apps/backend/

# Build the backend (from workspace root)
RUN pnpm --filter @badgerstore/backend build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.11.0

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S medusa -u 1001

# Copy built application from builder stage (like Railway)
COPY --from=builder --chown=medusa:nodejs /app/apps/backend/.medusa ./.medusa
COPY --from=builder --chown=medusa:nodejs /app/apps/backend/package.json ./
COPY --from=builder --chown=medusa:nodejs /app/apps/backend/medusa-config.ts ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile && \
    pnpm store prune && \
    rm -rf /root/.pnpm-store

# Stay at /app working directory (like Railway)

# Switch to non-root user
USER medusa

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

# Expose port
EXPOSE 9000

# Start the application
CMD ["pnpm", "run", "start"]