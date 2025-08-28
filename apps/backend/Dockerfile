# Production Dockerfile for Bough & Burrow Backend (Medusa)
# Simplified to match Railway approach

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (context is ./apps/backend so these are at root)
COPY package.json medusa-config.ts tsconfig.json ./
COPY src ./src

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile=false

# Build the backend
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/package.json ./
COPY --from=builder /app/medusa-config.ts ./

# Install production dependencies only
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile=false

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medusa -u 1001
USER medusa

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

# Expose port
EXPOSE 9000

# Start the application
CMD ["pnpm", "run", "start"]