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
COPY --from=builder /app/medusa-config.ts ./

# Install pnpm and TypeScript runtime support
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile=false
RUN pnpm add ts-node typescript

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medusa -u 1001
USER medusa

EXPOSE 9000
CMD ["pnpm", "run", "start"]