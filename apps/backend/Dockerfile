# Production Dockerfile for Bough & Burrow Backend (Medusa)
# Works with both project root and apps/backend build contexts

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm first
RUN npm install -g pnpm

# Copy package files - handle both build contexts
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
# Copy the compiled config from the build output
COPY --from=builder /app/.medusa/server/medusa-config.js ./medusa-config.js

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile=false

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medusa -u 1001

# Set permissions
RUN chown -R medusa:nodejs /app

# Switch to non-root user
USER medusa

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

# Expose port
EXPOSE 9000

# Run predeploy (migrations) then start
CMD ["sh", "-c", "pnpm run predeploy && pnpm run start"]