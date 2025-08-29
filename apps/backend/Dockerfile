# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json medusa-config.ts tsconfig.json ./
COPY src ./src

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile=false

# Build the backend
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/package.json ./
# Use the compiled JavaScript config instead of TypeScript
COPY --from=builder /app/.medusa/server/medusa-config.js ./medusa-config.js
# Copy the modules directory with source files
COPY --from=builder /app/src/modules ./src/modules

# Install production dependencies only
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile=false

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medusa -u 1001
USER medusa

EXPOSE 9000
CMD ["pnpm", "run", "start"]