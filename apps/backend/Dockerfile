# Production Dockerfile for Bough & Burrow Backend (Medusa)
# Works with both project root and apps/backend build contexts

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm first
RUN npm install -g pnpm

# Copy package files - handle both build contexts
# If context is project root, we need apps/backend/
# If context is apps/backend/, files are at root
COPY package*.json ./
COPY medusa-config.ts ./
COPY tsconfig.json ./
COPY src ./src

# Install dependencies
RUN pnpm install --frozen-lockfile=false

# Build the backend
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built application from builder stage
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/package.json ./
COPY --from=builder /app/medusa-config.ts ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile=false

# Create non-root user first
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medusa -u 1001

# Install production dependencies only
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile=false

# Switch to non-root user
USER medusa

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

# Expose port
EXPOSE 9000

# Start the application
CMD ["pnpm", "run", "start"]