# apps/backend/Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /workspace

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all package.json files for proper dependency resolution
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install all dependencies at workspace level
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development

# Copy the backend source code
COPY apps/backend ./apps/backend

# Set working directory to backend
WORKDIR /workspace/apps/backend

# Expose ports
EXPOSE 9000 7000

# Run development server
CMD ["pnpm", "run", "dev"]

# Build stage
FROM base AS build
COPY apps/backend ./apps/backend
WORKDIR /workspace/apps/backend
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy built application
COPY --from=build /workspace/apps/backend/dist ./dist
COPY --from=build /workspace/apps/backend/package.json ./
COPY --from=build /workspace/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medusa -u 1001
USER medusa

EXPOSE 9000

CMD ["pnpm", "run", "start"]
